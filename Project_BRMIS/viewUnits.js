// viewUnits.js — universal table search (works for Transcriptions, Patients, etc.)
(function () {
  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .trim();
  }

  function findSearchInput(root = document) {
    return (
      root.getElementById("searchInput") ||
      root.getElementById("searchReservation") ||
      root.querySelector('input[type="search"]')
    );
  }

  function findTable(root = document) {
    // Prefer explicit ids if present
    const preferredIds = [
      "transcriptionTable",
      "collectedTable",
      "distributedTable",
      "donorTable",
      "reservationTable",
      "patientTable",
    ];
    for (const id of preferredIds) {
      const t = root.getElementById(id);
      if (t && t.tBodies && t.tBodies.length) return t;
    }
    // Fallback: first .data-table with tbody
    return root.querySelector("table.data-table tbody")
      ? root.querySelector("table.data-table")
      : null;
  }

  function buildIndex(table) {
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const allCells = (row) => Array.from(row.querySelectorAll("td"));

    // Map header text -> column index
    const headerMap = {};
    const thead = table.tHead || table.querySelector("thead");
    if (thead) {
      const headers = Array.from(thead.querySelectorAll("th"));
      headers.forEach((th, i) => (headerMap[normalize(th.textContent)] = i));
    }

    // Collect id-prefix -> value for each row on the fly during filtering
    function getIdPrefixMap(row) {
      const map = {};
      allCells(row).forEach((td) => {
        const id = td.id || "";
        const m = id.match(/^([a-z][a-z0-9_-]*?)-\d+$/i);
        if (m) map[normalize(m[1])] = (td.textContent || "").toLowerCase();
      });
      return map;
    }

    return { rows, allCells, headerMap, getIdPrefixMap };
  }

  function applySearch(query, index) {
    const { rows, allCells, headerMap, getIdPrefixMap } = index;
    const q = (query || "").trim();
    if (!q) {
      rows.forEach((r) => (r.style.display = ""));
      return;
    }
    const tokens = q.split(/\s+/);

    rows.forEach((row) => {
      const rowText = row.textContent.toLowerCase();
      const cells = allCells(row);
      const byIdPrefix = getIdPrefixMap(row);

      let visible = true;
      for (const tok of tokens) {
        if (!tok) continue;
        if (tok.includes(":")) {
          const [kRaw, vRaw] = tok.split(":");
          const key = normalize(kRaw);
          const val = (vRaw || "").toLowerCase();

          // 1) Try id-prefix map (e.g., transcriptionid, patientid, status, etc.)
          let ok =
            (byIdPrefix[key] && byIdPrefix[key].includes(val)) || false;

          // 2) If not found, try header name (e.g., "Transcription ID")
          if (!ok && headerMap.hasOwnProperty(key)) {
            const col = headerMap[key];
            const cellText = (cells[col]?.textContent || "").toLowerCase();
            ok = cellText.includes(val);
          }

          // 3) If key unknown, fall back to whole-row match on the value
          if (!ok && !headerMap.hasOwnProperty(key)) {
            ok = rowText.includes(val);
          }

          if (!ok) {
            visible = false;
            break;
          }
        } else {
          if (!rowText.includes(tok.toLowerCase())) {
            visible = false;
            break;
          }
        }
      }
      row.style.display = visible ? "" : "none";
    });
  }

  function init(root = document) {
    const input = findSearchInput(root);
    const table = findTable(root);
    if (!input || !table || input.dataset.bound === "1") return;

    const index = buildIndex(table);

    let timer = null;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => applySearch(input.value, index), 60);
    });
    input.dataset.bound = "1";
    applySearch(input.value || "", index);
  }

  document.addEventListener("DOMContentLoaded", () => init(document));

  // Re-init if content is injected dynamically
  const obs = new MutationObserver(() => init(document));
  obs.observe(document.documentElement, { childList: true, subtree: true });
})();
