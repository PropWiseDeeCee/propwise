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
function calculateRegistration(price) {
  return Math.round(price * 0.06);
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

  const winner =
    aTotal < bTotal
      ? `${aName} is cheaper by ₹${diff.toLocaleString()}`
      : `${bName} is cheaper by ₹${diff.toLocaleString()}`;

  document.getElementById("resultDetails").innerHTML = `
    <h4>${winner}</h4>

    <div>
      <strong>${aName}</strong><br>
      Total: ₹${aTotal.toLocaleString()}
    </div>

    <div style="margin-top:10px;">
      <strong>${bName}</strong><br>
      Total: ₹${bTotal.toLocaleString()}
    </div>
  `;

  document.getElementById("emiResult").innerHTML = `
    EMI:
    ${aName}: ₹${calculateEMI(aTotal).toLocaleString()} / month<br>
    ${bName}: ₹${calculateEMI(bTotal).toLocaleString()} / month
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
