// =============================================
// PROPWISE CALCULATOR DATA SERVICE
// =============================================

window.CalculatorRules = {
  states: [],
  cities: [],
  authorities: [],
  propertyRules: [],
  womenConcessions: [],
  gstRules: [],
  config: {}
};

// =============================================
// LOAD ALL MASTER DATA
// =============================================

async function loadCalculatorRules() {

  try {

    const db =
      window.getSupabaseClient();

    if (!db) {

      console.error(
        "Supabase client not initialized"
      );

      return false;
    }

    const [

      statesRes,
      citiesRes,
      authoritiesRes,
      propertyRulesRes,
      womenRes,
      gstRes,
      configRes

    ] = await Promise.all([

      db
        .from("calculator_states")
        .select("*")
        .order("state_name"),

      db
        .from("calculator_cities")
        .select("*"),

      db
        .from("calculator_authorities")
        .select("*"),

      db
        .from("calculator_property_rules")
        .select("*"),

      db
        .from("calculator_women_concessions")
        .select("*"),

      db
        .from("calculator_gst_rules")
        .select("*"),

      db
        .from("calculator_config")
        .select("*")

    ]);

    // =============================================
    // ERROR CHECKING
    // =============================================

    const errors = [

      statesRes.error,
      citiesRes.error,
      authoritiesRes.error,
      propertyRulesRes.error,
      womenRes.error,
      gstRes.error,
      configRes.error

    ].filter(Boolean);

    if (errors.length > 0) {

      console.error(
        "Calculator data fetch errors:",
        errors
      );

      return false;
    }

    // =============================================
    // CONFIG MAP
    // =============================================

    const configMap = {};

    (configRes.data || []).forEach(item => {

      configMap[item.config_key] =
        item.config_value;
    });

    // =============================================
    // GLOBAL DATA STORE
    // =============================================

    window.CalculatorRules = {

      states:
        statesRes.data || [],

      cities:
        citiesRes.data || [],

      authorities:
        authoritiesRes.data || [],

      propertyRules:
        propertyRulesRes.data || [],

      womenConcessions:
        womenRes.data || [],

      gstRules:
        gstRes.data || [],

      config:
        configMap

    };

    console.log(
      "Calculator data loaded successfully"
    );

    console.log(
      "States:",
      window.CalculatorRules.states.length
    );

    console.log(
      "Cities:",
      window.CalculatorRules.cities.length
    );

    return true;

  }

  catch (error) {

    console.error(
      "Calculator load failed:",
      error
    );

    return false;
  }
}

// =============================================
// HELPERS
// =============================================

function getStateByCode(stateCode) {

  return CalculatorRules.states.find(
    state =>
      state.state_code === stateCode
  );
}

function getCitiesByState(stateCode) {

  return CalculatorRules.cities.filter(
    city =>
      city.state_code === stateCode
  );
}

// =============================================
// EXPORTS
// =============================================

window.loadCalculatorRules =
  loadCalculatorRules;

window.getStateByCode =
  getStateByCode;

window.getCitiesByState =
  getCitiesByState;