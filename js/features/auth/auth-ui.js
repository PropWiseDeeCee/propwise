// ==============================
// ADMIN UI
// ==============================


// ==============================
// LOAD ADMIN DASHBOARD
// ==============================

async function loadAdminDashboard() {

  try {

    const user =
      await getUser();

    // Not logged in
    if (!user) {

      window.location.href =
        appPath("login.html");

      return;
    }

    // Permission check
    const allowed =
      await isSuperAdmin(user.id);

    if (!allowed) {

      alert("Unauthorized");

      window.location.href =
        appPath("index.html");

      return;
    }

    const adminEl =
      document.getElementById(
        "adminMetrics"
      );

    if (!adminEl) return;

    // Loading state
    adminEl.innerHTML = `
      <div class="loading">
        Loading admin dashboard...
      </div>
    `;

    // ==============================
    // FETCH REPORTS
    // ==============================

    const {
      data: reports,
      error: reportsError
    } =
      await window
        .getSupabaseClient()
        .from("comparisons")
        .select("*");

    if (reportsError) {
      throw reportsError;
    }

    // ==============================
    // FETCH USERS
    // ==============================

    const {
      data: users,
      error: usersError
    } =
      await window
        .getSupabaseClient()
        .from("profiles")
        .select("*");

    if (usersError) {

      console.warn(
        "Users fetch failed:",
        usersError
      );
    }

    // ==============================
    // CALCULATIONS
    // ==============================

    const totalReports =
      reports?.length || 0;

    const totalUsers =
      users?.length || 0;

    const today =
      new Date().toDateString();

    const todayReports =
      (reports || []).filter(r => {

        return (
          new Date(
            r.created_at
          ).toDateString() === today
        );
      }).length;

    // ==============================
    // RENDER
    // ==============================

    adminEl.innerHTML = `

      <div class="admin-grid">

        <div class="metric-card">
          <h3>Total Reports</h3>
          <h2>${totalReports}</h2>
        </div>

        <div class="metric-card">
          <h3>Total Users</h3>
          <h2>${totalUsers}</h2>
        </div>

        <div class="metric-card">
          <h3>Reports Today</h3>
          <h2>${todayReports}</h2>
        </div>

      </div>

    `;

  } catch (error) {

    console.error(
      "Admin dashboard failed:",
      error
    );

    showError(
      "Failed to load admin dashboard"
    );
  }
}


// ==============================
// LOAD USERS
// ==============================

async function loadUsers() {

  try {

    const usersEl =
      document.getElementById(
        "usersList"
      );

    if (!usersEl) return;

    usersEl.innerHTML = `
      <div class="loading">
        Loading users...
      </div>
    `;

    const { data, error } =
      await window
        .getSupabaseClient()
        .from("profiles")
        .select("*")
        .order("created_at", {
          ascending: false
        });

    if (error) {
      throw error;
    }

    if (!data?.length) {

      usersEl.innerHTML = `
        <div class="empty-state">
          No users found.
        </div>
      `;

      return;
    }

    usersEl.innerHTML =
      data.map(user => `

        <div class="user-card">

          <h3>
            ${escapeHtml(
              user.name || "Unnamed"
            )}
          </h3>

          <p>
            ${escapeHtml(
              user.email || ""
            )}
          </p>

        </div>

      `).join("");

  } catch (error) {

    console.error(
      "Load users failed:",
      error
    );
  }
}


// ==============================
// GLOBAL EXPORTS
// ==============================

window.loadAdminDashboard =
  loadAdminDashboard;

window.loadUsers =
  loadUsers;