// ==============================
// ADMIN UI
// ==============================

async function loadAdmin() {
  const adminEl =
    document.getElementById("admin");

  if (!adminEl) return;

  adminEl.innerHTML = `
    <section class="admin-section">
      <div class="loading">Checking admin access...</div>
    </section>
  `;

  const user = await getUser();

  if (!user) {
    window.location.href =
      appPath("login.html");

    return;
  }

  const profile = await getProfile();

  if (!isAdminRole(profile?.role)) {
    adminEl.innerHTML = `
      <section class="admin-section">
        <div class="admin-access-card">
          <h1>Admin Access Required</h1>
          <p>
            You are signed in as
            <strong>${escapeHtml(user.email || "this user")}</strong>,
            but this account is not marked as an admin.
          </p>
          <p class="small-text">
            Current role: ${escapeHtml(profile?.role || "user")}
          </p>
          <a class="btn btn-primary" href="dashboard.html">
            Go to Dashboard
          </a>
        </div>
      </section>
    `;

    return;
  }

  adminEl.innerHTML = `
    <section class="admin-section">
      <div class="admin-header">
        <div>
          <h1 class="admin-title">Admin Dashboard</h1>
          <p class="admin-subtitle">
            Platform activity, saved comparisons, users and visitor journeys.
          </p>
        </div>

        <div class="admin-actions">
          <a class="btn btn-outline" href="dashboard.html">
            Dashboard
          </a>
        </div>
      </div>

      <div id="adminMetrics" class="admin-metrics">
        <div class="loading">Loading admin metrics...</div>
      </div>

      <div class="admin-panel-grid">
        <div class="card">
          <h2>Top Pages</h2>
          <div id="adminTopPages" class="admin-list">
            <div class="loading">Loading top pages...</div>
          </div>
        </div>

        <div class="card">
          <h2>Recent Activity</h2>
          <div id="adminRecentActivity" class="admin-list">
            <div class="loading">Loading recent activity...</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>User Journeys</h2>
        <div id="adminJourneys" class="admin-list">
          <div class="loading">Loading journeys...</div>
        </div>
      </div>
    </section>
  `;

  await loadAdminAnalytics();
}

window.loadAdmin = loadAdmin;
window.loadAdminDashboard = loadAdmin;
