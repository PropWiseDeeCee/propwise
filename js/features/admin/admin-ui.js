// ==============================
// ADMIN UI
// ==============================

async function loadAdminDashboard() {

  try {

    const user =
      await getUser();

    if (!user) {

      window.location.href =
        appPath("login.html");

      return;
    }

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

    adminEl.innerHTML = `
      <div class="loading">
        Loading admin dashboard...
      </div>
    `;

    const { data, error } =
      await window
        .getSupabaseClient()
        .from("comparisons")
        .select("*");

    if (error) {
      throw error;
    }

    adminEl.innerHTML = `

      <div class="metric-card">
        <h3>Total Reports</h3>
        <h2>${data.length}</h2>
      </div>

    `;

  } catch (error) {

    console.error(error);

    showError(
      "Failed to load admin dashboard"
    );
  }
}


// ==============================
// GLOBAL EXPORTS
// ==============================

window.loadAdminDashboard =
  loadAdminDashboard;