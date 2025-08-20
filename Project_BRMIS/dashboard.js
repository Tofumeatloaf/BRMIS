// for presentation only 
// 🔄 Clear temp rows if this page load is a real browser refresh
(function () {
  try {
    let isReload = false;
    if (typeof performance?.getEntriesByType === "function") {
      const nav = performance.getEntriesByType("navigation")[0];
      isReload = !!nav && nav.type === "reload";
    } else if (performance?.navigation) {
      // old fallback
      isReload = performance.navigation.type === 1; // 1 = reload
    }
    if (isReload) {
      ["collectedUnits", "distributedUnits", "donorInfo", "reservations", "transcriptions"].forEach(k =>
    sessionStorage.removeItem(k)
    );
    }
  } catch (e) {
    console.warn("refresh clear check failed:", e);
  }
})();
// ===================== Sidebar logic =====================
let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let searchBtn = document.querySelector(".bx-search");

// Select all navigation links and the home-section text container
const navLinks = document.querySelectorAll(".nav-list li a");
const homeSectionText = document.querySelector(".home-section .text");

closeBtn?.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  menuBtnChange();
});

searchBtn?.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  menuBtnChange();
});

function menuBtnChange() {
  if (sidebar.classList.contains("open")) {
    closeBtn?.classList.replace("bx-menu", "bx-menu-alt-right");
  } else {
    closeBtn?.classList.replace("bx-menu-alt-right", "bx-menu");
  }
}

// Function to set the active tab (left label text only)
function setActiveTab(selectedTab) {
  navLinks.forEach((link) => link.parentElement.classList.remove("active"));
  selectedTab.parentElement.classList.add("active");
  const tabText = selectedTab.querySelector(".links_name")?.textContent || "";
  if (homeSectionText) homeSectionText.textContent = tabText;
}

// Add click event listeners to all navigation links (visual left bar state)
navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveTab(link);
  });
});

// Default active tab text
document.addEventListener("DOMContentLoaded", () => {
  const defaultTab = document.querySelector(
    '.nav-list li a[data-section="dashboardSection"]'
  );
  if (defaultTab) setActiveTab(defaultTab);
});

// ===================== Logout modal =====================
function showLogoutModal() {
  document.getElementById("logoutModal").style.display = "flex";
}
function hideLogoutModal() {
  document.getElementById("logoutModal").style.display = "none";
}
function confirmLogout() {
  window.location.href = "login.html";
}
document.getElementById("confirmLogout")?.addEventListener("click", confirmLogout);
document.getElementById("cancelLogout")?.addEventListener("click", hideLogoutModal);

// ===================== Sections + header logic =====================
document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll(".nav-list a[data-section]");
  const sections = document.querySelectorAll(".content-section");

  function showSection(sectionId) {
    sections.forEach((section) => {
      const on = section.id === sectionId;
      section.classList.toggle("active", on);
      section.style.display = on ? "block" : "none";
    });
    links.forEach((link) => {
      link.parentElement.classList.toggle(
        "active",
        link.getAttribute("data-section") === sectionId
      );
    });
  }

  // ---------- Header title + Post button + Register FAB visibility ----------
  const headerTitle = document.getElementById("dashboardHeaderTitle");
  const postBtn = document.getElementById("postAnnouncementBtn");
  const registerFab = document.getElementById("registerFab");   // only FAB we keep

  // FAB visible only on these sections
  const sectionsWithRegisterFab = new Set([
    "dashboardSection",
    "inventorySection",
    "reservationSection",
    "transcriptionSection",
  ]);

  const sectionTitles = {
    dashboardSection: "BloodBank Record Management and Inventory System",
    inventorySection: "Inventory Management",
    reservationSection: "Reservation Management",
    newsSection: "News & Updates",
    transcriptionSection: "Transcription Management",
    summarySection: "Summary Report",
    settingsSection: "BloodBank Record Management and Inventory System",
  };

  function updateHeader(sectionId) {
    if (headerTitle) headerTitle.textContent = sectionTitles[sectionId] || "";

    // Post button only on Dashboard
    if (postBtn) postBtn.style.display = sectionId === "dashboardSection" ? "block" : "none";

    // Toggle only the Register FAB + conditional padding class
    const showFab = sectionsWithRegisterFab.has(sectionId);
    if (registerFab) registerFab.style.display = showFab ? "grid" : "none";
    document.body.classList.toggle("has-scanfab", showFab);
  }

  // ---------- Summary CSS/JS cleanup so it won't affect other sections ----------
  function removeSummaryAssets() {
    document
      .querySelectorAll(
        'link[data-summary-dynamic-style],script[data-summary-dynamic-script],script[data-summary-lib]'
      )
      .forEach((n) => n.remove());
  }

  // expose
  window._showSection = showSection;
  window._updateHeader = updateHeader;

  // Always start on Dashboard
  (function forceDashboard() {
    showSection("dashboardSection");
    updateHeader("dashboardSection");
    localStorage.setItem("activeSection", "dashboardSection");
  })();

  // ---------- Generic navigation (skip dropdown headers) ----------
  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      const id = this.id;
      if (
        id === "inventoryDropdownBtn" ||
        id === "reservationDropdownBtn" ||
        id === "transcriptionDropdownBtn"
      ) {
        return;
      }
      e.preventDefault();
      const target = this.getAttribute("data-section");
      if (!target) return;

      // Close dropdowns when switching sections
      closeAllDropdowns();

      // If leaving Summary, drop its CSS/JS
      if (target !== "summarySection") removeSummaryAssets();

      showSection(target);
      localStorage.setItem("activeSection", target);
      updateHeader(target);
    });
  });

  // ---------- Accordion for settings ----------
  document.querySelectorAll(".accordion-header").forEach((header) => {
    header.addEventListener("click", function () {
      this.classList.toggle("active");
      const panel = this.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  // ===================== Dropdowns =====================
  const inventoryBtn = document.getElementById("inventoryDropdownBtn");
  const reservationBtn = document.getElementById("reservationDropdownBtn");
  const transcriptionBtn = document.getElementById("transcriptionDropdownBtn");

  const inventoryDropdown = document.getElementById("inventoryDropdown");
  const reservationDropdown = document.getElementById("reservationDropdown");
  const transcriptionDropdown = document.getElementById("transcriptionDropdown");

  function closeDropdown(btn, dropdown) {
    if (!dropdown || !btn) return;
    dropdown.style.maxHeight = "0";
    btn.parentElement.classList.remove("open");
    dropdown.addEventListener(
      "transitionend",
      () => {
        if (!btn.parentElement.classList.contains("open")) {
          dropdown.style.display = "none";
        }
      },
      { once: true }
    );
    btn.setAttribute("aria-expanded", "false");
  }

  function openDropdown(btn, dropdown) {
    if (!dropdown || !btn) return;
    dropdown.style.display = "block";
    requestAnimationFrame(() => {
      dropdown.style.maxHeight = dropdown.scrollHeight + "px";
    });
    btn.parentElement.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
  }

  function closeAllDropdowns() {
    closeDropdown(inventoryBtn, inventoryDropdown);
    closeDropdown(reservationBtn, reservationDropdown);
    closeDropdown(transcriptionBtn, transcriptionDropdown);
  }

  // Open sidebar if collapsed
  function openSidebarIfCollapsed() {
    if (!sidebar.classList.contains("open")) {
      sidebar.classList.add("open");
      menuBtnChange();
    }
  }

  function toggleDropdownExclusive(btn, dropdown) {
    const isOpen = btn?.parentElement.classList.contains("open");
    if (isOpen) return; // keep it open
    closeAllDropdowns();
    openDropdown(btn, dropdown);
  }

  // Inventory header (NO section change)
  inventoryBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openSidebarIfCollapsed();
    toggleDropdownExclusive(inventoryBtn, inventoryDropdown);
  });

  // Reservation header
  reservationBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openSidebarIfCollapsed();
    toggleDropdownExclusive(reservationBtn, reservationDropdown);
  });

  // Transcription header
  transcriptionBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openSidebarIfCollapsed();
    toggleDropdownExclusive(transcriptionBtn, transcriptionDropdown);
  });

  // Close all when collapsing sidebar
  closeBtn?.addEventListener("click", () => {
    setTimeout(() => {
      if (!document.querySelector(".sidebar").classList.contains("open")) {
        closeAllDropdowns();
      }
    }, 100);
  });

  // Keep submenu clicks from closing dropdowns
  document.querySelectorAll(".sidebar-dropdown a").forEach((link) => {
    link.addEventListener("click", (e) => e.stopPropagation());
  });

  // Sidebar search menu logic
  menuBtnChange();
  searchBtn?.addEventListener("click", () => {
    if (!sidebar.classList.contains("open")) {
      sidebar.classList.add("open");
      menuBtnChange();
    } else {
      document.querySelector(".sidebar input")?.focus();
    }
  });
});

