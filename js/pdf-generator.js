// =========================================
// PROPWISE INDIA
// PROFESSIONAL PDF GENERATOR
// =========================================

const { jsPDF } = window.jspdf;

// =========================================
// PDF CONSTANTS
// =========================================

const PDF = {

  margin: 18,

  pageWidth: 210,

  pageHeight: 297,

  contentWidth: 174
};

// =========================================
// CREATE PDF DOCUMENT
// =========================================

function createPDFDocument() {

  return new jsPDF({

    orientation: "portrait",

    unit: "mm",

    format: "a4"
  });
}

// =========================================
// FORMATTERS
// =========================================

function pdfCurrency(value) {

  const amount =
    Number(value || 0);

  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

// =========================================
// PDF HEADER
// =========================================

function renderPDFHeader(
  doc,
  title,
  reportId
) {

  // LOGO
  const logo =
    document.getElementById(
      "pdfLogo"
    );

  if (logo) {

    try {

      doc.addImage(
        logo,
        "PNG",
        PDF.margin,
        10,
        18,
        18
      );

    } catch (err) {

      console.warn(
        "Logo render failed",
        err
      );
    }
  }

  // TITLE
  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(22);

  doc.setTextColor(
    17,
    24,
    39
  );

  doc.text(
    title,
    42,
    20
  );

  // META
  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(10);

  doc.setTextColor(
    107,
    114,
    128
  );

  doc.text(
    `Report ID: ${reportId}`,
    42,
    28
  );

  doc.text(
    `Generated: ${new Date()
      .toLocaleString()}`,
    42,
    34
  );

  // DIVIDER
  doc.setDrawColor(
    229,
    231,
    235
  );

  doc.line(
    PDF.margin,
    42,
    PDF.pageWidth - PDF.margin,
    42
  );
}

// =========================================
// FOOTER
// =========================================

function renderPDFFooter(
  doc,
  pageNumber
) {

  doc.setFontSize(9);

  doc.setTextColor(
    156,
    163,
    175
  );

  doc.text(
    "PropWise India | Confidential",
    PDF.margin,
    285
  );

  doc.text(
    `Page ${pageNumber}`,
    180,
    285
  );
}

// =========================================
// WATERMARK
// =========================================

function renderWatermark(doc) {

  doc.setFontSize(42);

  doc.setTextColor(
    250,
    250,
    250
  );

  doc.text(
    "PROPWISE INDIA",
    30,
    160,
    {
      angle: 45
    }
  );
}

// =========================================
// SECTION TITLE
// =========================================

function renderSectionTitle(
  doc,
  title,
  y
) {

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(16);

  doc.setTextColor(
    17,
    24,
    39
  );

  doc.text(
    title,
    PDF.margin,
    y
  );
}

// =========================================
// SUMMARY CARD
// =========================================

function renderSummaryCard(
  doc,
  {
    title,
    value,
    subtitle
  },
  x,
  y,
  width = 80,
  height = 30
) {

  doc.setFillColor(
    248,
    250,
    252
  );

  doc.roundedRect(
    x,
    y,
    width,
    height,
    4,
    4,
    "F"
  );

  doc.setFontSize(10);

  doc.setTextColor(
    100,
    116,
    139
  );

  doc.text(
    title,
    x + 6,
    y + 9
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(16);

  doc.setTextColor(
    15,
    23,
    42
  );

  doc.text(
    value,
    x + 6,
    y + 19
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(9);

  doc.setTextColor(
    107,
    114,
    128
  );

  doc.text(
    subtitle,
    x + 6,
    y + 26
  );
}

// =========================================
// COVER HERO
// =========================================

function renderCoverHero(
  doc,
  {
    aName,
    bName,
    recommendation
  }
) {

  doc.setFillColor(
    15,
    23,
    42
  );

  doc.roundedRect(
    PDF.margin,
    52,
    166,
    38,
    6,
    6,
    "F"
  );

   doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(20);

  doc.setTextColor(
    255,
    255,
    255
  );

  doc.text(
    `${aName} vs ${bName}`,
    24,
    68
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(11);

  doc.setTextColor(
    226,
    232,
    240
  );

  doc.text(
    "AI-assisted property ownership comparison report",
    24,
    78
  );

  doc.setFillColor(
    255,
    255,
    255
  );

  doc.roundedRect(
    130,
    60,
    48,
    18,
    4,
    4,
    "F"
  );

  doc.setFontSize(9);

  doc.setTextColor(
    15,
    23,
    42
  );

  doc.text(
    "Recommended",
    140,
    67
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

const safeRecommendation =
  recommendation || "Property A";

const shortRecommendation =
  safeRecommendation.length > 18
    ? safeRecommendation.substring(0,18) + "..."
    : safeRecommendation;

doc.text(
  shortRecommendation,
  136,
  73
);
}

// =========================================
// AGREEMENT COVER HERO
// =========================================

function renderAgreementHero(
  doc,
  report
) {

  // HERO BACKGROUND
  doc.setFillColor(
    15,
    23,
    42
  );

  doc.roundedRect(
    PDF.margin,
    52,
    174,
    42,
    6,
    6,
    "F"
  );

  // TITLE
  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(20);

  doc.setTextColor(
    255,
    255,
    255
  );

  doc.text(
    "Agreement Risk Report",
    24,
    68
  );

  // SUBTITLE
  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(11);

  doc.setTextColor(
    226,
    232,
    240
  );

  doc.text(
    "AI-assisted legal agreement analysis",
    24,
    78
  );

  // RISK BADGE
  const riskLevel =
    report.risk_level || "Medium";

  let badgeColor = [234,179,8];

  if (
    riskLevel.toLowerCase()
    .includes("high")
  ) {

    badgeColor = [220,38,38];
  }

  if (
    riskLevel.toLowerCase()
    .includes("low")
  ) {

    badgeColor = [22,163,74];
  }

  doc.setFillColor(
    ...badgeColor
  );

  doc.roundedRect(
    132,
    60,
    42,
    18,
    4,
    4,
    "F"
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(10);

  doc.setTextColor(
    255,
    255,
    255
  );

  doc.text(
    riskLevel.toUpperCase(),
    138,
    71
  );
}

// =========================================
// INSIGHT BOX
// =========================================

function renderInsightBox(
  doc,
  title,
  content,
  y
) {

  const lines =
    doc.splitTextToSize(
      content,
      158
    );

  const boxHeight =
    18 + (lines.length * 5);

  doc.setFillColor(
    239,
    246,
    255
  );

  doc.roundedRect(
    PDF.margin,
    y,
    174,
    boxHeight,
    4,
    4,
    "F"
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(12);

  doc.setTextColor(
    30,
    64,
    175
  );

  doc.text(
    title,
    PDF.margin + 8,
    y + 10
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(10);

doc.setLineHeightFactor(
  1.4
);

  doc.setTextColor(
    55,
    65,
    81
  );

  doc.text(
    lines,
    PDF.margin + 8,
    y + 18
  );
}

// =========================================
// METRICS GRID
// =========================================

function renderMetricsGrid(
  doc,
  metrics,
  startY
) {

  const cardWidth = 82;

  const cardHeight = 26;

  const gap = 10;

  metrics.forEach(
    (metric, index) => {

      const x =
        index % 2 === 0
          ? PDF.margin
          : PDF.margin + cardWidth + gap;

      const y =
        startY +
        Math.floor(index / 2) *
        (cardHeight + gap);

         doc.setFillColor(
        248,
        250,
        252
      );

      doc.roundedRect(
        x,
        y,
        cardWidth,
        cardHeight,
        4,
        4,
        "F"
      );

      doc.setFontSize(9);

      doc.setTextColor(
        100,
        116,
        139
      );

       doc.text(
        metric.label,
        x + 6,
        y + 8
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(13);

      doc.setTextColor(
        15,
        23,
        42
      );

      doc.text(
        metric.value,
        x + 6,
        y + 18
      );
    }
  );
}

// =========================================
// ADD CHART IMAGE
// =========================================

function renderChartImage(
  doc,
  canvasId,
  y
) {

  const canvas =
    document.getElementById(
      canvasId
    );

  if (!canvas) return y;

  try {

    const image =
      canvas.toDataURL(
        "image/png"
      );

    doc.addImage(
      image,
      "PNG",
      PDF.margin,
      y,
      174,
      72
    );

    return y + 78;

  } catch (err) {

    console.warn(
      "Chart export failed",
      err
    );

    return y;
  }
}



// =========================================
// DOWNLOAD AGREEMENT PDF
// =========================================

async function downloadAgreementPDF(
  report
) {

  const doc =
    createPDFDocument();

  const reportId =
    report.reportId ||
    `AGR-${Date.now()}`;

  // =====================================
  // PAGE 1
  // =====================================

  renderWatermark(doc);

  renderPDFHeader(
    doc,
    "Agreement Risk Report",
    reportId
  );

  renderAgreementHero(
    doc,
    report
  );

  // EXECUTIVE SUMMARY
  renderSectionTitle(
    doc,
    "Executive Summary",
    110
  );

  renderSummaryCard(
    doc,
    {
      title: "Risk Score",
      value: `${report.risk_score || 0}/100`,
      subtitle: "Overall agreement risk"
    },
    18,
    118
  );

  renderSummaryCard(
    doc,
    {
      title: "Risk Level",
      value: report.risk_level || "Medium",
      subtitle: "AI-detected severity"
    },
    110,
    118
  );

  // RISK METRICS
  renderSectionTitle(
    doc,
    "Risk Overview",
    162
  );

  const findings =
    report.findings || [];

  const highRisks =
    findings.filter(
      item =>
        (item.severity || "")
        .toLowerCase()
        .includes("high")
    ).length;

  const mediumRisks =
    findings.filter(
      item =>
        (item.severity || "")
        .toLowerCase()
        .includes("medium")
    ).length;

  renderMetricsGrid(
    doc,
    [

      {
        label: "High Risk Clauses",
        value: `${highRisks}`
      },

      {
        label: "Medium Risk Clauses",
        value: `${mediumRisks}`
      },

      {
        label: "Total Findings",
        value: `${findings.length}`
      },

      {
        label: "Document Status",
        value:
          report.risk_level || "Review"
      }
    ],
    170
  );

  // =====================================
  // PAGE 2
  // =====================================

  doc.addPage();

  renderWatermark(doc);

  renderPDFHeader(
    doc,
    "Detected Agreement Risks",
    reportId
  );

  renderSectionTitle(
    doc,
    "AI Risk Findings",
    58
  );

  const findingsBody =
    findings.map(item => [

      item.title || "Risk",

      item.severity || "-",

      item.description || "-"
    ]);

  doc.autoTable({

    startY: 65,

    theme: "grid",
    pageBreak: "auto",

    margin: {
      left: PDF.margin,
      right: PDF.margin
    },
    pageBreak: "auto",

    styles: {

      fontSize: 10,

      cellPadding: 5,

      lineColor: [229,231,235],

      lineWidth: 0.2
    },

    headStyles: {

      fillColor: [15,23,42],

      textColor: [255,255,255],

      minCellHeight: 12
    },

    alternateRowStyles: {

      fillColor: [248,250,252]
    },

    head: [[

      "Issue",

      "Severity",

      "Description"
    ]],

    body: findingsBody
  });

  // =====================================
  // PAGE 3
  // =====================================

  doc.addPage();

  renderWatermark(doc);

  renderPDFHeader(
    doc,
    "AI Recommendation & Legal Guidance",
    reportId
  );

  renderInsightBox(
    doc,
    "AI Recommendation",
    report.summary ||
    "This agreement should be carefully reviewed before execution. Certain clauses may require legal clarification or renegotiation.",
    60
  );

  renderSummaryCard(
    doc,
    {
      title: "Agreement Status",
      value:
        report.risk_level || "Review",
      subtitle: "Current AI assessment"
    },
    18,
    130
  );

  renderSummaryCard(
    doc,
    {
      title: "Total Findings",
      value: `${findings.length}`,
      subtitle: "AI-detected observations"
    },
    110,
    130
  );

  renderInsightBox(
    doc,
    "Legal Disclaimer",
    "This report is AI-assisted and intended for informational purposes only. PropWise India does not provide legal advice and strongly recommends consulting a qualified legal professional before signing any property agreement.",
    165
  );

  // FOOTERS
  const totalPages =
    doc.getNumberOfPages();

  for (
    let i = 1;
    i <= totalPages;
    i++
  ) {

    doc.setPage(i);

    renderPDFFooter(
      doc,
      i
    );
  }

  // SAVE PDF
  doc.save(
    `PropWise-Agreement-Risk-Report-${reportId}.pdf`
  );
}

// =========================================
// DOWNLOAD COMPARISON PDF
// =========================================

async function downloadComparisonPDF(
  data
) {

  const doc =
    createPDFDocument();

  const reportId =
    `CMP-${Date.now()}`;

  // PAGE 1
  renderWatermark(doc);

  renderPDFHeader(
    doc,
    "Property Comparison Report",
    reportId
  );

  renderCoverHero(
    doc,
    data
  );

  renderSectionTitle(
    doc,
    "Executive Summary",
    105
  );

  renderSummaryCard(
    doc,
    {
      title: "Recommended",
      value: data.recommended || "Property A",
      subtitle: "Better ownership value"
    },
    18,
    112
  );

  renderSummaryCard(
    doc,
    {
      title: "Estimated Savings",
      value: pdfCurrency(
        data.savings || 0
      ),
      subtitle: "Projected cost advantage"
    },
    110,
    112
  );

  renderSectionTitle(
    doc,
    "Key Financial Metrics",
    155
  );

  renderMetricsGrid(
    doc,
    [

      {
        label: "Property A Total Cost",
        value: pdfCurrency(
          data.totalA || 0
        )
      },

      {
        label: "Property B Total Cost",
        value: pdfCurrency(
          data.totalB || 0
        )
      },

      {
        label: "Rental Yield A",
        value: `${data.yieldA || 0}%`
      },

      {
        label: "Rental Yield B",
        value: `${data.yieldB || 0}%`
      }
    ],
    162
  );

  // PAGE 2
  doc.addPage();

  renderWatermark(doc);

  renderPDFHeader(
    doc,
    "Detailed Financial Comparison",
    reportId
  );

  renderSectionTitle(
    doc,
    "Ownership Comparison",
    58
  );

  doc.autoTable({

    startY: 65,

    theme: "grid",
    pageBreak: "auto",

    margin: {
  left: PDF.margin,
  right: PDF.margin
},
pageBreak: "auto",

    styles: {

      fontSize: 10,

      cellPadding: 5,
       lineColor: [229,231,235],

  lineWidth: 0.2
    },

    headStyles: {

      fillColor: [15,23,42],

      textColor: [255,255,255]
    },

    alternateRowStyles: {

      fillColor: [248,250,252]
    },

    head: [[

      "Metric",

      data.aName || "Property A",

      data.bName || "Property B"
    ]],

    body: [

      [
        "Total Cost",
        pdfCurrency(data.totalA || 0),
        pdfCurrency(data.totalB || 0)
      ],

      [
        "Price/Sq.ft",
        pdfCurrency(data.priceSqftA || 0),
        pdfCurrency(data.priceSqftB || 0)
      ],

      [
        "Monthly EMI",
        pdfCurrency(data.emiA || 0),
        pdfCurrency(data.emiB || 0)
      ],

      [
        "Rental Yield",
        `${data.yieldA || 0}%`,
        `${data.yieldB || 0}%`
      ],

      [
        "5Y Appreciation",
        pdfCurrency(data.futureValueA || 0),
        pdfCurrency(data.futureValueB || 0)
      ]
    ]
  });

  renderSectionTitle(
    doc,
    "Appreciation Projection",
    Math.min(
  doc.lastAutoTable.finalY + 16,
  158
)
  );

  renderChartImage(
    doc,
    "appreciationChart",
    Math.min(
  doc.lastAutoTable.finalY + 24,
  165
)
  );

  // PAGE 3
  doc.addPage();

  renderWatermark(doc);

  renderPDFHeader(
    doc,
    "AI Recommendation & Insights",
    reportId
  );

  renderInsightBox(
    doc,
    "AI Recommendation",
    data.recommendation ||
    "Property comparison generated based on ownership cost, appreciation and rental yield assumptions.",
    60
  );

  renderSummaryCard(
  doc,
  {
    title: "Recommendation",
    value: data.recommended || "Property A",
    subtitle: "AI-selected option"
  },
  18,
  120
);

renderSummaryCard(
  doc,
  {
    title: "Projected Savings",
    value: pdfCurrency(
      data.savings || 0
    ),
    subtitle: "Estimated advantage"
  },
  110,
  120
);

  renderInsightBox(
    doc,
    "Legal Disclaimer",
    "This report is AI-assisted and intended for informational purposes only. PropWise India does not provide legal, financial or investment advice.",
    170
  );

  // FOOTERS
  const totalPages =
    doc.getNumberOfPages();

  for (
    let i = 1;
    i <= totalPages;
    i++
  ) {

    doc.setPage(i);

    renderPDFFooter(
      doc,
      i
    );
  }

  // SAVE PDF
  doc.save(
    `propwise-comparison-report-${reportId}.pdf`
  );
}
