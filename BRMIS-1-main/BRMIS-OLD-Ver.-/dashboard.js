
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".fa-bars");
  const sidebar = document.querySelector(".sidebar");

  if (btn && sidebar) {
    btn.addEventListener("click", () => {
      console.log("Hamburger clicked");
      sidebar.classList.toggle("close");
    });
  } else {
    console.error("Hamburger button or sidebar not found");
  }

  let arrows = document.querySelectorAll(".arrow");
  for (var i = 0; i < arrows.length; i++) {
    arrows[i].addEventListener("click", (e) => {
      let arrowParent = e.target.parentElement.parentElement;

      // Close other dropdowns
      let allDropdowns = document.querySelectorAll(".nav-list li.show");
      allDropdowns.forEach((dropdown) => {
        if (dropdown !== arrowParent) {
          dropdown.classList.remove("show");
        }
      });

      // Toggle the clicked dropdown
      arrowParent.classList.toggle("show");
    });
  }

  // New code to handle sidebar link clicks and update main content and active section
  const navListItems = document.querySelectorAll(".nav-list li");
  const subMenuLinks = document.querySelectorAll(".nav-list ul.sub-menu li a");

  // Mapping of tab and submenu names to main content section classes
  const nameToSectionClass = {
    "Dashboard": "dashCon",
    "Inventory": "inventCon",
    "View Stock": "viewStockCon",
    "Add Stock": "addStockCon",
    "Reservation": "reservCon",
    "Web Design": "reservCon",
    "Card Design": "reservCon",
    "Form Design": "reservCon",
    "News & Updates": "newsUpdateCon",
    "Transcription": "transCon",
    "Summary Report": "summaryCon",
    "Distribution Report": "distributionReportCon",
    "Collection Report": "collectionReportCon",
    "Settings": "settingsCon"
  };

  // Function to show a section by name and hide others
  function showSectionByName(name) {
    const allSections = document.querySelectorAll("main > section");
    allSections.forEach(section => {
      section.style.display = "none";
    });
    const sectionClass = nameToSectionClass[name];
    if (sectionClass) {
      const sectionToShow = document.querySelector("main > ." + sectionClass);
      if (sectionToShow) {
        sectionToShow.style.display = "block";
      }
    }
  }

  navListItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      // Remove active class from all sidebar items and submenu links
      navListItems.forEach((el) => el.classList.remove("active"));
      subMenuLinks.forEach((el) => el.classList.remove("active"));

      // Add active class to clicked item (li element)
      item.classList.add("active");

      // Update title text to clicked tab name
      const titleTextElement = document.querySelector(".title-text");
      const tabTextElement = item.querySelector(".link-name");
      const tabText = tabTextElement ? tabTextElement.textContent.trim() : "";
      if (titleTextElement && tabText) {
        titleTextElement.textContent = tabText;
      }

      // Check if clicked item has a dropdown arrow
      const arrow = item.querySelector(".arrow");

      if (arrow) {
        // Open the clicked dropdown
        navListItems.forEach((el) => {
          if (el !== item) {
            el.classList.remove("show");
          }
        });
        item.classList.add("show");

        // Automatically select and highlight the first child submenu item (a element)
        const firstSubMenuItem = item.querySelector("ul.sub-menu li a");
        if (firstSubMenuItem) {
          // Remove active from all submenu links
          subMenuLinks.forEach((el) => el.classList.remove("active"));
          firstSubMenuItem.classList.add("active");

          // Show the section corresponding to the first submenu item
          const firstSubMenuText = firstSubMenuItem.textContent.trim();
          showSectionByName(firstSubMenuText);

          // Update title text to first submenu item name
          if (titleTextElement && firstSubMenuText) {
            titleTextElement.textContent = firstSubMenuText;
          }

          // Also add active class to parent tab (li element)
          item.classList.add("active");
        }
      } else {
        // Close all dropdowns if clicked item has no dropdown
        navListItems.forEach((el) => el.classList.remove("show"));

        // Show the section corresponding to the clicked tab
        showSectionByName(tabText);
      }
    });
  });

  subMenuLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Remove active class from all sidebar items and submenu links
      navListItems.forEach((el) => el.classList.remove("active"));
      subMenuLinks.forEach((el) => el.classList.remove("active"));

      // Add active class to clicked submenu item (a element)
      link.classList.add("active");

      // Update title text to clicked submenu name
      const titleTextElement = document.querySelector(".title-text");
      const linkText = link.textContent.trim();
      if (titleTextElement && linkText) {
        titleTextElement.textContent = linkText;
      }

      // Show the section corresponding to the clicked submenu item
      // Special handling for Inventory submenu children "View" and "Add"
      if (linkText === "View" || linkText === "Add") {
        // Show the main inventory section
        const inventorySection = document.querySelector(".inventCon");
        if (inventorySection) {
          inventorySection.style.display = "block";
        }

        // Show/hide child sections inside inventory
        const viewSection = document.querySelector(".inventCon .viewStockCon");
        const addSection = document.querySelector(".inventCon .addStockCon");
        if (linkText === "View") {
          if (viewSection) viewSection.style.display = "block";
          if (addSection) addSection.style.display = "none";
        } else if (linkText === "Add") {
          if (viewSection) viewSection.style.display = "none";
          if (addSection) addSection.style.display = "block";
        }
      }
      // Special handling for Reservation submenu children "View" and "Add"
      if (linkText === "View" || linkText === "Add") {
        const reservationSection = document.querySelector(".reservCon");
        if (reservationSection) {
          reservationSection.style.display = "block";
        }
        const viewReservSection = document.querySelector(".reservCon .viewReservCon");
        const addReservSection = document.querySelector(".reservCon .addReservCon");
        if (linkText === "View") {
          if (viewReservSection) viewReservSection.style.display = "block";
          if (addReservSection) addReservSection.style.display = "none";
          // Also update the title text to "View"
          const titleTextElement = document.querySelector(".title-text");
          if (titleTextElement) {
            titleTextElement.textContent = "View";
          }
        } else if (linkText === "Add") {
          if (viewReservSection) viewReservSection.style.display = "none";
          if (addReservSection) addReservSection.style.display = "block";
          // Also update the title text to "Add"
          const titleTextElement = document.querySelector(".title-text");
          if (titleTextElement) {
            titleTextElement.textContent = "Add";
          }
        }
      }
      // Special handling for Transcription submenu children "View Transcription" and "Add Transcription"
      else if (linkText === "View Transcription" || linkText === "Add Transcription") {
        const transcriptionSection = document.querySelector(".transCon");
        if (transcriptionSection) {
          transcriptionSection.style.display = "block";
        }
        const viewTransSection = document.querySelector(".transCon .viewTransCon");
        const addTransSection = document.querySelector(".transCon .addTransCon");
        if (linkText === "View Transcription") {
          if (viewTransSection) viewTransSection.style.display = "block";
          if (addTransSection) addTransSection.style.display = "none";
        } else if (linkText === "Add Transcription") {
          if (viewTransSection) viewTransSection.style.display = "none";
          if (addTransSection) addTransSection.style.display = "block";
        }
      }
      // Special handling for Summary Report submenu children "Distribution Report" and "Collection Report"
      else if (linkText === "Distribution Report" || linkText === "Collection Report") {
        const summarySection = document.querySelector(".summaryCon");
        if (summarySection) {
          summarySection.style.display = "block";
        }
        const distributionSection = document.querySelector(".summaryCon .distributionReportCon");
        const collectionSection = document.querySelector(".summaryCon .collectionReportCon");
        if (linkText === "Distribution Report") {
          if (distributionSection) distributionSection.style.display = "block";
          if (collectionSection) collectionSection.style.display = "none";
        } else if (linkText === "Collection Report") {
          if (distributionSection) distributionSection.style.display = "none";
          if (collectionSection) collectionSection.style.display = "block";
        }
      }
      else {
        showSectionByName(linkText);
      }

      // Also open the parent dropdown and set active on parent li
      const parentLi = link.closest("li");
      if (parentLi) {
        const parentDropdown = parentLi.closest("li");
        if (parentDropdown) {
          navListItems.forEach((el) => {
            if (el !== parentDropdown) {
              el.classList.remove("show");
              el.classList.remove("active");
            }
          });
          parentDropdown.classList.add("show");
          parentDropdown.classList.add("active");

          // Also add active class to parent tab (li element)
          parentDropdown.classList.add("active");
        }
      }
    });
  });

  // Announcement carousel
  const announcementCarousel = document.querySelector(".announcement-carousel");
  if (announcementCarousel) {
    let isDown = false;
    let startX;
    let scrollLeft;

    announcementCarousel.addEventListener("mousedown", (e) => {
      isDown = true;
      announcementCarousel.classList.add("active");
      startX = e.clientX - announcementCarousel.getBoundingClientRect().left;
      scrollLeft = announcementCarousel.scrollLeft;
    });

    announcementCarousel.addEventListener("mouseleave", () => {
      isDown = false;
      announcementCarousel.classList.remove("active");
    });

    announcementCarousel.addEventListener("mouseup", () => {
      isDown = false;
      announcementCarousel.classList.remove("active");
    });

    announcementCarousel.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.clientX - announcementCarousel.getBoundingClientRect().left;
      const walk = (x - startX) * 3;
      announcementCarousel.scrollLeft = scrollLeft - walk;
    });

    // Touch events for mobile support
    announcementCarousel.addEventListener("touchstart", (e) => {
      isDown = true;
      announcementCarousel.classList.add("active");
      startX = e.touches[0].clientX - announcementCarousel.getBoundingClientRect().left;
      scrollLeft = announcementCarousel.scrollLeft;
    });

    announcementCarousel.addEventListener("touchend", () => {
      isDown = false;
      announcementCarousel.classList.remove("active");
    });

    announcementCarousel.addEventListener("touchmove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.touches[0].clientX - announcementCarousel.getBoundingClientRect().left;
      const walk = (x - startX) * 3;
      announcementCarousel.scrollLeft = scrollLeft - walk;
    });

    // Automatic sliding feature
    let autoScrollInterval = setInterval(() => {
      if (!isDown) { // Only auto scroll if not dragging
        const maxScrollLeft = announcementCarousel.scrollWidth - announcementCarousel.clientWidth;
        if (announcementCarousel.scrollLeft >= maxScrollLeft) {
          announcementCarousel.scrollLeft = 0; // Reset to start
        } else {
          announcementCarousel.scrollLeft += 2; // Scroll right by 2px
        }
      }
    }, 30); // Scroll every 30ms for smooth effect
  }

  // Sorting function for tables
  function sortTable(table, colIndex) {
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);
    let asc = table.getAttribute("data-sort-dir") !== "asc";
    table.setAttribute("data-sort-dir", asc ? "asc" : "desc");

    rows.sort((a, b) => {
      let aText = a.cells[colIndex].textContent.trim();
      let bText = b.cells[colIndex].textContent.trim();

      // Try to parse as date
      let aDate = Date.parse(aText);
      let bDate = Date.parse(bText);
      if (!isNaN(aDate) && !isNaN(bDate)) {
        return asc ? aDate - bDate : bDate - aDate;
      }

      // Try to parse as number
      let aNum = parseFloat(aText.replace(/[^0-9.-]+/g, ""));
      let bNum = parseFloat(bText.replace(/[^0-9.-]+/g, ""));
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return asc ? aNum - bNum : bNum - aNum;
      }

      // Default to string comparison
      return asc ? aText.localeCompare(bText) : bText.localeCompare(aText);
    });

    // Remove existing rows
    while (tbody.firstChild) {
      tbody.removeChild(tbody.firstChild);
    }

    // Append sorted rows
    rows.forEach(row => tbody.appendChild(row));
  }

  // Add event listeners to sortable table headers
  const sortableHeaders = document.querySelectorAll("th.sortable");
  sortableHeaders.forEach(header => {
    header.style.cursor = "pointer";
    header.addEventListener("click", () => {
      const table = header.closest("table");
      const colIndex = Array.from(header.parentNode.children).indexOf(header);
      sortTable(table, colIndex);
    });
  });
});