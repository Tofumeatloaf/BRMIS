let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let searchBtn = document.querySelector(".bx-search");

const navLinks = document.querySelectorAll('.nav-list li a');
const homeSectionText = document.querySelector('.home-section .text');

closeBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    menuBtnChange();
})

searchBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    menuBtnChange();
})

function menuBtnChange() {
    if (sidebar.classList.contains("open")) {
        closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
    } else {
        closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
    }
}

function setActiveTab(selectedTab) {
  navLinks.forEach((link) => {
    link.parentElement.classList.remove('active');
  });

  selectedTab.parentElement.classList.add('active');

  const tabText = selectedTab.querySelector('.links_name').textContent;
  homeSectionText.textContent = tabText;
}

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default link behavior
    setActiveTab(link);
  });
});

// Set the default active tab (Dashboard) on page load
document.addEventListener('DOMContentLoaded', () => {
  const defaultTab = document.querySelector('.nav-list li a[data-section="dashboardSection"]'); // Adjust the selector if needed
  if (defaultTab) {
    setActiveTab(defaultTab);
  }
});

// Show the logout confirmation modal
function showLogoutModal() {
    const modal = document.getElementById('logoutModal');
    modal.style.display = 'flex'; // Show the modal
}

// Hide the logout confirmation modal
function hideLogoutModal() {
    const modal = document.getElementById('logoutModal');
    modal.style.display = 'none'; // Hide the modal
}

// Handle logout confirmation
function confirmLogout() {
    // Perform logout action (e.g., redirect to login page)
    window.location.href = 'login.html';
}

// Attach event listeners to modal buttons
document.getElementById('confirmLogout').addEventListener('click', confirmLogout);
document.getElementById('cancelLogout').addEventListener('click', hideLogoutModal);

// Main dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables and select DOM elements
    let sidebar = document.querySelector(".sidebar");
    let closeBtn = document.querySelector("#btn");
    let searchBtn = document.querySelector(".bx-search");
    const homeSectionText = document.querySelector('.home-section .text');
    const links = document.querySelectorAll('.nav-list a[data-section]');
    const sections = document.querySelectorAll('.content-section');
    const dropdownMenus = document.querySelectorAll('.has-dropdown .menu-btn');
    const submenuItems = document.querySelectorAll('.submenu li a');

    // Toggle sidebar
    closeBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        menuBtnChange();
    });

    searchBtn.addEventListener("click", () => {
        if (!sidebar.classList.contains("open")) {
            sidebar.classList.add("open");
            menuBtnChange();
        } else {
            document.querySelector(".sidebar input").focus();
        }
    });

    // Function to update menu button icon
    function menuBtnChange() {
        if (sidebar.classList.contains("open")) {
            closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
        } else {
            closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
        }
    }

    // Function to close all dropdowns
    function closeAllDropdowns() {
        document.querySelectorAll('.has-dropdown').forEach(item => {
            item.classList.remove('submenu-active');
        });
    }

    // Function to show a specific section
    function showSection(sectionId) {
        // First hide all main sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        // Define parent sections and their IDs
        const parentSections = {
            'inventory': 'inventorySection',
            'reservation': 'reservationSection',
            'transcription': 'transcriptionSection',
            'summary': 'summaryReportSection'
        };

        // Check if the sectionId belongs to any parent section
        for (const [key, parentId] of Object.entries(parentSections)) {
            if (sectionId.includes(key)) {
                // Show the parent section
                const parentSection = document.getElementById(parentId);
                if (parentSection) {
                    parentSection.style.display = 'block';
                }

                // Hide all sub-sections first
                document.querySelectorAll('.sub-section').forEach(subSection => {
                    subSection.style.display = 'none';
                });

                // Show the specific sub-section if it exists
                const subSection = document.getElementById(sectionId);
                if (subSection) {
                    subSection.style.display = 'block';
                }
                return;
            }
        }

        // Handle regular sections (no sub-sections)
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
        }
    }

    // Handle dropdown toggle clicks
    dropdownMenus.forEach(menu => {
        menu.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const parentLi = this.closest('li');
            
            // If sidebar is collapsed, just open it
            if (!sidebar.classList.contains('open')) {
                sidebar.classList.add('open');
                menuBtnChange();
                return;
            }
            
            // Check if this dropdown is already open
            const wasActive = parentLi.classList.contains('submenu-active');
            
            // Close all dropdowns first
            closeAllDropdowns();
            
            // If it wasn't already open, open it now
            if (!wasActive) {
                parentLi.classList.add('submenu-active');
            }
        });
    });

    // Handle regular menu item clicks
    document.querySelectorAll('.nav-list > li:not(.has-dropdown) > a[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const target = this.getAttribute('data-section');
            
            // Close all dropdowns
            closeAllDropdowns();
            
            // Show the selected section
            showSection(target);
            localStorage.setItem('activeSection', target);
        });
    });

    // Handle submenu item clicks
    submenuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const target = this.getAttribute('data-section');
            
            // Show the selected section
            showSection(target);
            localStorage.setItem('activeSection', target);
            
            // Close sidebar in mobile view
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
                menuBtnChange();
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.has-dropdown')) {
            closeAllDropdowns();
        }
    });

    // System Settings Panel toggle
    const openSystemSettings = document.getElementById('openSystemSettings');
    const closeSystemSettings = document.getElementById('closeSystemSettings');
    const systemSettingsPanel = document.getElementById('systemSettingsPanel');
    
    if (openSystemSettings && closeSystemSettings && systemSettingsPanel) {
        openSystemSettings.addEventListener('click', function() {
            systemSettingsPanel.style.display = 'block';
        });
        
        closeSystemSettings.addEventListener('click', function() {
            systemSettingsPanel.style.display = 'none';
        });
    }

    // Accordion functionality for settings
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', function() {
            this.classList.toggle('active');
            const panel = this.nextElementSibling;
            
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    });

    // Logout modal functionality
    document.getElementById('confirmLogout').addEventListener('click', function() {
        window.location.href = 'login.html';
    });
    
    document.getElementById('cancelLogout').addEventListener('click', function() {
        document.getElementById('logoutModal').style.display = 'none';
    });

    // Show the logout modal
    window.showLogoutModal = function() {
        document.getElementById('logoutModal').style.display = 'flex';
    };

    // Initialize with last saved section or default to dashboard
    const savedSection = localStorage.getItem('activeSection') || 'dashboardSection';
    showSection(savedSection);
    
    // Initial menu button state
    menuBtnChange();
});

