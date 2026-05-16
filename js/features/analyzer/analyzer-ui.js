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

  if (!resultDiv) return;

  let file = null;
  let text = "";

  try {

    // ==============================
    // FILE MODE
    // ==============================

    if (fileInput?.files?.length) {

      file =
        fileInput.files[0];

      // Local extraction for checks
      text =
        await extractTextFromFile(file);
    }

    // ==============================
    // TEXT MODE
    // ==============================

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
    // LOADING
    // ==============================

    resultDiv.innerHTML = `
      <div class="loading">
        Analyzing agreement...
      </div>
    `;

    // ==============================
    // LOCAL CHECKS
    // ==============================

    const checks =
      runChecks(text);

    // ==============================
    // BACKEND AI ANALYSIS
    // ==============================

    let result = null;

    // File upload mode
    if (file) {

      result =
        await analyzeAgreement(file);
    }

    // Text mode fallback
    else {

      result = {
        critical: [],
        moderate: checks,
        positive: []
      };
    }

    // ==============================
    // SCORING
    // ==============================

    const score =
      calculateRiskScore(result);

    const riskLevel =
      getRiskLevel(score);

    // ==============================
    // RENDER
    // ==============================

    resultDiv.innerHTML = `

      <div class="analysis-card">

        <h2>
          Risk Score:
          ${score}/100
        </h2>

        <p>
          Risk Level:
          ${riskLevel}
        </p>

        <hr>

        <h3>Local Checks</h3>

        <ul>
          ${
            checks.map(issue => `
              <li>${issue}</li>
            `).join("")
          }
        </ul>

      </div>
    `;

  } catch (error) {

    console.error(error);

    resultDiv.innerHTML = `
      <div class="error">
        Failed to analyze agreement
      </div>
    `;
  }
}


// ==============================
// GLOBAL EXPORT
// ==============================

window.analyzeAgreementHandler =
  analyzeAgreementHandler;