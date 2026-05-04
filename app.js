// ==============================
// SAFE SUPABASE INIT
// ==============================

let supabaseClient = null;

function initSupabase() {
  if (!window.supabase) {
    console.warn("Supabase not loaded yet");
    return;
  }

  if (!supabaseClient) {
    const SUPABASE_URL = "https://awlgjsfhoeijpyusjthl.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3bGdqc2Zob2VpanB5dXNqdGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3ODUzMTEsImV4cCI6MjA5MzM2MTMxMX0.NnLZJxpBGC-m5Rr7nrgYQsHm0ptJdK4TtUMVjykvixw";

    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );
  }
}

initSupabase();

// ==============================
// AUTH
// ==============================

async function getUser() {
  if (!supabaseClient) return null;

  const { data: { user } } = await supabaseClient.auth.getUser();
  return user;
}

async function signUp() {
  initSupabase();

  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  if (!email || !password) return alert("Enter email and password");

  const { error } = await supabaseClient.auth.signUp({ email, password });
  if (error) alert(error.message);
  else alert("Signup successful. Now login.");
}

async function signIn() {
  initSupabase();

  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) alert(error.message);
  else window.location.href = "dashboard.html";
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}

// ==============================
// NAVBAR
// ==============================

async function updateNavbar() {
  initSupabase();

  const user = await getUser();
  const nav = document.getElementById("nav-right");

  if (!nav) return;

  nav.innerHTML = user
    ? `<span>${user.email}</span> <a href="#" onclick="logout()">Logout</a>`
    : `<a href="login.html">Login</a>`;
}

async function requireAuth() {
  const user = await getUser();
  if (!user) window.location.href = "login.html";
}

async function initPage(protectedPage = false) {
  initSupabase();

  if (protectedPage) await requireAuth();
  await updateNavbar();
}

// ==============================
// HELPERS
// ==============================

function getNumber(id) {
  return Number(document.getElementById(id)?.value || 0);
}

// ==============================
// PDF EXTRACTION
// ==============================

async function extractTextFromPDF(file) {
  try {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = async function () {
        try {
          const typedarray = new Uint8Array(this.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;

          let fullText = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();

            const strings = content.items.map(item => item.str);
            fullText += strings.join(" ") + " ";
          }

          resolve(fullText);
        } catch (err) {
          reject(err);
        }
      };

      reader.readAsArrayBuffer(file);
    });

  } catch (e) {
    return "";
  }
}

// ==============================
// FILE EXTRACTOR
// ==============================

