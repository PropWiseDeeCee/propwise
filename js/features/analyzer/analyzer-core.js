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

  let score = 0;

  score += (result.critical?.length || 0) * 10;
  score += (result.moderate?.length || 0) * 5;

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
// NORMALIZE RESPONSE
// ==============================

function normalizeAnalysisResult(data = {}) {

  const risk_score =
    data.risk_score ??
    data.score ??
    0;

  const risk_level =
    data.risk_level ??
    data.riskLevel ??
    getRiskLevel(risk_score);

  return {

    summary:
      data.summary || "",

    critical:
  data.critical ||
  data.critical_risks ||
  [],

moderate:
  data.moderate ||
  data.moderate_risks ||
  [],

positive:
  data.positive ||
  data.positive_findings ||
  [],

financial_obligations:
  data.financial_obligations ||
  [],

hidden_costs:
  data.hidden_costs ||
  [],

builder_friendly_clauses:
  data.builder_friendly_clauses ||
  [],

buyer_friendly_clauses:
  data.buyer_friendly_clauses ||
  [],

rera_findings:
  data.rera_findings ||
  [],

timeline_findings:
  data.timeline_findings ||
  [],

negotiation_points:
  data.negotiation_points ||
  [],

recommendations:
  data.recommendations ||
  data.negotiation_points ||
  [],

    risk_score,

    risk_level
  };
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

      return normalizeAnalysisResult({

        critical:
          runChecks(input),

        moderate: [],

        positive: [],

        recommendations: [

          "Consult legal expert before signing.",

          "Verify builder approvals.",

          "Check payment schedule carefully."
        ],

        risk_score: 40,

        risk_level: "Medium"
      });
    }

    // ==============================
    // RESPONSE VALIDATION
    // ==============================

    if (response.status === 429) {

  const errorData =
    await response.json();

  const error =
    new Error(
      "RATE_LIMIT_EXCEEDED"
    );

  error.retry_after =
    errorData.retry_after || 300;

  throw error;
}

if (!response.ok) {

  throw new Error(
    `Analysis failed: ${response.status}`
  );
}

    const responseData =
      await response.json();

    console.log(
      "Analyzer API Response:",
      responseData
    );

    // ==============================
    // BACKEND ANALYSIS OBJECT
    // ==============================

    const data =
      responseData.analysis ||
      responseData;

    // ==============================
    // NORMALIZED RESPONSE
    // ==============================

    return normalizeAnalysisResult(data);

  } catch (err) {

     if (
  err.message ===
  "RATE_LIMIT_EXCEEDED"
) {

  const remaining =
    err.retry_after || 300;

  const minutes =
    Math.floor(
      remaining / 60
    );

  const seconds =
    remaining % 60;

  return {

    rate_limited: true,

    retry_after: remaining,

    summary:
      "Server cooldown active.",

    critical: [],

    moderate: [],

    recommendations: [

      `Please wait ${minutes}m ${seconds}s before starting another analysis.`
    ],

    risk_score: 0,

    risk_level: "Low"
  };
}


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

    return normalizeAnalysisResult({

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

      risk_score: 45,

      risk_level: "Medium"
    });
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

window.normalizeAnalysisResult =
  normalizeAnalysisResult;

window.analyzeAgreement =
  analyzeAgreement;