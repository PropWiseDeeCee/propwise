// ==============================
// CONFIG (REPLACE)
// ==============================
const SUPABASE_URL = "https://awlgjsfhoeijpyusjthl.supabase.co";
const SUPABASE_KEY = "YOUR_KEY";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// ==============================
// AUTH
// ==============================
async function getUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user;
}

async function signUp() {
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  if (!email || !password) return alert("Enter email and password");

  const { error } = await supabaseClient.auth.signUp({ email, password });
  if (error) alert(error.message);
  else alert("Signup successful. Now login.");
}

async function signIn() {
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
// REGISTRATION
// ==============================
function getRegistrationRate() {
  const state = document.getElementById("state")?.value || "KA";

  return {
    KA: 0.06,
    MH: 0.06,
    TN: 0.07,
    TS: 0.06,
    DL: 0.06
  }[state] || 0.06;
}

function calculateRegistration(price) {
  return Math.round(price * getRegistrationRate());
}

// ==============================
// HIDDEN CHARGES
// ==============================
function calculateHiddenCharges(price, type) {
  let charges = {
    legal: 50000,
    maintenance: 0,
    gst: 0,
    other: 30000
  };

  if (type === "apartment") {
    charges.maintenance = price * 0.02;
    charges.gst = price * 0.05;
  }

  if (type === "villa") {
    charges.maintenance = price * 0.025;
    charges.gst = price * 0.05;
  }

  return {
    breakdown: charges,
    total: Math.round(
      charges.legal + charges.maintenance + charges.gst + charges.other
    )
  };
}

// ==============================
// EMI
// ==============================
function calculateEMI(principal) {
  const rate = 0.08 / 12;
  const tenure = 240;

  return Math.round(
    (principal * rate * Math.pow(1 + rate, tenure)) /
    (Math.pow(1 + rate, tenure) - 1)
  );
}

// ==============================
// INSIGHT ENGINE
// ==============================
function generateInsights(base, total, hidden, type) {
  const insights = [];
  const extraPercent = ((total - base) / base) * 100;

  if (extraPercent > 10) {
    insights.push(`⚠️ Total cost is ~${extraPercent.toFixed(1)}% higher than base price`);
  }

  if (hidden.breakdown.gst > 0) {
    insights.push("💡 GST applicable (under-construction)");
  }

  if (hidden.breakdown.maintenance > 100000) {
    insights.push("⚠️ High maintenance cost");
  }

  if (type === "plot") {
    insights.push("💡 Lower hidden costs (no GST)");
  }

  return insights;
}

// ==============================
// TOGGLE
// ==============================
function toggleDetails(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = el.style.display === "none" ? "block" : "none";
}

// ==============================
// COMPARE
// ==============================
function compareAdvanced() {
  const aName = document.getElementById("aName")?.value || "Property A";
  const bName = document.getElementById("bName")?.value || "Property B";

  const aBase = getNumber("aPrice");
  const bBase = getNumber("bPrice");
  const aCharges = getNumber("aCharges");
  const bCharges = getNumber("bCharges");

  const aType = document.getElementById("aType")?.value || "apartment";
  const bType = document.getElementById("bType")?.value || "apartment";

  const state = document.getElementById("state")?.value || "KA";

  if (aBase === 0 && bBase === 0) return alert("Enter values");

  const aReg = calculateRegistration(aBase);
  const bReg = calculateRegistration(bBase);

  const aHidden = calculateHiddenCharges(aBase, aType);
  const bHidden = calculateHiddenCharges(bBase, bType);

  const aTotal = aBase + aCharges + aReg + aHidden.total;
  const bTotal = bBase + bCharges + bReg + bHidden.total;

  const diff = Math.abs(aTotal - bTotal);
  const percent = ((diff / Math.max(aTotal, bTotal)) * 100).toFixed(1);

  const winner =
    aTotal < bTotal
      ? `${aName} is cheaper by ₹${diff.toLocaleString()}`
      : `${bName} is cheaper by ₹${diff.toLocaleString()}`;

  const stateLabel = {
    KA: "Karnataka",
    MH: "Maharashtra",
    TN: "Tamil Nadu",
    TS: "Telangana",
    DL: "Delhi"
  }[state] || state;

  const aInsights = generateInsights(aBase, aTotal, aHidden, aType);
  const bInsights = generateInsights(bBase, bTotal, bHidden, bType);

  const resultEl = document.getElementById("resultDetails");
  if (!resultEl) return;

  resultEl.innerHTML = `
    <h4>${winner}</h4>

    <div style="color:#6b7280;">
      Includes registration + hidden charges (${stateLabel})
    </div>

    <br>

    <strong>${aName}</strong><br>
    Total: ₹${aTotal.toLocaleString()}<br><br>

    <strong>${bName}</strong><br>
    Total: ₹${bTotal.toLocaleString()}

    <hr>

    <div><b>Difference: ${percent}%</b></div>

    <div style="margin-top:15px; background:#fff7ed; padding:10px;">
      <strong>Insights</strong><br><br>

      ${aName}:<br>
      ${aInsights.map(i => `• ${i}`).join("<br>")}<br><br>

      ${bName}:<br>
      ${bInsights.map(i => `• ${i}`).join("<br>")}
    </div>
  `;

  document.getElementById("resultCard").style.display = "block";

  window._lastComparison = {
    a_name: aName,
    b_name: bName,
    a_total: aTotal,
    b_total: bTotal
  };
}

// ==============================
// SAVE
// ==============================
async function save() {
  const user = await getUser();

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  if (!window._lastComparison) return alert("Run comparison first");

  await supabaseClient.from("comparisons").insert([{
    user_id: user.id,
    ...window._lastComparison
  }]);

  alert("Saved!");
}

// ==============================
// DASHBOARD
// ==============================
async function loadDashboard() {
  const user = await getUser();
  if (!user) return;

  const { data } = await supabaseClient
    .from("comparisons")
    .select("*")
    .eq("user_id", user.id);

  const container = document.getElementById("list");

  container.innerHTML = data.map(d => `
    <div class="card">
      ${d.a_name} vs ${d.b_name}<br>
      ₹${d.a_total} vs ₹${d.b_total}
    </div>
  `).join("");
}
