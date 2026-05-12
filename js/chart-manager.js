// ==============================
// PROPWISE CHART MANAGER
// ==============================

let appreciationChartInstance = null;

// ==============================
// DESTROY OLD CHART
// ==============================

function destroyExistingChart() {

  if (appreciationChartInstance) {

    appreciationChartInstance.destroy();

    appreciationChartInstance = null;
  }
}

// ==============================
// CREATE APPRECIATION CHART
// ==============================

// ==============================
// CREATE APPRECIATION CHART
// ==============================

function renderAppreciationChart({

  aName,
  bName,

  aBase,
  bBase,

  growthRate = 0.06

}) {

  // DESTROY OLD CHART
  if (
    window.appreciationChartInstance
  ) {

    window.appreciationChartInstance.destroy();

    window.appreciationChartInstance =
      null;
  }

  const canvas =
    document.getElementById(
      "appreciationChart"
    );

  if (!canvas) return;

  const ctx =
    canvas.getContext("2d");

  const labels = [

    "Year 1",
    "Year 2",
    "Year 3",
    "Year 4",
    "Year 5"
  ];

  const buildProjection = (
    base
  ) => {

    return [

      base,

      calculateFutureValue(
        base,
        growthRate,
        1
      ),

      calculateFutureValue(
        base,
        growthRate,
        2
      ),

      calculateFutureValue(
        base,
        growthRate,
        3
      ),

      calculateFutureValue(
        base,
        growthRate,
        4
      )
    ];
  };

  const appreciationA =
    buildProjection(aBase);

  const appreciationB =
    buildProjection(bBase);

  window.appreciationChartInstance =
    new Chart(ctx, {

      type: "line",

      data: {

        labels,

        datasets: [

          {

            label: aName,

            data: appreciationA,

            tension: 0.35
          },

          {

            label: bName,

            data: appreciationB,

            tension: 0.35
          }
        ]
      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        animation: false,

        plugins: {

          title: {

            display: true,

            text:
              "5-Year Property Appreciation Projection"
          },

          legend: {

            position: "top"
          },

          tooltip: {

            callbacks: {

              label: function(context) {

                return formatCurrency(
                  context.parsed.y
                );
              }
            }
          }
        },

        scales: {

          y: {

            ticks: {

              callback: function(value) {

                return formatCurrency(
                  value
                );
              }
            }
          }
        }
      }
    });
}

// ==============================
// OWNERSHIP PROJECTION TABLE
// ==============================

function renderOwnershipProjection({

  aName,
  bName,

  totalA,
  totalB,

  maintenanceA,
  maintenanceB

}) {

  const container =
    document.getElementById(
      "ownershipProjection"
    );

  if (!container) return;

  const fiveYearA =
    totalA +
    calculateFiveYearMaintenance(
      maintenanceA
    );

  const fiveYearB =
    totalB +
    calculateFiveYearMaintenance(
      maintenanceB
    );

  container.innerHTML = `

    <div class="card">

      <h2 style="margin-bottom:20px;">

        5-Year Ownership Projection

      </h2>

      <table class="pdf-table">

        <tr>

          <th>Metric</th>

          <th>${aName}</th>

          <th>${bName}</th>

        </tr>

        <tr>

          <td>
            Initial Acquisition Cost
          </td>

          <td>
            ${formatCurrency(totalA)}
          </td>

          <td>
            ${formatCurrency(totalB)}
          </td>

        </tr>

        <tr>

          <td>
            5-Year Maintenance
          </td>

          <td>
            ${formatCurrency(
              calculateFiveYearMaintenance(
                maintenanceA
              )
            )}
          </td>

          <td>
            ${formatCurrency(
              calculateFiveYearMaintenance(
                maintenanceB
              )
            )}
          </td>

        </tr>

        <tr>

          <td>
            Total 5-Year Ownership
          </td>

          <td>
            ${formatCurrency(fiveYearA)}
          </td>

          <td>
            ${formatCurrency(fiveYearB)}
          </td>

        </tr>

      </table>

    </div>
  `;
}

// ==============================
// AI RECOMMENDATION
// ==============================

function renderAIRecommendation({

  winner,
  savings,

  yieldA,
  yieldB,

  emiA,
  emiB
}) {

  const container =
    document.getElementById(
      "aiRecommendation"
    );

  if (!container) return;

  const propertyA =
    document.getElementById("aName")
      ?.value || "Property A";

  const propertyB =
    document.getElementById("bName")
      ?.value || "Property B";

  const betterYield =
    Number(yieldA) >
    Number(yieldB)

      ? propertyA
      : propertyB;

  const lowerEMI =
    Number(emiA) <
    Number(emiB)

      ? propertyA
      : propertyB;

  container.innerHTML = `

    <div class="smart-box">

      <div class="smart-header">

        <div class="smart-icon">
          🧠
        </div>

        <div>

          <h3>
            Smart Recommendation
          </h3>

          <p>
            AI-assisted financial insights
          </p>

        </div>

      </div>

      <div class="smart-list">

        <div class="smart-item">

          ✅ <strong>${winner}</strong>
          appears financially stronger
          based on ownership efficiency,
          appreciation potential and
          overall acquisition cost.

        </div>

        <div class="smart-item">

          📈 <strong>${betterYield}</strong>
          offers stronger rental yield
          potential for long-term returns.

        </div>

        <div class="smart-item">

          💰 <strong>${lowerEMI}</strong>
          has lower EMI burden and may
          provide better monthly cash flow.

        </div>

        <div class="smart-highlight">

          Estimated ownership difference:

          <br><br>

          ${formatCurrency(savings)}

        </div>

      </div>

    </div>
  `;
}