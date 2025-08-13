// Sidebar logic
let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let searchBtn = document.querySelector(".bx-search");

// Select all navigation links and the home-section text container
const navLinks = document.querySelectorAll('.nav-list li a');
const homeSectionText = document.querySelector('.home-section .text');

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

// Function to set the active tab
function setActiveTab(selectedTab) {
    navLinks.forEach((link) => link.parentElement.classList.remove('active'));
    selectedTab.parentElement.classList.add('active');
    const tabText = selectedTab.querySelector('.links_name')?.textContent || '';
    if (homeSectionText) homeSectionText.textContent = tabText;
}

// Add click event listeners to all navigation links
navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        setActiveTab(link);
    });
});

// Default active tab
document.addEventListener('DOMContentLoaded', () => {
    const defaultTab = document.querySelector('.nav-list li a[data-section="dashboardSection"]');
    if (defaultTab) setActiveTab(defaultTab);
});

// Logout modal
function showLogoutModal(){ document.getElementById('logoutModal').style.display='flex'; }
function hideLogoutModal(){ document.getElementById('logoutModal').style.display='none'; }
function confirmLogout(){ window.location.href='login.html'; }
document.getElementById('confirmLogout')?.addEventListener('click', confirmLogout);
document.getElementById('cancelLogout')?.addEventListener('click', hideLogoutModal);

// Sections + header logic
document.addEventListener('DOMContentLoaded', function () {
  const links = document.querySelectorAll('.nav-list a[data-section]');
  const sections = document.querySelectorAll('.content-section');

  function showSection(sectionId) {
    sections.forEach(section => {
      const on = section.id === sectionId;
      section.classList.toggle('active', on);
      section.style.display = on ? 'block' : 'none';
    });
    links.forEach(link => {
      link.parentElement.classList.toggle('active', link.getAttribute('data-section') === sectionId);
    });
  }

  // Header title + Post button
  const headerTitle = document.getElementById('dashboardHeaderTitle');
  const postBtn = document.getElementById('postAnnouncementBtn');
  const sectionTitles = {
    dashboardSection: 'BloodBank Record Management and Inventory System',
    inventorySection: 'Inventory Management',
    reservationSection: 'Reservation',
    newsSection: 'News & Updates',
    transcriptionSection: 'Transcription',
    summarySection: 'Summary Report',
    settingsSection: 'BloodBank Record Management and Inventory System',
  };
  function updateHeader(sectionId) {
    if (headerTitle) headerTitle.textContent = sectionTitles[sectionId] || '';
    if (postBtn) postBtn.style.display = (sectionId === 'dashboardSection') ? 'block' : 'none';
  }

  // expose
  window._showSection = showSection;
  window._updateHeader = updateHeader;

  // Always start on Dashboard
  (function forceDashboard(){
    showSection('dashboardSection');
    updateHeader('dashboardSection');
    localStorage.setItem('activeSection', 'dashboardSection');
  })();

  // Generic navigation (skip dropdown headers) + CLOSE ALL DROPDOWNS on section change
  links.forEach(link => {
    link.addEventListener('click', function (e) {
      const id = this.id;
      if (id === 'inventoryDropdownBtn' || id === 'reservationDropdownBtn' || id === 'transcriptionDropdownBtn') {
        return;
      }
      e.preventDefault();
      const target = this.getAttribute('data-section');
      if (!target) return;

      // NEW: close dropdowns when switching to e.g. Summary, Settings, News, etc.
      closeAllDropdowns();

      showSection(target);
      localStorage.setItem('activeSection', target);
      updateHeader(target);
    });
  });

  // Accordion for settings
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', function () {
      this.classList.toggle('active');
      const panel = this.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  // ===== Dropdowns =====
  const inventoryBtn = document.getElementById('inventoryDropdownBtn');
  const reservationBtn = document.getElementById('reservationDropdownBtn');
  const transcriptionBtn = document.getElementById('transcriptionDropdownBtn');

  const inventoryDropdown = document.getElementById('inventoryDropdown');
  const reservationDropdown = document.getElementById('reservationDropdown');
  const transcriptionDropdown = document.getElementById('transcriptionDropdown');

  function closeDropdown(btn, dropdown){
    if (!dropdown || !btn) return;
    dropdown.style.maxHeight = '0';
    btn.parentElement.classList.remove('open');
    dropdown.addEventListener('transitionend', () => {
      if (!btn.parentElement.classList.contains('open')) {
        dropdown.style.display = 'none';
      }
    }, { once: true });
    btn.setAttribute('aria-expanded','false');
  }

  function openDropdown(btn, dropdown){
    if (!dropdown || !btn) return;
    dropdown.style.display = 'block';
    requestAnimationFrame(() => {
      dropdown.style.maxHeight = dropdown.scrollHeight + 'px';
    });
    btn.parentElement.classList.add('open');
    btn.setAttribute('aria-expanded','true');
  }

  function closeAllDropdowns() {
    closeDropdown(inventoryBtn, inventoryDropdown);
    closeDropdown(reservationBtn, reservationDropdown);
    closeDropdown(transcriptionBtn, transcriptionDropdown);
  }

  // open sidebar if collapsed
  function openSidebarIfCollapsed() {
    if (!sidebar.classList.contains('open')) {
      sidebar.classList.add('open');
      menuBtnChange();
    }
  }

  function toggleDropdownExclusive(btn, dropdown) {
    const isOpen = btn?.parentElement.classList.contains('open');
    if (isOpen) return; // keep it open
    closeAllDropdowns();
    openDropdown(btn, dropdown);
  }

  // Inventory header (NO section change here)
  inventoryBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openSidebarIfCollapsed();
    toggleDropdownExclusive(inventoryBtn, inventoryDropdown);
    // intentionally do NOT change sections
  });

  // Reservation header
  reservationBtn?.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    openSidebarIfCollapsed();
    toggleDropdownExclusive(reservationBtn, reservationDropdown);
  });

  // Transcription header
  transcriptionBtn?.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    openSidebarIfCollapsed();
    toggleDropdownExclusive(transcriptionBtn, transcriptionDropdown);
  });

  // Close all when collapsing sidebar
  closeBtn?.addEventListener("click", () => {
    setTimeout(() => {
      if (!document.querySelector('.sidebar').classList.contains('open')) {
        closeAllDropdowns();
      }
    }, 100);
  });

  // Keep submenu clicks from closing dropdowns
  document.querySelectorAll('.sidebar-dropdown a').forEach(link => {
    link.addEventListener('click', (e) => e.stopPropagation());
  });
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

