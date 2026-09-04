// ===============================
// Overlay HTML Dynamically
// ===============================

function showAnalysisOverlay() {

  document.body.insertAdjacentHTML(

    "beforeend",

    `
      <div id="analysisOverlay">

        <div class="analysis-overlay-card">

          <div class="loading-spinner"></div>

          <h2>
            AI Reviewing Agreement
          </h2>

          <p id="analysisStatus">

            Extracting agreement text...

          </p>

        </div>

      </div>
    `
  );

  document.body.style.overflow =
    "hidden";

  startAnalysisMessages();
}

function hideAnalysisOverlay() {

  const overlay =
    document.getElementById(
      "analysisOverlay"
    );

  if (overlay) {

    overlay.remove();
  }

  document.body.style.overflow =
    "";
}

// ===============================
// Add Progress Messages
// ===============================

let analysisMessageTimer;

function startAnalysisMessages() {

  const messages = [

  "Extracting agreement text...",

  "Identifying property and buyer details...",

  "Reviewing financial obligations...",

  "Checking hidden charges and fees...",

  "Analyzing builder-friendly clauses...",

  "Reviewing possession timelines...",

  "Checking RERA references...",

  "Calculating risk score...",

  "Generating PropWise AI report..."
];

  let index = 0;

  analysisMessageTimer =
    setInterval(() => {

      const status =
        document.getElementById(
          "analysisStatus"
        );

      if (!status) return;

      index =
        (index + 1) %
        messages.length;

      status.textContent =
        messages[index];

    }, 2500);
}

function stopAnalysisMessages() {

  clearInterval(
    analysisMessageTimer
  );
}



// ==============================
// ANALYZER UI
// ==============================

window.analysisInProgress = false;

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

  const lastAnalysisTime =
  Number(
    localStorage.getItem(
      "lastAnalysisTime"
    )
  );

const cooldownMs =
  5 * 60 * 1000;

if (
  lastAnalysisTime &&
  Date.now() - lastAnalysisTime < cooldownMs
) {

  const remaining =
    cooldownMs -
    (Date.now() - lastAnalysisTime);

  const minutes =
    Math.floor(
      remaining / 60000
    );

  const seconds =
    Math.ceil(
      (remaining % 60000) / 1000
    );

  resultDiv.innerHTML = `

    <div class="analysis-cooldown-card">

      <div class="cooldown-icon">
        ⏳
      </div>

      <h3>
        Analysis Cooldown Active
      </h3>

      <p>
        To ensure fair usage and maintain service quality,
        please wait before running another agreement analysis.
      </p>

      <div class="cooldown-timer">

        ${minutes}m ${seconds}s

      </div>

    </div>

  `;

  resultDiv.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  return;
}

if (window.analysisInProgress) {

  resultDiv.innerHTML = `

    <div class="analysis-cooldown-card">

      <div class="cooldown-icon">
        🤖
      </div>

      <h3>
        Analysis In Progress
      </h3>

      <p>
        PropWise AI is currently reviewing your agreement.
        Please wait for the analysis to complete.
      </p>

    </div>

  `;

  return;
}

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

    window.analysisInProgress = true;

    showAnalysisOverlay();

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

    if (result.rate_limited) {

  resultDiv.innerHTML = `

    <div class="analysis-cooldown-card">

      <div class="cooldown-icon">
        ⏳
      </div>

      <h3>
        Server Cooldown Active
      </h3>

      <p>
        To ensure fair usage of AI resources,
        please wait before running another agreement analysis.
      </p>

      <div class="cooldown-timer">

        ${
          Math.floor(
            result.retry_after / 60
          )
        }m
        ${
          result.retry_after % 60
        }s

      </div>

    </div>

  `;

  stopAnalysisMessages();
  hideAnalysisOverlay();

  window.analysisInProgress = false;

  return;
}

    const supabase =
  window.getSupabaseClient?.();