// ===================== Announcement popup logic =====================
document.addEventListener("DOMContentLoaded", function () {
  const postBtn = document.getElementById("postAnnouncementBtn");
  const popup = document.getElementById("announcementPopup");
  const popupBody = document.getElementById("announcementPopupBody");
  const closeBtnX = document.getElementById("closeAnnouncementPopup");

  postBtn?.addEventListener("click", function () {
    popup.style.display = "flex";
    Promise.all([
      fetch("announcementbtn.html").then((res) => res.text()),
      fetch("announcementbtn.css").then((res) => res.text()),
    ])
      .then(([html, css]) => {
        const bodyContent = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const styleTag = `<style>${css}</style>`;
        popupBody.innerHTML = styleTag + (bodyContent ? bodyContent[1] : html);

        // ✅ Load the JS logic for handling form submission
        injectOptionalScript("announcementbtn.js");
      })
      .catch((err) => {
        popupBody.innerHTML = `<p style='color:red;'>Failed to load form. ${err.message}</p>`;
      });
  });

  closeBtnX?.addEventListener("click", function () {
    popup.style.display = "none";
    popupBody.innerHTML = "";
  });

  popup?.addEventListener("click", function (e) {
    if (e.target === popup) {
      popup.style.display = "none";
      popupBody.innerHTML = "";
    }
  });
});


// ===================== Helpers (shared) =====================
function ensureContainer(sectionId, containerId) {
  let container = document.getElementById(containerId);
  const section = document.getElementById(sectionId);
  if (!section) return null;
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    section.appendChild(container);
  }
  section.style.display = "block";
  return container;
}
function injectOptionalScript(src) {
  const s = document.createElement("script");
  s.src = src;
  s.defer = true;
  s.onerror = () => { try { s.remove(); } catch (e) {} };
  document.body.appendChild(s);
}
function leaveInventoryUI() {
  const viewBtnGroup = document.getElementById("viewBtnGroup");
  const addBtnGroup = document.getElementById("addBtnGroup");
  if (viewBtnGroup) viewBtnGroup.style.display = "none";
  if (addBtnGroup) addBtnGroup.style.display = "none";
}
// Add a stylesheet via <link> only once (works on file://)
function addStylesheetLinkOnce(href, dataAttr) {
  if (document.querySelector(`link[${dataAttr}][href="${href}"]`)) return;
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = href;
  l.setAttribute(dataAttr, "true");
  document.head.appendChild(l);
}
// Load HTML into a container; if fetch fails (e.g., file://), fallback to <iframe>
async function loadHtmlInto(container, url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(res.status + " " + res.statusText);
    const html = await res.text();
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    container.innerHTML = bodyMatch ? bodyMatch[1] : html;
  } catch (err) {
    // Fallback: iframe so it still works offline/file://
    container.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.title = url;
    iframe.style.width = "100%";
    iframe.style.minHeight = "70vh";
    iframe.style.border = "0";
    container.appendChild(iframe);
    console.warn("Fetch failed, used iframe for", url, err);
  }
}

