// ==============================
// PAGE BOOTSTRAP
// ==============================

let pageInitialized = false;

async function initPage() {
  if (pageInitialized) {
    return;
  }

  pageInitialized = true;

  try {
    initSupabase();

    if (typeof loadSharedComponents === "function") {
      await loadSharedComponents();
    }

    if (typeof initDropdowns === "function") {
      initDropdowns();
    }

    if (typeof updateAuthUI === "function") {
      await updateAuthUI();
    }

    await initFeaturePage();

    if (typeof trackPageView === "function") {
      await trackPageView();
    }

  } catch (error) {
    console.error("Page initialization failed:", error);
  }
}

async function initFeaturePage() {
  const page =
    document.body?.dataset?.page ||
    inferPageName();

  const initializers = {
    admin: async () => {
      if (typeof loadAdmin === "function") {
        await loadAdmin();
      }
    },
    dashboard: async () => {
      if (typeof loadDashboard === "function") {
        await loadDashboard();
      }

      if (typeof loadReports === "function") {
        await loadReports();
      }
    },
    profile: async () => {
      if (typeof loadProfilePage === "function") {
        await loadProfilePage();
      }
    },
    report: async () => {
      if (typeof loadReport === "function") {
        await loadReport();
      }
    }
  };

  if (initializers[page]) {
    await initializers[page]();
  }
}

function inferPageName() {
  const file =
    window.location.pathname
      .split("/")
      .pop()
      .replace(".html", "");

  return file || "index";
}

document.addEventListener(
  "DOMContentLoaded",
  initPage
);

window.initPage = initPage;
