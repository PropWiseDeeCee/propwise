// ==============================
// DASHBOARD UI
// ==============================


// ==============================
// HELPERS
// ==============================

function formatDate(date) {

  if (!date) return "-";

  return new Date(date)
    .toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    );
}

function getRiskClass(level = "") {

  return String(level)
    .toLowerCase()
    .trim();
}


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

    await Promise.all([

      loadAgreementReports(),

      loadComparisons(),

      loadDashboardStats()
    ]);

  } catch (error) {

    console.error(
      "Dashboard load failed:",
      error
    );

    showError(
      "Failed to load dashboard"
    );
  }
}


// ==============================
// DASHBOARD STATS
// ==============================

async function loadDashboardStats() {

  try {

    const user =
      await getUser();

    if (!user) return;

    const supabase =
      window.getSupabaseClient();

    if (!supabase) return;

    // AGREEMENT REPORTS
    const {
      count: reportCount
    } = await supabase
      .from("agreement_reports")
      .select("*", {
        count: "exact",
        head: true
      })
      .eq("user_id", user.id);

    // COMPARISONS
    const {
      count: comparisonCount
    } = await supabase
      .from("comparisons")
      .select("*", {
        count: "exact",
        head: true
      })
      .eq("user_id", user.id);

    const reportsCountEl =
      document.getElementById(
        "reportsCount"
      );

    const comparisonsCountEl =
      document.getElementById(
        "comparisonsCount"
      );

    if (reportsCountEl) {

      reportsCountEl.textContent =
        reportCount || 0;
    }

    if (comparisonsCountEl) {

      comparisonsCountEl.textContent =
        comparisonCount || 0;
    }

  } catch (err) {

    console.error(
      "Stats load failed:",
      err
    );
  }
}


// ==============================
// LOAD AGREEMENT REPORTS
// ==============================

async function loadAgreementReports() {

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

    const supabase =
      window.getSupabaseClient();

    if (!supabase) {

      reportsEl.innerHTML = `

        <div class="empty-state">

          Supabase unavailable

        </div>
      `;

      return;
    }

    const { data, error } =
      await supabase

        .from("agreement_reports")

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

          <h3>
            No agreement reports yet
          </h3>

          <p>
            Analyze your first agreement
            to build your report history.
          </p>

        </div>
      `;

      return;
    }

    reportsEl.innerHTML =

      data.map(report => {

        const riskClass =
          getRiskClass(
            report.risk_level
          );

        return `

          <div class="report-card">

            <div class="report-top">

              <div>

                <h3>
                  ${escapeHtml(

                    report.report_name ||

                    "Agreement Report"
                  )}
                </h3>

                <p class="report-date">

                  ${formatDate(
                    report.created_at
                  )}

                </p>

              </div>

              <div class="
                risk-pill
                ${riskClass}
              ">

                ${report.risk_level || "Medium"}

              </div>

            </div>

            <div class="report-metrics">

              <div class="metric-box">

                <span>
                  Risk Score
                </span>

                <strong>

                  ${report.risk_score || 0}/100

                </strong>

              </div>

            </div>

            <div class="report-actions">

              <button
                class="secondary-btn"
                onclick="viewAgreementReport('${report.id}')"
              >

                View Report

              </button>

            </div>

          </div>
        `;

      }).join("");

  } catch (error) {

    console.error(
      "Agreement reports load failed:",
      error
    );

    const reportsEl =
      document.getElementById(
        "reportsList"
      );

    if (reportsEl) {

      reportsEl.innerHTML = `

        <div class="empty-state">

          Failed to load reports

        </div>
      `;
    }
  }
}


// ==============================
// LOAD COMPARISONS
// ==============================

async function loadComparisons() {

  try {

    const user =
      await getUser();

    if (!user) return;

    const listEl =
      document.getElementById(
        "list"
      );

    if (!listEl) return;

    listEl.innerHTML = `

      <div class="loading">

        Loading comparisons...

      </div>
    `;

    const supabase =
      window.getSupabaseClient();

    if (!supabase) {

      listEl.innerHTML = `

        <div class="empty-state">

          Supabase unavailable

        </div>
      `;

      return;
    }

    const { data, error } =
      await supabase

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

          <h3>
            No comparisons yet
          </h3>

          <p>
            Start comparing properties
            to save investment insights.
          </p>

        </div>
      `;

      return;
    }

    listEl.innerHTML =

      data.map(item => `

        <div class="report-card">

          <div class="report-top">

            <div>

              <h3>

                ${escapeHtml(

                  item.project_name ||

                  "Property Comparison"
                )}

              </h3>

              <p class="report-date">

                ${formatDate(
                  item.created_at
                )}

              </p>

            </div>

          </div>

        </div>

      `).join("");

  } catch (error) {

    console.error(
      "Comparison load failed:",
      error
    );

    const listEl =
      document.getElementById(
        "list"
      );

    if (listEl) {

      listEl.innerHTML = `

        <div class="empty-state">

          Failed to load comparisons

        </div>
      `;
    }
  }
}


// ==============================
// VIEW SAVED AGREEMENT REPORT
// ==============================

async function viewAgreementReport(
  reportId
) {

  try {

    const supabase =
      window.getSupabaseClient();

    if (!supabase) {

      throw new Error(
        "Supabase unavailable"
      );
    }

    const { data, error } =
      await supabase

        .from("agreement_reports")

        .select("*")

        .eq("id", reportId)

        .single();

    if (error) {

      throw error;
    }

    localStorage.setItem(

      "agreementAnalysis",

      JSON.stringify(
        data.result || {}
      )
    );

  window.location.href =
  `report.html?id=${reportId}`;

  } catch (err) {

    console.error(
      "Open report failed:",
      err
    );

    alert(
      "Unable to open report"
    );
  }
}


// ==============================
// AUTO INIT
// ==============================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadDashboard();
  }
);


// ==============================
// GLOBAL EXPORTS
// ==============================

window.loadDashboard =
  loadDashboard;

window.loadAgreementReports =
  loadAgreementReports;

window.loadComparisons =
  loadComparisons;

window.viewAgreementReport =
  viewAgreementReport;