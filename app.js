const SUPABASE_URL = "https://awlgjsfhoeijpyusjthl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3bGdqc2Zob2VpanB5dXNqdGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3ODUzMTEsImV4cCI6MjA5MzM2MTMxMX0.NnLZJxpBGC-m5Rr7nrgYQsHm0ptJdK4TtUMVjykvixw
Project ID - awlgjsfhoeijpyusjthl";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ===== AUTH =====

async function getUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user;
}

async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signUp({ email, password });

  alert(error ? error.message : "Signup successful");
}

async function signIn() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) alert(error.message);
  else window.location.href = "dashboard.html";
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}

// ===== NAVBAR =====

async function updateNavbar() {
  const user = await getUser();
  const nav = document.getElementById("nav-right");

  if (!nav) return;

  if (user) {
    nav.innerHTML = `
      <span style="margin-right:10px;">${user.email}</span>
      <a href="#" onclick="logout()">Logout</a>
    `;
  } else {
    nav.innerHTML = `<a href="login.html">Login</a>`;
  }
}

// ===== PROTECT =====

async function requireAuth() {
  const user = await getUser();
  if (!user) window.location.href = "login.html";
}

// ===== COMPARE =====

function getValue(id) {
  return Number(document.getElementById(id).value || 0);
}

function compare() {
  const a = getValue("aPrice") + getValue("aCharges");
  const b = getValue("bPrice") + getValue("bCharges");

  const result = a < b ? "Property A is cheaper" : "Property B is cheaper";

  document.getElementById("result").innerText = result;
}

async function save() {
  const user = await getUser();
  if (!user) return alert("Login first");

  await supabaseClient.from("comparisons").insert([
    {
      user_id: user.id,
      a_name: document.getElementById("aName").value,
      a_cost: getValue("aPrice"),
      b_name: document.getElementById("bName").value,
      b_cost: getValue("bPrice")
    }
  ]);

  alert("Saved!");
}

// ===== DASHBOARD =====

async function loadDashboard() {
  const user = await getUser();
  if (!user) return;

  const { data } = await supabaseClient
    .from("comparisons")
    .select("*")
    .eq("user_id", user.id);

  document.getElementById("list").innerHTML =
    data.map(d => `<div>${d.a_name} vs ${d.b_name}</div>`).join("");
}

// ===== INIT =====

async function initPage(protectedPage = false) {
  if (protectedPage) await requireAuth();
  await updateNavbar();
}
