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
  // Blood "type" like A+, O-, etc.
  function getType(item) {
    return (item.bloodType || item.type || item.blood_group || '').toString().toUpperCase();
  }
  // Blood "unit/component" like RBC, WBC, Platelets, Apheresis
  function getUnit(item) {
    return (
      item.unit ||
      item.component ||
      item.bloodUnit ||
      item.unitType ||
      item.product ||
      ''
    ).toString().trim().toUpperCase();
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
  function filterByYear(list, getDateFn, yearStr) {
    if (!yearStr) return list;
    return list.filter(i => {
      const d = getDateFn(i);
      return d && d.getFullYear().toString() === yearStr;
    });
  }
  function filterByUnit(list, unitStr) {
    if (!unitStr || unitStr.toLowerCase() === 'all') return list;
    const want = unitStr.toUpperCase();
    return list.filter(i => getUnit(i) === want);
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

  // --- Charts ---
  let chartMonthly, chartByType, chartChosen;
  // Resize a canvas to device pixels for crisp rendering
  function dprSizeCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = Math.max(1, Math.floor(rect.width  * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  }

  function renderCharts(monthCollected, monthDistributed, byTypeAvail) {
    const ctx1 = document.getElementById('chartMonthly');
    const ctx2 = document.getElementById('chartByType');
    if (!window.Chart || !ctx1 || !ctx2) return;

    // Device-pixel size → avoids blur
    dprSizeCanvas(ctx1);
    dprSizeCanvas(ctx2);

    const labels = Array.from(new Set([
      ...monthCollected.map(([k]) => k),
      ...monthDistributed.map(([k]) => k)
    ])).sort();

    const cData = labels.map(l => (monthCollected.find(([k]) => k === l)?.[1] ?? 0));
    const dData = labels.map(l => (monthDistributed.find(([k]) => k === l)?.[1] ?? 0));

    const maxMonthly = Math.max(0, ...cData, ...dData);
    const yScaleMonthly = { beginAtZero: true, ticks: { precision: 0, color: '#333' }, grid: { color: 'rgba(0,0,0,0.15)' } };
    if (maxMonthly === 0) yScaleMonthly.max = 1;

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,     // let CSS control height (prevents squashing/blur)
      plugins: {
        legend: { position: 'top', labels: { color: '#333' } },
        tooltip: { enabled: true }
      },
      scales: {
        x: { ticks: { color: '#333' }, grid: { color: 'rgba(0,0,0,0.08)' } },
        y: yScaleMonthly
      }
    };

    if (chartMonthly) chartMonthly.destroy();
    chartMonthly = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Collected',   data: cData, backgroundColor: 'rgba(59,130,246,0.65)', borderColor: 'rgba(59,130,246,1)', borderWidth: 1 },
          { label: 'Distributed', data: dData, backgroundColor: 'rgba(244,114,182,0.65)', borderColor: 'rgba(244,114,182,1)', borderWidth: 1 }
        ]
      },
      options: commonOptions
    });

    const typeLabels = byTypeAvail.map(x => x.type);
    const typeData   = byTypeAvail.map(x => x.available);
    const maxType    = Math.max(0, ...typeData);
    const yScaleType = { beginAtZero: true, ticks: { precision: 0, color: '#333' }, grid: { color: 'rgba(0,0,0,0.15)' } };
    if (maxType === 0) yScaleType.max = 1;

    const byTypeOptions = JSON.parse(JSON.stringify(commonOptions));
    byTypeOptions.scales.y = yScaleType;

    if (chartByType) chartByType.destroy();
    chartByType = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: typeLabels,
        datasets: [{ label: 'Available', data: typeData, backgroundColor: 'rgba(59,130,246,0.65)', borderColor: 'rgba(59,130,246,1)', borderWidth: 1 }]
      },
      options: byTypeOptions
    });
  }
  
  let chartSample;
  // --- Sample presentation-only chart (demo data) ---
