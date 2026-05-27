

// ==============================
// SHARED COMPONENTS
// ==============================

async function loadSharedComponents() {

  const navbar =
    document.getElementById("navbar");

  if (navbar) {

    try {

      const navResponse = await fetch(
        appPath("components/navbar.html")
      );

      navbar.innerHTML =
        await navResponse.text();

      resolveComponentLinks(navbar);

      if (
  typeof initNavbarDropdown ===
  "function"
) {

  initNavbarDropdown();
}

if (
  typeof initMobileNavbar ===
  "function"
) {

  initMobileNavbar();
}

    } catch (e) {

      console.warn(
        "Navbar failed to load"
      );

      console.error(e);
    }
  }

  const footer =
    document.getElementById("footer");

  if (footer) {

    try {

      const footerResponse = await fetch(
        appPath("components/footer.html")
      );

      footer.innerHTML =
        await footerResponse.text();

      resolveComponentLinks(footer);

    } catch (e) {

      console.warn(
        "Footer failed to load"
      );

      console.error(e);
    }
  }
}

function resolveComponentLinks(root) {
  const prefix =
    window.location.pathname.includes("/guides/")
      ? "../"
      : "";

  if (!prefix) return;

  root
    .querySelectorAll("[href]")
    .forEach(element => {
      const href =
        element.getAttribute("href");

      if (isRelativePath(href)) {
        element.setAttribute(
          "href",
          `${prefix}${href}`
        );
      }
    });

  root
    .querySelectorAll("[src]")
    .forEach(element => {
      const src =
        element.getAttribute("src");

      if (isRelativePath(src)) {
        element.setAttribute(
          "src",
          `${prefix}${src}`
        );
      }
    });
}

function isRelativePath(value = "") {
  return Boolean(value) &&
    !value.startsWith("#") &&
    !value.startsWith("/") &&
    !value.includes("://") &&
    !value.startsWith("mailto:") &&
    !value.startsWith("tel:");
}

window.loadSharedComponents =
  loadSharedComponents;
