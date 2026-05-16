// ==========================================
// PropWise Global Configuration
// ==========================================

window.PROPWISE_CONFIG = {

  APP_NAME: "PropWise India",

  API: {
    BASE_URL:
      "https://propwise-backend-0b32.onrender.com",

    TIMEOUT: 90000
  },

  SUPABASE: {
    URL:
      "https://YOUR_PROJECT.supabase.co",

    ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3bGdqc2Zob2VpanB5dXNqdGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3ODUzMTEsImV4cCI6MjA5MzM2MTMxMX0.NnLZJxpBGC-m5Rr7nrgYQsHm0ptJdK4TtUMVjykvixw"
  },

  STORAGE_KEYS: {
    REPORT_DATA: "propwise_report_data",
    USER_SESSION: "propwise_user_session",
    COMPARE_DATA: "propwise_compare_data"
  },

  FEATURES: {
    ENABLE_ANALYTICS: true,
    ENABLE_PDF_EXPORT: true
  }
};