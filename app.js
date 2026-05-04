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
  window.location.href = "login.html";
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
    if (err) err.innerHTML = `<span style="color:#dc2626;">${e.message}</span>`;
    if (btn) btn.innerText = "Login";
  }
}

async function handleSignup() {
  const err = document.getElementById("authError");

  try {
    await signUp();
    if (err) err.innerHTML = `<span style="color:#16a34a;">Account created. Login now.</span>`;
  } catch (e) {
    if (err) err.innerHTML = `<span style="color:#dc2626;">${e.message}</span>`;
  }
}

// ==============================
// NAVBAR + INIT
// ==============================

async function initPage(protectedPage = false) {
  initSupabase();

  const user = await getUser();

  if (protectedPage && !user) {
    window.location.href = "login.html";
    return;
  }

  const nav = document.getElementById("nav-right");

  if (nav) {
    nav.innerHTML = user
      ? `<span>${user.email}</span> <a href="#" onclick="logout()">Logout</a>`
      : `<a href="login.html">Login</a>`;
  }
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
        <strong>Risk: ${risk}</strong> • Score: ${score}
      </div>

      <h4>Top Issues</h4>
      <ul>${preview.map(i => `<li>${i}</li>`).join("")}</ul>

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
    ${items.map(i => `<div class="card"><b>${i}</b><br><span>${explain(i)}</span></div>`).join("")}
  `;

  el.innerHTML = `
    <h2>Risk: <span style="color:${color}">${risk}</span></h2>
    <p>Score: ${score}</p>

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

function save() {
  const data = {
    a: aName.value,
    b: bName.value
  };

  const list = JSON.parse(localStorage.getItem("savedComparisons") || "[]");
  list.push(data);

  localStorage.setItem("savedComparisons", JSON.stringify(list));
  alert("Saved");
}

// ==============================
// DASHBOARD
// ==============================

function loadDashboard() {
  const list = JSON.parse(localStorage.getItem("savedComparisons") || "[]");
  const el = document.getElementById("list");

  if (!list.length) {
    el.innerHTML = "<p>No saved comparisons</p>";
    return;
  }

  el.innerHTML = list.map(i => `
    <div class="card">${i.a} vs ${i.b}</div>
  `).join("");
}

// ==============================
// ADMIN
// ==============================

async function loadAdmin() {
  const user = await getUser();
  const el = document.getElementById("admin");

  if (!user || user.email !== "your-email@gmail.com") {
    el.innerHTML = "Access denied";
    return;
  }

  el.innerHTML = "<h3>Admin Panel</h3>";
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