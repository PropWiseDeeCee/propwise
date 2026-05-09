// ==============================
// SUPABASE INIT
// ==============================

let supabaseClient = null;
const SUPER_ADMIN_EMAILS = [
  "choudhury.diganta17@example.com"
];

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

function roleForEmail(email) {
  return SUPER_ADMIN_EMAILS.includes(String(email || "").toLowerCase())
    ? "super_admin"
    : "user";
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

async function analyzeAgreementHandler() {
  const resultEl = document.getElementById("analysisResult");
  if (resultEl) resultEl.innerHTML = "Analyzing...";

  const file = document.getElementById("pdfFile")?.files[0];
  let text = "";

  if (file) text = await extractTextFromFile(file);
  else text = document.getElementById("agreementText")?.value;

  if (!text || text.length < 50) {
    showError("Unable to read agreement. Try another file or paste text.");
    return;
  }

  const result = runChecks(text);

  const score =
    result.critical.length * 3 +
    result.moderate.length * 2 +
    result.info.length;

  let risk = "Low", color = "#16a34a";

  if (score >= 10) { risk = "High"; color = "#dc2626"; }
  else if (score >= 5) { risk = "Medium"; color = "#f59e0b"; }

  localStorage.setItem("agreementReport", JSON.stringify({
    result, score, risk, color
  }));

  renderPreview(result, score, risk);
}

// ==============================
// PREVIEW
// ==============================

async function renderPreview(result, score, risk) {
  const el = document.getElementById("analysisResult");
  const user = await getUser();

  const all = [...result.critical, ...result.moderate, ...result.info];
  const preview = all.slice(0, 2);
  const hidden = all.length - 2;

  el.innerHTML = `
    <div class="analysis-card">
      <div class="risk-box">
        <strong>Risk: ${escapeHtml(risk)}</strong> • Score: ${escapeHtml(score)}
      </div>

      <h4>Top Issues</h4>
      <ul>${preview.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>

      ${hidden > 0 ? `<p style="color:#dc2626;">⚠️ ${hidden} more issues found</p>` : ""}
    </div>

    <div class="paywall">
      ${
        !user
          ? `<button onclick="location.href='login.html'">Login to Unlock</button>`
          : `<button onclick="location.href='report.html'">View Full Report</button>`
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

    return;
  }

  // RENDER DATA
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
    role: roleForEmail(user.email),
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
    if (fallbackProfile.role === "super_admin") {
      return { ...data, role: "super_admin" };
    }

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
