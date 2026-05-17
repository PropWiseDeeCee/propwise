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

// =========================================
// ANALYZER PDF EXPORT
// =========================================

async function downloadAnalysisPDF(data) {

  try {

    if (!data) {

      alert(
        "Analysis data missing."
      );

      return;
    }

    const {

      jsPDF

    } = window.jspdf;

    const doc =
      new jsPDF();

    // =====================================
    // HEADER
    // =====================================

    doc.setFontSize(22);

    doc.text(
      "PropWise India",
      20,
      22
    );

    doc.setFontSize(14);

    doc.text(
      "AI Agreement Analysis Report",
      20,
      32
    );

    // =====================================
    // SCORE
    // =====================================

    doc.setFontSize(18);

    doc.text(
      `Risk Score: ${data.score}/100`,
      20,
      50
    );

    doc.setFontSize(14);

    doc.text(
      `Risk Level: ${data.riskLevel}`,
      20,
      60
    );

    // =====================================
    // CRITICAL RISKS
    // =====================================

    let y = 80;

    doc.setFontSize(16);

    doc.text(
      "Critical Risks",
      20,
      y
    );

    y += 10;

    (data.critical || [])
      .forEach(item => {

        doc.setFontSize(12);

        doc.text(
          `• ${item}`,
          24,
          y
        );

        y += 8;
      });

    // =====================================
    // MODERATE RISKS
    // =====================================

    y += 10;

    doc.setFontSize(16);

    doc.text(
      "Moderate Risks",
      20,
      y
    );

    y += 10;

    (data.moderate || [])
      .forEach(item => {

        doc.setFontSize(12);

        doc.text(
          `• ${item}`,
          24,
          y
        );

        y += 8;
      });

    // =====================================
    // RECOMMENDATIONS
    // =====================================

    y += 10;

    doc.setFontSize(16);

    doc.text(
      "Recommendations",
      20,
      y
    );

    y += 10;

    (data.recommendations || [])
      .forEach(item => {

        doc.setFontSize(12);

        doc.text(
          `• ${item}`,
          24,
          y
        );

        y += 8;
      });

    // =====================================
    // FOOTER
    // =====================================

    y += 16;

    doc.setFontSize(10);

    doc.text(

      "Generated by PropWise India AI Agreement Analyzer",

      20,

      y
    );

    // =====================================
    // SAVE
    // =====================================

    doc.save(
      "propwise-analysis-report.pdf"
    );

  } catch (err) {

    console.error(
      "PDF generation failed:",
      err
    );

    alert(
      "Unable to generate PDF."
    );
  }
}

// GLOBAL EXPORT
window.downloadAnalysisPDF =
  downloadAnalysisPDF;