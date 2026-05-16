

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
        initNavbarDropdown();

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

    } catch (e) {

      console.warn(
        "Footer failed to load"
      );

      console.error(e);
    }
  }
}
window.loadSharedComponents =
  loadSharedComponents;