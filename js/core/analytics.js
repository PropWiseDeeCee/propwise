// ==============================
// ANALYTICS
// ==============================

async function trackPageView() {
  try {
    const client =
      window.getSupabaseClient?.();

    if (!client) return;

    const user =
      await getUser();

    await client
      .from("analytics_events")
      .insert([
        {
          user_id: user?.id || null,
          email: user?.email || null,
          visitor_id: getVisitorId(),
          event_type: "page_view",
          page_path: window.location.pathname,
          page_title: document.title,
          referrer: document.referrer || null,
          timezone:
            Intl.DateTimeFormat()
              .resolvedOptions()
              .timeZone,
          locale: navigator.language,
          device_type:
            window.innerWidth < 768
              ? "mobile"
              : "desktop",
          user_agent: navigator.userAgent
        }
      ]);

  } catch (error) {
    console.error("Track page view failed:", error);
  }
}

function getVisitorId() {
  const key = "propwise_visitor_id";
  let visitorId =
    localStorage.getItem(key);

  if (!visitorId) {
    visitorId =
      crypto.randomUUID?.() ||
      `${Date.now()}-${Math.random()}`;

    localStorage.setItem(key, visitorId);
  }

  return visitorId;
}

window.trackPageView = trackPageView;
window.getVisitorId = getVisitorId;
