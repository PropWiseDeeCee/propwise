// ==============================
// SUPABASE INIT
// ==============================

let supabaseClient = null;

function initSupabase() {

  if (!window.supabase) {
    console.error("Supabase SDK not loaded");
    return null;
  }

  if (!supabaseClient) {

    supabaseClient =
      window.supabase.createClient(
        window.PROPWISE_CONFIG.SUPABASE.URL,
        window.PROPWISE_CONFIG.SUPABASE.ANON_KEY
      );

    console.log("Supabase initialized");
  }

  return supabaseClient;
}



// ==============================
// HELPERS
// ==============================

function appPath(path) {
  return window.location.pathname.includes("/guides/") ? `../${path}` : path;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getInitial(value) {
  return String(value || "U").trim().charAt(0).toUpperCase() || "U";
}

function getVisitorId() {
  const key = "propwiseVisitorId";
  let id = localStorage.getItem(key);

  if (!id) {
    id = window.crypto?.randomUUID?.() || `visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(key, id);
  }

  return id;
}

function getDeviceType() {
  const width = window.innerWidth || 0;
  if (width <= 640) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
}

function getBrowserName() {
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
  if (ua.includes("Firefox/")) return "Firefox";
  return "Other";
}

function toggleUserMenu(event) {
  event.preventDefault();
  event.stopPropagation();

  const menu = document.getElementById("user-menu");
  if (!menu) return;

  const isOpen = menu.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
}

document.addEventListener("click", () => {
  const menu = document.getElementById("user-menu");
  menu?.classList.remove("open");
  menu?.querySelector(".user-menu-button")?.setAttribute("aria-expanded", "false");
});

// ==============================
// ANALYTICS
// ==============================

async function trackPageView(user = null) {
  if (!supabaseClient) return;

  try {
    await supabaseClient
      .from("analytics_events")
      .insert([{
        user_id: user?.id || null,
        email: user?.email || null,
        visitor_id: getVisitorId(),
        event_type: "page_view",
        page_path: window.location.pathname,
        page_title: document.title,
        referrer: document.referrer || null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
        locale: navigator.language || null,
        device_type: getDeviceType(),
        browser: getBrowserName(),
        user_agent: navigator.userAgent
      }]);
  } catch (error) {
    console.warn("Analytics tracking skipped", error);
  }
}


// ==============================
// LOGIN FLOW
// ==============================

async function handleLogin() {

  const btn =
    document.getElementById("loginBtn");

  const err =
    document.getElementById("authError");

  if (btn) {

    btn.disabled = true;
    btn.innerText = "Logging in...";
  }

  if (err) {
    err.innerHTML = "";
  }

  try {

    await signIn();

    const hasReport =
      localStorage.getItem(
        "agreementReport"
      );

    window.location.href =
      hasReport
        ? appPath("report.html")
        : appPath("dashboard.html");

  } catch (e) {

    console.error(e);

    if (err) {

      err.innerHTML = `

        <span style="color:#dc2626;">

          ${escapeHtml(e.message)}

        </span>
      `;
    }

  } finally {

    if (btn) {

      btn.disabled = false;

      btn.innerText = "Login";
    }
  }
}

// ==============================
// NAVBAR + INIT
// ==============================

async function initPage(protectedPage = false) {
   await loadSharedComponents();
  initSupabase();

  const user = await getUser();

  if (protectedPage && !user) {
    window.location.href = appPath("login.html");
    return;
  }

  trackPageView(user);

  const nav = document.getElementById("nav-right");

  if (!nav) return;

  // NOT LOGGED IN
  if (!user) {
    nav.innerHTML = `
      <a class="login-link" href="${appPath("login.html")}">Login</a>
    `;
    return;
  }

  // GET PROFILE
  const profile = await getProfile();

  const isAdmin = profile?.role === "super_admin";
  const rawDisplayName = profile?.full_name || user.email;
  const displayName = escapeHtml(rawDisplayName);
  const email = escapeHtml(user.email);
  const initial = escapeHtml(getInitial(rawDisplayName));

  nav.innerHTML = `
    <div class="user-menu" id="user-menu">
      <button class="user-menu-button" onclick="toggleUserMenu(event)" aria-label="Account menu" aria-expanded="false">
        ${initial}
      </button>

      <div class="user-menu-panel">
        <div class="user-menu-header">
          <strong>${displayName}</strong>
          <span>${email}</span>
        </div>

        <a href="${appPath("dashboard.html")}">Dashboard</a>
        <a href="${appPath("profile.html")}">Profile</a>

        ${
          isAdmin
            ? `<a href="${appPath("admin.html")}">Admin Panel</a>`
            : ""
        }

        <button type="button" onclick="logout()">Logout</button>
      </div>
    </div>
  `;
}

// ==============================
// NAVBAR DROPDOWN
// ==============================

function initNavbarDropdown() {

  const dropdownBtn =
    document.querySelector(".dropdown-btn");

  const dropdownMenu =
    document.querySelector(".dropdown-menu");

  const dropdown =
    document.querySelector(".dropdown");

  if (
    !dropdownBtn ||
    !dropdownMenu ||
    !dropdown
  ) {
    return;
  }

  // TOGGLE MENU

  dropdownBtn.addEventListener(
    "click",
    function(event) {

      event.preventDefault();
      event.stopPropagation();

      dropdownMenu.classList.toggle("show");
    }
  );

  // CLOSE ON OUTSIDE CLICK

  document.addEventListener(
    "click",
    function(event) {

      if (
        !dropdown.contains(event.target)
      ) {

        dropdownMenu.classList.remove("show");
      }
    }
  );

}

// ==============================
// FILE PARSING
// ==============================

async function extractTextFromPDF(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    text += content.items.map(i => i.str).join(" ");
  }

  return text;
}

async function extractTextFromFile(file) {
  const type = file.name.split(".").pop().toLowerCase();

  if (type === "pdf") return extractTextFromPDF(file);
  if (type === "txt") return file.text();

  if (type === "docx") {
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  }

  return "";
}

// ==============================
// ANALYZER ENGINE
// ==============================

function runChecks(text) {
  const t = text.toLowerCase();

  return {
    critical: [
      !t.includes("possession") && "Possession clause missing",
      !t.includes("penalty") && "No delay penalty clause",
      t.includes("sole discretion") && "One-sided clause",
      t.includes("not be liable") && "Builder liability removed"
    ].filter(Boolean),

    moderate: [
      !t.includes("parking") && "Parking not defined",
      !t.includes("maintenance") && "Maintenance unclear",
      t.includes("reasonable time") && "Vague timeline"
    ].filter(Boolean),

    info: [
      !t.includes("gst") && "GST not mentioned"
    ].filter(Boolean)
  };
}


function calculateRiskScore(result) {

  return (
    result.critical.length * 25 +
    result.moderate.length * 12 +
    result.info.length * 5
  );
}

function getRiskLevel(score) {

  if (score >= 70) return "High";

  if (score >= 40) return "Medium";

  return "Low";
}

async function analyzeAgreementHandler() {

  const loading = document.getElementById("analysisLoading");
  const resultDiv = document.getElementById("analysisResult");
  const btn = document.getElementById("analyzeBtn");

  // SHOW LOADING
  if (loading) {

  loading.style.display = "block";

  loading.innerHTML = `

    <div style="text-align:center; padding:20px;">

      <div class="loader"></div>

      <div style="margin-top:15px;">
        AI is analyzing your agreement...
      </div>

      <div style="
        margin-top:8px;
        font-size:13px;
        color:#6b7280;
      ">
        First request may take up to 1 minute
      </div>

    </div>
  `;
}

  // DISABLE BUTTON
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Starting AI analysis...";
  }

  try {

    let text = document.getElementById("agreementText").value.trim();

    // FILE INPUT
    const fileInput = document.getElementById("pdfFile");
    const file = fileInput?.files?.[0];

    // PARSE FILE
    if (file) {

      text = await extractTextFromFile(file);

      if (!text || !text.trim()) {

        alert("Unsupported or unreadable file");

        throw new Error("Unsupported or unreadable file");
      }
    }

    // EMPTY TEXT
    if (!text || text.length < 30) {

      alert("Please upload or paste a valid agreement");

      throw new Error("Please upload or paste a valid agreement");
    }

    // ANALYSIS
   
    const result = await analyzeAgreement(text, file);

const score =
  result.aiScore || calculateRiskScore(result);

const risk =
  result.aiRisk || getRiskLevel(score);
  window.latestAgreementReport = {

  risk_score: score,

  risk_level: risk,

  high_risks:
    (result.critical || []).map(item => ({
      title: item,
      description: item
    })),

  medium_risks:
    (result.moderate || []).map(item => ({
      title: item,
      description: item
    })),

  info:
    result.info || []
}; 

    // RENDER
    await renderPreview(result, score, risk);

  }

  catch (error) {

    console.error(error);

    resultDiv.innerHTML = `
      <div class="analysis-card">

        <div class="risk-box risk-high">
          Failed to analyze agreement.
        </div>

        <p style="margin-top:10px; color:#6b7280;">
          Please try another file or paste agreement text manually.
        </p>

      </div>
    `;
  }

  finally {

    // HIDE LOADING
    if (loading) {
      loading.style.display = "none";
    }

    // ENABLE BUTTON
    if (btn) {
      btn.disabled = false;
      btn.innerText = "Analyze Agreement Risks";
    }
  }
}


// ==============================
// PREVIEW
// ==============================

async function renderPreview(result, score, risk) {

  const el = document.getElementById("analysisResult");

  const user = await getUser();

  const allIssues = [
  ...(result.critical || []),
  ...(result.moderate || []),
  ...(result.info || [])
];

  // PREVIEW LIMIT
  const preview = allIssues.slice(0, 3);

  const hidden = Math.max(allIssues.length - preview.length, 0);
  localStorage.setItem(
  "agreementReport",
  JSON.stringify({
    result,
    score,
    risk,
    color:
      risk === "High"
        ? "#dc2626"
        : risk === "Medium"
        ? "#d97706"
        : "#16a34a"
  })
);


  // EXPLAIN ISSUES
  const explainIssue = (issue) => {

    const t = issue.toLowerCase();

    if (t.includes("penalty")) {
      return `
        The agreement may not clearly define
        compensation if project possession is delayed.
      `;
    }

    if (t.includes("parking")) {
      return `
        Parking ownership or allocation terms
        may be vague or undefined.
      `;
    }

    if (t.includes("liability")) {
      return `
        Certain clauses may heavily favor
        the builder by limiting responsibility.
      `;
    }

    if (t.includes("maintenance")) {
      return `
        Maintenance responsibilities or charges
        may not be clearly explained.
      `;
    }

    if (t.includes("gst")) {
      return `
        Tax responsibilities and GST-related costs
        may require additional clarification.
      `;
    }

    if (t.includes("timeline")) {
      return `
        Some timelines may be vaguely defined,
        creating ambiguity around delivery obligations.
      `;
    }

    return `
      This clause or condition may require
      additional legal and financial review.
    `;
  };

  // SCORE EXPLANATION
  const riskMeaning = () => {

    if (score >= 75) {
      return `
        Multiple high-risk or unclear clauses
        were detected in this agreement.
      `;
    }

    if (score >= 45) {
      return `
        Some important agreement areas
        may require closer review.
      `;
    }

    return `
      No major high-risk patterns were detected,
      but professional review is still recommended.
    `;
  };

  // REVIEW AREAS
  const recommendations = [
    "Review possession timelines carefully",
    "Verify builder penalty obligations",
    "Check parking ownership clarity",
    "Confirm maintenance and GST terms"
  ];
  // SAVE REPORT TO DATABASE
if (user && supabaseClient) {

  try {

    const payload = {
  user_id: user.id,
  risk_level: risk,
  risk_score: score,
  result,
  agreement_excerpt: allIssues.slice(0, 5).join(", ")
};

await supabaseClient
  .from("agreement_reports")
  .insert([payload]);

  } catch (err) {

    console.error("Failed to save report", err);

  }
}

  el.innerHTML = `

    <!-- SUMMARY -->
    <div class="analysis-card">

      <div class="risk-box risk-${risk.toLowerCase()}">

        <strong>
          ${escapeHtml(risk)} Risk Detected
        </strong>

        <div style="margin-top:8px; font-size:14px; color:#6b7280; line-height:1.7;">

          Agreement Risk Score:
          <strong>${escapeHtml(score)}</strong>

          <br><br>

          ${riskMeaning()}

          <br><br>

          Higher scores generally indicate
          more agreement risks,
          missing protections,
          or financial ambiguity.

        </div>

      </div>

      <!-- FINDINGS -->
      <h3 style="margin-top:24px;">
        Key Findings
      </h3>

      <div style="margin-top:18px;">

        ${preview.map(issue => `

          <div class="finding-card">

            <div class="finding-title">
              ⚠ ${escapeHtml(issue)}
            </div>

            <div class="finding-explain">
              ${escapeHtml(explainIssue(issue))}
            </div>

          </div>

        `).join("")}

      </div>

      ${
        hidden > 0
          ? `
            <div class="hidden-warning">
              + ${hidden} additional issues detected
            </div>
          `
          : ""
      }

      <!-- REVIEW -->
      <div class="review-section">

        <h3>
          Recommended Review Areas
        </h3>

        <ul>

          ${recommendations.map(item => `
            <li>${escapeHtml(item)}</li>
          `).join("")}

        </ul>

      </div>

    </div>

    <!-- PAYWALL -->
    <div class="paywall">

      <h3 style="margin-bottom:10px;">
        Unlock Full Agreement Report
      </h3>

      <p style="
        color:#6b7280;
        line-height:1.7;
        margin-bottom:20px;
      ">

        View detailed agreement findings,
        additional detected risks,
        and structured review insights.

      </p>

      ${
        !user
          ? `
            <button onclick="location.href='${appPath("login.html")}'">
              Login to Unlock Full Report
            </button>
          `
          : `
            <button onclick="location.href='${appPath("report.html")}'">
              View Full Report
            </button>
          `
      }

    </div>

  `;
    }
  
// ==============================
// REPORT (FINAL)
// ==============================

async function loadReport() {
  const el = document.getElementById("reportContent");
  const user = await getUser();

  if (!user) {
    el.innerHTML = `<p>Please login to view report</p>`;
    return;
  }

  const data = JSON.parse(localStorage.getItem("agreementReport"));

  if (!data) {
    el.innerHTML = `<p>No report found</p>`;
    return;
  }

  const { result, score, risk, color } = data;

  const explain = (t) => {
    t = t.toLowerCase();
    if (t.includes("penalty")) return "No compensation if delay occurs.";
    if (t.includes("parking")) return "Parking clarity missing.";
    if (t.includes("liability")) return "Builder avoids responsibility.";
    return "Needs review.";
  };

  const section = (title, items) => `
    <h3>${title}</h3>
    ${items.map(i => {
      const issue = escapeHtml(i);
      return `<div class="card"><b>${issue}</b><br><span>${escapeHtml(explain(i))}</span></div>`;
    }).join("")}
  `;

  el.innerHTML = `
    <h2>Risk: <span style="color:${escapeHtml(color)}">${escapeHtml(risk)}</span></h2>
    <p>Score: ${escapeHtml(score)}</p>

   ${section("Critical Issues", result.critical || [])}
${section("Moderate Issues", result.moderate || [])}
${section("Suggestions", result.info || [])}
  `;
}

// ==============================
// CALCULATOR
// ==============================

function calculate() {
  const base = Number(document.getElementById("basePrice")?.value || 0);
  const extra = Number(document.getElementById("chargesInput")?.value || 0);
  const state = document.getElementById("state")?.value;

  let rate = 0.07;
  if (state === "MH") rate = 0.06;
  if (state === "KA") rate = 0.056;

  const total = base + extra;
  const reg = Math.round(base * rate);

  document.getElementById("calcResult").innerHTML = `
    Total: ₹${total.toLocaleString()}<br>
    Registration: ₹${reg.toLocaleString()}
  `;
}



// ==============================
// DASHBOARD
// ==============================

async function loadDashboard() {

  const user = await getUser();

  // NOT LOGGED IN
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const el = document.getElementById("list");

  el.innerHTML = "<p>Loading...</p>";

  // FETCH USER COMPARISONS
  const { data, error } = await supabaseClient
    .from("comparisons")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // ERROR
  if (error) {

    console.error(error);

    el.innerHTML = `
      <p>Failed to load comparisons</p>
    `;

    return;
  }

  // EMPTY STATE
  if (!data.length) {

  el.innerHTML = `
    <p>No saved comparisons yet</p>
  `;

} else {

  el.innerHTML = data.map(item => `

    <div class="card">

      <h4>${escapeHtml(item.property_a)}</h4>

      <p style="margin:8px 0;">
        vs
      </p>

      <h4>${escapeHtml(item.property_b)}</h4>

      <p style="
        margin-top:12px;
        font-size:12px;
        color:#6b7280;
      ">
        Saved on
        ${escapeHtml(new Date(item.created_at).toLocaleDateString())}
      </p>

    </div>

  `).join("");

}

}
async function loadReports() {

  const user = await getUser();

  if (!user) return;

  const el = document.getElementById("reportsList");

  if (!el) return;

  el.innerHTML = "<p>Loading reports...</p>";

  const { data, error } = await supabaseClient
    .from("agreement_reports")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {

    console.error(error);

    el.innerHTML = `
      <p>Failed to load reports</p>
    `;

    return;
  }

  if (!data.length) {

    el.innerHTML = `
      <p>No reports available yet</p>
    `;

    return;
  }

  el.innerHTML = data.map(report => `

    <div class="card">

      <h3>
        ${escapeHtml(report.risk_level)} Risk
      </h3>

      <p style="
        color:#6b7280;
        margin:10px 0;
      ">
        Score:
        <strong>${escapeHtml(report.risk_score)}</strong>
      </p>

      <p style="
        color:#6b7280;
        font-size:14px;
        line-height:1.7;
      ">
        ${escapeHtml(report.agreement_excerpt || "Agreement analysis")}
      </p>

      <p style="
        margin-top:14px;
        font-size:12px;
        color:#9ca3af;
      ">
        ${escapeHtml(new Date(report.created_at).toLocaleString())}
      </p>

    </div>

  `).join("");
}

// ==============================
// ADMIN
// ==============================

async function loadAdmin() {
  const el = document.getElementById("admin");

  const admin = await isSuperAdmin();

  if (!admin) {
    el.innerHTML = `
      <div class="card">
        <h3>Access Denied</h3>
        <p>You do not have permission to access this page.</p>
      </div>
    `;
    return;
  }

  const profile = await getProfile();

  el.innerHTML = `
    <div style="text-align:center; margin-bottom:30px;">
      <h1>Admin Panel</h1>
      <p style="color:#6b7280;">
        Welcome back, <strong>${escapeHtml(profile.full_name || profile.email)}</strong>
      </p>
    </div>

    <div id="adminMetrics" class="admin-metrics">
      ${renderAdminMetric("Loading", "...")}
    </div>

    <div class="admin-grid">
      <div class="card">
        <h3>Top Pages</h3>
        <div id="adminTopPages" class="admin-list">
          <p>Loading...</p>
        </div>
      </div>

      <div class="card">
        <h3>Recent Activity</h3>
        <div id="adminRecentActivity" class="admin-list">
          <p>Loading...</p>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>User Journeys</h3>
      <div id="adminJourneys" class="journey-list">
        <p>Loading...</p>
      </div>
    </div>
  `;

  await loadAdminAnalytics();
}
// ==============================
// ERROR
// ==============================

function showError(msg) {
  document.getElementById("analysisResult").innerHTML =
    `<div style="background:#fee2e2;padding:10px">${msg}</div>`;
}

window.initSupabase = initSupabase;

window.getSupabaseClient =
  () => supabaseClient;

window.runChecks = runChecks;

window.escapeHtml = escapeHtml;

window.appPath = appPath;