// ===================== Inventory VIEW/ADD =====================
document.addEventListener("DOMContentLoaded", function () {
  const viewBtnGroup = document.getElementById("viewBtnGroup");
  const addBtnGroup = document.getElementById("addBtnGroup");
  const inventoryContentArea = document.getElementById("inventoryContentArea");

  function hideAllGroups() {
    if (viewBtnGroup) viewBtnGroup.style.display = "none";
    if (addBtnGroup) addBtnGroup.style.display = "none";
    if (inventoryContentArea) inventoryContentArea.innerHTML = "";
    document
      .querySelectorAll(
        "style[data-view-dynamic-style],style[data-add-dynamic-style],script[data-view-dynamic-script]"
      )
      .forEach((n) => n.remove());
  }

  document.getElementById("loadView")?.addEventListener("click", function (e) {
    e.preventDefault();
    window._showSection?.("inventorySection");
    window._updateHeader?.("inventorySection");
    localStorage.setItem("activeSection", "inventorySection");
    hideAllGroups();
    if (viewBtnGroup) viewBtnGroup.style.display = "flex";

    // keep the clicked dropdown item active (stay red)
    document.querySelectorAll(".sidebar-dropdown ul li").forEach(li => li.classList.remove("active"));
    this.parentElement?.classList.add("active");
  });

  document.getElementById("loadAdd")?.addEventListener("click", function (e) {
    e.preventDefault();
    window._showSection?.("inventorySection");
    window._updateHeader?.("inventorySection");
    localStorage.setItem("activeSection", "inventorySection");
    hideAllGroups();
    if (addBtnGroup) addBtnGroup.style.display = "flex";

    // keep the clicked dropdown item active (stay red)
    document.querySelectorAll(".sidebar-dropdown ul li").forEach(li => li.classList.remove("active"));
    this.parentElement?.classList.add("active");
  });

  // View actions
  document.getElementById("viewCollected")?.addEventListener("click", () =>
    loadViewSub("collectedUnits.html")
  );
  document.getElementById("viewDistributed")?.addEventListener("click", () =>
    loadViewSub("distributedUnits.html")
  );
  document.getElementById("viewDonor")?.addEventListener("click", () =>
    loadViewSub("donorInfo.html")
  );

  function loadViewSub(file) {
    if (!inventoryContentArea) return;
    inventoryContentArea.innerHTML =
      "<p style='padding:2em;text-align:center;color:#aaa;'>Loading...</p>";

    // Drop Summary assets so its CSS doesn't leak here
    try {
      document
        .querySelectorAll(
          'link[data-summary-dynamic-style],script[data-summary-dynamic-script],script[data-summary-lib]'
        )
        .forEach((n) => n.remove());
    } catch (_) {}

    // clear old view styles/scripts
    document
      .querySelectorAll(
        "style[data-view-dynamic-style],script[data-view-dynamic-script]"
      )
      .forEach((n) => n.remove());

    fetch(file)
      .then((res) => res.text())
      .then((html) => {
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        inventoryContentArea.innerHTML = bodyMatch ? bodyMatch[1] : html;

        // Use a <link> so it works on file:// as well
        addStylesheetLinkOnce("viewUnits.css", "data-view-dynamic-style");

        // Strong inline override to avoid forced scrollbars
        const fix = document.createElement("style");
        fix.setAttribute("data-view-dynamic-style", "true");
        fix.textContent = `
          #inventorySection .table-scroll { overflow-x: auto !important; overflow-y: hidden; max-width: 100%; }
        `;
        document.head.appendChild(fix);

        const s = document.createElement("script");
        s.setAttribute("data-view-dynamic-script", "true");
        s.src = "viewUnits.js";
        document.body.appendChild(s);

        // ✅ also load the localStorage table populator
        injectOptionalScript("view-loader.js");
      })
      .catch((err) => {
        inventoryContentArea.innerHTML = `<p style='color:red;'>Failed to load: ${err.message}</p>`;
      });
  }

  // Add actions
  document.getElementById("btnCollected")?.addEventListener("click", () =>
    loadAddSubForm("collected.html")
  );
  document.getElementById("btnDonors")?.addEventListener("click", () =>
    loadAddSubForm("donor.html")
  );
  document.getElementById("btnDistributed")?.addEventListener("click", () =>
    loadAddSubForm("distributed.html")
  );

  function loadAddSubForm(file) {
    if (!inventoryContentArea) return;
    inventoryContentArea.innerHTML =
      "<p style='padding:2em;text-align:center;color:#aaa;'>Loading...</p>";
    document
      .querySelectorAll("style[data-add-dynamic-style]")
      .forEach((n) => n.remove());
    Promise.all([fetch(file).then((r) => r.text())])
      .then(([html]) => {
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        inventoryContentArea.innerHTML = bodyMatch ? bodyMatch[1] : html;

        // use a <link> instead of inline css text
        const cssHref = file.replace(".html", ".css");
        addStylesheetLinkOnce(cssHref, "data-add-dynamic-style");

        // ✅ ensure the submit handler is bound for the injected form
        injectOptionalScript("addSubmit.js");
      })
      .catch((err) => {
        inventoryContentArea.innerHTML = `<p style='color:red;'>Failed to load: ${err.message}</p>`;
      });
  }
});

// ===================== Reservation (delegated clicks) =====================
document.addEventListener("DOMContentLoaded", function () {
  function switchToReservation() {
    window._showSection?.("reservationSection");
    window._updateHeader?.("reservationSection");
    localStorage.setItem("activeSection", "reservationSection");
  }
  function clearReservationContent() {
    const reservationContainer = document.getElementById("reservationContainer");
    if (reservationContainer) reservationContainer.innerHTML = "";
    document
      .querySelectorAll(
        "[data-reservation-dynamic-style], [data-reservation-dynamic-script]"
      )
      .forEach((n) => n.remove());
  }
  function injectScriptOnce(src) {
    if (
      document.querySelector(
        `script[data-reservation-dynamic-script][src="${src}"]`
      )
    )
      return;
    const s = document.createElement("script");
    s.src = src;
    s.defer = true;
    s.setAttribute("data-reservation-dynamic-script", "true");
    document.body.appendChild(s);
  }

  document.addEventListener("click", async function (e) {
    const viewBtn = e.target.closest("#loadReservationView");
    const addBtn = e.target.closest("#loadAddReservation");
    if (!viewBtn && !addBtn) return;

    e.preventDefault();
    leaveInventoryUI();
    switchToReservation();
    clearReservationContent();

    // keep the clicked dropdown item active (stay red)
    document.querySelectorAll(".sidebar-dropdown ul li").forEach(li => li.classList.remove("active"));
    (viewBtn || addBtn)?.parentElement?.classList.add("active");

    // drop Summary assets to prevent style leak
    try {
      document
        .querySelectorAll(
          'link[data-summary-dynamic-style],script[data-summary-dynamic-script],script[data-summary-lib]'
        )
        .forEach((n) => n.remove());
    } catch (_) {}

    const container = ensureContainer("reservationSection", "reservationContainer");
    if (!container) return;

    if (viewBtn) {
      container.innerHTML =
        "<p style='padding:2em;text-align:center;color:#888;'>Loading reservation view…</p>";

      // Styles & scripts via link/script (works on file://)
      addStylesheetLinkOnce("viewUnits.css", "data-reservation-dynamic-style");
      injectScriptOnce("viewUnits.js");

      await loadHtmlInto(container, "reservationView.html");
      injectOptionalScript("reservationView.js"); // optional
      injectOptionalScript("view-loader.js");     // ✅ required so the table fills
    }

    if (addBtn) {
      container.innerHTML =
        "<p style='padding:2em;text-align:center;color:#888;'>Loading reservation form…</p>";

      // Load HTML with fallback, add CSS via <link>
      await loadHtmlInto(container, "reservation.html");
      addStylesheetLinkOnce("reservation.css", "data-reservation-dynamic-style");

      // Optional page JS
      injectOptionalScript("reservation.js");
      injectOptionalScript("reservationAdd.js");
      injectOptionalScript("addSubmit.js");       // ✅ required so the form saves
    }
  });
});

