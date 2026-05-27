// ==============================
// ANALYZER UI
// ==============================

async function analyzeAgreementHandler() {

  const fileInput =
    document.getElementById("pdfFile");

  const textInput =
    document.getElementById("agreementText");

  const resultDiv =
    document.getElementById("analysisResult");

  const reportActions =
    document.getElementById("reportActions");

  if (!resultDiv) return;

  let file = null;
  let text = "";

  try {

    // ==============================
    // INPUT VALIDATION
    // ==============================

    if (fileInput?.files?.length) {

      file =
        fileInput.files[0];

      text =
        await extractTextFromFile(file);
    }

    else if (
      textInput?.value?.trim()
    ) {

      text =
        textInput.value.trim();
    }

    else {

      alert(
        "Please upload or paste agreement text"
      );

      return;
    }

    // ==============================
    // LOADING UI
    // ==============================

    resultDiv.innerHTML = `

      <div class="analysis-loading-card">

        <div class="loading-spinner"></div>

        <h3>
          AI Agreement Analysis Running...
        </h3>

        <p>
          Detecting legal risks, financial clauses,
          delay penalties and hidden issues.
        </p>

      </div>
    `;

    // ==============================
    // LOCAL CHECKS
    // ==============================

    const checks =
      runChecks(text);

    // ==============================
    // AI ANALYSIS
    // ==============================

    let result = null;

    if (file) {

      result =
        await analyzeAgreement(file);
    }

    else {

      result =
        await analyzeAgreement(text);
    }

    // ==============================
    // SAFE FALLBACKS
    // ==============================

    result = result || {};

    const score =
      result.score ??
      calculateRiskScore(result);

    const riskLevel =
      result.riskLevel ||
      getRiskLevel(score);

    const critical =
      result.critical || [];

    const moderate =
      result.moderate || [];

    const recommendations =
      result.recommendations || [];

    // ==============================
    // PREVIEW LIMITING
    // ==============================

    const previewCritical =
      critical.slice(0, 2);

    const previewModerate =
      moderate.slice(0, 2);

    const previewRecommendations =
      recommendations.slice(0, 2);

    // ==============================
    // SAVE FOR PDF
    // ==============================

    window.latestAnalyzerResult = {

      score,
      riskLevel,
      critical,
      moderate,
      recommendations,
      text
    };

    // ==============================
    // RENDER
    // ==============================

    resultDiv.innerHTML = `

      <div class="analysis-card modern-analysis-card">

        <div class="analysis-top">

          <div>

            <div class="risk-score-label">
              Risk Score
            </div>

            <h2 class="risk-score-value">
              ${score}/100
            </h2>

            <div class="risk-pill ${riskLevel.toLowerCase()}">
              ${riskLevel} Risk
            </div>

          </div>

          <div class="analysis-summary-box">

            <strong>
              AI Agreement Review
            </strong>

            <p>
              This agreement contains legal and financial risks.
              Full report includes clause analysis,
              recommendations and downloadable PDF.
            </p>

          </div>

        </div>

        <div class="analysis-grid">

          <div class="analysis-section-box critical-box">

            <h3>
              Critical Risks
            </h3>

            <ul>
              ${previewCritical
                .map(issue => `
                  <li>${issue}</li>
                `)
                .join("")}
            </ul>

          </div>

          <div class="analysis-section-box moderate-box">

            <h3>
              Moderate Risks
            </h3>

            <ul>
              ${previewModerate
                .map(issue => `
                  <li>${issue}</li>
                `)
                .join("")}
            </ul>

          </div>

        </div>

        <div class="recommendation-box">

          <h3>
            Recommendations
          </h3>

          <ul>
            ${previewRecommendations
              .map(issue => `
                <li>${issue}</li>
              `)
              .join("")}
          </ul>

        </div>

        <div class="premium-lock-box">

          <h3>
            Unlock Full AI Report
          </h3>

          <p>
            View complete clause analysis,
            legal risk explanations,
            financial warnings and export detailed PDF report.
          </p>

          <div class="premium-actions">

            <button
  class="primary-btn"
  onclick="unlockFullReport()"
>
  Login to View Full Report
</button>

<button
  class="secondary-btn"
  onclick="unlockFullReport()"
>
  Login to Download PDF
</button>

          </div>

        </div>

      </div>
    `;

    if (reportActions) {

      reportActions.style.display =
        "flex";
    }

  } catch (error) {

    console.error(error);

    resultDiv.innerHTML = `

      <div class="analysis-error-card">

        <h3>
          Analysis Failed
        </h3>

        <p>
          Unable to analyze agreement right now.
          Please try again.
        </p>

      </div>
    `;
  }
}

function loadSampleAgreement() {

  const input =
    document.getElementById("agreementText");

  if (!input) return;

  input.value = `
Builder shall not be liable for delay.
No penalty clause mentioned.
Parking allocation not defined.
Maintenance charges applicable.
Builder reserves unilateral rights.
`;
}

function unlockFullReport() {

  // SAVE CURRENT ANALYSIS
  localStorage.setItem(

    "pendingAnalysis",

    JSON.stringify(
      window.latestAnalyzerResult
    )
  );

  // SAVE REDIRECT PATH
  localStorage.setItem(
    "postLoginRedirect",
    "tools.html"
  );

  // REDIRECT
 window.location.href =
  "login.html";
}

function resetAgreementAnalyzer() {

  const fileInput =
    document.getElementById("pdfFile");

  const textInput =
    document.getElementById("agreementText");

  const resultDiv =
    document.getElementById(
      "analysisResult"
    );

  const reportActions =
    document.getElementById(
      "reportActions"
    );

  if (fileInput) {
    fileInput.value = "";
  }

  if (textInput) {
    textInput.value = "";
  }

  if (resultDiv) {
    resultDiv.innerHTML = "";
  }

  if (reportActions) {
    reportActions.style.display =
      "none";
  }

  localStorage.removeItem(
    "pendingAnalysis"
  );

  window.latestAnalyzerResult = null;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}



// ==============================
// GLOBAL EXPORTS
// ==============================

window.analyzeAgreementHandler =
  analyzeAgreementHandler;

window.loadSampleAgreement =
  loadSampleAgreement;

window.resetAgreementAnalyzer =
  resetAgreementAnalyzer;