let isLoggedIn = false;

try {

  if (supabase) {

    const {
      data: { user }
    } = await supabase.auth.getUser();

    isLoggedIn = !!user;
    console.log(
  "User logged in:",
  isLoggedIn
);
  }

} catch (e) {

  console.error(
    "Auth check failed:",
    e
  );
}

    const summary =
  result.summary ||
  "Agreement analyzed successfully.";

    const risk_score =
  result.risk_score ??
  calculateRiskScore(result);

const risk_level =
  result.risk_level ||
  getRiskLevel(risk_score);


const critical =
  result.critical ||
  result.critical_risks ||
  [];

const moderate =
  result.moderate ||
  result.moderate_risks ||
  [];

const recommendations =
  isLoggedIn
    ? (result.recommendations || [])
    : (
        result.recommendations?.length
          ? result.recommendations
          : (result.negotiation_points || [])
      );

    // ==============================
    // PREVIEW LIMITING
    // ==============================

    const displayCritical =
  isLoggedIn
    ? critical
    : critical.slice(0, 2);

const displayModerate =
  isLoggedIn
    ? moderate
    : moderate.slice(0, 2);

const displayRecommendations =
  isLoggedIn
    ? recommendations
    : recommendations.slice(0, 2);

    // ==============================
    // SAVE FOR PDF
    // ==============================

    window.latestAnalyzerResult = {

  ...result,

  risk_score,
  risk_level,
  critical,
  moderate,
  recommendations,
  findings: typeof buildAgreementFindings === "function"
    ? buildAgreementFindings(result)
    : [],
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
              ${risk_score}/100
            </h2>

            <div class="risk-pill ${risk_level
  .toLowerCase()
  .replace(/\s+/g, "-")}">
  ${risk_level}
