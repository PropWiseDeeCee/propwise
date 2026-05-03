// ==============================
// CONFIG (REPLACE THESE)
// ==============================
const SUPABASE_URL = "https://awlgjsfhoeijpyusjthl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3bGdqc2Zob2VpanB5dXNqdGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3ODUzMTEsImV4cCI6MjA5MzM2MTMxMX0.NnLZJxpBGC-m5Rr7nrgYQsHm0ptJdK4TtUMVjykvixw";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ==============================
// AUTH HELPERS
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
  else alert("Signup successful. You can login now.");
}

async function signIn() {
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
  } else {
    window.location.href = "dashboard.html";
  }
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}

// ==============================
// NAVBAR STATE
// ==============================
async function updateNavbar() {
  const user = await getUser();
  const nav = document.getElementById("nav-right");

  if (!nav) return;

  if (user) {
    nav.innerHTML = `
      <span style="margin-right:10px; font-size:13px; color:#6b7280;">
        ${user.email}
      </span>
      <a href="#" onclick="logout()">Logout</a>
    `;
  } else {
    nav.innerHTML = `
      <a href="login.html">Login</a>
    `;
  }
}

// ==============================
// ROUTE PROTECTION
// ==============================
async function requireAuth() {
  const user = await getUser();

  if (!user) {
    window.location.href = "login.html";
  }
}

// ==============================
// INIT PAGE (IMPORTANT)
// ==============================
async function initPage(isProtected = false) {
  if (isProtected) {
    await requireAuth();
  }

  await updateNavbar();
}

// ==============================
// COMPARE LOGIC
// ==============================
function getNumber(id) {
  return Number(document.getElementById(id)?.value || 0);
}

function compare() {
  const a = getNumber("aPrice") + getNumber("aCharges");
  const b = getNumber("bPrice") + getNumber("bCharges");

  let result = "";

  if (a === 0 && b === 0) {
    result = "Please enter values";
  } else {
    result = a < b ? "Property A is cheaper" : "Property B is cheaper";
  }

  const resultEl = document.getElementById("result");
  if (resultEl) resultEl.innerText = result;
}

// ==============================
// SAVE TO DB
// ==============================
async function save() {
  const user = await getUser();

  if (!user) {
    alert("Please login first");
    return;
  }

  const { error } = await supabaseClient.from("comparisons").insert([
    {
      user_id: user.id,
      a_name: document.getElementById("aName")?.value || "A",
      a_cost: getNumber("aPrice") + getNumber("aCharges"),
      b_name: document.getElementById("bName")?.value || "B",
      b_cost: getNumber("bPrice") + getNumber("bCharges")
    }
  ]);

  if (error) {
    alert(error.message);
  } else {
    alert("Saved successfully");
  }
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

  if (!container) return;

  if (!data.length) {
    container.innerHTML = "<p>No comparisons yet.</p>";
    return;
  }

  container.innerHTML = data.map(d => `
    <div style="padding:10px; border-bottom:1px solid #eee;">
      <strong>${d.a_name}</strong> vs <strong>${d.b_name}</strong><br>
      ₹${d.a_cost} vs ₹${d.b_cost}
    </div>
  `).join("");
}

// ==============================
// LOGIN PAGE AUTO REDIRECT
// ==============================
async function redirectIfLoggedIn() {
  const user = await getUser();

  if (user) {
    window.location.href = "dashboard.html";
  }
}
