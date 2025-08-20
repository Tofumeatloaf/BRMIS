(function () {
  // --- Data access ---
  function getLS(key, fallback = []) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v : fallback;
    } catch (e) { return fallback; }
  }
  function getCollected() {
    return (
      getLS('collectedUnits') ||
      window.collectedUnits ||
      getLS('inventory_collected') ||
      []
    );
  }
  function getDistributed() {
    return (
      getLS('distributedUnits') ||
      window.distributedUnits ||
      getLS('inventory_distributed') ||
      []
    );
  }
  function getDonors() {
    return (
      getLS('donorInfo') ||
      window.donorInfo ||
      getLS('donors') ||
      []
    );
  }
  function getReservations() {
    return (
      getLS('reservations') ||
      window.reservations ||
      []
    );
  }
  function getTranscriptions() {
    return (
      getLS('transcriptions') ||
      window.transcriptions ||
      []
    );
  }

  // --- Date helpers ---
  function parseDate(d) {
    if (!d) return null;
    try {
      if (d instanceof Date) return d;
      const dt = new Date(d);
      return isNaN(dt) ? null : dt;
    } catch (e) { return null; }
  }
  function inRange(dt, from, to) {
    if (!dt) return false;
    if (from && dt < from) return false;
    if (to && dt > to) return false;
    return true;
  }

  // --- Field getters ---
  function getStatus(item) {
    return (item.status || item.unitStatus || '').toString().trim().toLowerCase();
  }
  function getType(item) {
    return (item.bloodType || item.type || item.blood_group || '').toString().toUpperCase();
  }
  function getCollectionDate(item) {
    return parseDate(item.collectionDate || item.dateCollected || item.date);
  }
  function getDistributionDate(item) {
    return parseDate(item.distributionDate || item.dateDistributed || item.date);
  }
  function getExpiryDate(item) {
    return parseDate(item.expiryDate || item.expirationDate || item.expiry);
  }

  // --- Filtering ---
  function filterByDateRange(list, getDateFn, from, to) {
    if (!from && !to) return list.slice();
    return list.filter(i => inRange(getDateFn(i), from, to));
  }

  // --- Aggregations ---
  function countExpired(list, asOf) {
    const now = asOf || new Date();
    return list.reduce((acc, i) => {
      const s = getStatus(i);
      const exp = getExpiryDate(i);
      const expired = (s === 'expired') || (exp && exp < now);
      return acc + (expired ? 1 : 0);
    }, 0);
  }
  function groupByStatus(list) {
    const m = new Map();
    list.forEach(i => {
      const s = getStatus(i) || 'unknown';
      m.set(s, (m.get(s) || 0) + 1);
    });
    return Array.from(m.entries()).map(([status, count]) => ({ status, count }));
  }
  function groupByMonth(list, getDateFn) {
    const m = new Map(); // key: YYYY-MM
    list.forEach(i => {
      const d = getDateFn(i);
      if (!d) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      m.set(key, (m.get(key) || 0) + 1);
    });
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }
  function groupByTypeAvailable(collected, distributed, expiredCount) {
    const cType = new Map();
    collected.forEach(i => {
      const t = getType(i) || 'UNK';
      cType.set(t, (cType.get(t) || 0) + 1);
    });
    const dType = new Map();
    distributed.forEach(i => {
      const t = getType(i) || 'UNK';
      dType.set(t, (dType.get(t) || 0) + 1);
    });

    const totalCollected = collected.length || 1;
    const result = [];
    for (const [t, cCount] of cType.entries()) {
      const dCount = dType.get(t) || 0;
      const expiredShare = Math.round((cCount / totalCollected) * expiredCount);
      const available = Math.max(0, cCount - dCount - expiredShare);
      result.push({ type: t, available, collected: cCount, distributed: dCount });
    }
    for (const [t, dCount] of dType.entries()) {
      if (!cType.has(t)) {
        result.push({ type: t, available: 0, collected: 0, distributed: dCount });
      }
    }
    return result.sort((a, b) => a.type.localeCompare(b.type));
  }

  // --- Rendering helpers ---
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = String(text);
  }
  function renderStatusTable(rows) {
    const tbody = document.querySelector('#statusTable tbody');
    if (!tbody) return;
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.status}</td>
        <td>${r.count}</td>
      </tr>
    `).join('');
  }

  // --- Charts (colors + visible axes even when all-zero) ---
  let chartMonthly, chartByType;

  function renderCharts(monthCollected, monthDistributed, byTypeAvail) {
    const ctx1 = document.getElementById('chartMonthly');
    const ctx2 = document.getElementById('chartByType');
    if (!window.Chart || !ctx1 || !ctx2) return;

    // Labels for monthly chart
    const labels = Array.from(new Set([
      ...monthCollected.map(([k]) => k),
      ...monthDistributed.map(([k]) => k)
    ])).sort();

    const cData = labels.map(l => {
      const f = monthCollected.find(([k]) => k === l);
      return f ? f[1] : 0;
    });
    const dData = labels.map(l => {
      const f = monthDistributed.find(([k]) => k === l);
      return f ? f[1] : 0;
    });

    // If max is 0, keep y-axis visible 0→1 so frame/grid show up
    const maxMonthly = Math.max(0, ...cData, ...dData);
    const yScaleMonthly = {
      beginAtZero: true,
      ticks: { precision: 0, color: '#333' },
      grid: { color: 'rgba(0,0,0,0.15)' }
    };
    if (maxMonthly === 0) yScaleMonthly.max = 1;

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2, // width:height
      plugins: {
        legend: { position: 'top', labels: { color: '#333' } },
        tooltip: { enabled: true }
      },
      scales: {
        x: {
          ticks: { color: '#333' },
          grid: { color: 'rgba(0,0,0,0.08)' }
        },
        y: yScaleMonthly
      }
    };

    if (chartMonthly) chartMonthly.destroy();
    chartMonthly = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Collected',
            data: cData,
            backgroundColor: 'rgba(59,130,246,0.65)',   // blue
            borderColor: 'rgba(59,130,246,1)',
            borderWidth: 1
          },
          {
            label: 'Distributed',
            data: dData,
            backgroundColor: 'rgba(244,114,182,0.65)', // pink
            borderColor: 'rgba(244,114,182,1)',
            borderWidth: 1
          }
        ]
      },
      options: commonOptions
    });

    // By-type chart
    const typeLabels = byTypeAvail.map(x => x.type);
    const typeData = byTypeAvail.map(x => x.available);
    const maxType = Math.max(0, ...typeData);
    const yScaleType = {
      beginAtZero: true,
      ticks: { precision: 0, color: '#333' },
      grid: { color: 'rgba(0,0,0,0.15)' }
    };
    if (maxType === 0) yScaleType.max = 1;

    const byTypeOptions = JSON.parse(JSON.stringify(commonOptions));
    byTypeOptions.scales.y = yScaleType;

    if (chartByType) chartByType.destroy();
    chartByType = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: typeLabels,
        datasets: [
          {
            label: 'Available',
            data: typeData,
            backgroundColor: 'rgba(59,130,246,0.65)',
            borderColor: 'rgba(59,130,246,1)',
            borderWidth: 1
          }
        ]
      },
      options: byTypeOptions
    });
  }

  // --- Main compute + render ---
  function runSummary() {
    const from = parseDate(document.getElementById('sumDateFrom')?.value);
    const to   = parseDate(document.getElementById('sumDateTo')?.value);

    const collectedAll = getCollected();
    const distributedAll = getDistributed();

    const collected   = filterByDateRange(collectedAll, getCollectionDate, from, to);
    const distributed = filterByDateRange(distributedAll, getDistributionDate, from, to);

    const now = new Date();
    const expiredAll     = countExpired(collectedAll, now);
    const expiredInRange = countExpired(collected, now);

    const totalCollected    = collected.length;
    const totalDistributed  = distributed.length;
    const available         = Math.max(0, totalCollected - totalDistributed - expiredInRange);

    setText('kpiCollected', totalCollected);
    setText('kpiDistributed', totalDistributed);
    setText('kpiExpired',    expiredInRange);
    setText('kpiAvailable',  available);

    setText('kpiCollectedSub',   `All time: ${collectedAll.length}`);
    setText('kpiDistributedSub', `All time: ${distributedAll.length}`);
    setText('kpiExpiredSub',     `All time: ${expiredAll}`);

    const statusRows = groupByStatus(collected);
    renderStatusTable(statusRows);

    const monthC = groupByMonth(collected, getCollectionDate);
    const monthD = groupByMonth(distributed, getDistributionDate);
    const byType = groupByTypeAvailable(collected, distributed, expiredInRange);
    renderCharts(monthC, monthD, byType);
  }

  // --- PDF Export ---
  async function exportPDF() {
    if (!window.jspdf || !window.html2canvas) {
      alert('PDF libraries not loaded.');
      return;
    }
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'pt', 'a4');

    const margin = 36;
    const pageW  = pdf.internal.pageSize.getWidth();
    const pageH  = pdf.internal.pageSize.getHeight();
    const innerW = pageW - margin * 2;
    let y = margin;

    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(16);
    pdf.text('Blood Inventory Summary Report', margin, y); y += 22;

    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10);
    const from = document.getElementById('sumDateFrom')?.value || '—';
    const to   = document.getElementById('sumDateTo')?.value || '—';
    pdf.text(`Date range: ${from} to ${to}`, margin, y);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, margin + innerW - 200, y, { align: 'left' });
    y += 14;

    const kpi = (label, id) => `${label}: ${document.getElementById(id)?.textContent ?? '0'}`;
    pdf.setFontSize(12);
    [ 'Collected','Distributed','Expired','Available' ].forEach((label, i) => {
      const ids = ['kpiCollected','kpiDistributed','kpiExpired','kpiAvailable'];
      pdf.text(`${label}: ${document.getElementById(ids[i])?.textContent ?? '0'}`, margin, y);
      y += 16;
    });

    async function addElementImage(el, title) {
      if (!el) return;
      if (y + 24 > pageH - margin) { pdf.addPage(); y = margin; }
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12);
      pdf.text(title, margin, y); y += 10;

      const canvas = await window.html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const imgW = innerW;
      const imgH = canvas.height * (imgW / canvas.width);

      if (y + imgH > pageH - margin) { pdf.addPage(); y = margin; }
      pdf.addImage(imgData, 'PNG', margin, y, imgW, imgH);
      y += imgH + 12;
    }

    // capture only the canvases so titles aren't duplicated in the PDF
    await addElementImage(document.getElementById('chartMonthly'), 'Monthly Collected vs Distributed');
    await addElementImage(document.getElementById('chartByType'), 'Inventory by Blood Type');

    // keep parent for the table so header + body are included
    await addElementImage(document.getElementById('statusTable')?.parentElement, 'Breakdown by Status');

    pdf.save('summary.pdf');
  }

  // --- Wire UI ---
  function wireUI() {
    document.getElementById('sumApply')?.addEventListener('click', runSummary);
    document.getElementById('sumReset')?.addEventListener('click', () => {
      const f = document.getElementById('sumDateFrom');
      const t = document.getElementById('sumDateTo');
      if (f) f.value = '';
      if (t) t.value = '';
      runSummary();
    });
    document.getElementById('sumExportPdf')?.addEventListener('click', exportPDF);

    window.addEventListener('resize', () => {
      try { chartMonthly?.resize(); } catch (_) {}
      try { chartByType?.resize(); } catch (_) {}
    });
  }

  // --- Init ---
  function ready(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(fn, 0);
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    if (document.getElementById('sumApply')) {
      wireUI();
      runSummary();
    }
  });
})();
