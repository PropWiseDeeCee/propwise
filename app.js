// ==============================
// SUPABASE INIT
// ==============================

let supabaseClient = null;

function initSupabase() {
  if (!window.supabase) return;

  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(
      "https://awlgjsfhoeijpyusjthl.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3bGdqc2Zob2VpanB5dXNqdGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3ODUzMTEsImV4cCI6MjA5MzM2MTMxMX0.NnLZJxpBGC-m5Rr7nrgYQsHm0ptJdK4TtUMVjykvixw"
    );
  }
}

initSupabase();

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
// AUTH
// ==============================

async function getUser() {
  try {
    if (!supabaseClient) return null;
    const { data } = await supabaseClient.auth.getUser();
    return data?.user || null;
  } catch {
    return null;
  }
}

async function signIn() {
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  if (!email || !password) throw new Error("Enter email & password");

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw new Error(error.message);
}

async function signUp() {
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  if (!email || !password) throw new Error("Enter email & password");

  const { error } = await supabaseClient.auth.signUp({
    email,
    password
  });

  if (error) throw new Error(error.message);
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = appPath("login.html");
}

// ==============================
// LOGIN FLOW
// ==============================

async function handleLogin() {
  const btn = document.getElementById("loginBtn");
  const err = document.getElementById("authError");

  if (btn) btn.innerText = "Logging in...";
  if (err) err.innerHTML = "";

  try {
    await signIn();

    const hasReport = localStorage.getItem("agreementReport");

    window.location.href = hasReport ? "report.html" : "dashboard.html";

  } catch (e) {
    if (err) err.innerHTML = `<span style="color:#dc2626;">${escapeHtml(e.message)}</span>`;
    if (btn) btn.innerText = "Login";
  }
}

async function handleSignup() {
  const err = document.getElementById("authError");

  try {
    await signUp();
    if (err) err.innerHTML = `<span style="color:#16a34a;">Account created. Login now.</span>`;
  } catch (e) {
    if (err) err.innerHTML = `<span style="color:#dc2626;">${escapeHtml(e.message)}</span>`;
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
function analyzeAgreement(text) {
  return runChecks(text);
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
  }

  // DISABLE BUTTON
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Analyzing...";
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

        return;
      }
    }

    // EMPTY TEXT
    if (!text || text.length < 30) {

      alert("Please upload or paste a valid agreement");

      return;
    }

    // ANALYSIS
    const result = analyzeAgreement(text);

    const score = calculateRiskScore(result);

    const risk = getRiskLevel(score);

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
    ...result.critical,
    ...result.moderate,
    ...result.info
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
            <button onclick="location.href='login.html'">
              Login to Unlock Full Report
            </button>
          `
          : `
            <button onclick="location.href='report.html'">
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

    ${section("Critical Issues", result.critical)}
    ${section("Moderate Issues", result.moderate)}
    ${section("Suggestions", result.info)}
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
// COMPARE
// ==============================

function compareAdvanced() {
  const a = Number(aPrice.value) + Number(aCharges.value);
  const b = Number(bPrice.value) + Number(bCharges.value);

  resultCard.style.display = "block";

  resultDetails.innerHTML = `
    A: ₹${a.toLocaleString()}<br>
    B: ₹${b.toLocaleString()}<br><br>
    <strong>${a < b ? "Property A is better" : "Property B is better"}</strong>
  `;
}

// ==============================
// SAVED COMPARISONS
// ==============================
async function save() {

  const user = await getUser();

  // USER NOT LOGGED IN
  if (!user) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  // FORM DATA
  const data = {
    user_id: user.id,
    property_a: aName.value,
    property_b: bName.value
  };

  // INSERT INTO SUPABASE
  const { error } = await supabaseClient
    .from("comparisons")
    .insert([data]);

  // ERROR HANDLING
  if (error) {
    console.error(error);
    alert("Failed to save comparison");
    return;
  }

  // SUCCESS
  alert("Comparison saved successfully");
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
// PROFILE + RBAC
// ==============================

async function getProfile() {
  const user = await getUser();

  if (!user) return null;

  const fallbackProfile = {
  id: user.id,
  email: user.email,
  full_name: user.user_metadata?.full_name || "",
  role: "user",
  created_at: user.created_at || new Date().toISOString()
};

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return fallbackProfile;
  }

  if (data) {


    return data;
  }

  const { data: created, error: createError } = await supabaseClient
    .from("profiles")
    .insert([fallbackProfile])
    .select("*")
    .maybeSingle();

  if (createError) {
    console.error(createError);
    return fallbackProfile;
  }

  return created || fallbackProfile;
}

async function isSuperAdmin() {
  const profile = await getProfile();

  return profile?.role === "super_admin";
}

function formatDateTime(value) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleString();
}

function groupBy(items, keyFn) {
  return items.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
}

