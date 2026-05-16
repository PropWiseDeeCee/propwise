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