document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const sidebar = document.querySelector(".sidebar");
    const closeBtn = document.querySelector("#btn");
    const searchBtn = document.querySelector(".bx-search");

    // Function to show specific section content
    function showSection(sectionId) {
        // Hide all sections first
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show the selected section
        const selectedSection = document.getElementById(sectionId);
        if (selectedSection) {
            selectedSection.style.display = 'block';

            // If this is a parent section with subsections
            if (sectionId.includes('Section')) {
                // Hide all subsections first
                const subsections = selectedSection.querySelectorAll('.sub-section');
                subsections.forEach(subsection => {
                    subsection.style.display = 'none';
                });
            }
        }
    }

    // Handle clicks on main menu items
    document.querySelectorAll('.nav-list a[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
        });
    });

    // Handle clicks on submenu items
    document.querySelectorAll('.submenu a[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            
            // Show parent section first
            const parentSection = link.closest('.has-dropdown')
                                    .querySelector('.menu-btn')
                                    .getAttribute('data-section');
            if (parentSection) {
                showSection(parentSection);
            }

            // Show specific subsection
            const subsection = document.getElementById(sectionId);
            if (subsection) {
                subsection.style.display = 'block';
            }
        });
    });

    // Show dashboard by default
    showSection('dashboardSection');

    // Sidebar toggle functionality
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            sidebar.classList.toggle("open");
            menuBtnChange();
        });
    }

    // Menu button icon change
    function menuBtnChange() {
        if (sidebar.classList.contains("open")) {
            closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
        } else {
            closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
        }
    }

    function setActiveTab(element) {
        // Remove all active classes first
        document.querySelectorAll('.nav-list li').forEach(item => {
            item.classList.remove('active', 'parent-active');
        });

        const dropdownParent = element.closest('.has-dropdown');

        if (dropdownParent) {
            // This is a dropdown menu item
            dropdownParent.classList.add('parent-active');

            if (element.classList.contains('menu-btn')) {
                // Parent was clicked - select first child
                const firstChild = dropdownParent.querySelector('.submenu li:first-child a');
                if (firstChild) {
                    firstChild.closest('li').classList.add('active');
                    showSection(firstChild.getAttribute('data-section'));
                }
            } else {
                // Child was clicked
                element.closest('li').classList.add('active');
                showSection(element.getAttribute('data-section'));
            }
        } else {
            // Regular tab without dropdown
            element.closest('li').classList.add('active');
            showSection(element.getAttribute('data-section'));
        }
    }

    // Update showSection function
    function showSection(sectionId) {
        // Hide all sections first
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        // Hide all subsections
        document.querySelectorAll('.sub-section').forEach(subsection => {
            subsection.style.display = 'none';
        });

        // Show the selected section/subsection
        const selectedSection = document.getElementById(sectionId);
        if (selectedSection) {
            if (selectedSection.classList.contains('sub-section')) {
                // Show parent section first
                selectedSection.closest('.content-section').style.display = 'block';
            }
            selectedSection.style.display = 'block';
        }
    }

    // Add click handlers to all navigation items
    document.querySelectorAll('.nav-list a[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            setActiveTab(e.currentTarget);
        });
    });

    // Set default active tab (Dashboard)
    const defaultTab = document.querySelector('.nav-list > li:first-child > a[data-section]');
    if (defaultTab) {
        setActiveTab(defaultTab);
    }
});