function renderAdminMetric(label, value) {
  return `
    <div class="admin-metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function renderAdminSetupMessage(error) {
  return `
    <div class="card">
      <h3>Analytics setup needed</h3>
      <p style="color:#6b7280;">
        The admin analytics table is not available yet. Run the SQL in
        <strong>supabase-analytics.sql</strong> from your Supabase SQL Editor.
      </p>
      <p style="font-size:13px; color:#dc2626; margin-top:10px;">
        ${escapeHtml(error?.message || "analytics_events table is unavailable")}
      </p>
    </div>
  `;
}

function renderTopPages(events) {
  const counts = {};
  events.forEach(event => {
    const page = event.page_path || "Unknown";
    counts[page] = (counts[page] || 0) + 1;
  });

  const rows = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  if (!rows.length) return `<p style="color:#6b7280;">No page views tracked yet.</p>`;

  return rows.map(([page, count]) => `
    <div class="admin-row">
      <span>${escapeHtml(page)}</span>
      <strong>${escapeHtml(count)}</strong>
    </div>
  `).join("");
}

function renderRecentActivity(events) {
  if (!events.length) return `<p style="color:#6b7280;">No recent activity yet.</p>`;

  return events.slice(0, 12).map(event => `
    <div class="admin-row admin-row-stacked">
      <div>
        <strong>${escapeHtml(event.email || "Anonymous visitor")}</strong>
        <span>${escapeHtml(event.page_path || "Unknown page")}</span>
      </div>
      <small>${escapeHtml(formatDateTime(event.created_at))}</small>
    </div>
  `).join("");
}

function renderUserJourneys(events) {
  const groups = groupBy(events, event => event.email || event.visitor_id || "unknown");
  const journeys = Object.entries(groups)
    .map(([visitor, visitorEvents]) => ({
      visitor,
      events: visitorEvents
        .slice()
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .slice(-8)
    }))
    .sort((a, b) => {
      const aLast = a.events[a.events.length - 1]?.created_at || 0;
      const bLast = b.events[b.events.length - 1]?.created_at || 0;
      return new Date(bLast) - new Date(aLast);
    })
    .slice(0, 8);

  if (!journeys.length) return `<p style="color:#6b7280;">No journeys tracked yet.</p>`;

  return journeys.map(journey => `
    <div class="journey-card">
      <strong>${escapeHtml(journey.visitor)}</strong>
      <div class="journey-path">
        ${journey.events.map(event => `
          <span title="${escapeHtml(formatDateTime(event.created_at))}">
            ${escapeHtml(event.page_path || "Unknown")}
          </span>
        `).join("")}
      </div>
    </div>
  `).join("");
}

async function loadAdminAnalytics() {
  const metricsEl = document.getElementById("adminMetrics");
  const topPagesEl = document.getElementById("adminTopPages");
  const recentEl = document.getElementById("adminRecentActivity");
  const journeysEl = document.getElementById("adminJourneys");

  const [
    profilesResult,
    comparisonsResult,
    eventsCountResult,
    recentEventsResult
  ] = await Promise.all([
    supabaseClient.from("profiles").select("*", { count: "exact", head: true }),
    supabaseClient.from("comparisons").select("*", { count: "exact", head: true }),
    supabaseClient.from("analytics_events").select("*", { count: "exact", head: true }),
    supabaseClient
      .from("analytics_events")
      .select("*")
      .eq("event_type", "page_view")
      .order("created_at", { ascending: false })
      .limit(300)
  ]);

  if (eventsCountResult.error || recentEventsResult.error) {
    metricsEl.innerHTML = renderAdminSetupMessage(eventsCountResult.error || recentEventsResult.error);
    topPagesEl.innerHTML = "";
    recentEl.innerHTML = "";
    journeysEl.innerHTML = "";
    return;
  }

  const events = recentEventsResult.data || [];
  const uniqueVisitors = new Set(events.map(event => event.email || event.visitor_id).filter(Boolean)).size;
  const loggedInVisits = events.filter(event => event.email).length;

  metricsEl.innerHTML = `
    ${renderAdminMetric("Users", profilesResult.count ?? 0)}
    ${renderAdminMetric("Saved Comparisons", comparisonsResult.count ?? 0)}
    ${renderAdminMetric("Total Page Views", eventsCountResult.count ?? 0)}
    ${renderAdminMetric("Recent Unique Visitors", uniqueVisitors)}
    ${renderAdminMetric("Logged-in Visits", loggedInVisits)}
  `;

  topPagesEl.innerHTML = renderTopPages(events);
  recentEl.innerHTML = renderRecentActivity(events);
  journeysEl.innerHTML = renderUserJourneys(events);
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
// SAMPLE DATA
// ==============================

function loadSampleAgreement() {
  document.getElementById("agreementText").value = `
Builder shall not be liable for delay.
No penalty clause mentioned.
Parking not defined.
Maintenance applicable.
`;
}

// ==============================
// Download Report
// ==============================

async function downloadReport() {
  const data = JSON.parse(localStorage.getItem("agreementReport"));

  if (!data) {
    alert("No report found");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const { result, score, risk } = data;

  let y = 20;

  doc.setFontSize(16);
  doc.text("PropWise Agreement Report", 20, y);

  y += 10;
  doc.setFontSize(12);
  doc.text(`Risk: ${risk}`, 20, y);
  y += 7;
  doc.text(`Score: ${score}`, 20, y);

  y += 10;

  const addSection = (title, items) => {
    if (!items || !items.length) return;

    doc.text(title, 20, y);
    y += 7;

    items.forEach(i => {
      doc.text(`- ${i}`, 20, y);
      y += 6;
    });

    y += 5;
  };

  addSection("Critical", result.critical);
  addSection("Moderate", result.moderate);
  addSection("Suggestions", result.info);

  doc.save("agreement-report.pdf");
}

// ==============================
// ERROR
// ==============================

function showError(msg) {
  document.getElementById("analysisResult").innerHTML =
    `<div style="background:#fee2e2;padding:10px">${msg}</div>`;
}

// ==============================
// SHARED COMPONENTS
// ==============================

async function loadSharedComponents() {

  const navbar = document.getElementById("navbar");
  if (navbar) {
    const navHtml = await fetch("components/navbar.html");
    navbar.innerHTML = await navHtml.text();
  }

  const footer = document.getElementById("footer");
  if (footer) {
    const footerHtml = await fetch("components/footer.html");
    footer.innerHTML = await footerHtml.text();
  }
}