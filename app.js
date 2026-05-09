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

  const nav = document.getElementById("nav-right");

  if (!nav) return;

  // NOT LOGGED IN
  if (!user) {
    nav.innerHTML = `
      <a href="${appPath("login.html")}">Login</a>
    `;
    return;
  }

  // GET PROFILE
  const profile = await getProfile();

  const isAdmin = profile?.role === "super_admin";
  const displayName = escapeHtml(profile?.full_name || user.email);

  nav.innerHTML = `
    <span style="margin-right:12px;">
      ${displayName}
    </span>

    <a href="${appPath("dashboard.html")}">Dashboard</a>

    <a href="${appPath("profile.html")}">Profile</a>

    ${
      isAdmin
        ? `<a href="${appPath("admin.html")}">Admin</a>`
        : ""
    }

    <a href="#" onclick="logout()">Logout</a>
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

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

async function isSuperAdmin() {
  const profile = await getProfile();

  return profile?.role === "super_admin";
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
    <div class="card">
      <h2>Admin Panel</h2>

      <p style="margin-top:10px;">
        Welcome back,
        <strong>${escapeHtml(profile.full_name || profile.email)}</strong>
      </p>

      <p style="color:#16a34a; margin-top:8px;">
        Role: ${escapeHtml(profile.role)}
      </p>
    </div>
  `;
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