async function extractTextFromFile(file) {
  const type = file.name.split('.').pop().toLowerCase();

  try {
    if (type === "pdf") return await extractTextFromPDF(file);
    if (type === "txt") return await file.text();

    if (type === "docx") {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    return "";
  } catch (e) {
    console.error(e);
    return "";
  }
}

// ==============================
// RULE ENGINE
// ==============================

function runAgreementChecks(text) {
  const t = text.toLowerCase();

  const results = {
    critical: [],
    moderate: [],
    info: []
  };

  if (!t.includes("possession")) results.critical.push("Possession clause missing");
  if (!t.includes("penalty")) results.critical.push("No delay penalty clause");
  if (t.includes("sole discretion")) results.critical.push("One-sided clause");
  if (t.includes("not be liable")) results.critical.push("Builder liability removed");

  if (t.includes("reasonable time")) results.moderate.push("Vague timeline");
  if (!t.includes("maintenance")) results.moderate.push("Maintenance unclear");
  if (!t.includes("parking")) results.moderate.push("Parking not defined");

  if (!t.includes("gst")) results.info.push("GST not mentioned");

  return results;
}

// ==============================
// MAIN ANALYZER
// ==============================

async function analyzeAgreementHandler() {
  const fileInput = document.getElementById("pdfFile");
  const textInput = document.getElementById("agreementText").value;

  let text = "";

  if (fileInput.files.length > 0) {
    text = await extractTextFromFile(fileInput.files[0]);
  } else {
    text = textInput;
  }

  console.log("Extracted:", text);

  if (!text || text.trim().length < 50) {
    showError("⚠️ Unable to read agreement. Try DOCX or paste text.");
    return;
  }

  const result = runAgreementChecks(text);

  const score =
    (result.critical.length * 3) +
    (result.moderate.length * 2) +
    result.info.length;

  let risk = "Low";
  let color = "#16a34a";

  if (score >= 10) {
    risk = "High";
    color = "#dc2626";
  } else if (score >= 5) {
    risk = "Medium";
    color = "#f59e0b";
  }

  localStorage.setItem("agreementReport", JSON.stringify({
    result, score, risk, color
  }));

  renderPreview(result, score, risk, color);
}

// ==============================
// PREVIEW UI
// ==============================

async function renderPreview(result, score, risk, color) {
  const el = document.getElementById("analysisResult");
  const user = await getUser();

  const allIssues = [
    ...result.critical,
    ...result.moderate,
    ...result.info
  ];

  const previewIssues = allIssues.slice(0, 2);

  let riskClass = "risk-low";
  if (risk === "High") riskClass = "risk-high";
  if (risk === "Medium") riskClass = "risk-medium";

  el.innerHTML = `
    <div class="analysis-card">

      <div class="risk-box ${riskClass}">
        Risk: <strong>${risk}</strong> | Score: ${score}
      </div>

      <h4>⚠️ Top Issues Found</h4>
      <ul>
        ${
          previewIssues.length
            ? previewIssues.map(i => `<li>${i}</li>`).join("")
            : `<li>No major issues detected</li>`
        }
      </ul>

    </div>

    <div class="paywall">
      <strong>🔒 Unlock Full Report</strong>

      <ul>
        <li>All identified risks</li>
        <li>Detailed explanations</li>
        <li>Recommendations</li>
        <li>Downloadable report</li>
      </ul>

      ${
        !user
          ? `<button onclick="location.href='login.html'">Login to Unlock</button>`
          : `<button onclick="location.href='report.html'">Unlock Full Report</button>`
      }

      <p style="font-size:12px; color:#6b7280; margin-top:10px;">
        This is an automated analysis and not legal advice.
      </p>
    </div>
  `;
}

// ==============================
// REPORT PAGE
// ==============================

function loadReport() {
  const data = JSON.parse(localStorage.getItem("agreementReport"));
  const el = document.getElementById("reportContent");

  if (!data) {
    el.innerHTML = "<p>No report found. Please analyze again.</p>";
    return;
  }

  const { result, score, risk, color } = data;

  el.innerHTML = `
    <div class="card">

      <div class="risk-box" style="border-left:6px solid ${color};">
        <strong>Risk Level: <span style="color:${color}">${risk}</span></strong><br>
        Score: ${score}
      </div>

      ${renderSection("🔴 Critical Issues", result.critical, "#dc2626")}
      ${renderSection("🟠 Moderate Issues", result.moderate, "#f59e0b")}
      ${renderSection("🟢 Suggestions", result.info, "#16a34a")}

    </div>

    <!-- 🔥 WATERMARK UI -->
    <div style="
  margin-top:20px;
  padding:10px;
  text-align:center;
  font-size:12px;
  color:#6b7280;
  background:#f9fafb;
  border-radius:8px;
">
  🔒 Free Report • Upgrade to remove watermark & unlock full insights
</div>
  `;
}

// ==============================
// PDF generation function
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

  // 🔥 FREE USER FLAG
  const isPremium = false;

  // TITLE
  doc.setFontSize(16);
  doc.text("PropWise Agreement Report", 20, y);

  y += 10;

  // RISK
  doc.setFontSize(12);
  doc.text(`Risk Level: ${risk}`, 20, y);
  y += 7;
  doc.text(`Score: ${score}`, 20, y);

  y += 10;

  function addSection(title, items) {
    if (!items || items.length === 0) return;

    doc.setFontSize(13);
    doc.text(title, 20, y);
    y += 7;

    doc.setFontSize(11);

    items.forEach(item => {
      const split = doc.splitTextToSize(`• ${item}`, 170);
      doc.text(split, 20, y);
      y += split.length * 6;

      if (y > 270) {
        addWatermark();
        doc.addPage();
        y = 20;
      }
    });

    y += 5;
  }

  addSection("Critical Issues", result.critical);
  addSection("Moderate Issues", result.moderate);
  addSection("Suggestions", result.info);

  // DISCLAIMER
  y += 10;
  doc.setFontSize(9);
  doc.text("This is an automated analysis and not legal advice.", 20, y);

  // 🔥 WATERMARK FUNCTION
  function addWatermark() {
    if (isPremium) return;

    doc.setTextColor(200, 200, 200);
    doc.setFontSize(30);
    doc.text("PropWise (Free Report)", 30, 150, { angle: 30 });
    doc.setTextColor(0, 0, 0);
  }

  // ADD WATERMARK ON FIRST PAGE
  addWatermark();

  // SAVE
  doc.save("agreement-report.pdf");
}

// ==============================
// ERROR
// ==============================

function showError(msg) {
  document.getElementById("analysisResult").innerHTML =
    `<div style="color:red;">${msg}</div>`;
}