// =========================================
// PROPWISE INDIA
// AGREEMENT REPORT GENERATOR
// =========================================

// =========================================
// REPORT DATA
// =========================================

function buildAgreementFindings(analysis = {}) {

  return [

    ...(analysis.critical || analysis.critical_risks || []).map(item => ({
      title: "Critical Risk",
      severity: "High",
      description: item
    })),

    ...(analysis.moderate || analysis.moderate_risks || []).map(item => ({
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

    ...(analysis.project_structure_risks || []).map(item => ({
      title: "Project Structure Risk",
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

    ...(analysis.positive || analysis.positive_findings || []).map(item => ({
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
}

function buildAgreementReportData(analysis = {}) {

  return {
    reportId: `AGR-${Date.now()}`,
    risk_score: analysis.risk_score ?? 0,
    risk_level: analysis.risk_level || "Medium Risk",
    summary: analysis.summary || "This agreement contains legal and financial clauses that should be carefully reviewed before signing.",
    findings: buildAgreementFindings(analysis)
  };
}

// =========================================
// DOWNLOAD AGREEMENT REPORT
// =========================================

async function downloadAgreementReport() {

  try {

    // =========================
    // GET ANALYSIS DATA
    // =========================

    // TRY MULTIPLE STORAGE KEYS
const analysis =
  window.latestAnalyzerResult;

if (!analysis) {

  alert(
    "Agreement analysis data not found. Please analyze the agreement again."
  );

  return;
}

    // =========================
    // REPORT ID
    // =========================

    const reportId =
      `AGR-${Date.now()}`;

    const agreementReportData = buildAgreementReportData(analysis);
    agreementReportData.reportId = reportId;
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
