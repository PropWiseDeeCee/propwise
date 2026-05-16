// ==============================
// ADMIN ANALYTICS
// ==============================

function groupBy(items, keyFn) {
  return items.reduce((groups, item) => {
    const key = keyFn(item);

    if (!groups[key]) {
      groups[key] = [];
    }

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
      <h3>Admin data unavailable</h3>
      <p style="color:#6b7280;">
        Admin access is working, but one or more admin data queries failed.
        Confirm the tables and policies in
        <strong>supabase-analytics.sql</strong> are applied in Supabase.
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
    const page =
      event.page_path || "Unknown";

    counts[page] =
      (counts[page] || 0) + 1;
  });

  const rows =
    Object
      .entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

  if (!rows.length) {
    return `<p style="color:#6b7280;">No page views tracked yet.</p>`;
  }

  return rows.map(([page, count]) => `
    <div class="admin-row">
      <span>${escapeHtml(page)}</span>
      <strong>${escapeHtml(count)}</strong>
    </div>
  `).join("");
}

function renderRecentActivity(events) {
  if (!events.length) {
    return `<p style="color:#6b7280;">No recent activity yet.</p>`;
  }

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
  const groups =
    groupBy(
      events,
      event => event.email || event.visitor_id || "unknown"
    );

  const journeys =
    Object
      .entries(groups)
      .map(([visitor, visitorEvents]) => ({
        visitor,
        events: visitorEvents
          .slice()
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .slice(-8)
      }))
      .sort((a, b) => {
        const aLast =
          a.events[a.events.length - 1]?.created_at || 0;

        const bLast =
          b.events[b.events.length - 1]?.created_at || 0;

        return new Date(bLast) - new Date(aLast);
      })
      .slice(0, 8);

  if (!journeys.length) {
    return `<p style="color:#6b7280;">No journeys tracked yet.</p>`;
  }

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
  const metricsEl =
    document.getElementById("adminMetrics");

  const topPagesEl =
    document.getElementById("adminTopPages");

  const recentEl =
    document.getElementById("adminRecentActivity");

  const journeysEl =
    document.getElementById("adminJourneys");

  if (!metricsEl || !topPagesEl || !recentEl || !journeysEl) {
    return;
  }

  const [
    profilesResult,
    comparisonsResult,
    eventsCountResult,
    recentEventsResult
  ] = await Promise.all([
    requireSupabase()
      .from("profiles")
      .select("*", { count: "exact", head: true }),

    requireSupabase()
      .from("comparisons")
      .select("*", { count: "exact", head: true }),

    requireSupabase()
      .from("analytics_events")
      .select("*", { count: "exact", head: true }),

    requireSupabase()
      .from("analytics_events")
      .select("*")
      .eq("event_type", "page_view")
      .order("created_at", { ascending: false })
      .limit(300)
  ]);

  if (
    profilesResult.error ||
    comparisonsResult.error ||
    eventsCountResult.error ||
    recentEventsResult.error
  ) {
    metricsEl.innerHTML =
      renderAdminSetupMessage(
        profilesResult.error ||
        comparisonsResult.error ||
        eventsCountResult.error ||
        recentEventsResult.error
      );

    topPagesEl.innerHTML = "";
    recentEl.innerHTML = "";
    journeysEl.innerHTML = "";
    return;
  }

  const events =
    recentEventsResult.data || [];

  const uniqueVisitors =
    new Set(
      events
        .map(event => event.email || event.visitor_id)
        .filter(Boolean)
    ).size;

  const loggedInVisits =
    events.filter(event => event.email).length;

  metricsEl.innerHTML = `
    ${renderAdminMetric("Users", profilesResult.count ?? 0)}
    ${renderAdminMetric("Saved Comparisons", comparisonsResult.count ?? 0)}
    ${renderAdminMetric("Total Page Views", eventsCountResult.count ?? 0)}
    ${renderAdminMetric("Recent Unique Visitors", uniqueVisitors)}
    ${renderAdminMetric("Logged-in Visits", loggedInVisits)}
  `;

  topPagesEl.innerHTML =
    renderTopPages(events);

  recentEl.innerHTML =
    renderRecentActivity(events);

  journeysEl.innerHTML =
    renderUserJourneys(events);
}

window.loadAdminAnalytics = loadAdminAnalytics;
