const SUPABASE_URL = "https://awlgjsfhoeijpyusjthl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3bGdqc2Zob2VpanB5dXNqdGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3ODUzMTEsImV4cCI6MjA5MzM2MTMxMX0.NnLZJxpBGC-m5Rr7nrgYQsHm0ptJdK4TtUMVjykvixw
Project ID - awlgjsfhoeijpyusjthl";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// AUTH
async function signUp() {
  const email = emailInput.value;
  const password = passwordInput.value;

  const { error } = await supabaseClient.auth.signUp({ email, password });

  if (error) alert(error.message);
  else alert("Signup successful");
}

async function signIn() {
  const email = emailInput.value;
  const password = passwordInput.value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) alert(error.message);
  else window.location.href = "dashboard.html";
}

// CALCULATOR
function calculate() {
  const base = Number(basePrice.value || 0);
  const charges = Number(chargesInput.value || 0);

  calcResult.innerText = "Total: ₹" + (base + charges);
}

// COMPARE
function propertyMetrics(prefix) {
  const base = Number(document.getElementById(prefix + 'Base').value || 0);
  const charges = Number(document.getElementById(prefix + 'Charges').value || 0);
  return base + charges;
}

function compareProperties() {
  const a = propertyMetrics('a');
  const b = propertyMetrics('b');

  compareResult.innerText = a < b ? "Property A is cheaper" : "Property B is cheaper";
}

// SAVE
async function saveComparison() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return alert("Login first");

  await supabaseClient.from('comparisons').insert([
    {
      user_id: user.id,
      a_name: aName.value,
      a_cost: propertyMetrics('a'),
      b_name: bName.value,
      b_cost: propertyMetrics('b')
    }
  ]);

  alert("Saved!");
}

// DASHBOARD
async function loadDashboard() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  const { data } = await supabaseClient
    .from('comparisons')
    .select('*')
    .eq('user_id', user.id);

  list.innerHTML = data.map(d =>
    `<div>${d.a_name} vs ${d.b_name}</div>`
  ).join('');
}

// ADMIN
async function loadAdmin() {
  const { data } = await supabaseClient.from('comparisons').select('*');
  admin.innerText = "Total comparisons: " + data.length;
}
