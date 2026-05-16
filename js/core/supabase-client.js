// ==============================
// SUPABASE CLIENT
// ==============================

let supabaseClient = null;

function initSupabase() {
  if (!window.supabase) {
    console.error("Supabase SDK not loaded");
    return null;
  }

  if (
    !window.PROPWISE_CONFIG?.SUPABASE?.URL ||
    !window.PROPWISE_CONFIG?.SUPABASE?.ANON_KEY
  ) {
    console.warn("Supabase config not loaded");
    return null;
  }

  if (!supabaseClient) {
    supabaseClient =
      window.supabase.createClient(
        window.PROPWISE_CONFIG.SUPABASE.URL,
        window.PROPWISE_CONFIG.SUPABASE.ANON_KEY
      );
  }

  return supabaseClient;
}

function getSupabaseClient() {
  return supabaseClient;
}

window.initSupabase = initSupabase;
window.getSupabaseClient = getSupabaseClient;