function renderSampleChart() {
  const canvas = document.getElementById('chartSample');
  if (!window.Chart || !canvas) return;

  // keep it crisp like your other charts
  dprSizeCanvas(canvas);

  // build a fake monthly series (12 months)
  const labels = [];
  const data   = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    labels.push(ym);
    // demo values with a gentle wave
    const base = 20 + Math.round(8 * Math.sin((12 - i) / 2));
    const noise = Math.floor(Math.random() * 6); // small randomness
    data.push(base + noise);
  }

  const maxVal = Math.max(0, ...data);
  const yScale = { beginAtZero: true, ticks: { precision: 0 } };
  if (maxVal === 0) yScale.max = 1;

  if (chartSample) chartSample.destroy();
  chartSample = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Demo Units (Sample Only)',
        data,
        backgroundColor: 'rgba(99,102,241,0.6)',
        borderColor: 'rgba(99,102,241,1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      scales: { y: yScale }
    }
  });

  // Also auto-fill the explanation box to make it obvious this is a demo
  const box = document.getElementById('chartComment');
  if (box) {
    const total = data.reduce((a,b)=>a+b,0);
    const peakVal = Math.max(...data);
    const peakIdx = data.indexOf(peakVal);
    const peakMonth = labels[peakIdx] || 'N/A';
    box.value = [
      'SAMPLE PRESENTATION (DEMO DATA)',
      `Coverage: ${labels[0]} to ${labels[labels.length-1]}.`,
      `Total demo units: ${total}.`,
      `Peak month: ${peakMonth} (${peakVal} units).`,
      'Trend: This is synthetic data to illustrate how the report explanation looks.'
    ].join('\n');
  }
}



