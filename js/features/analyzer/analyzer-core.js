// ==============================
// FILE PARSING
// ==============================

async function extractTextFromPDF(file) {

  const buffer =
    await file.arrayBuffer();

  const pdf =
    await pdfjsLib
      .getDocument({ data: buffer })
      .promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {

    const page =
      await pdf.getPage(i);

    const content =
      await page.getTextContent();

    text += content.items
      .map(i => i.str)
      .join(" ");
  }

  return text;
}


async function extractTextFromFile(file) {

  const type =
    file.name
      .split(".")
      .pop()
      .toLowerCase();

  if (type === "pdf") {
    return extractTextFromPDF(file);
  }

  if (type === "txt") {
    return file.text();
  }

  if (type === "docx") {

    const buffer =
      await file.arrayBuffer();

    const result =
      await mammoth.extractRawText({
        arrayBuffer: buffer
      });

    return result.value;
  }

  return "";
}


// ==============================
// ANALYSIS HELPERS
// ==============================

function calculateRiskScore(result) {

  const critical =
    (result.critical || []).length;

  const moderate =
    (result.moderate || []).length;

  let score =
    (critical * 20) +
    (moderate * 10);

  return Math.min(score, 100);
}


function getRiskLevel(score) {

  if (score >= 70) {
    return "High";
  }

  if (score >= 40) {
    return "Medium";
  }

  return "Low";
}


// ==============================
// BASIC CHECKS
// ==============================

function runChecks(text) {

  const lower =
    text.toLowerCase();

  const issues = [];

  if (!lower.includes("rera")) {
    issues.push(
      "RERA registration details missing"
    );
  }

  if (
    lower.includes("delay") &&
    !lower.includes("penalty")
  ) {
    issues.push(
      "Delay penalty clause missing"
    );
  }

  if (!lower.includes("parking")) {
    issues.push(
      "Parking clause missing"
    );
  }

  return issues;
}

// ==============================
// MAIN ANALYZER
// ==============================

async function analyzeAgreement(input) {

  try {

    let response;

    // ==============================
    // FILE MODE
    // ==============================

    if (input instanceof File) {

      const formData =
        new FormData();

      formData.append(
        "file",
        input
      );

      response =
        await fetch(

          `${window.PROPWISE_CONFIG.API.BASE_URL}/analyze`,

          {

            method: "POST",

            body: formData
          }
        );
    }

    // ==============================
    // TEXT MODE
    // ==============================

    else {

      return {

        critical:
          runChecks(input),

        moderate: [],

        positive: [],

        recommendations: [

          "Consult legal expert before signing.",

          "Verify builder approvals.",

          "Check payment schedule carefully."
        ],

        score: 40,

        riskLevel: "Medium"
      };
    }

    // ==============================
    // RESPONSE VALIDATION
    // ==============================

    if (!response.ok) {

      throw new Error(
        `Analysis failed: ${response.status}`
      );
    }

    const data =
      await response.json();

    return {

      summary:
        data.summary || "",

      critical:
        data.critical || [],

      moderate:
        data.moderate || [],

      positive:
        data.positive || [],

      recommendations:
        data.recommendations || [],

      score:
        data.score || 0,

      riskLevel:
        data.risk_level || "Medium"
    };

  } catch (err) {

    console.error(
      "Analyzer API failed:",
      err
    );

    // ==============================
    // SAFE FALLBACK
    // ==============================

    const fallbackText =
      typeof input === "string"
        ? input
        : "";

    const issues =
      runChecks(fallbackText);

    return {

      summary:
        "Basic local analysis completed.",

      critical:
        issues,

      moderate: [],

      positive: [],

      recommendations: [

        "Consult legal expert before signing.",

        "Verify RERA registration.",

        "Review hidden charges carefully."
      ],

      score: 45,

      riskLevel: "Medium"
    };
  }
}

// ==============================
// GLOBAL EXPORTS
// ==============================

window.extractTextFromPDF =
  extractTextFromPDF;

window.extractTextFromFile =
  extractTextFromFile;

window.calculateRiskScore =
  calculateRiskScore;

window.getRiskLevel =
  getRiskLevel;

window.runChecks =
  runChecks;