// ===================== Transcription (delegated clicks) =====================
// ===================== Transcription (delegated clicks) — with View/Add button groups =====================
document.addEventListener("DOMContentLoaded", function () {
  function switchToTranscription() {
    window._showSection?.("transcriptionSection");
    window._updateHeader?.("transcriptionSection");
    localStorage.setItem("activeSection", "transcriptionSection");
  }
  function clearTranscriptionContent() {
    const transcriptionContainer = document.getElementById("transcriptionContainer");
    if (transcriptionContainer) transcriptionContainer.innerHTML = "";
    document
      .querySelectorAll("[data-transcription-dynamic-style],[data-transcription-dynamic-script]")
      .forEach((n) => n.remove());
  }
  function injectScriptOnce(src) {
    if (document.querySelector(`script[data-transcription-dynamic-script][src="${src}"]`)) return;
    const s = document.createElement("script");
    s.src = src;
    s.defer = true;
    s.setAttribute("data-transcription-dynamic-script", "true");
    document.body.appendChild(s);
  }

  // NEW: local refs to the button groups + content area
  const transcriptionViewBtnGroup = document.getElementById("transcriptionViewBtnGroup");
  const transcriptionAddBtnGroup  = document.getElementById("transcriptionAddBtnGroup");
  const transcriptionContentArea  = document.getElementById("transcriptionContentArea");

  function hideTranscriptionGroups() {
    if (transcriptionViewBtnGroup) transcriptionViewBtnGroup.style.display = "none";
    if (transcriptionAddBtnGroup)  transcriptionAddBtnGroup.style.display  = "none";
    if (transcriptionContentArea)  transcriptionContentArea.innerHTML      = "";
  }

  // Left sidebar submenu clicks
  document.addEventListener("click", async function (e) {
    const viewBtn = e.target.closest("#loadTranscriptionView");
    const addBtn  = e.target.closest("#loadAddTranscription");
    if (!viewBtn && !addBtn) return;

    e.preventDefault();
    leaveInventoryUI();
    switchToTranscription();
    clearTranscriptionContent();
    hideTranscriptionGroups();

    // keep the clicked dropdown item active (stay red)
    document.querySelectorAll(".sidebar-dropdown ul li").forEach(li => li.classList.remove("active"));
    (viewBtn || addBtn)?.parentElement?.classList.add("active");

    // drop Summary assets to prevent style leak
    try {
      document
        .querySelectorAll('link[data-summary-dynamic-style],script[data-summary-dynamic-script],script[data-summary-lib]')
        .forEach((n) => n.remove());
    } catch (_) {}

    const container = ensureContainer("transcriptionSection", "transcriptionContainer");
    if (!container) return;

    // Show the right button group
    if (viewBtn && transcriptionViewBtnGroup) transcriptionViewBtnGroup.style.display = "flex";
    if (addBtn  && transcriptionAddBtnGroup)  transcriptionAddBtnGroup.style.display  = "flex";
  });

  // View group actions
  document.getElementById("viewTranscription")?.addEventListener("click", () => {
    if (!transcriptionContentArea) return;
    transcriptionContentArea.innerHTML = "<p style='padding:2em;text-align:center;color:#888;'>Loading transcription view…</p>";
    addStylesheetLinkOnce("viewUnits.css", "data-transcription-dynamic-style");
    injectScriptOnce("viewUnits.js");
    loadHtmlInto(transcriptionContentArea, "transcriptionView.html");
    injectOptionalScript("transcriptionView.js"); // optional
    injectOptionalScript("view-loader.js");       // fills table from storage
  });

  document.getElementById("viewPatient")?.addEventListener("click", () => {
    if (!transcriptionContentArea) return;
    transcriptionContentArea.innerHTML = "<p style='padding:2em;text-align:center;color:#888;'>Loading patient view…</p>";
    addStylesheetLinkOnce("viewUnits.css", "data-transcription-dynamic-style");
    injectScriptOnce("viewUnits.js");
    loadHtmlInto(transcriptionContentArea, "patientView.html");
    injectOptionalScript("view-loader.js");
  });

  // Add group actions
  document.getElementById("btnTranscription")?.addEventListener("click", () => {
    if (!transcriptionContentArea) return;
    transcriptionContentArea.innerHTML = "<p style='padding:2em;text-align:center;color:#888;'>Loading transcription form…</p>";
    loadHtmlInto(transcriptionContentArea, "transcriptionAdd.html");
    addStylesheetLinkOnce("transcriptionAdd.css", "data-transcription-dynamic-style");
    injectOptionalScript("transcriptionAdd.js");
    injectOptionalScript("transcription.js");
    injectOptionalScript("addSubmit.js"); // saves to storage
  });

  document.getElementById("btnPatient")?.addEventListener("click", () => {
    if (!transcriptionContentArea) return;
    transcriptionContentArea.innerHTML = "<p style='padding:2em;text-align:center;color:#888;'>Loading patient form…</p>";
    loadHtmlInto(transcriptionContentArea, "patientAdd.html");
    addStylesheetLinkOnce("patientAdd.css", "data-transcription-dynamic-style");
    injectOptionalScript("addSubmit.js");
  });
});
// ===================== Summary Report (dynamic loader) =====================
document.addEventListener("DOMContentLoaded", function () {
  const summaryLink = document.querySelector(
    '.nav-list a[data-section="summarySection"]'
  );
  if (!summaryLink) return;

  function addScriptOnce(src, dataAttr) {
    if (document.querySelector(`script[${dataAttr}][src="${src}"]`)) return;
    const s = document.createElement("script");
    s.src = src;
    s.defer = true;
    s.setAttribute(dataAttr, "true");
    document.body.appendChild(s);
  }

  summaryLink.addEventListener("click", async function (e) {
    e.preventDefault();

    window._showSection?.("summarySection");
    window._updateHeader?.("summarySection");
    localStorage.setItem("activeSection", "summarySection");

    const container = ensureContainer("summarySection", "summaryContainer");
    if (!container) return;
    container.innerHTML =
      "<p style='padding:2em;text-align:center;color:#888;'>Loading summary report…</p>";

    // Inject HTML
    await loadHtmlInto(container, "summaryReport.html");

    // Add CSS/JS (mark them so we can remove when leaving)
    addStylesheetLinkOnce("summaryReport.css", "data-summary-dynamic-style");
    addScriptOnce("https://cdn.jsdelivr.net/npm/chart.js", "data-summary-lib");
    addScriptOnce(
      "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js",
      "data-summary-lib"
    );
    addScriptOnce(
      "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js",
      "data-summary-lib"
    );
    injectOptionalScript("summaryReport.js");
    document
      .querySelector('script[src="summaryReport.js"]')
      ?.setAttribute("data-summary-dynamic-script", "true");
  });
});

