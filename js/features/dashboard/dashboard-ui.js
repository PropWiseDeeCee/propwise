// ==============================
// DASHBOARD UI
// ==============================


// ==============================
// LOAD DASHBOARD
// ==============================

async function loadDashboard() {

  try {

    const user =
      await getUser();

    if (!user) {

      window.location.href =
        appPath("login.html");

      return;
    }

    const listEl =
      document.getElementById(
        "dashboardList"
      );

    if (!listEl) return;

    listEl.innerHTML = `
      <div class="loading">
        Loading dashboard...
      </div>
    `;

    const { data, error } =
      await window
        .getSupabaseClient()
        .from("comparisons")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false
        });

    if (error) {

      throw error;
    }

    if (!data?.length) {

      listEl.innerHTML = `
        <div class="empty-state">
          No reports found.
        </div>
      `;

      return;
    }

    listEl.innerHTML =
      data.map(item => `

        <div class="dashboard-card">

          <h3>
            ${escapeHtml(
              item.project_name ||
              "Untitled Report"
            )}
          </h3>

          <p>
            Created:
            ${new Date(
              item.created_at
            ).toLocaleDateString()}
          </p>

        </div>

      `).join("");

  } catch (error) {

    console.error(error);

    showError(
      "Failed to load dashboard"
    );
  }
}


// ==============================
// LOAD REPORTS
// ==============================

async function loadReports() {

  try {

    const user =
      await getUser();

    if (!user) return;

    const reportsEl =
      document.getElementById(
        "reportsList"
      );

    if (!reportsEl) return;

    reportsEl.innerHTML = `
      <div class="loading">
        Loading reports...
      </div>
    `;

    const { data, error } =
      await window
        .getSupabaseClient()
        .from("comparisons")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false
        });

    if (error) {

      throw error;
    }

    if (!data?.length) {

      reportsEl.innerHTML = `
        <div class="empty-state">
          No reports available.
        </div>
      `;

      return;
    }

    reportsEl.innerHTML =
      data.map(report => `

        <div class="report-card">

          <h3>
            ${escapeHtml(
              report.project_name ||
              "Untitled"
            )}
          </h3>

          <p>
            ${new Date(
              report.created_at
            ).toLocaleDateString()}
          </p>

        </div>

      `).join("");

  } catch (error) {

    console.error(error);

    showError(
      "Failed to load reports"
    );
  }
}


// ==============================
// GLOBAL EXPORTS
// ==============================

window.loadDashboard =
  loadDashboard;

window.loadReports =
  loadReports;