function renderChosenChart(list, dataType, unitType, getDateFn) {
  const canvas = document.getElementById('chartChosen');
  if (!window.Chart || !canvas) return;

  // keep charts crisp
  dprSizeCanvas(canvas);

  // aggregate by month
  const byMonth = groupByMonth(list, getDateFn); // [ [YYYY-MM, count], ... ]
  const labels = byMonth.map(([k]) => k);
  const data   = byMonth.map(([_, v]) => v);

  // build the chart (same look/feel as before)
  const maxVal = Math.max(0, ...data);
  const yScale = { beginAtZero: true, ticks: { precision: 0 } };
  if (maxVal === 0) yScale.max = 1;

  if (chartChosen) chartChosen.destroy();
  chartChosen = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: `${(dataType || 'collected').charAt(0).toUpperCase() + (dataType || 'collected').slice(1)} (${(unitType || 'All')})`,
        data,
        backgroundColor: 'rgba(75,192,192,0.6)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // CSS controls height
      plugins: { legend: { display: true } },
      scales: { y: yScale }
    }
  });

  // ---------- Auto-generate explanation for the Chosen Report ----------
  const box = document.getElementById('chartComment');
  if (!box) return;

  // helpers for summary text
  const kind = (dataType || 'collected').toLowerCase();
  const unit = (unitType && unitType.toLowerCase() !== 'all') ? unitType.toUpperCase() : 'all blood units';

  const total = data.reduce((a, b) => a + b, 0);
  const peakVal = data.length ? Math.max(...data) : 0;
  const peakIdx = data.length ? data.indexOf(peakVal) : -1;
  const peakMonth = peakIdx >= 0 ? labels[peakIdx] : 'N/A';

  // simple trend (least-squares slope on month index vs count)
  let trend = 'No data available.';
  if (data.length >= 2) {
    const n = data.length;
    const xs = data.map((_, i) => i);
    const sumX = xs.reduce((a,b)=>a+b,0);
    const sumY = data.reduce((a,b)=>a+b,0);
    const sumXY = data.reduce((a,y,i)=>a + xs[i]*y, 0);
    const sumXX = xs.reduce((a,x)=>a + x*x, 0);
    const denom = (n*sumXX - sumX*sumX) || 1;
    const slope = (n*sumXY - sumX*sumY) / denom;

    if (Math.abs(slope) < 0.05) trend = 'Overall stable month to month.';
    else trend = slope > 0 ? 'Upward trend across the period.' : 'Downward trend across the period.';
  }

  // compose narrative
  const startMonth = labels[0] || '—';
  const endMonth   = labels[labels.length - 1] || '—';
  const lines = [
    `This chart summarizes ${kind} for ${unit} by month.`,
    `Coverage: ${startMonth} to ${endMonth}.`,
    `Total units: ${total}.`,
    `Peak month: ${peakMonth} (${peakVal} units).`,
    `Trend: ${trend}`
  ];

  // write to the textarea but keep it editable
  box.value = lines.join('\n');
}


  // --- Main compute + render ---
  function runSummary() {
    const from = parseDate(document.getElementById('sumDateFrom')?.value);
    const to   = parseDate(document.getElementById('sumDateTo')?.value);

    const collectedAll    = getCollected();
    const distributedAll  = getDistributed();

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

    // --- New: chosen report section ---
    const yearSel  = document.getElementById('sumYear')?.value || '';
    const dataSel  = document.getElementById('sumDataType')?.value || 'collected';
    const unitSel  = document.getElementById('sumUnitType')?.value || 'all';

    let working = dataSel === 'distributed' ? distributedAll.slice() : collectedAll.slice();
    const getDateFn = dataSel === 'distributed' ? getDistributionDate : getCollectionDate;

    // Apply date range, year, and unit filters
    working = filterByDateRange(working, getDateFn, from, to);
    working = filterByYear(working, getDateFn, yearSel);
    working = filterByUnit(working, unitSel);

    // // Render the bottom "Chosen Report" chart if its canvas exists
    // renderChosenChart(working, dataSel, unitSel, getDateFn);
    // If no data after filters, show demo sample instead of empty
if (working.length === 0) {
  renderSampleChart();  // <- reuse the sample chart function we built earlier
} else {
  renderChosenChart(working, dataSel, unitSel, getDateFn);
}

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
  const year = document.getElementById('sumYear')?.value || 'All';
  const dataType = document.getElementById('sumDataType')?.value || 'collected';
  const unitType = document.getElementById('sumUnitType')?.value || 'All';
  pdf.text(`Date range: ${from} to ${to}`, margin, y);
  pdf.text(`Year: ${year} | Data: ${dataType} | Unit: ${unitType}`, margin + 220, y);
  y += 14;
  pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  y += 14;

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

  // Charts and table
  await addElementImage(document.getElementById('chartMonthly'), 'Monthly Collected vs Distributed');
  await addElementImage(document.getElementById('chartByType'), 'Inventory by Blood Type');
  await addElementImage(document.getElementById('chartChosen'), 'Chosen Report');
  await addElementImage(document.getElementById('statusTable')?.parentElement, 'Breakdown by Status');

  // ===== Notes / Explanation section (from the textarea) =====
  const notes = (document.getElementById('chartComment')?.value || '').trim();
  if (notes) {
    const para = pdf.splitTextToSize(notes, innerW);  // wrap to page width
    const blockHeight = para.length * 16 + 8;         // estimate text block height

    if (y + 24 + blockHeight > pageH - margin) { pdf.addPage(); y = margin; }
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12);
    pdf.text('Notes / Explanation', margin, y); y += 10;

    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11);
    para.forEach(line => {
      if (y + 16 > pageH - margin) { pdf.addPage(); y = margin; }
      pdf.text(line, margin, y);
      y += 16;
    });
  }

  pdf.save('summary.pdf');
}


  // --- Wire UI ---
  function wireUI() {
    const apply = () => runSummary();

    document.getElementById('sumApply')?.addEventListener('click', apply);
    document.getElementById('sumReset')?.addEventListener('click', () => {
      const f = document.getElementById('sumDateFrom');
      const t = document.getElementById('sumDateTo');
      if (f) f.value = '';
      if (t) t.value = '';
      const y = document.getElementById('sumYear');
      if (y) y.value = '';
      const d = document.getElementById('sumDataType');
      if (d) d.value = 'collected';
      const u = document.getElementById('sumUnitType');
      if (u) u.value = 'all';
      runSummary();
    });
    document.getElementById('sumExportPdf')?.addEventListener('click', exportPDF);

    ['sumYear','sumDataType','sumUnitType'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', apply);
    });

    window.addEventListener('resize', () => {
      try { chartMonthly?.resize(); } catch (_) {}
      try { chartByType?.resize(); } catch (_) {}
      try { chartChosen?.resize(); } catch (_) {}
    });
  }

// --- Init ---
function ready(fn) {
  if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(fn, 0);
  else document.addEventListener('DOMContentLoaded', fn);
}
ready(function () {
  const yearSelect = document.getElementById('sumYear');
  if (yearSelect) {
    const keep = yearSelect.value || '';      
    const currentYear = new Date().getFullYear();
    const oldest = currentYear - 5;              

    yearSelect.innerHTML = '<option value="">All</option>'; 
    for (let y = currentYear; y >= oldest; y--) {
      const opt = document.createElement('option');
      opt.value = String(y);
      opt.textContent = String(y);
      yearSelect.appendChild(opt);
    }

    // restore previous selection if still present
    if ([...yearSelect.options].some(o => o.value === keep)) {
      yearSelect.value = keep;
    }
  }

  if (document.getElementById('sumApply')) {
    wireUI();
    runSummary();
  }
});

})();