/* ========================================================================
   FAB SPEED-DIAL + BARCODE CAPTURE (USB keyboard-wedge)
   - Single FAB (#registerFab) toggles a small menu: [Scan only] / [Register]
   - Scan-only fills #scanOnlyCode, Register fills #regBarcode
   - Destination / Inventory type logic unchanged
   - "Save and open form" still routes and autofills forms
   ======================================================================== */
(function () {
  // --- Main controls ---
  const registerFab   = document.getElementById('registerFab');

  // Speed-dial menu + buttons
  const fabMenu       = document.getElementById('fabMenu');
  const btnScanOnly   = document.getElementById('fabScanOnly');
  const btnRegister   = document.getElementById('fabRegister');

  // Scan-only modal
  const scanOnlyModal = document.getElementById('scanOnlyModal');
  const scanOnlyCode  = document.getElementById('scanOnlyCode');
  const closeScanOnly = document.getElementById('closeScanOnly');
  const scanOnlySave  = document.getElementById('scanOnlySave');

  // Register modal & fields
  const regModal      = document.getElementById('registerModal');
  const regBarcode    = document.getElementById('regBarcode');
  const regWhere      = document.getElementById('regWhere');   // inventory | reservation | transcription
  const regSub        = document.getElementById('regSub');     // collected | distributed | donor (for inventory only)
  const regSubLabel   = document.getElementById('regSubLabel');
  const registerGo    = document.getElementById('registerGo');
  const closeRegister = document.getElementById('closeRegister');

  // --- Utilities ---
  function show(node, disp='flex'){ if(node) node.style.display = disp; }
  function hide(node){ if(node) node.style.display = 'none'; }
  function toggleMenu(){
    if (!fabMenu) return;
    const on = fabMenu.style.display !== 'grid';
    fabMenu.style.display = on ? 'grid' : 'none';
  }

  // Expose for other pages (unchanged)
  function applyPendingBarcode(){
    const code = localStorage.getItem('pendingBarcode');
    if (!code) return;
    const trySet = () => {
      const target =
        document.querySelector('[data-autofill="barcode"]') ||
        document.getElementById('barcode') ||
        document.querySelector('input[name*="barcode" i]') ||
        Array.from(document.querySelectorAll('input'))
          .find(i => /barcode/i.test(i.placeholder || ''));
      if (target) {
        target.value = code;
        target.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      return false;
    };
    if (!trySet()) setTimeout(trySet, 300);
    if (!trySet()) setTimeout(trySet, 900);
  }
  window.applyPendingBarcode = applyPendingBarcode;

  // --- Barcode keystroke capture (works for both modals) ---
  let buffer = '', last = 0;
  function isAnyScanModalOpen(){
    return (scanOnlyModal && scanOnlyModal.style.display === 'flex') ||
           (regModal     && regModal.style.display      === 'flex');
  }
  function keyListener(e){
    if (!isAnyScanModalOpen()) return;

    if (e.target && (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.isContentEditable)) return;

    const now = Date.now();
    if (now - last > 100) buffer = '';
    last = now;

    if (e.key === 'Enter' || e.key === 'Tab') {
      if (buffer) e.preventDefault?.();
      const code = buffer.trim();
      buffer = '';
      if (!code) return;
      // Fill whichever modal is open
      if (scanOnlyModal?.style.display === 'flex' && scanOnlyCode) scanOnlyCode.value = code;
      if (regModal?.style.display === 'flex'      && regBarcode)   regBarcode.value   = code;
      localStorage.setItem('pendingBarcode', code);
      return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) buffer += e.key;
  }
  function startListening(){ window.addEventListener('keydown', keyListener, true); }
  function stopListening(){ window.removeEventListener('keydown', keyListener, true); }

  function open(modal){
    if (!modal) return;
    // close menu so it doesn't sit behind
    hide(fabMenu);
    show(modal, 'flex');
    startListening();
  }
  function close(modal){
    if (!modal) return;
    hide(modal);
    stopListening();
  }

  // --- FAB click => toggle speed-dial (not the register modal directly) ---
  registerFab?.addEventListener('click', () => {
    toggleMenu();
  });

  // --- Speed-dial actions ---
  btnScanOnly?.addEventListener('click', () => {
    scanOnlyCode.value = localStorage.getItem('pendingBarcode') || '';
    open(scanOnlyModal);
  });
  btnRegister?.addEventListener('click', () => {
    // Reset register fields each time
    regBarcode.value = localStorage.getItem('pendingBarcode') || '';
    if (regWhere) regWhere.value = "";
    if (regSub)   { regSub.value = ""; regSub.disabled = true; }
    if (regSubLabel) regSubLabel.style.opacity = 0.6;
    open(regModal);
  });

  // --- Close handlers / backdrop close ---
  closeScanOnly?.addEventListener('click', () => close(scanOnlyModal));
  scanOnlyModal?.addEventListener('click', (e)=>{ if (e.target === scanOnlyModal) close(scanOnlyModal); });

  closeRegister?.addEventListener('click', () => close(regModal));
  regModal?.addEventListener('click', (e)=>{ if (e.target === regModal) close(regModal); });

  // --- Scan-only "Save" (store value; you can expand this to log/queue later) ---
  scanOnlySave?.addEventListener('click', () => {
    const code = (scanOnlyCode?.value || '').trim();
    if (!code) { alert('No barcode scanned yet.'); return; }
    localStorage.setItem('lastScanned', code);
    close(scanOnlyModal);
    alert('Saved barcode: ' + code);
  });

  // --- Destination/type toggle (unchanged) ---
  regWhere?.addEventListener('change', () => {
    const inv = regWhere.value === 'inventory';
    if (regSub) { 
      regSub.disabled = !inv;
      regSub.value = "";
    }
    if (regSubLabel) regSubLabel.style.opacity = inv ? 1 : 0.6;
  });

  // --- Save + navigate + autofill (unchanged logic) ---
  registerGo?.addEventListener('click', async () => {
    const code = regBarcode?.value?.trim();
    if (!code) { alert('Scan a code first'); return; }
    if (!regWhere?.value) { alert('Select a destination'); return; }
    if (regWhere.value === 'inventory' && !regSub?.value) { alert('Select an inventory type'); return; }

    localStorage.setItem('pendingBarcode', code);
    const where = regWhere.value;
    close(regModal);

    function waitFor(cond, timeout=8000, interval=60){
      return new Promise((resolve, reject) => {
        const deadline = Date.now() + timeout;
        (function tick(){
          const v = typeof cond === 'function' ? cond() : document.querySelector(cond);
          if (v) return resolve(v);
          if (Date.now() > deadline) return reject(new Error('timeout'));
          setTimeout(tick, interval);
        })();
      });
    }

    if (where === 'inventory') {
      const sub = regSub?.value || 'collected'; // collected / distributed / donor
      document.getElementById('loadAdd')?.click();
      await waitFor(() => document.getElementById('btnCollected'));
      const map = { collected:'btnCollected', distributed:'btnDistributed', donor:'btnDonors' };
      document.getElementById(map[sub])?.click();
      setTimeout(applyPendingBarcode, 500);
    } else if (where === 'reservation') {
      document.getElementById('loadAddReservation')?.click();
      setTimeout(applyPendingBarcode, 600);
    } else {
      document.getElementById('loadAddTranscription')?.click();
      setTimeout(applyPendingBarcode, 600);
    }
  });
})();
// ===================== Capture-phase override for quick section switches =====================
document.addEventListener('click', async function (e) {
  const t = e.target;
  if (!(t instanceof Element)) return;

  const hit = sel => t.closest(sel);

  // little util
  function go(sectionId, html, cssHref, extraJs = []) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();

    // leave other UIs
    try { leaveInventoryUI(); } catch(_) {}

    // switch section + header
    window._showSection?.(sectionId);
    window._updateHeader?.(sectionId);
    localStorage.setItem('activeSection', sectionId);

    // drop Summary assets so its CSS won't leak
    document.querySelectorAll(
      'link[data-summary-dynamic-style],script[data-summary-dynamic-script],script[data-summary-lib]'
    ).forEach(n => n.remove());

    const containerId = sectionId.replace('Section','Container');
    const container = ensureContainer(sectionId, containerId);
    if (!container) return;

    container.innerHTML = "<p style='padding:2em;text-align:center;color:#888;'>Loading…</p>";

    // base styles (via <link>)
    addStylesheetLinkOnce(cssHref, `data-${sectionId.split('Section')[0]}-dynamic-style`);

    // load page HTML
    loadHtmlInto(container, html).then(() => {
      // optional page scripts
      extraJs.forEach(injectOptionalScript);
    });
  }

  // keep li active state

  // --- Quick-switch handling for Transcription: show button groups (do NOT load a page here)
  const tcv = hit('#loadTranscriptionView');
  if (tcv) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();

    try { leaveInventoryUI(); } catch(_) {}

    window._showSection?.('transcriptionSection');
    window._updateHeader?.('transcriptionSection');
    localStorage.setItem('activeSection','transcriptionSection');

    document.querySelectorAll(".sidebar-dropdown ul li").forEach(li => li.classList.remove("active"));
    tcv.parentElement?.classList.add("active");

    // Ensure container exists and show the correct group
    ensureContainer('transcriptionSection','transcriptionContainer');
    document.getElementById('transcriptionAddBtnGroup')?.style.setProperty('display','none');
    document.getElementById('transcriptionViewBtnGroup')?.style.setProperty('display','flex');
    document.getElementById('transcriptionContentArea')?.replaceChildren();
    return;
  }
  const tca = hit('#loadAddTranscription');
  if (tca) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();

    try { leaveInventoryUI(); } catch(_) {}

    window._showSection?.('transcriptionSection');
    window._updateHeader?.('transcriptionSection');
    localStorage.setItem('activeSection','transcriptionSection');

    document.querySelectorAll(".sidebar-dropdown ul li").forEach(li => li.classList.remove("active"));
    tca.parentElement?.classList.add("active");

    // Ensure container exists and show the correct group
    ensureContainer('transcriptionSection','transcriptionContainer');
    document.getElementById('transcriptionViewBtnGroup')?.style.setProperty('display','none');
    document.getElementById('transcriptionAddBtnGroup')?.style.setProperty('display','flex');
    document.getElementById('transcriptionContentArea')?.replaceChildren();
    return;
  }

  const rsv = hit('#loadReservationView');
  if (rsv) {
    document.querySelectorAll(".sidebar-dropdown ul li").forEach(li => li.classList.remove("active"));
    rsv.parentElement?.classList.add("active");
    go('reservationSection',  'reservationView.html',  'viewUnits.css', ['viewUnits.js','reservationView.js','view-loader.js']); // + view-loader.js
    return;
  }
  const rsa = hit('#loadAddReservation');
  if (rsa) {
    document.querySelectorAll(".sidebar-dropdown ul li").forEach(li => li.classList.remove("active"));
    rsa.parentElement?.classList.add("active");
    go('reservationSection',  'reservation.html',      'reservation.css', ['reservation.js','reservationAdd.js','addSubmit.js']); // + addSubmit.js
    return;
  }
}, true);
// --- Option only Restore saved Announcements/News on page load ---
// --- for presentation only ---
document.addEventListener("DOMContentLoaded", () => {
  function safeParse(k){ try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; } }

  const annWrap  = document.querySelector("#announcements .announcement-carousel");
  const newsWrap = document.querySelector(".news-card .news-list");

  if (annWrap) {
    const anns = safeParse("bb_announcements");
    anns.forEach(a => {
      const node = document.createElement("div");
      node.className = "announcement-item";
      node.innerHTML = `
        <img src="${a.img || ""}" alt="${(a.title || "")}" class="announcement-img"/>
        <div class="announcement-text">
          <h3>${(a.title || "")}</h3>
          <p class="date">${(a.date || "")}</p>
          <p>${(a.content || "")}</p>
        </div>`;
      annWrap.appendChild(node);
    });
  }

  if (newsWrap) {
    const news = safeParse("bb_news");
    news.forEach(n => {
      const node = document.createElement("div");
      node.className = "news-item";
      node.innerHTML = `
        <img class="news-img" src="${n.img || ""}" alt="${(n.title || "")}">
        <div class="news-item-title">${(n.title || "")}</div>
        <div class="news-date">${(n.date || "")}</div>
        <div class="news-desc">${(n.content || "")}</div>`;
      newsWrap.appendChild(node);
    });
  }
});

