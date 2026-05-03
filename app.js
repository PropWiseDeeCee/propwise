// ==============================
// CONFIG (REPLACE)
// ==============================
const SUPABASE_URL = "https://awlgjsfhoeijpyusjthl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3bGdqc2Zob2VpanB5dXNqdGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3ODUzMTEsImV4cCI6MjA5MzM2MTMxMX0.NnLZJxpBGC-m5Rr7nrgYQsHm0ptJdK4TtUMVjykvixw";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ==============================
// AUTH
// ==============================
async function getUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user;
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

  if (user) {
    nav.innerHTML = `
      <span style="margin-right:10px; font-size:13px;">
        ${user.email}
      </span>
      <a href="#" onclick="logout()">Logout</a>
    `;
  } else {
    nav.innerHTML = `<a href="login.html">Login</a>`;
  }
}

// ==============================
// PROTECT ROUTES
// ==============================
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
// REGISTRATION ENGINE
// ==============================
function getRegistrationRate() {
  return 0.06; // 6% (MVP)
}

function calculateRegistration(price) {
  return Math.round(price * getRegistrationRate());
}

// ==============================
// EMI
// ==============================
function calculateEMI(principal) {
  const rate = 0.08 / 12;
  const tenure = 240;

  const emi =
    (principal * rate * Math.pow(1 + rate, tenure)) /
    (Math.pow(1 + rate, tenure) - 1);

  return Math.round(emi);
}

// ==============================
// COMPARE
// ==============================
function compareAdvanced() {
  const aName = document.getElementById("aName").value || "Property A";
  const bName = document.getElementById("bName").value || "Property B";

  const aBase = getNumber("aPrice");
  const aCharges = getNumber("aCharges");

  const bBase = getNumber("bPrice");
  const bCharges = getNumber("bCharges");

  const aReg = calculateRegistration(aBase);
  const bReg = calculateRegistration(bBase);

  const aTotal = aBase + aCharges + aReg;
  const bTotal = bBase + bCharges + bReg;

  if (aTotal === 0 && bTotal === 0) {
    alert("Enter values");
    return;
  }

  const diff = Math.abs(aTotal - bTotal);
  const percent = ((diff / Math.max(aTotal, bTotal)) * 100).toFixed(1);

  let winner =
    aTotal < bTotal
      ? `${aName} is cheaper by ₹${diff.toLocaleString()}`
      : `${bName} is cheaper by ₹${diff.toLocaleString()}`;

  document.getElementById("resultDetails").innerHTML = `
    <h4>${winner}</h4>

    <div>
      <strong>${aName}</strong><br>
      Base: ₹${aBase.toLocaleString()}<br>
      Charges: ₹${aCharges.toLocaleString()}<br>
      Registration: ₹${aReg.toLocaleString()}<br>
      <b>Total: ₹${aTotal.toLocaleString()}</b>
    </div>

    <hr>

    <div>
      <strong>${bName}</strong><br>
      Base: ₹${bBase.toLocaleString()}<br>
      Charges: ₹${bCharges.toLocaleString()}<br>
      Registration: ₹${bReg.toLocaleString()}<br>
      <b>Total: ₹${bTotal.toLocaleString()}</b>
    </div>

    <hr>
    Difference: ${percent}%
  `;

  const emiA = calculateEMI(aTotal);
  const emiB = calculateEMI(bTotal);

  document.getElementById("emiResult").innerHTML = `
    <h4>Estimated EMI</h4>
    ${aName}: ₹${emiA.toLocaleString()} / month<br>
    ${bName}: ₹${emiB.toLocaleString()} / month
  `;

  document.getElementById("resultCard").style.display = "block";

  // store for saving
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
  if (!user) return alert("Login first");

  if (!window._lastComparison) {
    alert("Run comparison first");
    return;
  }

  const { error } = await supabaseClient.from("comparisons").insert([
    {
      user_id: user.id,
      a_name: window._lastComparison.a_name,
      a_cost: window._lastComparison.a_total,
      b_name: window._lastComparison.b_name,
      b_cost: window._lastComparison.b_total
    }
  ]);

  if (error) alert(error.message);
  else alert("Saved successfully");
}

// ==============================
// DASHBOARD
// ==============================
async function loadDashboard() {
  const user = await getUser();
  if (!user) return;

  const { data, error } = await supabaseClient
    .from("comparisons")
    .select("*")
    .eq("user_id", user.id)
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const container = document.getElementById("list");

  if (!data.length) {
    container.innerHTML = "<p>No saved comparisons yet.</p>";
    return;
  }

  container.innerHTML = data.map(d => `
    <div style="padding:12px; border-bottom:1px solid #eee;">
      <strong>${d.a_name}</strong> vs <strong>${d.b_name}</strong><br>
      ₹${d.a_cost.toLocaleString()} vs ₹${d.b_cost.toLocaleString()}
    </div>
  `).join("");
}
