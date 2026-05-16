// ======================
// SUPABASE CLIENT
// =====================

function requireSupabase() {

  let client =
    window.getSupabaseClient?.();

  // Force init if missing
  if (!client && window.initSupabase) {

    client = window.initSupabase();
  }

  if (!client) {

    throw new Error(
      "Supabase client not initialized"
    );
  }

  return client;
}

// =====================
// API_BASEURL
// =====================
const API_BASE =
  window.PROPWISE_CONFIG.API.BASE_URL;

async function analyzeAgreement(text, file = null) {

  try {

    const formData = new FormData();

    if (file) {

      formData.append("file", file);

    } else {

      const blob = new Blob([text], {
        type: "text/plain"
      });

      formData.append("file", blob, "agreement.txt");
    }

    const controller = new AbortController();

const timeout = setTimeout(() => {
  controller.abort();
}, window.PROPWISE_CONFIG.API.TIMEOUT);// 90 sec timeout for Render cold start

const response = await fetch(
  `${API_BASE}/analyze`,
  {
    method: "POST",
    body: formData,
    signal: controller.signal
  }
);

clearTimeout(timeout);

if (!response.ok) {
  throw new Error("Backend request failed");
}

const data = await response.json();

    if (!data.success) {

      console.error(data);

      return runChecks(text);
    }

    return {
      critical: data.analysis.critical || [],
      moderate: data.analysis.moderate || [],
      info: [
        data.analysis.summary || "AI analysis completed"
      ],
      aiScore: data.analysis.score || 50,
      aiRisk: data.analysis.risk_level || "Medium"
    };

  } catch (err) {

    console.warn(
  "AI backend unavailable, using fallback rules"
);

console.error(err);

return runChecks(text);
  }
}

// ==============================
// AUTH
// ==============================

async function getUser() {
  try {
    if (!requireSupabase()) return null;
    const { data } = await requireSupabase().auth.getUser();
    return data?.user || null;
  } catch {
    return null;
  }
}

async function signIn() {
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  if (!email || !password) throw new Error("Enter email & password");

  const { error } = await requireSupabase().auth.signInWithPassword({
    email,
    password
  });

  if (error) throw new Error(error.message);
}

async function signUp() {
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  if (!email || !password) throw new Error("Enter email & password");

  const { error } = await requireSupabase().auth.signUp({
    email,
    password
  });

  if (error) throw new Error(error.message);
}

async function logout() {

  try {

    if (requireSupabase()) {

      await requireSupabase().auth.signOut();
    }

  } catch (err) {

    console.error("Logout failed", err);
  }

  window.location.href =
    appPath("index.html");
}

// ==============================
// PROFILE + RBAC
// ==============================

async function getProfile() {
  const user = await getUser();

  if (!user) return null;

  const fallbackProfile = {
  id: user.id,
  email: user.email,
  full_name: user.user_metadata?.full_name || "",
  role: "user",
  created_at: user.created_at || new Date().toISOString()
};

  const { data, error } = await requireSupabase()
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return fallbackProfile;
  }

  if (data) {


    return data;
  }

  const { data: created, error: createError } = await requireSupabase()
    .from("profiles")
    .insert([fallbackProfile])
    .select("*")
    .maybeSingle();

  if (createError) {
    console.error(createError);
    return fallbackProfile;
  }

  return created || fallbackProfile;
}

async function isSuperAdmin() {
  const profile = await getProfile();

  return profile?.role === "super_admin";
}



function groupBy(items, keyFn) {
  return items.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
}

