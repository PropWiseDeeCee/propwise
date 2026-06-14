// =========================================
// PROPWISE INDIA
// AGREEMENT REPORT GENERATOR
// =========================================

// =========================================
// DOWNLOAD AGREEMENT REPORT
// =========================================

async function downloadAgreementReport() {

  try {

    // =========================
    // GET ANALYSIS DATA
    // =========================

    // TRY MULTIPLE STORAGE KEYS
const storedReport =

  localStorage.getItem(
    "agreementAnalysis"
  )

  ||

  localStorage.getItem(
    "agreementReport"
  )

  ||

  sessionStorage.getItem(
    "agreementAnalysis"
  )

  ||

  sessionStorage.getItem(
    "agreementReport"
  );

if (!storedReport) {

  console.error(
    "Agreement analysis not found in storage"
  );

  alert(
    "Agreement analysis data not found. Please analyze the agreement again."
  );

  return;
}

const analysis =
  JSON.parse(storedReport);

    // =========================
    // REPORT ID
    // =========================

    const reportId =
      `AGR-${Date.now()}`;

    // =========================
// BUILD FINDINGS
// =========================

const findings = [

  ...(
    analysis.critical ||
    analysis.critical_risks ||
    []
  ).map(item => ({

    title: "Critical Risk",

    severity: "High",

    description: item

  })),

  ...(
    analysis.moderate ||
    analysis.moderate_risks ||
    []
  ).map(item => ({

    title: "Moderate Risk",

    severity: "Medium",

    description: item

  })),

  ...(analysis.hidden_costs || []).map(item => ({

    title: "Hidden Cost",

    severity: "Medium",

    description: item

  })),

  ...(analysis.financial_obligations || []).map(item => ({

    title: "Financial Obligation",

    severity: "Medium",

    description: item

  })),

  ...(analysis.rera_findings || []).map(item => ({

    title: "RERA Finding",

    severity: "Info",

    description: item

  })),

  ...(analysis.timeline_findings || []).map(item => ({

    title: "Timeline Finding",

    severity: "Medium",

    description: item

  })),

  ...(analysis.builder_friendly_clauses || []).map(item => ({

    title: "Builder-Friendly Clause",

    severity: "Medium",

    description: item

  })),

  ...(analysis.buyer_friendly_clauses || []).map(item => ({

    title: "Buyer-Friendly Clause",

    severity: "Positive",

    description: item

  })),

  ...(
    analysis.positive_findings ||
    analysis.positive ||
    []
  ).map(item => ({

    title: "Positive Finding",

    severity: "Positive",

    description: item

  })),

  ...(analysis.negotiation_points || []).map(item => ({

    title: "Negotiation Point",

    severity: "Action",

    description: item

  }))
];

    // =========================
    // BUILD PDF DATA
    // =========================

    const agreementReportData = {

      reportId,

      risk_score:
        analysis.risk_score || 50,

      risk_level:
        analysis.risk_level ||
        "Medium Risk",

      summary:
        analysis.summary ||
        "This agreement contains legal and financial clauses that should be carefully reviewed before signing.",

      findings
    };

    // =========================
    // VALIDATE PDF ENGINE
    // =========================

    if (
      typeof downloadAgreementPDF !==
      "function"
    ) {

      console.error(
        "downloadAgreementPDF() not found"
      );

      alert(
        "PDF engine failed to load."
      );

      return;
    }

    // =========================
    // GENERATE PDF
    // =========================

    await downloadAgreementPDF(
      agreementReportData
    );

  } catch (error) {

    console.error(
      "Agreement report generation failed:",
      error
    );

    alert(
      "Failed to generate agreement report."
    );
  }
}

// =========================================
// OPTIONAL REPORT DOWNLOAD BUTTON HELPER
// =========================================

function initAgreementReportDownload() {

  const button =
    document.getElementById(
      "downloadAgreementReportBtn"
    );

  if (!button) return;

  button.addEventListener(
    "click",
    downloadAgreementReport
  );
}

// =========================================
// AUTO INIT
// =========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initAgreementReportDownload();
  }
);
