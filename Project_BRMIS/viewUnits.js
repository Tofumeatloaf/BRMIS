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

// new code 
/* --- Inline Status Editor for Collected Units --- */
(function () {
  const TABLE_ID = "collectedTable";
  const STATUS_OPTIONS = ["Existing", "Distributed", "Expired"]; // add more if needed

  function getColumnIndexByHeader(table, headerText) {
    const wanted = String(headerText).trim().toLowerCase();
    const ths = Array.from(table.tHead?.rows?.[0]?.cells || table.querySelectorAll("thead th"));
    for (let i = 0; i < ths.length; i++) {
      if (ths[i].textContent.trim().toLowerCase() === wanted) return i;
    }
    return -1;
  }

  function timestampNow() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function enterEdit(td, idx) {
    if (td.classList.contains("editing")) return;

    const current = td.textContent.trim();
    td.dataset.originalText = current;
    td.classList.add("editing");

    const sel = document.createElement("select");
    sel.innerHTML = STATUS_OPTIONS.map(s => `<option value="${s}">${s}</option>`).join("");
    sel.value = STATUS_OPTIONS.includes(current) ? current : STATUS_OPTIONS[0];

    const commit = () => commitChange(td, sel.value, idx);
    const cancel = () => cancelEdit(td);

    sel.addEventListener("change", commit);
    sel.addEventListener("blur", commit);
    sel.addEventListener("keydown", (e) => {
      if (e.key === "Escape") cancel();
      if (e.key === "Enter")  commit();
    });

    td.textContent = "";
    td.appendChild(sel);
    sel.focus();
  }

  function cancelEdit(td) {
    td.classList.remove("editing");
    td.textContent = td.dataset.originalText || "";
  }

  function commitChange(td, nextValue, idx) {
    td.classList.remove("editing");
    td.textContent = nextValue;

    const tr = td.closest("tr");
    if (!tr) return;

    // Update “Last Update Timestamp” + “Last Updated by User” cells if present
    const stamp = timestampNow();
    const user  = sessionStorage.getItem("username") || sessionStorage.getItem("currentUser") || "system";

    if (idx.lastUpdate > -1) tr.cells[idx.lastUpdate].textContent = stamp;
    if (idx.updatedBy > -1)  tr.cells[idx.updatedBy].textContent  = user;

    // Persist to sessionStorage (so view-loader will keep the change across views)
    try {
      const unitId = idx.unitId > -1 ? (tr.cells[idx.unitId]?.textContent?.trim() || "") : "";
      const rows = JSON.parse(sessionStorage.getItem("collectedUnits") || "[]");
      const row  = rows.find(r => (r.collected_unit_id || "").trim() === unitId);
      if (row) {
        row.status = nextValue;
        row.last_update_timestamp = stamp;
        row.last_updated_by = user;
        sessionStorage.setItem("collectedUnits", JSON.stringify(rows));
      }
    } catch (e) {
      console.warn("[status editor] persist failed:", e);
    }

    // If you have a backend, call it here:
    // fetch("/api/collected/update-status", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ collected_unit_id: unitId, status: nextValue })
    // });
  }

  function init() {
    const table = document.getElementById(TABLE_ID);
    if (!table) return;

    // Find column indexes by header text so this works for both static sample rows
    // and rows injected by view-loader (which don’t carry td IDs).
    const idx = {
      unitId:     getColumnIndexByHeader(table, "Collected Unit ID"),
      status:     getColumnIndexByHeader(table, "Status"),
      lastUpdate: getColumnIndexByHeader(table, "Last Update Timestamp"),
      updatedBy:  getColumnIndexByHeader(table, "Last Updated by User"),
    };

    if (idx.status < 0) return;

    // Event delegation: turn the clicked Status cell into a select
    table.addEventListener("click", (ev) => {
      const td = ev.target.closest("td");
      if (!td || td.cellIndex !== idx.status) return;
      enterEdit(td, idx);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