// Announcement popup logic
document.addEventListener("DOMContentLoaded", function () {
  const postBtn = document.getElementById("postAnnouncementBtn");
  const popup = document.getElementById("announcementPopup");
  const popupBody = document.getElementById("announcementPopupBody");
  const closeBtnX = document.getElementById("closeAnnouncementPopup");

  postBtn?.addEventListener("click", function () {
    popup.style.display = "flex";
    Promise.all([
      fetch("announcementbtn.html").then(res => res.text()),
      fetch("announcementbtn.css").then(res => res.text())
    ])
    .then(([html, css]) => {
      const bodyContent = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const styleTag = `<style>${css}</style>`;
      popupBody.innerHTML = styleTag + (bodyContent ? bodyContent[1] : html);
    })
    .catch(err => {
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

// ============ Inventory VIEW/ADD ============
document.addEventListener('DOMContentLoaded', function () {
  const viewBtnGroup = document.getElementById('viewBtnGroup');
  const addBtnGroup = document.getElementById('addBtnGroup');
  const inventoryContentArea = document.getElementById('inventoryContentArea');

  function hideAllGroups() {
    if (viewBtnGroup) viewBtnGroup.style.display = 'none';
    if (addBtnGroup) addBtnGroup.style.display = 'none';
    if (inventoryContentArea) inventoryContentArea.innerHTML = "";
    document.querySelectorAll('style[data-view-dynamic-style],style[data-add-dynamic-style],script[data-view-dynamic-script]').forEach(n => n.remove());
  }

  document.getElementById('loadView')?.addEventListener('click', function (e) {
    e.preventDefault();
    window._showSection?.('inventorySection');
    window._updateHeader?.('inventorySection');
    localStorage.setItem('activeSection', 'inventorySection');
    hideAllGroups();
    if (viewBtnGroup) viewBtnGroup.style.display = 'flex';
  });

  document.getElementById('loadAdd')?.addEventListener('click', function (e) {
    e.preventDefault();
    window._showSection?.('inventorySection');
    window._updateHeader?.('inventorySection');
    localStorage.setItem('activeSection', 'inventorySection');
    hideAllGroups();
    if (addBtnGroup) addBtnGroup.style.display = 'flex';
  });

  // View actions
  document.getElementById('viewCollected')?.addEventListener('click', () => loadViewSub('collectedUnits.html'));
  document.getElementById('viewDistributed')?.addEventListener('click', () => loadViewSub('distributedUnits.html'));
  document.getElementById('viewDonor')?.addEventListener('click', () => loadViewSub('donorInfo.html'));

  function loadViewSub(file) {
    if (!inventoryContentArea) return;
    inventoryContentArea.innerHTML = "<p style='padding:2em;text-align:center;color:#aaa;'>Loading...</p>";
    document.querySelectorAll('style[data-view-dynamic-style],script[data-view-dynamic-script]').forEach(n => n.remove());

    fetch(file).then(res => res.text()).then(html => {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      inventoryContentArea.innerHTML = bodyMatch ? bodyMatch[1] : html;

      // use a <link> so it works on file:// as well
      addStylesheetLinkOnce('viewUnits.css', 'data-view-dynamic-style');

      const s = document.createElement('script');
      s.setAttribute('data-view-dynamic-script', 'true');
      s.src = 'viewUnits.js';
      document.body.appendChild(s);
    }).catch(err => {
      inventoryContentArea.innerHTML = `<p style='color:red;'>Failed to load: ${err.message}</p>`;
    });
  }

  // Add actions
  document.getElementById('btnCollected')?.addEventListener('click', () => loadAddSubForm('collected.html'));
  document.getElementById('btnDonors')?.addEventListener('click', () => loadAddSubForm('donor.html'));
  document.getElementById('btnDistributed')?.addEventListener('click', () => loadAddSubForm('distributed.html'));

  function loadAddSubForm(file) {
    if (!inventoryContentArea) return;
    inventoryContentArea.innerHTML = "<p style='padding:2em;text-align:center;color:#aaa;'>Loading...</p>";
    document.querySelectorAll('style[data-add-dynamic-style]').forEach(n => n.remove());
    Promise.all([
      fetch(file).then(r => r.text())
    ]).then(([html]) => {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      inventoryContentArea.innerHTML = bodyMatch ? bodyMatch[1] : html;

      // use a <link> instead of fetch text
      const cssHref = file.replace('.html', '.css');
      addStylesheetLinkOnce(cssHref, 'data-add-dynamic-style');
    }).catch(err => {
      inventoryContentArea.innerHTML = `<p style='color:red;'>Failed to load: ${err.message}</p>`;
    });
  }
});

// ============ Helpers used by Reservation/Transcription ============
function ensureContainer(sectionId, containerId) {
  let container = document.getElementById(containerId);
  const section = document.getElementById(sectionId);
  if (!section) return null;
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    section.appendChild(container);
  }
  section.style.display = 'block';
  return container;
}
function injectOptionalScript(src) {
  const s = document.createElement('script');
  s.src = src;
  s.defer = true;
  s.onerror = () => { try { s.remove(); } catch(e){} };
  document.body.appendChild(s);
}
function leaveInventoryUI() {
  const viewBtnGroup = document.getElementById('viewBtnGroup');
  const addBtnGroup  = document.getElementById('addBtnGroup');
  if (viewBtnGroup) viewBtnGroup.style.display = 'none';
  if (addBtnGroup)  addBtnGroup.style.display  = 'none';
}
// Add a stylesheet via <link> only once (works on file://)
function addStylesheetLinkOnce(href, dataAttr) {
  if (document.querySelector(`link[${dataAttr}][href="${href}"]`)) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = href;
  l.setAttribute(dataAttr, 'true');
  document.head.appendChild(l);
}
// Load HTML into a container; if fetch fails (e.g., file://), fallback to <iframe>
async function loadHtmlInto(container, url) {
  try {
    const res = await fetch(url, {cache:'no-store'});
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    const html = await res.text();
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    container.innerHTML = bodyMatch ? bodyMatch[1] : html;
  } catch (err) {
    // Fallback: iframe so it still works offline/file://
    container.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.title = url;
    iframe.style.width = '100%';
    iframe.style.minHeight = '70vh';
    iframe.style.border = '0';
    container.appendChild(iframe);
    console.warn('Fetch failed, used iframe for', url, err);
  }
}

// ============ Reservation (delegated clicks with .closest) ============
document.addEventListener('DOMContentLoaded', function () {
  function switchToReservation() {
    window._showSection?.('reservationSection');
    window._updateHeader?.('reservationSection');
    localStorage.setItem('activeSection', 'reservationSection');
  }
  function clearReservationContent() {
    const reservationContainer = document.getElementById('reservationContainer');
    if (reservationContainer) reservationContainer.innerHTML = "";
    document.querySelectorAll('[data-reservation-dynamic-style], [data-reservation-dynamic-script]').forEach(n => n.remove());
  }
  function injectScriptOnce(src) {
    if (document.querySelector(`script[data-reservation-dynamic-script][src="${src}"]`)) return;
    const s = document.createElement('script');
    s.src = src;
    s.defer = true;
    s.setAttribute('data-reservation-dynamic-script', 'true');
    document.body.appendChild(s);
  }

  document.addEventListener('click', async function(e){
    const viewBtn = e.target.closest('#loadReservationView');
    const addBtn  = e.target.closest('#loadAddReservation');
    if (!viewBtn && !addBtn) return;

    e.preventDefault();
    leaveInventoryUI();
    switchToReservation();
    clearReservationContent();

    const container = ensureContainer('reservationSection', 'reservationContainer');
    if (!container) return;

    if (viewBtn) {
      container.innerHTML = "<p style='padding:2em;text-align:center;color:#888;'>Loading reservation view…</p>";

      // Styles & scripts via link/script (works on file://)
      addStylesheetLinkOnce('viewUnits.css', 'data-reservation-dynamic-style');
      injectScriptOnce('viewUnits.js');

      await loadHtmlInto(container, 'reservationView.html');
      injectOptionalScript('reservationView.js'); // optional
    }

    if (addBtn) {
      container.innerHTML = "<p style='padding:2em;text-align:center;color:#888;'>Loading reservation form…</p>";

      // Load HTML with fallback, add CSS via <link>
      await loadHtmlInto(container, 'reservation.html');
      addStylesheetLinkOnce('reservation.css', 'data-reservation-dynamic-style');

      // Optional page JS
      injectOptionalScript('reservation.js');
      injectOptionalScript('reservationAdd.js');
    }
  });
});

// ============ Transcription (delegated clicks with .closest) ============
document.addEventListener('DOMContentLoaded', function () {
  function switchToTranscription() {
    window._showSection?.('transcriptionSection');
    window._updateHeader?.('transcriptionSection');
    localStorage.setItem('activeSection', 'transcriptionSection');
  }
  function clearTranscriptionContent() {
    const transcriptionContainer = document.getElementById('transcriptionContainer');
    if (transcriptionContainer) transcriptionContainer.innerHTML = "";
    document.querySelectorAll('[data-transcription-dynamic-style],[data-transcription-dynamic-script]').forEach(n => n.remove());
  }
  function injectScriptOnce(src) {
    if (document.querySelector(`script[data-transcription-dynamic-script][src="${src}"]`)) return;
    const s = document.createElement('script');
    s.src = src;
    s.defer = true;
    s.setAttribute('data-transcription-dynamic-script', 'true');
    document.body.appendChild(s);
  }

  document.addEventListener('click', async function(e){
    const viewBtn = e.target.closest('#loadTranscriptionView');
    const addBtn  = e.target.closest('#loadAddTranscription');
    if (!viewBtn && !addBtn) return;

    e.preventDefault();
    leaveInventoryUI();
    switchToTranscription();
    clearTranscriptionContent();

    const container = ensureContainer('transcriptionSection', 'transcriptionContainer');
    if (!container) return;

    if (viewBtn) {
      container.innerHTML = "<p style='padding:2em;text-align:center;color:#888;'>Loading transcription view…</p>";

      addStylesheetLinkOnce('viewUnits.css', 'data-transcription-dynamic-style');
      injectScriptOnce('viewUnits.js');

      await loadHtmlInto(container, 'transcriptionView.html');
      injectOptionalScript('transcriptionView.js'); // optional
    }

    if (addBtn) {
      container.innerHTML = "<p style='padding:2em;text-align:center;color:#888;'>Loading transcription form…</p>";

      await loadHtmlInto(container, 'transcriptionAdd.html');
      addStylesheetLinkOnce('transcriptionAdd.css', 'data-transcription-dynamic-style');

      injectOptionalScript('transcriptionAdd.js');
      injectOptionalScript('transcription.js');
    }
  });
});
/* ===== HARD OVERRIDE: make View/Add switch sections reliably =====
   If other listeners (like generic .nav-list handlers) are firing after your click
   and sending you back to Inventory, this capture-phase listener intercepts first,
   switches section, and blocks the rest. It also loads the requested HTML.
   Make sure your menu item IDs exist in the DOM:
     #loadTranscriptionView, #loadAddTranscription,
     #loadReservationView,  #loadAddReservation
*/

function _forceSwitchSection(sectionId) {
  window._showSection?.(sectionId);
  window._updateHeader?.(sectionId);
  localStorage.setItem('activeSection', sectionId);
}

function _killOtherHandlers(e) {
  // stop everything else from running and undoing our switch
  e.stopPropagation();
  if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
}

document.addEventListener('click', async function (e) {
  const t = e.target;
  if (!(t instanceof Element)) return;

  // TRANSSSSSCRIPTION — VIEW
  if (t.closest('#loadTranscriptionView')) {
    e.preventDefault();
    _killOtherHandlers(e);
    // leave Inventory UI if visible
    try { leaveInventoryUI(); } catch(_) {}
    _forceSwitchSection('transcriptionSection');

    const container = ensureContainer('transcriptionSection', 'transcriptionContainer');
    if (container) {
      container.innerHTML = "<p style='padding:2em;text-align:center;color:#888;'>Loading transcription view…</p>";
      // Add shared table styles/scripts (link/script so it works on file://)
      try { addStylesheetLinkOnce('viewUnits.css', 'data-transcription-dynamic-style'); } catch(_) {}
      try {
        if (!document.querySelector('script[data-transcription-dynamic-script][src="viewUnits.js"]')) {
          const s = document.createElement('script');
          s.src = 'viewUnits.js';
          s.defer = true;
          s.setAttribute('data-transcription-dynamic-script','true');
          document.body.appendChild(s);
        }
      } catch(_) {}

      // Load the page (fetch with iframe fallback if needed)
      try { await loadHtmlInto(container, 'transcriptionView.html'); } catch(_) {}
      // Optional page-specific JS
      try { injectOptionalScript('transcriptionView.js'); } catch(_) {}
    }
    return;
  }

  // TRANSCRIPTION — ADD
  if (t.closest('#loadAddTranscription')) {
    e.preventDefault();
    _killOtherHandlers(e);
    try { leaveInventoryUI(); } catch(_) {}
    _forceSwitchSection('transcriptionSection');

    const container = ensureContainer('transcriptionSection', 'transcriptionContainer');
    if (container) {
      container.innerHTML = "<p style='padding:2em;text-align:center;color:#888;'>Loading transcription form…</p>";
      try { await loadHtmlInto(container, 'transcriptionAdd.html'); } catch(_) {}
      try { addStylesheetLinkOnce('transcriptionAdd.css', 'data-transcription-dynamic-style'); } catch(_) {}
      try { injectOptionalScript('transcriptionAdd.js'); } catch(_) {}
      try { injectOptionalScript('transcription.js'); } catch(_) {}
    }
    return;
  }

  // (Optional) RESERVATION overrides too, for consistency

  if (t.closest('#loadReservationView')) {
    e.preventDefault();
    _killOtherHandlers(e);
    try { leaveInventoryUI(); } catch(_) {}
    _forceSwitchSection('reservationSection');

    const container = ensureContainer('reservationSection', 'reservationContainer');
    if (container) {
      container.innerHTML = "<p style='padding:2em;text-align:center;color:#888;'>Loading reservation view…</p>";
      try { addStylesheetLinkOnce('viewUnits.css', 'data-reservation-dynamic-style'); } catch(_) {}
      try {
        if (!document.querySelector('script[data-reservation-dynamic-script][src="viewUnits.js"]')) {
          const s = document.createElement('script');
          s.src = 'viewUnits.js';
          s.defer = true;
          s.setAttribute('data-reservation-dynamic-script','true');
          document.body.appendChild(s);
        }
      } catch(_) {}
      try { await loadHtmlInto(container, 'reservationView.html'); } catch(_) {}
      try { injectOptionalScript('reservationView.js'); } catch(_) {}
    }
    return;
  }

  if (t.closest('#loadAddReservation')) {
    e.preventDefault();
    _killOtherHandlers(e);
    try { leaveInventoryUI(); } catch(_) {}
    _forceSwitchSection('reservationSection');

    const container = ensureContainer('reservationSection', 'reservationContainer');
    if (container) {
      container.innerHTML = "<p style='padding:2em;text-align:center;color:#888;'>Loading reservation form…</p>";
      try { await loadHtmlInto(container, 'reservation.html'); } catch(_) {}
      try { addStylesheetLinkOnce('reservation.css', 'data-reservation-dynamic-style'); } catch(_) {}
      try { injectOptionalScript('reservation.js'); } catch(_) {}
      try { injectOptionalScript('reservationAdd.js'); } catch(_) {}
    }
    return;
  }
}, /* capture: */ true);

// --- If you don't already have these helpers earlier in your file, include them: ---
function ensureContainer(sectionId, containerId) {
  let container = document.getElementById(containerId);
  const section = document.getElementById(sectionId);
  if (!section) return null;
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    section.appendChild(container);
  }
  section.style.display = 'block';
  return container;
}
function leaveInventoryUI() {
  const viewBtnGroup = document.getElementById('viewBtnGroup');
  const addBtnGroup  = document.getElementById('addBtnGroup');
  if (viewBtnGroup) viewBtnGroup.style.display = 'none';
  if (addBtnGroup)  addBtnGroup.style.display  = 'none';
}
function addStylesheetLinkOnce(href, dataAttr) {
  if (document.querySelector(`link[${dataAttr}][href="${href}"]`)) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = href;
  l.setAttribute(dataAttr, 'true');
  document.head.appendChild(l);
}
async function loadHtmlInto(container, url) {
  try {
    const res = await fetch(url, {cache:'no-store'});
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    const html = await res.text();
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    container.innerHTML = bodyMatch ? bodyMatch[1] : html;
  } catch (err) {
    container.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.title = url;
    iframe.style.width = '100%';
    iframe.style.minHeight = '70vh';
    iframe.style.border = '0';
    container.appendChild(iframe);
    console.warn('Fetch failed, used iframe for', url, err);
  }
}
function injectOptionalScript(src) {
  const s = document.createElement('script');
  s.src = src;
  s.defer = true;
  s.onerror = () => { try { s.remove(); } catch(e){} };
  document.body.appendChild(s);
}
