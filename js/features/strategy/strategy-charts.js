// =============================================
// PROPWISE STRATEGY CHARTS
// =============================================

let strategyProjectionChart = null;
let strategyBreakdownChart = null;


// =============================================
// DESTROY CHARTS
// =============================================

function destroyStrategyCharts() {

  if (strategyProjectionChart) {

    strategyProjectionChart.destroy();

    strategyProjectionChart = null;
  }

  if (strategyBreakdownChart) {

    strategyBreakdownChart.destroy();

    strategyBreakdownChart = null;
  }
}


// =============================================
// CAGR PROJECTION
// =============================================

function calculateProjectionSeries(
  principal,
  annualRate,
  years
) {

  const values = [];

  for (
    let year = 0;
    year <= years;
    year++
  ) {

    values.push(

      principal *

      Math.pow(
        1 + annualRate / 100,
        year
      )

    );
  }

  return values;
}


// =============================================
// WEALTH PROJECTION
// =============================================

function renderStrategyProjectionChart(
  result,
  inputData
) {

  const canvas =

    document.getElementById(
      "strategyProjectionChart"
    );

  if (!canvas) return;

  const ctx =
    canvas.getContext("2d");

  const years =
    inputData.projectionYears;

  const labels = [];

  for (
    let i = 0;
    i <= years;
    i++
  ) {

    labels.push(
      `Year ${i}`
    );
  }

  const keepSeries =
    calculateProjectionSeries(

      inputData.propertyValue,

      inputData.appreciationRate,

      years

    );

  const sellSeries =
    calculateProjectionSeries(

      Math.max(
        inputData.propertyValue -
        inputData.outstandingLoan,
        0
      ),

      inputData.equityReturnRate,

      years

    );

  strategyProjectionChart =

    new Chart(ctx, {

      type: "line",

      data: {

        labels,

        datasets: [

          {

            label:
              "Keep Property",

            data:
              keepSeries,

            borderWidth: 3,

            tension: 0.35

          },

          {

            label:
              "Sell & Invest",

            data:
              sellSeries,

            borderWidth: 3,

            tension: 0.35

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

          title: {

            display: true,

            text:
              "Wealth Projection"

          }

        },

        scales: {

          y: {

            ticks: {

              callback(
                value
              ) {

                return `₹${Math.round(
                  value
                ).toLocaleString(
                  "en-IN"
                )}`;
              }

            }

          }

        }

      }

    });
}


// =============================================
// BREAKDOWN CHART
// =============================================

function renderStrategyBreakdownChart(
  result
) {

  const canvas =

    document.getElementById(
      "strategyBreakdownChart"
    );

  if (!canvas) return;

  const ctx =
    canvas.getContext("2d");

  const keep =
    result.keepScenario;

  strategyBreakdownChart =

    new Chart(ctx, {

      type: "doughnut",

      data: {

        labels: [

          "Property Value",

          "Rental Income",

          "Maintenance",

          "Property Tax"

        ],

        datasets: [

          {

            data: [

              keep.futurePropertyValue,

              keep.totalRentIncome,

              keep.totalMaintenance,

              keep.totalPropertyTax

            ]

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

          title: {

            display: true,

            text:
              "Keep Property Breakdown"

          }

        }

      }

    });
}


// =============================================
// MASTER RENDER
// =============================================

function renderStrategyCharts(
  result,
  inputData
) {

  destroyStrategyCharts();

  renderStrategyProjectionChart(

    result,

    inputData

  );

  renderStrategyBreakdownChart(
    result
  );
}


// =============================================
// EXPORTS
// =============================================

window.renderStrategyCharts =
  renderStrategyCharts;

window.destroyStrategyCharts =
  destroyStrategyCharts;