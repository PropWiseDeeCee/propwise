// =============================================
// PROPWISE STRATEGY REPORT PDF
// =============================================

async function downloadStrategyReport(
  reportData = window.latestStrategyData
) {

  try {

    if (!reportData) {

      alert(
        "Please analyze a property strategy first."
      );

      return;
    }

    if (
      !window.jspdf ||
      !window.jspdf.jsPDF
    ) {

      alert(
        "PDF library not loaded."
      );

      return;
    }

    const {

      inputData,

      result

    } = reportData;

    const {

      jsPDF

    } = window.jspdf;

    const doc =
      new jsPDF(
        "p",
        "mm",
        "a4"
      );

    let y = 20;

    // =========================================
    // HEADER
    // =========================================

    doc.setFontSize(20);

    doc.text(
      "PropWise India",
      15,
      y
    );

    y += 8;

    doc.setFontSize(14);

    doc.text(
      "Property Strategy Advisor Report",
      15,
      y
    );

    y += 12;

    doc.setFontSize(10);

    doc.text(
      `Generated: ${new Date().toLocaleString()}`,
      15,
      y
    );

    y += 12;

    // =========================================
    // PROPERTY DETAILS
    // =========================================

    doc.setFontSize(13);

    doc.text(
      "Property Details",
      15,
      y
    );

    y += 6;

    doc.autoTable({

      startY: y,

      theme: "grid",

      head: [[
        "Field",
        "Value"
      ]],

      body: [

        [
          "City",
          inputData.city
        ],

        [
          "State",
          inputData.state
        ],

        [
          "Current Value",
          formatIndianCurrency(
            inputData.propertyValue
          )
        ],

        [
          "Purchase Price",
          formatIndianCurrency(
            inputData.purchasePrice
          )
        ],

        [
          "Outstanding Loan",
          formatIndianCurrency(
            inputData.outstandingLoan
          )
        ],

        [
          "Monthly Rent",
          formatIndianCurrency(
            inputData.monthlyRent
          )
        ]

      ]

    });

    y =
      doc.lastAutoTable.finalY + 10;

    // =========================================
    // RECOMMENDATION
    // =========================================

    doc.setFontSize(13);

    doc.text(
      "Recommendation",
      15,
      y
    );

    y += 8;

    doc.setFontSize(18);

    doc.text(

      result.recommendation.action,

      15,

      y

    );

    y += 8;

    doc.setFontSize(10);

    doc.text(

      result.recommendation.reason,

      15,

      y,

      {
        maxWidth: 170
      }

    );

    y += 20;

    // =========================================
    // STRATEGY METRICS
    // =========================================

    doc.setFontSize(13);

    doc.text(
      "Strategy Metrics",
      15,
      y
    );

    y += 6;

    doc.autoTable({

      startY: y,

      theme: "grid",

      head: [[
        "Metric",
        "Value"
      ]],

      body: [

        [
          "Keep Wealth",
          formatIndianCurrency(
            result.keepScenario.keepWealth
          )
        ],

        [
          "Sell Wealth",
          formatIndianCurrency(
            result.sellScenario.sellWealth
          )
        ],

        [
          "Opportunity Cost",
          formatIndianCurrency(
            result.opportunityCost
          )
        ],

        [
          "Rental Yield",
          `${result.rentalYield.toFixed(2)}%`
        ],

        [
          "Strategy Score",
          `${result.strategyScore}/100`
        ],

        [
          "Strategy Grade",
          result.strategyGrade
        ]

      ]

    });

    y =
      doc.lastAutoTable.finalY + 10;

    // =========================================
    // KEEP SCENARIO
    // =========================================

    doc.setFontSize(13);

    doc.text(
      "Keep Property Scenario",
      15,
      y
    );

    y += 6;

    doc.autoTable({

      startY: y,

      theme: "striped",

      head: [[
        "Metric",
        "Value"
      ]],

      body: [

        [
          "Future Property Value",
          formatIndianCurrency(
            result.keepScenario.futurePropertyValue
          )
        ],

        [
          "Total Rental Income",
          formatIndianCurrency(
            result.keepScenario.totalRentIncome
          )
        ],

        [
          "Maintenance Cost",
          formatIndianCurrency(
            result.keepScenario.totalMaintenance
          )
        ],

        [
          "Property Tax",
          formatIndianCurrency(
            result.keepScenario.totalPropertyTax
          )
        ]

      ]

    });

    y =
      doc.lastAutoTable.finalY + 10;

    // =========================================
    // NEW PAGE
    // =========================================

    doc.addPage();

    y = 20;

    // =========================================
    // SELL SCENARIO
    // =========================================

    doc.setFontSize(13);

    doc.text(
      "Sell & Invest Scenario",
      15,
      y
    );

    y += 6;

    doc.autoTable({

      startY: y,

      theme: "striped",

      head: [[
        "Metric",
        "Value"
      ]],

      body: [

        [
          "Sale Proceeds",
          formatIndianCurrency(
            result.sellScenario.saleProceeds
          )
        ],

        [
          "Future Investment Value",
          formatIndianCurrency(
            result.sellScenario.futureInvestmentValue
          )
        ],

        [
          "Projected Wealth",
          formatIndianCurrency(
            result.sellScenario.sellWealth
          )
        ]

      ]

    });

    y =
      doc.lastAutoTable.finalY + 12;

    // =========================================
    // CHART IMAGE
    // =========================================

    const chartCanvas =
      document.getElementById(
        "strategyProjectionChart"
      );

    if (chartCanvas) {

      try {

        const chartImage =

          chartCanvas.toDataURL(
            "image/png"
          );

        doc.addImage(

          chartImage,

          "PNG",

          15,

          y,

          180,

          80

        );

        y += 90;

      } catch (err) {

        console.warn(
          "Chart export failed",
          err
        );
      }
    }

    // =========================================
    // DISCLAIMER
    // =========================================

    doc.setFontSize(9);

    doc.text(

      "Disclaimer: PropWise India provides informational projections only. This report is not legal, tax, financial or investment advice.",

      15,

      285,

      {
        maxWidth: 180
      }

    );

    // =========================================
    // SAVE
    // =========================================

    const fileName =

      `propwise-strategy-report-${Date.now()}.pdf`;

    doc.save(fileName);

  }

  catch (error) {

    console.error(error);

    alert(
      "Failed to generate strategy report."
    );
  }
}


// =============================================
// HELPERS
// =============================================

function formatIndianCurrency(
  value
) {

  return `₹${Number(
    value || 0
  ).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 0
    }
  )}`;
}


// =============================================
// EXPORTS
// =============================================

window.downloadStrategyReport =
  downloadStrategyReport;