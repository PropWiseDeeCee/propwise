// ==============================
// DROPDOWNS
// ==============================

let dropdownsInitialized = false;

function toggleUserMenu() {
  const menu =
    document.getElementById("userDropdown");

  if (!menu) return;

  menu.classList.toggle("show");
}

function initDropdowns() {
  const dropdowns =
    document.querySelectorAll(".dropdown");

  dropdowns.forEach(dropdown => {
    const toggle =
      dropdown.querySelector(".dropdown-toggle");

    const menu =
      dropdown.querySelector(".dropdown-menu");

    if (!toggle || !menu || toggle.dataset.dropdownReady) return;

    toggle.dataset.dropdownReady = "true";

    toggle.addEventListener("click", event => {
      event.stopPropagation();

      document
        .querySelectorAll(".dropdown-menu")
        .forEach(openMenu => {
          if (openMenu !== menu) {
            openMenu.classList.remove("show");
          }
        });

      menu.classList.toggle("show");
    });
  });

  if (dropdownsInitialized) return;

  dropdownsInitialized = true;

  document.addEventListener("click", event => {
    document
      .querySelectorAll(".dropdown-menu")
      .forEach(menu => {
        const dropdown =
          menu.closest(".dropdown");

        if (!dropdown?.contains(event.target)) {
          menu.classList.remove("show");
        }
      });
  });
}

/* =========================================
   MOBILE NAVBAR
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const toggle =
      document.getElementById(
        "mobileMenuToggle"
      );

    const wrapper =
      document.getElementById(
        "mobileNavWrapper"
      );

    if (!toggle || !wrapper) return;

    toggle.addEventListener(
      "click",
      () => {

        wrapper.classList.toggle(
          "active"
        );
      }
    );
  }
);

window.toggleUserMenu = toggleUserMenu;
window.initDropdowns = initDropdowns;