</div>

          </div>

          <div class="analysis-summary-box">

            <strong>
              AI Agreement Review
            </strong>

            <p>
              ${summary}
            </p>

          </div>

        </div>

        <div class="analysis-grid">

          <div class="analysis-section-box critical-box">

            <h3>
              Critical Risks
            </h3>

            <ul>
              ${displayCritical
                .map(issue => `
                  <li>${issue}</li>
                `)
                .join("")}
            </ul>

          </div>

          ${
  displayModerate.length
    ? `
      <div class="analysis-section-box moderate-box">

        <h3>
          Moderate Risks
        </h3>

        <ul>
          ${displayModerate
            .map(issue => `
              <li>${issue}</li>
            `)
            .join("")}
        </ul>

      </div>
    `
    : ""
}

        ${
          isLoggedIn && result.financial_obligations?.length
            ? `
              <div class="analysis-section-box">

                <h3>
                  Financial Obligations
                </h3>

                <ul>
                  ${result.financial_obligations
                    .map(item => `<li>${item}</li>`)
                    .join("")}
                </ul>

              </div>
            `
            : ""
        }

        ${
          isLoggedIn && result.hidden_costs?.length
            ? `
              <div class="analysis-section-box">

                <h3>
                  Hidden Costs
                </h3>

                <ul>
                  ${result.hidden_costs
                    .map(item => `<li>${item}</li>`)
                    .join("")}
                </ul>

              </div>
            `
            : ""
        }

        ${
          isLoggedIn && result.rera_findings?.length
            ? `
              <div class="analysis-section-box">

                <h3>
                  RERA Findings
                </h3>

                <ul>
                  ${result.rera_findings
                    .map(item => `<li>${item}</li>`)
                    .join("")}
                </ul>

              </div>
            `
            : ""
        }

        ${
          isLoggedIn && result.timeline_findings?.length
            ? `
              <div class="analysis-section-box">

                <h3>
                  Timeline Findings
                </h3>

                <ul>
                  ${result.timeline_findings
                    .map(item => `<li>${item}</li>`)
                    .join("")}
                </ul>

              </div>
            `
            : ""
        }

        ${
          isLoggedIn && result.builder_friendly_clauses?.length
            ? `
              <div class="analysis-section-box">

                <h3>
                  Builder-Friendly Clauses
                </h3>

                <ul>
                  ${result.builder_friendly_clauses
                    .map(item => `<li>${item}</li>`)
                    .join("")}
                </ul>

              </div>
            `
            : ""
        }

        ${
          isLoggedIn && result.buyer_friendly_clauses?.length
            ? `
              <div class="analysis-section-box">

                <h3>
                  Buyer-Friendly Clauses
                </h3>

                <ul>
                  ${result.buyer_friendly_clauses
                    .map(item => `<li>${item}</li>`)
                    .join("")}
                </ul>

              </div>
            `
            : ""
        }

        ${
          isLoggedIn && result.project_structure_risks?.length
            ? `
              <div class="analysis-section-box">

                <h3>
                  Project Structure Risks
                </h3>

                <ul>
                  ${result.project_structure_risks
                    .map(item => `<li>${item}</li>`)
                    .join("")}
                </ul>

              </div>
            `
            : ""
        }

        ${
          isLoggedIn &&
          (
            result.positive_findings ||
            result.positive ||
            []
          ).length
            ? `
              <div class="analysis-section-box">

                <h3>
                  Positive Findings
                </h3>

                <ul>
                  ${
                    (
                      result.positive_findings ||
                      result.positive ||
                      []
                    )
                      .map(item => `<li>${item}</li>`)
                      .join("")
                  }
                </ul>

              </div>
            `
            : ""
        }

      </div>

      <div class="recommendation-box">

        <h3>
          Recommendations
        </h3>

        <ul>
          ${displayRecommendations
            .map(issue => `
              <li>${issue}</li>
            `)
            .join("")}
        </ul>

      </div>

      ${
        isLoggedIn &&
        result.negotiation_points?.length
          ? `
            <div class="recommendation-box">

              <h3>
                Negotiation Points
              </h3>

              <ul>
                ${result.negotiation_points
                  .map(item => `
                    <li>${item}</li>
                  `)
                  .join("")}
              </ul>

            </div>
          `
          : ""
      }

      ${
        isLoggedIn
          ? `
            <div class="premium-actions">

              <button
                class="primary-btn"
                onclick="downloadAgreementReport()"
              >
                Download PDF Report
              </button>

            </div>
          `
          : `
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
          `
      }

    </div>

`;

localStorage.setItem(
  "lastAnalysisTime",
  Date.now()
);

stopAnalysisMessages();
hideAnalysisOverlay();

window.analysisInProgress = false;


    if (reportActions) {

      reportActions.style.display =
        "flex";
    }

  } catch (error) {

    stopAnalysisMessages();
hideAnalysisOverlay();

    window.analysisInProgress = false;

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

async function saveAgreementReport(
  analysis,
  agreementText
) {
   console.log(
    "Saving agreement report...",
    analysis
  );

  try {

  const supabase =
  window.getSupabaseClient?.();

if (!supabase) {

  console.error(
    "Supabase client unavailable"
  );

  return;
}

const {
  data: { user }
} = await supabase.auth.getUser();

    if (!user) return;

    const reportName =
      `Agreement Report - ${
        new Date()
          .toLocaleDateString("en-IN")
      }`;

    const payload = {

      user_id:
        user.id,

      report_name:
        reportName,

      agreement_excerpt:
        agreementText?.substring(0, 500),

      risk_score:
        analysis.risk_score || 0,

      risk_level:
        analysis.risk_level || "Medium",

      result:
        analysis
    };

    const { error } =
      await supabase
        .from("agreement_reports")
        .insert(payload);

    if (error) {

      console.error(
        "Agreement save failed:",
        error
      );
    }

  } catch (err) {

    console.error(
      "Agreement persistence failed:",
      err
    );
  }
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

window.saveAgreementReport =
  saveAgreementReport;
