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

function renderAppreciationChart({

  aName,
  bName,

  aBase,
  bBase,

  growthRate = 0.06

}) {

  destroyExistingChart();

  const canvas =
    document.getElementById(
      "appreciationChart"
    );

  if (!canvas) return;

  const years = [
    "Year 1",
    "Year 2",
    "Year 3",
    "Year 4",
    "Year 5"
  ];

  const buildProjection = (base) => {

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

  appreciationChartInstance =
    new Chart(canvas, {

      type: "line",

      data: {

        labels: years,

        datasets: [

          {
            label: aName,

            data:
              buildProjection(aBase),

            tension: 0.4,

            fill: false
          },

          {
            label: bName,

            data:
              buildProjection(bBase),

            tension: 0.4,

            fill: false
          }
        ]
      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

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

                return formatCurrency(value);
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

  let insights = [];

  insights.push(

    `${winner} appears financially stronger based on overall ownership efficiency.`
  );

  if (yieldA > yieldB) {

    insights.push(
      "Property A offers better rental yield potential."
    );

  } else if (yieldB > yieldA) {

    insights.push(
      "Property B offers better rental yield potential."
    );
  }

  if (emiA < emiB) {

    insights.push(
      "Property A has lower EMI burden."
    );

  } else if (emiB < emiA) {

    insights.push(
      "Property B has lower EMI burden."
    );
  }

  insights.push(
    `Estimated savings difference: ${formatCurrency(savings)}`
  );

  container.innerHTML = `

    <div class="winner-box">

      <h3 style="margin-bottom:16px;">

        Smart Recommendation

      </h3>

      <ul style="
        line-height:1.9;
        padding-left:20px;
      ">

        ${insights.map(item => `

          <li>${item}</li>

        `).join("")}

      </ul>

    </div>
  `;
}