function renderAdminMetric(label, value) {
  return `
    <div class="admin-metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function renderAdminSetupMessage(error) {
  return `
    <div class="card">
      <h3>Analytics setup needed</h3>
      <p style="color:#6b7280;">
        The admin analytics table is not available yet. Run the SQL in
        <strong>supabase-analytics.sql</strong> from your Supabase SQL Editor.
      </p>
      <p style="font-size:13px; color:#dc2626; margin-top:10px;">
        ${escapeHtml(error?.message || "analytics_events table is unavailable")}
      </p>
    </div>
  `;
}

function renderTopPages(events) {
  const counts = {};
  events.forEach(event => {
    const page = event.page_path || "Unknown";
    counts[page] = (counts[page] || 0) + 1;
  });

  const rows = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  if (!rows.length) return `<p style="color:#6b7280;">No page views tracked yet.</p>`;

  return rows.map(([page, count]) => `
    <div class="admin-row">
      <span>${escapeHtml(page)}</span>
      <strong>${escapeHtml(count)}</strong>
    </div>
  `).join("");
}

function renderRecentActivity(events) {
  if (!events.length) return `<p style="color:#6b7280;">No recent activity yet.</p>`;

  return events.slice(0, 12).map(event => `
    <div class="admin-row admin-row-stacked">
      <div>
        <strong>${escapeHtml(event.email || "Anonymous visitor")}</strong>
        <span>${escapeHtml(event.page_path || "Unknown page")}</span>
      </div>
      <small>${escapeHtml(formatDateTime(event.created_at))}</small>
    </div>
  `).join("");
}

function renderUserJourneys(events) {
  const groups = groupBy(events, event => event.email || event.visitor_id || "unknown");
  const journeys = Object.entries(groups)
    .map(([visitor, visitorEvents]) => ({
      visitor,
      events: visitorEvents
        .slice()
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .slice(-8)
    }))
    .sort((a, b) => {
      const aLast = a.events[a.events.length - 1]?.created_at || 0;
      const bLast = b.events[b.events.length - 1]?.created_at || 0;
      return new Date(bLast) - new Date(aLast);
    })
    .slice(0, 8);

  if (!journeys.length) return `<p style="color:#6b7280;">No journeys tracked yet.</p>`;

  return journeys.map(journey => `
    <div class="journey-card">
      <strong>${escapeHtml(journey.visitor)}</strong>
      <div class="journey-path">
        ${journey.events.map(event => `
          <span title="${escapeHtml(formatDateTime(event.created_at))}">
            ${escapeHtml(event.page_path || "Unknown")}
          </span>
        `).join("")}
      </div>
    </div>
  `).join("");
}

async function loadAdminAnalytics() {
  const metricsEl = document.getElementById("adminMetrics");
  const topPagesEl = document.getElementById("adminTopPages");
  const recentEl = document.getElementById("adminRecentActivity");
  const journeysEl = document.getElementById("adminJourneys");

  const [
    profilesResult,
    comparisonsResult,
    eventsCountResult,
    recentEventsResult
  ] = await Promise.all([
    supabaseClient.from("profiles").select("*", { count: "exact", head: true }),
    supabaseClient.from("comparisons").select("*", { count: "exact", head: true }),
    supabaseClient.from("analytics_events").select("*", { count: "exact", head: true }),
    supabaseClient
      .from("analytics_events")
      .select("*")
      .eq("event_type", "page_view")
      .order("created_at", { ascending: false })
      .limit(300)
  ]);

  if (eventsCountResult.error || recentEventsResult.error) {
    metricsEl.innerHTML = renderAdminSetupMessage(eventsCountResult.error || recentEventsResult.error);
    topPagesEl.innerHTML = "";
    recentEl.innerHTML = "";
    journeysEl.innerHTML = "";
    return;
  }

  const events = recentEventsResult.data || [];
  const uniqueVisitors = new Set(events.map(event => event.email || event.visitor_id).filter(Boolean)).size;
  const loggedInVisits = events.filter(event => event.email).length;

  metricsEl.innerHTML = `
    ${renderAdminMetric("Users", profilesResult.count ?? 0)}
    ${renderAdminMetric("Saved Comparisons", comparisonsResult.count ?? 0)}
    ${renderAdminMetric("Total Page Views", eventsCountResult.count ?? 0)}
    ${renderAdminMetric("Recent Unique Visitors", uniqueVisitors)}
    ${renderAdminMetric("Logged-in Visits", loggedInVisits)}
  `;

  topPagesEl.innerHTML = renderTopPages(events);
  recentEl.innerHTML = renderRecentActivity(events);
  journeysEl.innerHTML = renderUserJourneys(events);
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

window.analyzeAgreement =
  analyzeAgreement;

window.signIn = signIn;

window.signUp = signUp;

window.logout = logout;

window.getUser = getUser;

window.getProfile = getProfile;