// --- Option only Restore saved Announcements/News on page load ---
// --- for presentation only ---



/* ========================================================================
   SIDEBAR SEARCH (top-level + submenu + aliases) — paste at file bottom
   ======================================================================== */
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector(".sidebar input[type='text']");
  if (!searchInput) return;

  // Dropdown buttons & containers
  const invBtn  = document.getElementById("inventoryDropdownBtn");
  const resBtn  = document.getElementById("reservationDropdownBtn");
  const trnBtn  = document.getElementById("transcriptionDropdownBtn");

  const invLi   = invBtn?.closest("li");
  const resLi   = resBtn?.closest("li");
  const trnLi   = trnBtn?.closest("li");

  const invDrop = document.getElementById("inventoryDropdown");
  const resDrop = document.getElementById("reservationDropdown");
  const trnDrop = document.getElementById("transcriptionDropdown");

  const openDropdownSafe = (btn, drop) => {
    if (!btn || !drop) return;
    if (!btn.parentElement.classList.contains("open")) {
      drop.style.display = "block";
      requestAnimationFrame(() => drop.style.maxHeight = drop.scrollHeight + "px");
      btn.parentElement.classList.add("open");
      btn.setAttribute("aria-expanded","true");
    }
  };
  const closeDropdownSafe = (btn, drop) => {
    if (!btn || !drop) return;
    drop.style.maxHeight = "0";
    btn.parentElement.classList.remove("open");
    btn.setAttribute("aria-expanded","false");
    drop.addEventListener("transitionend", () => {
      if (!btn.parentElement.classList.contains("open")) drop.style.display = "none";
    }, { once:true });
  };
  const ensureSidebarVisible = () => {
    const sb = document.querySelector(".sidebar");
    if (sb && !sb.classList.contains("open")) { sb.classList.add("open"); menuBtnChange?.(); }
  };
  const highlightLi = (li) => {
    document.querySelectorAll(".nav-list li").forEach(n => n.classList.remove("active"));
    li?.classList.add("active");
  };

  // Build searchable entries
  const entries = [];

  // 1) Top-level items
  document.querySelectorAll(".nav-list > li > a[data-section]").forEach(a => {
    const li = a.closest("li");
    const label = (a.textContent || "").trim().toLowerCase();
    const sectionId = a.getAttribute("data-section");
    entries.push({
      label, li, type:"top",
      open: () => { ensureSidebarVisible();
        window._showSection?.(sectionId);
        window._updateHeader?.(sectionId);
        localStorage.setItem("activeSection", sectionId);
        highlightLi(li);
      }
    });
  });

  // 2) Dropdown headers
  [
    {btn:invBtn, li:invLi, drop:invDrop, label:"inventory"},
    {btn:resBtn, li:resLi, drop:resDrop, label:"reservation"},
    {btn:trnBtn, li:trnLi, drop:trnDrop, label:"transcription"},
  ].forEach(d => {
    if (!d.btn || !d.li) return;
    entries.push({
      label:d.label, li:d.li, type:"header",
      open: () => { ensureSidebarVisible(); openDropdownSafe(d.btn,d.drop); highlightLi(d.li); }
    });
  });

  // 3) Submenu items inside dropdowns (View/Add)
  function addSubmenu(parentLabel, parentLi, dropSelector) {
    const drop = parentLi?.querySelector(dropSelector);
    drop?.querySelectorAll("ul > li > a").forEach(a => {
      const itemLi = a.closest("li");
      const raw = (a.textContent || "").trim().toLowerCase();   // "view" | "add"
      const label = `${parentLabel} ${raw}`;                     // e.g., "inventory view"
      entries.push({
        label, li:itemLi, type:"submenu",
        open: () => {
          ensureSidebarVisible();
          const btn = parentLi.querySelector("a[id$='DropdownBtn']");
          const cont = parentLi.querySelector(dropSelector);
          openDropdownSafe(btn, cont);
          a.click(); // let existing handlers load content
          document.querySelectorAll(".sidebar-dropdown ul li").forEach(n => n.classList.remove("active"));
          itemLi?.classList.add("active");
        }
      });
    });
  }
  addSubmenu("inventory",    invLi, ".sidebar-dropdown#inventoryDropdown");
  addSubmenu("reservation",  resLi, ".sidebar-dropdown#reservationDropdown");
  addSubmenu("transcription",trnLi, ".sidebar-dropdown#transcriptionDropdown");

  // 4) Aliases for the flows you want (Collected/Distributed/Donor/etc.)
  function alias(labels, open) { labels.forEach(l => entries.push({ label:l.toLowerCase(), li:null, type:"alias", open })); }
  function waitFor(sel, timeout=5000){ return new Promise((res,rej)=>{const t0=Date.now();(function tick(){const el=typeof sel==="function"?sel():document.querySelector(sel); if(el)return res(el); if(Date.now()-t0>timeout)return rej(new Error("timeout")); setTimeout(tick,60);}())});}

  // Inventory VIEW (collected/distributed/donor)
  alias(["view collected units","collected units view","inventory view collected units",
         "view distributed units","distributed units view","inventory view distributed units",
         "view donor info","donor info view","inventory view donor info"], async () => {
    ensureSidebarVisible();
    document.getElementById("loadView")?.click();
    await waitFor(() => document.getElementById("viewCollected"));
    const q = searchInput.value.toLowerCase();
    const id = q.includes("distributed") ? "viewDistributed" : q.includes("donor") ? "viewDonor" : "viewCollected";
    document.getElementById(id)?.click();
  });

  // Inventory ADD (collected/distributed/donor)
  alias(["add collected units","inventory add collected units",
         "add distributed units","inventory add distributed units",
         "add donor info","inventory add donor info"], async () => {
    ensureSidebarVisible();
    document.getElementById("loadAdd")?.click();
    await waitFor(() => document.getElementById("btnCollected"));
    const q = searchInput.value.toLowerCase();
    const id = q.includes("distributed") ? "btnDistributed" : q.includes("donor") ? "btnDonors" : "btnCollected";
    document.getElementById(id)?.click();
  });

  // Reservation (view/add) + blood unit reservation -> add
  alias(["reservation view","view reservation","reservations view"], () => {
    ensureSidebarVisible(); document.getElementById("loadReservationView")?.click();
  });
  alias(["reservation add","add reservation","blood unit reservation","blood unit reservation add"], () => {
    ensureSidebarVisible(); document.getElementById("loadAddReservation")?.click();
  });

  // Transcription (view/patient/add)
  alias(["transcription view","view transcription"], () => {
    ensureSidebarVisible(); document.getElementById("loadTranscriptionView")?.click();
    setTimeout(() => document.getElementById("viewTranscription")?.click(), 150);
  });
  alias(["patient view","view patient","transcription patient view"], () => {
    ensureSidebarVisible(); document.getElementById("loadTranscriptionView")?.click();
    setTimeout(() => document.getElementById("viewPatient")?.click(), 150);
  });
  alias(["transcription add","add transcription"], () => {
    ensureSidebarVisible(); document.getElementById("loadAddTranscription")?.click();
    setTimeout(() => document.getElementById("btnTranscription")?.click(), 150);
  });
  alias(["patient add","add patient","transcription patient add"], () => {
    ensureSidebarVisible(); document.getElementById("loadAddTranscription")?.click();
    setTimeout(() => document.getElementById("btnPatient")?.click(), 150);
  });

  // Summary Reports
  alias(["summary","summary report","summary reports"], () => {
    ensureSidebarVisible();
    window._showSection?.("summarySection");
    window._updateHeader?.("summarySection");
    localStorage.setItem("activeSection","summarySection");
    document.querySelector('.nav-list a[data-section="summarySection"]')?.click();
  });

  // ---------- Filter UI ----------
  const allTopLis = Array.from(document.querySelectorAll(".nav-list > li"));
  const allSubLis = Array.from(document.querySelectorAll(".sidebar-dropdown ul > li"));

  function resetAll(){
    allTopLis.forEach(li => { if (!li.querySelector("input")) li.style.display = "block"; });
    allSubLis.forEach(li => li.style.display = "list-item");
    closeDropdownSafe(invBtn, invDrop);
    closeDropdownSafe(resBtn, resDrop);
    closeDropdownSafe(trnBtn, trnDrop);
  }

  // ✅ Improved live filter: also reveals the right submenu rows for aliases
  searchInput.addEventListener("input", function () {
    const term = this.value.trim().toLowerCase();
    if (!term) { resetAll(); return; }

    // refs to submenu <li> we may force-show for alias terms
    const invViewLi = document.querySelector("#inventoryDropdown a#loadView")?.closest("li");
    const invAddLi  = document.querySelector("#inventoryDropdown a#loadAdd")?.closest("li");
    const resViewLi = document.querySelector("#reservationDropdown a#loadReservationView")?.closest("li");
    const resAddLi  = document.querySelector("#reservationDropdown a#loadAddReservation")?.closest("li");
    const trnViewLi = document.querySelector("#transcriptionDropdown a#loadTranscriptionView")?.closest("li");
    const trnAddLi  = document.querySelector("#transcriptionDropdown a#loadAddTranscription")?.closest("li");

    // Hide everything (except the search row)
    allTopLis.forEach(li => { if (!li.querySelector("input")) li.style.display = "none"; });
    allSubLis.forEach(li => li.style.display = "none");

    const parentsToExpand = new Set();

    entries.forEach(entry => {
      if (!entry.label.includes(term)) return;

      if (entry.type === "top") {
        entry.li.style.display = "block";
      } else if (entry.type === "header") {
        entry.li.style.display = "block";
        parentsToExpand.add(entry.li);
      } else if (entry.type === "submenu") {
        const parentLi = entry.li?.closest("li");
        if (parentLi) parentLi.style.display = "block";
        entry.li.style.display = "list-item";
        parentsToExpand.add(parentLi);
      } else if (entry.type === "alias") {
        // Make the relevant parent visible…
        if (/inventory/.test(entry.label)) { invLi && (invLi.style.display = "block", parentsToExpand.add(invLi)); }
        if (/reservation|blood unit/.test(entry.label)) { resLi && (resLi.style.display = "block", parentsToExpand.add(resLi)); }
        if (/transcription|patient/.test(entry.label)) { trnLi && (trnLi.style.display = "block", parentsToExpand.add(trnLi)); }
        if (/summary/.test(entry.label)) {
          const li = document.querySelector('.nav-list > li > a[data-section="summarySection"]')?.closest("li");
          li && (li.style.display = "block");
        }

        // …and also reveal the specific submenu rows users should click:
        if (/inventory/.test(entry.label)) {
          // for inventory, show both View and Add so the user can decide
          invViewLi && (invViewLi.style.display = "list-item");
          invAddLi  && (invAddLi.style.display  = "list-item");
        }
        if (/reservation/.test(entry.label) || /blood unit/.test(entry.label)) {
          // for "blood unit reservation" we mainly want Add
          if (/blood unit/.test(entry.label)) {
            resAddLi && (resAddLi.style.display = "list-item");
          } else {
            resViewLi && (resViewLi.style.display = "list-item");
            resAddLi  && (resAddLi.style.display  = "list-item");
          }
        }
        if (/transcription|patient/.test(entry.label)) {
          // show both "Transcription" (view group) and "Add" in submenu
          trnViewLi && (trnViewLi.style.display = "list-item");
          trnAddLi  && (trnAddLi.style.display  = "list-item");
        }
      }
    });

    // Expand any parents with visible children
    parentsToExpand.forEach(parentLi => {
      if (!parentLi) return;
      const btn = parentLi.querySelector("a[id$='DropdownBtn']");
      const drop = parentLi.querySelector(".sidebar-dropdown");
      openDropdownSafe(btn, drop);
    });
  });

  // Enter to open first visible match; Esc to clear
  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { this.value = ""; resetAll(); return; }
    if (e.key !== "Enter") return;

    const term = this.value.trim().toLowerCase();
    if (!term) return;

    const first = entries.find(entry => {
      if (entry.type === "alias") return entry.label.includes(term);
      const li = entry.li;
      return li && li.style.display !== "none" && entry.label.includes(term);
    });
    if (!first) return;
    e.preventDefault();
    try { first.open(); } catch (_) { first.open(); }
  });
});

