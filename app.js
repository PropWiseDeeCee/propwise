// ==============================
// GLOBAL STATE
// ==============================

let supabaseClient = null;


// ==============================
// SUPABASE INITIALIZATION
// ==============================

function initSupabase() {

  if (!window.supabase) {

    console.error(
      "Supabase SDK not loaded"
    );

    return null;
  }

  if (!supabaseClient) {

    supabaseClient =
      window.supabase.createClient(
        window.PROPWISE_CONFIG
          .SUPABASE
          .URL,

        window.PROPWISE_CONFIG
          .SUPABASE
          .ANON_KEY
      );

    console.log(
      "Supabase initialized"
    );
  }

  return supabaseClient;
}


// ==============================
// PATH HELPER
// ==============================

function appPath(path = "") {

  return path;
}


// ==============================
// HTML ESCAPE
// ==============================

function escapeHtml(str = "") {

  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ==============================
// USER MENU TOGGLE
// ==============================

function toggleUserMenu() {

  const menu =
    document.getElementById(
      "userDropdown"
    );

  if (!menu) return;

  menu.classList.toggle("show");
}


// ==============================
// CLOSE DROPDOWN ON OUTSIDE CLICK
// ==============================

document.addEventListener(
  "click",
  function (event) {

    const dropdown =
      document.getElementById(
        "userDropdown"
      );

    const profileBtn =
      document.querySelector(
        ".profile-btn"
      );

    if (
      dropdown &&
      profileBtn &&
      !profileBtn.contains(event.target) &&
      (!dropdown ||
        !dropdown.contains(event.target))
    ) {

      dropdown.classList.remove(
        "show"
      );
    }
  }
);


// ==============================
// PAGE VIEW TRACKING
// ==============================

async function trackPageView() {

  try {

    const client =
      window.getSupabaseClient?.();

    if (!client) return;

    const user =
      await getUser();

    if (!user) return;

    await client
      .from("page_views")
      .insert([
        {
          user_id: user.id,
          page:
            window.location.pathname
        }
      ]);

  } catch (error) {

    console.error(
      "Track page view failed:",
      error
    );
  }
}


// ==============================
// GLOBAL ERROR DISPLAY
// ==============================

function showError(msg) {

  const el =
    document.getElementById(
      "analysisResult"
    );

  if (!el) return;

  el.innerHTML = `
    <div
      style="
        background:#fee2e2;
        color:#991b1b;
        padding:12px;
        border-radius:10px;
        margin-top:10px;
      "
    >
      ${escapeHtml(msg)}
    </div>
  `;
}


// ==============================
// GLOBAL PAGE INIT
// ==============================

async function initPage() {

  try {

    // Initialize Supabase
    initSupabase();

    // Shared Components
    if (
      typeof loadSharedComponents ===
      "function"
    ) {

      await loadSharedComponents();
    }

    // Auth UI
    if (
      typeof updateAuthUI ===
      "function"
    ) {

      await updateAuthUI();
    }

    // Dashboard
    if (
      typeof loadDashboard ===
      "function"
    ) {

      await loadDashboard();
    }

    // Reports
    if (
      typeof loadReports ===
      "function"
    ) {

      await loadReports();
    }

    // Admin
    if (
      typeof loadAdminDashboard ===
      "function"
    ) {

      await loadAdminDashboard();
    }

    // Track analytics
    await trackPageView();

    console.log(
      "Page initialized"
    );

  } catch (error) {

    console.error(
      "Page initialization failed:",
      error
    );
  }
}


// ==============================
// DOM READY
// ==============================

document.addEventListener(
  "DOMContentLoaded",
  initPage
);


// ==============================
// GLOBAL EXPORTS
// ==============================

window.initSupabase =
  initSupabase;

window.getSupabaseClient =
  () => supabaseClient;

window.appPath =
  appPath;

window.escapeHtml =
  escapeHtml;

window.toggleUserMenu =
  toggleUserMenu;

window.showError =
  showError;