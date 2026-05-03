// ==============================
// CONFIG (REPLACE)
// ==============================
const SUPABASE_URL = "https://awlgjsfhoeijpyusjthl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3bGdqc2Zob2VpanB5dXNqdGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3ODUzMTEsImV4cCI6MjA5MzM2MTMxMX0.NnLZJxpBGC-m5Rr7nrgYQsHm0ptJdK4TtUMVjykvixw"; // keep your key

// ✅ FIXED INIT (important)
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

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  const { error } = await supabaseClient.auth.signUp({ email, password });

  if (error) alert(error.message);
  else alert("Signup successful. Now login.");
}

async function signIn() {
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  console.log("Login attempt:", email);

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error(error.message);
    alert(error.message);
  } else {
    console.log("Login success");
    window.location.href = "dashboard.html";
  }
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
  const state = document.getElementById("state")?.value || "KA";

  const rates = {
    KA: 0.06, // Karnataka
    MH: 0.06, // Maharashtra
    TN: 0.07, // Tamil Nadu
    TS: 0.06, // Telangana
    DL: 0.06  // Delhi
  };

  return rates[state] || 0.06;
}

function calculateRegistration(price) {
  return Math.round(price * getRegistrationRate());
}

// ==============================
// Hidden Charges Engine
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

  if (type === "plot") {
    charges.maintenance = 0;
    charges.gst = 0;
  }

  const total =
    charges.legal +
    charges.maintenance +
    charges.gst +
    charges.other;

  return {
    breakdown: charges,
    total: Math.round(total)
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
// COMPARE
// ==============================
function compareAdvanced() {
  // ==============================
  // INPUTS
  // ==============================
  const aName = document.getElementById("aName")?.value || "Property A";
  const bName = document.getElementById("bName")?.value || "Property B";

  const aBase = getNumber("aPrice");
  const aCharges = getNumber("aCharges");

  const bBase = getNumber("bPrice");
  const bCharges = getNumber("bCharges");

  const aType = document.getElementById("aType")?.value || "apartment";
  const bType = document.getElementById("bType")?.value || "apartment";

  const state = document.getElementById("state")?.value || "KA";

  // ==============================
  // VALIDATION
  // ==============================
  if (aBase === 0 && bBase === 0) {
    alert("Please enter property values");
    return;
  }

  // ==============================
  // CALCULATIONS
  // ==============================
  const aReg = calculateRegistration(aBase);
  const bReg = calculateRegistration(bBase);

  const aHidden = calculateHiddenCharges(aBase, aType);
  const bHidden = calculateHiddenCharges(bBase, bType);

  const aTotal = aBase + aCharges + aReg + aHidden.total;
  const bTotal = bBase + bCharges + bReg + bHidden.total;

  const diff = Math.abs(aTotal - bTotal);
  const percent = ((diff / Math.max(aTotal, bTotal)) * 100).toFixed(1);

  // ==============================
  // WINNER
  // ==============================
  let winner = "";
  if (aTotal < bTotal) {
    winner = `${aName} is cheaper by ₹${diff.toLocaleString()}`;
  } else if (bTotal < aTotal) {
    winner = `${bName} is cheaper by ₹${diff.toLocaleString()}`;
  } else {
    winner = "Both properties cost the same";
  }

  // ==============================
  // STATE LABEL
  // ==============================
  const stateNames = {
    KA: "Karnataka",
    MH: "Maharashtra",
    TN: "Tamil Nadu",
    TS: "Telangana",
    DL: "Delhi"
  };

  const stateLabel = stateNames[state] || state;

  // ==============================
  // RESULT UI (ONLY HTML HERE)
  // ==============================
  document.getElementById("resultDetails").innerHTML = `
    <h4 style="margin-bottom:10px;">${winner}</h4>

    <div style="margin-bottom:10px; font-size:13px; color:#6b7280;">
      Includes registration + hidden charges (${stateLabel})
    </div>

    <div>
      <strong>${aName}</strong><br>
      Base: ₹${aBase.toLocaleString()}<br>
      Charges: ₹${aCharges.toLocaleString()}<br>
      Registration: ₹${aReg.toLocaleString()}<br>
      Hidden Charges: ₹${aHidden.total.toLocaleString()}<br>
      <b>Total: ₹${aTotal.toLocaleString()}</b>
    </div>

    <hr style="margin:15px 0;">

    <div>
      <strong>${bName}</strong><br>
      Base: ₹${bBase.toLocaleString()}<br>
      Charges: ₹${bCharges.toLocaleString()}<br>
      Registration: ₹${bReg.toLocaleString()}<br>
      Hidden Charges: ₹${bHidden.total.toLocaleString()}<br>
      <b>Total: ₹${bTotal.toLocaleString()}</b>
    </div>

    <hr style="margin:15px 0;">

    <div style="font-weight:500;">
      Difference: ${percent}%
    </div>
  `;

  // ==============================
  // EMI
  // ==============================
  const emiA = calculateEMI(aTotal);
  const emiB = calculateEMI(bTotal);

  document.getElementById("emiResult").innerHTML = `
    <h4>Estimated EMI (20 yrs @ 8%)</h4>
    ${aName}: ₹${emiA.toLocaleString()} / month<br>
    ${bName}: ₹${emiB.toLocaleString()} / month
  `;

  // ==============================
  // SHOW RESULT
  // ==============================
  document.getElementById("resultCard").style.display = "block";

  // ==============================
  // SAVE DATA
  // ==============================
  window._lastComparison = {
    a_name: aName,
    b_name: bName,
    a_total: aTotal,
    b_total: bTotal,
    state: stateLabel,
    a_type: aType,
    b_type: bType
  };
}

// ==============================
// SAVE
// ==============================
async function save() {
  const user = await getUser();

  if (!user) {
    alert("Please login to save and track your comparisons.");
    window.location.href = "login.html";
    return;
  }

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

  if (error) {
    alert(error.message);
  } else {
    alert("Saved successfully!");
  }
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
    .eq("user_id", user.id)
    .order("id", { ascending: false });

  const container = document.getElementById("list");

  if (!data.length) {
    container.innerHTML = "<p>No saved comparisons yet.</p>";
    return;
  }

  container.innerHTML = data.map(d => `
    <div class="card" style="margin-bottom:10px;">
      <strong>${d.a_name}</strong> vs <strong>${d.b_name}</strong><br>
      ₹${d.a_cost.toLocaleString()} vs ₹${d.b_cost.toLocaleString()}
    </div>
  `).join("");
}
