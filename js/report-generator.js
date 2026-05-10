window.downloadReport = async function () {

  const btn = document.querySelector(
    'button[onclick="downloadReport()"]'
  );

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Generating PDF...";
  }

  try {

    const data = JSON.parse(
      localStorage.getItem("agreementReport")
    );

    if (!data) {

      alert("No report found");

      if (btn) {
        btn.disabled = false;
        btn.innerText = "Download PDF Report";
      }

      return;
    }

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    // =========================
    // IMAGE LOADER
    // =========================

    const loadImage = (src) =>
      new Promise((resolve, reject) => {

        const img = new Image();

        img.crossOrigin = "Anonymous";

        img.onload = () => resolve(img);

        img.onerror = reject;

        img.src = src;

      });

    const {
      result,
      score,
      risk
    } = data;

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    const generatedDate =
      new Date().toLocaleString();

    const reportId =
      `PW-${Date.now()}`;

    let y = 20;

    // =========================
    // LOAD LOGO
    // =========================

    let logo = null;

    try {

      logo = await loadImage(
        `${window.location.origin}/assets/PropWiseLogo.png`
      );

    } catch (e) {

      console.warn(
        "Logo failed to load"
      );

    }

    // =========================
    // COLORS
    // =========================

    const COLORS = {
      primary: [17, 24, 39],
      gray: [107, 114, 128],
      border: [229, 231, 235],
      light: [249, 250, 251],
      success: [22, 163, 74],
      warning: [217, 119, 6],
      danger: [220, 38, 38]
    };

    const riskColor =
      risk === "High"
        ? COLORS.danger
        : risk === "Medium"
        ? COLORS.warning
        : COLORS.success;

    // =========================
    // WATERMARK
    // =========================

    const addWatermark = () => {

      doc.setTextColor(
        245,
        245,
        245
      );

      doc.setFontSize(28);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "PROPWISE INDIA",
        55,
        190,
        {
          angle: 45
        }
      );

      doc.setTextColor(
        ...COLORS.primary
      );
    };

    addWatermark();

    // =========================
    // HEADER
    // =========================

    doc.setFillColor(
      ...COLORS.primary
    );

    doc.rect(
      0,
      0,
      pageWidth,
      45,
      "F"
    );

    doc.setTextColor(
      255,
      255,
      255
    );

    // LOGO
    if (logo) {

      doc.addImage(
        logo,
        "PNG",
        18,
        10,
        60,
        20
      );

    } else {

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(26);

      doc.text(
        "PropWise India",
        20,
        22
      );

    }

    // SUBTITLE
    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(13);

    doc.text(
      "AI Agreement Risk Analysis Report",
      20,
      38
    );

    y = 60;

    // =========================
    // META CARD
    // =========================

    doc.setDrawColor(
      ...COLORS.border
    );

    doc.roundedRect(
      20,
      y,
      170,
      42,
      4,
      4
    );

    doc.setTextColor(
      ...COLORS.primary
    );

    doc.setFontSize(11);

    doc.text(
      `Generated: ${generatedDate}`,
      28,
      y + 12
    );

    doc.text(
      `Report ID: ${reportId}`,
      28,
      y + 22
    );

    doc.text(
      `Risk Score: ${score}/100`,
      110,
      y + 12
    );

    doc.text(
      `Risk Level: ${risk}`,
      110,
      y + 22
    );

    y += 60;

    // =========================
    // RISK BANNER
    // =========================

    doc.setFillColor(
      ...riskColor
    );

    doc.roundedRect(
      20,
      y,
      170,
      24,
      4,
      4,
      "F"
    );

    doc.setTextColor(
      255,
      255,
      255
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(16);

    doc.text(
      `${risk.toUpperCase()} RISK DETECTED`,
      28,
      y + 15
    );

    y += 38;

    // =========================
    // RISK METER
    // =========================

    doc.setTextColor(
      ...COLORS.primary
    );

    doc.setFontSize(13);

    doc.text(
      "Risk Meter",
      20,
      y
    );

    y += 10;

    doc.setFillColor(
      229,
      231,
      235
    );

    doc.roundedRect(
      20,
      y,
      150,
      10,
      3,
      3,
      "F"
    );

    doc.setFillColor(
      ...riskColor
    );

    doc.roundedRect(
      20,
      y,
      Math.min(score, 100) * 1.5,
      10,
      3,
      3,
      "F"
    );

    doc.setTextColor(
      ...COLORS.primary
    );

    doc.setFontSize(10);

    doc.text(
      `${score}/100`,
      176,
      y + 7
    );

    y += 24;

    // =========================
    // EXEC SUMMARY
    // =========================

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(15);

    doc.text(
      "Executive Summary",
      20,
      y
    );

    y += 10;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(11);

    const summary = `
This agreement presents ${risk.toLowerCase()}
legal and financial risk indicators.

${result.critical?.length || 0}
critical issues and
${result.moderate?.length || 0}
moderate concerns were identified during analysis.

Professional legal review is strongly recommended
before signing this agreement.
`;

    const summaryLines =
      doc.splitTextToSize(
        summary,
        165
      );

    doc.text(
      summaryLines,
      20,
      y
    );

    y +=
      summaryLines.length * 6 +
      12;

    // =========================
    // SECTION RENDERER
    // =========================

    const addSection = (
      title,
      items,
      color
    ) => {

      if (
        !items ||
        !items.length
      ) return;

      if (y > 240) {

        doc.addPage();

        addWatermark();

        y = 20;
      }

      doc.setTextColor(
        ...color
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(15);

      doc.text(
        title,
        20,
        y
      );

      y += 12;

      items.forEach(issue => {

        const lines =
          doc.splitTextToSize(
            issue,
            145
          );

        const height =
          lines.length * 6 + 22;

        if (y + height > 280) {

          doc.addPage();

          addWatermark();

          y = 20;
        }

        // CARD
        doc.setDrawColor(
          ...COLORS.border
        );

        doc.roundedRect(
          20,
          y,
          170,
          height,
          3,
          3
        );

        // BADGE
        doc.setFillColor(
          ...color
        );

        doc.roundedRect(
          28,
          y + 7,
          22,
          8,
          2,
          2,
          "F"
        );

        doc.setTextColor(
          255,
          255,
          255
        );

        doc.setFontSize(8);

        doc.text(
          title.includes("Critical")
            ? "HIGH"
            : title.includes("Moderate")
            ? "MED"
            : "INFO",
          32,
          y + 12
        );

        // TITLE
        doc.setTextColor(
          ...COLORS.primary
        );

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(11);

        doc.text(
          "Detected Risk",
          58,
          y + 12
        );

        // ISSUE TEXT
        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.text(
          lines,
          58,
          y + 20
        );

        y += height + 6;

      });

    };

    // =========================
    // SECTIONS
    // =========================

    addSection(
      "Critical Issues",
      result.critical,
      COLORS.danger
    );

    addSection(
      "Moderate Issues",
      result.moderate,
      COLORS.warning
    );

    addSection(
      "Suggestions",
      result.info,
      COLORS.success
    );

    // =========================
    // RECOMMENDATIONS
    // =========================

    if (y > 220) {

      doc.addPage();

      addWatermark();

      y = 20;
    }

    doc.setTextColor(
      ...COLORS.primary
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(15);

    doc.text(
      "Recommended Actions",
      20,
      y
    );

    y += 12;

    const recommendations = [
      "Consult a qualified legal professional before signing.",
      "Verify possession timelines and compensation clauses.",
      "Review maintenance and parking ownership terms.",
      "Ensure all payment obligations are clearly documented."
    ];

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(11);

    recommendations.forEach(r => {

      const lines =
        doc.splitTextToSize(
          `• ${r}`,
          160
        );

      doc.text(
        lines,
        25,
        y
      );

      y +=
        lines.length * 6 + 5;

    });

    // =========================
    // DISCLAIMER
    // =========================

    if (y > 240) {

      doc.addPage();

      addWatermark();

      y = 20;
    }

    y += 10;

    doc.setTextColor(
      ...COLORS.primary
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(14);

    doc.text(
      "Disclaimer",
      20,
      y
    );

    y += 10;

    doc.setTextColor(
      ...COLORS.gray
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(10);

    const disclaimer =
`
This report is AI-generated and intended
for informational purposes only.

PropWise India does not provide legal advice.
Please consult a qualified legal professional
before making property decisions.

AI analysis may occasionally miss context,
legal nuances, or agreement-specific obligations.
`;

    const disclaimerLines =
      doc.splitTextToSize(
        disclaimer,
        165
      );

    doc.text(
      disclaimerLines,
      20,
      y
    );

    // =========================
    // FOOTERS
    // =========================

    const totalPages =
      doc.internal.getNumberOfPages();

    for (
      let i = 1;
      i <= totalPages;
      i++
    ) {

      doc.setPage(i);

      // PAGE HEADER
      doc.setFontSize(9);

      doc.setTextColor(
        180,
        180,
        180
      );

      doc.text(
        "Agreement Risk Analysis Report",
        20,
        10
      );

      // FOOTER
      const footerY =
        pageHeight - 12;

      doc.setDrawColor(
        ...COLORS.border
      );

      doc.line(
        20,
        footerY - 5,
        pageWidth - 20,
        footerY - 5
      );

      doc.setFontSize(9);

      doc.setTextColor(
        ...COLORS.gray
      );

      doc.text(
        "Generated by PropWise India",
        20,
        footerY
      );

      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - 45,
        footerY
      );

    }

    // =========================
    // SAVE
    // =========================

    doc.save(
      `PropWise-Agreement-Risk-Report-${reportId}.pdf`
    );

  } catch (err) {

    console.error(err);

    alert(
      "Failed to generate PDF report"
    );

  } finally {

    if (btn) {

      btn.disabled = false;

      btn.innerText =
        "Download PDF Report";
    }

  }

};