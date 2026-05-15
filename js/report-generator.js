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

      ...(analysis.high_risks || [])
        .map(item => ({

          title:
            item.title ||
            "High Risk",

          severity:
            "High",

          description:
            item.description || "-"
        })),

      ...(analysis.medium_risks || [])
        .map(item => ({

          title:
            item.title ||
            "Medium Risk",

          severity:
            "Medium",

          description:
            item.description || "-"
        })),

      ...(analysis.low_risks || [])
        .map(item => ({

          title:
            item.title ||
            "Low Risk",

          severity:
            "Low",

          description:
            item.description || "-"
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