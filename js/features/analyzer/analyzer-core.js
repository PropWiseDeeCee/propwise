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
// OPTIMIZED PATTERN-BASED CHECKS
// ==============================

function runChecks(text) {

  const lower = text.toLowerCase();
  const findings = { critical: [], moderate: [], positive: [] };
  
  // Patterns for efficient detection
  const patterns = {
    rera: /\brera\b/i,
    parking: /\bparking|car\s*space|garage|vehicles?\s*allot|car\s*park/i,
    delayPenalty: /delay.*penalty|penalty.*delay|possession.*delay/i,
    forceClause: /force\s*majeure|act\s*of\s*god|unforeseeable/i,
    defect: /defect|workmanship|quality\s*standard|structural/i,
    maintenance: /maintenance\s*charges?|common\s*area|amc|building\s*fund/i,
    registration: /registration\s*cost|stamp\s*duty|transfer|legal\s*fee|registration\s*fee/i,
    payment: /payment\s*schedule|installment|down\s*payment|booking|amount|cost/i,
    warranty: /warranty\s*period|defect\s*liability|defect\s*liability\s*period/i,
    possession: /possession|handover|delivery|completion/i,
    builder: /builder|developer|contractor|promoter/i,
    buyer: /buyer|purchaser|owner|applicant/i,
    cancellation: /cancellation|terminate|cancel|forfeiture|forfeit/i,
    escalation: /escalation|price\s*variation|cost\s*variation|increase/i
  };

  // Check RERA & Registration
  const hasRERA = patterns.rera.test(lower);
  const hasParking = patterns.parking.test(lower);
  const hasRegistration = patterns.registration.test(lower);

  if (!hasRERA) {
    findings.critical.push("RERA registration details missing");
  } else {
    findings.positive.push("RERA compliance mentioned");
  }

  if (!hasParking) {
    findings.critical.push("Parking/car space clause undefined");
  } else {
    findings.positive.push("Parking allocation specified");
  }

  if (!hasRegistration) {
    findings.moderate.push("Registration & legal fee clarity absent");
  }

  // Timeline & Possession Risks
  if (patterns.possession.test(lower) && !patterns.delayPenalty.test(lower)) {
    findings.critical.push("Possession delay penalties not mentioned");
  }
  
  if (!patterns.forceClause.test(lower) && patterns.possession.test(lower)) {
    findings.moderate.push("Force majeure clause missing");
  }

  // Financial Obligations
  if (patterns.maintenance.test(lower)) {
    findings.positive.push("Maintenance charges outlined");
  } else if (patterns.payment.test(lower)) {
    findings.moderate.push("Ongoing cost structure unclear");
  }

  if (patterns.escalation.test(lower)) {
    findings.moderate.push("Price escalation clause present - review terms");
  }

  // Quality & Defects
  if (patterns.warranty.test(lower)) {
    findings.positive.push("Defect liability period defined");
  } else if (patterns.defect.test(lower)) {
    findings.moderate.push("Defect responsibility not clearly defined");
  }

  // Cancellation & Termination
  if (patterns.cancellation.test(lower)) {
    findings.positive.push("Termination clauses specified");
  }

  // Builder-Favorable Patterns
  if (/builder.*not\s*liable|builder.*not\s*responsible|exemption.*builder/i.test(lower)) {
    findings.moderate.push("Builder liability heavily restricted - buyer risk");
  }

  if (/time\s*not\s*essence|extension.*time|force\s*majeure.*possession/i.test(lower)) {
    findings.moderate.push("Possession timelines have broad escape clauses");
  }

  return findings;
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

project_structure_risks:
  data.project_structure_risks ||
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

      const findings = runChecks(input);

      return normalizeAnalysisResult({

        critical: findings.critical,
        moderate: findings.moderate,
        positive: findings.positive,

        recommendations: [
          findings.critical.length > 0 ? "Address critical gaps before signing" : "Review moderate clauses carefully",
          findings.moderate.length > 0 ? "Negotiate unfavorable terms" : "Verify all terms with legal counsel"
        ],

        risk_score: (findings.critical.length * 10) + (findings.moderate.length * 5),

        risk_level: findings.critical.length > 3 ? "High" : findings.critical.length > 0 ? "Medium" : "Low"
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

    const findings = runChecks(fallbackText);

    return normalizeAnalysisResult({

      summary:
        "Basic pattern analysis completed. For comprehensive AI review, upload via web interface.",

      critical: findings.critical,
      moderate: findings.moderate,
      positive: findings.positive,

      recommendations: [
        "Consult legal expert before signing",
        "Review all clauses with qualified attorney"
      ],

      risk_score: (findings.critical.length * 10) + (findings.moderate.length * 5),

      risk_level: findings.critical.length > 3 ? "High" : findings.critical.length > 0 ? "Medium" : "Low"
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