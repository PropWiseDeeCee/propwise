// ==============================
// SUPABASE INIT
// ==============================

let supabaseClient = null;

function initSupabase() {

  if (!window.supabase) {
    console.error("Supabase SDK not loaded");
    return null;
  }

  if (!supabaseClient) {

    supabaseClient =
      window.supabase.createClient(
        window.PROPWISE_CONFIG.SUPABASE.URL,
        window.PROPWISE_CONFIG.SUPABASE.ANON_KEY
      );

    console.log("Supabase initialized");
  }

  return supabaseClient;
}



// ==============================
// HELPERS
// ==============================

function appPath(path) {
  return window.location.pathname.includes("/guides/") ? `../${path}` : path;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getInitial(value) {
  return String(value || "U").trim().charAt(0).toUpperCase() || "U";
}

function getVisitorId() {
  const key = "propwiseVisitorId";
  let id = localStorage.getItem(key);

  if (!id) {
    id = window.crypto?.randomUUID?.() || `visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(key, id);
  }

  return id;
}

function getDeviceType() {
  const width = window.innerWidth || 0;
  if (width <= 640) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
}

function getBrowserName() {
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
  if (ua.includes("Firefox/")) return "Firefox";
  return "Other";
}

function toggleUserMenu(event) {
  event.preventDefault();
  event.stopPropagation();

  const menu = document.getElementById("user-menu");
  if (!menu) return;

  const isOpen = menu.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
}

document.addEventListener("click", () => {
  const menu = document.getElementById("user-menu");
  menu?.classList.remove("open");
  menu?.querySelector(".user-menu-button")?.setAttribute("aria-expanded", "false");
});

// ==============================
// ANALYTICS
// ==============================

async function trackPageView(user = null) {
  if (!supabaseClient) return;

  try {
    await supabaseClient
      .from("analytics_events")
      .insert([{
        user_id: user?.id || null,
        email: user?.email || null,
        visitor_id: getVisitorId(),
        event_type: "page_view",
        page_path: window.location.pathname,
        page_title: document.title,
        referrer: document.referrer || null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
        locale: navigator.language || null,
        device_type: getDeviceType(),
        browser: getBrowserName(),
        user_agent: navigator.userAgent
      }]);
  } catch (error) {
    console.warn("Analytics tracking skipped", error);
  }
}


// ==============================
// LOGIN FLOW
// ==============================

async function handleLogin() {

  const btn =
    document.getElementById("loginBtn");

  const err =
    document.getElementById("authError");

  if (btn) {

    btn.disabled = true;
    btn.innerText = "Logging in...";
  }

  if (err) {
    err.innerHTML = "";
  }

  try {

    await signIn();

    const hasReport =
      localStorage.getItem(
        "agreementReport"
      );

    window.location.href =
      hasReport
        ? appPath("report.html")
        : appPath("dashboard.html");

  } catch (e) {

    console.error(e);

    if (err) {

      err.innerHTML = `

        <span style="color:#dc2626;">

          ${escapeHtml(e.message)}

        </span>
      `;
    }

  } finally {

    if (btn) {

      btn.disabled = false;

      btn.innerText = "Login";
    }
  }
}

// ==============================
// NAVBAR + INIT
// ==============================

async function initPage(protectedPage = false) {
   await loadSharedComponents();
  initSupabase();

  const user = await getUser();

  if (protectedPage && !user) {
    window.location.href = appPath("login.html");
    return;
  }

  trackPageView(user);

  const nav = document.getElementById("nav-right");

  if (!nav) return;

  // NOT LOGGED IN
  if (!user) {
    nav.innerHTML = `
      <a class="login-link" href="${appPath("login.html")}">Login</a>
    `;
    return;
  }

  // GET PROFILE
  const profile = await getProfile();

  const isAdmin = profile?.role === "super_admin";
  const rawDisplayName = profile?.full_name || user.email;
  const displayName = escapeHtml(rawDisplayName);
  const email = escapeHtml(user.email);
  const initial = escapeHtml(getInitial(rawDisplayName));

  nav.innerHTML = `
    <div class="user-menu" id="user-menu">
      <button class="user-menu-button" onclick="toggleUserMenu(event)" aria-label="Account menu" aria-expanded="false">
        ${initial}
      </button>

      <div class="user-menu-panel">
        <div class="user-menu-header">
          <strong>${displayName}</strong>
          <span>${email}</span>
        </div>

        <a href="${appPath("dashboard.html")}">Dashboard</a>
        <a href="${appPath("profile.html")}">Profile</a>

        ${
          isAdmin
            ? `<a href="${appPath("admin.html")}">Admin Panel</a>`
            : ""
        }

        <button type="button" onclick="logout()">Logout</button>
      </div>
    </div>
  `;
}

// ==============================
// NAVBAR DROPDOWN
// ==============================

function initNavbarDropdown() {

  const dropdownBtn =
    document.querySelector(".dropdown-btn");

  const dropdownMenu =
    document.querySelector(".dropdown-menu");

  const dropdown =
    document.querySelector(".dropdown");

  if (
    !dropdownBtn ||
    !dropdownMenu ||
    !dropdown
  ) {
    return;
  }

  // TOGGLE MENU

  dropdownBtn.addEventListener(
    "click",
    function(event) {

      event.preventDefault();
      event.stopPropagation();

      dropdownMenu.classList.toggle("show");
    }
  );

  // CLOSE ON OUTSIDE CLICK

  document.addEventListener(
    "click",
    function(event) {

      if (
        !dropdown.contains(event.target)
      ) {

        dropdownMenu.classList.remove("show");
      }
    }
  );

}



// ==============================
// DASHBOARD
// ==============================

async function loadDashboard() {

  const user = await getUser();

  // NOT LOGGED IN
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const el = document.getElementById("list");

  el.innerHTML = "<p>Loading...</p>";

  // FETCH USER COMPARISONS
  const { data, error } = await supabaseClient
    .from("comparisons")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // ERROR
  if (error) {

    console.error(error);

    el.innerHTML = `
      <p>Failed to load comparisons</p>
    `;

    return;
  }

  // EMPTY STATE
  if (!data.length) {

  el.innerHTML = `
    <p>No saved comparisons yet</p>
  `;

} else {

  el.innerHTML = data.map(item => `

    <div class="card">

      <h4>${escapeHtml(item.property_a)}</h4>

      <p style="margin:8px 0;">
        vs
      </p>

      <h4>${escapeHtml(item.property_b)}</h4>

      <p style="
        margin-top:12px;
        font-size:12px;
        color:#6b7280;
      ">
        Saved on
        ${escapeHtml(new Date(item.created_at).toLocaleDateString())}
      </p>

    </div>

  `).join("");

}

}
async function loadReports() {

  const user = await getUser();

  if (!user) return;

  const el = document.getElementById("reportsList");

  if (!el) return;

  el.innerHTML = "<p>Loading reports...</p>";

  const { data, error } = await supabaseClient
    .from("agreement_reports")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {

    console.error(error);

    el.innerHTML = `
      <p>Failed to load reports</p>
    `;

    return;
  }

  if (!data.length) {

    el.innerHTML = `
      <p>No reports available yet</p>
    `;

    return;
  }

  el.innerHTML = data.map(report => `

    <div class="card">

      <h3>
        ${escapeHtml(report.risk_level)} Risk
      </h3>

      <p style="
        color:#6b7280;
        margin:10px 0;
      ">
        Score:
        <strong>${escapeHtml(report.risk_score)}</strong>
      </p>

      <p style="
        color:#6b7280;
        font-size:14px;
        line-height:1.7;
      ">
        ${escapeHtml(report.agreement_excerpt || "Agreement analysis")}
      </p>

      <p style="
        margin-top:14px;
        font-size:12px;
        color:#9ca3af;
      ">
        ${escapeHtml(new Date(report.created_at).toLocaleString())}
      </p>

    </div>

  `).join("");
}

// ==============================
// ADMIN
// ==============================

async function loadAdmin() {
  const el = document.getElementById("admin");

  const admin = await isSuperAdmin();

  if (!admin) {
    el.innerHTML = `
      <div class="card">
        <h3>Access Denied</h3>
        <p>You do not have permission to access this page.</p>
      </div>
    `;
    return;
  }

  const profile = await getProfile();

  el.innerHTML = `
    <div style="text-align:center; margin-bottom:30px;">
      <h1>Admin Panel</h1>
      <p style="color:#6b7280;">
        Welcome back, <strong>${escapeHtml(profile.full_name || profile.email)}</strong>
      </p>
    </div>

    <div id="adminMetrics" class="admin-metrics">
      ${renderAdminMetric("Loading", "...")}
    </div>

    <div class="admin-grid">
      <div class="card">
        <h3>Top Pages</h3>
        <div id="adminTopPages" class="admin-list">
          <p>Loading...</p>
        </div>
      </div>

      <div class="card">
        <h3>Recent Activity</h3>
        <div id="adminRecentActivity" class="admin-list">
          <p>Loading...</p>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>User Journeys</h3>
      <div id="adminJourneys" class="journey-list">
        <p>Loading...</p>
      </div>
    </div>
  `;

  await loadAdminAnalytics();
}
// ==============================
// ERROR
// ==============================

function showError(msg) {
  document.getElementById("analysisResult").innerHTML =
    `<div style="background:#fee2e2;padding:10px">${msg}</div>`;
}

window.initSupabase = initSupabase;

window.getSupabaseClient =
  () => supabaseClient;

window.runChecks = runChecks;

window.escapeHtml = escapeHtml;

window.appPath = appPath;