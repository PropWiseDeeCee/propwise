// =============================================
// PROPWISE STRATEGY DATA SERVICE
// =============================================

window.StrategyRules = {

  states: [],

  cities: [],

  strategyRules: []
};


// =============================================
// LOAD STRATEGY MASTER DATA
// =============================================

async function loadStrategyRules() {

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

      strategyRes

    ] = await Promise.all([

      db
        .from("calculator_states")
        .select("*")
        .order("state_name"),

      db
        .from("calculator_cities")
        .select("*"),

      db
        .from("property_strategy_rules")
        .select("*")

    ]);

    // =========================================
    // ERROR CHECKING
    // =========================================

    const errors = [

      statesRes.error,

      citiesRes.error,

      strategyRes.error

    ].filter(Boolean);

    if (errors.length > 0) {

      console.error(
        "Strategy data fetch errors:",
        errors
      );

      return false;
    }

    // =========================================
    // GLOBAL STORE
    // =========================================

    window.StrategyRules = {

      states:
        statesRes.data || [],

      cities:
        citiesRes.data || [],

      strategyRules:
        strategyRes.data || []

    };

    console.log(
      "Strategy rules loaded"
    );

    console.log(
      "States:",
      StrategyRules.states.length
    );

    console.log(
      "Cities:",
      StrategyRules.cities.length
    );

    console.log(
      "Strategy Rules:",
      StrategyRules.strategyRules.length
    );

    return true;

  }

  catch (error) {

    console.error(
      "Strategy load failed:",
      error
    );

    return false;
  }
}


// =============================================
// STATE HELPERS
// =============================================

function getStrategyState(
  stateCode
) {

  return StrategyRules.states.find(

    state =>

      state.state_code ===
      stateCode

  );
}


// =============================================
// CITY HELPERS
// =============================================

function getStrategyCities(
  stateCode
) {

  return StrategyRules.cities.filter(

    city =>

      city.state_code ===
      stateCode

  );
}


function getStrategyCity(
  stateCode,
  cityName
) {

  return StrategyRules.cities.find(

    city =>

      city.state_code ===
      stateCode

      &&

      city.city_name ===
      cityName

  );
}


// =============================================
// STRATEGY RULE LOOKUP
// =============================================

function getStrategyRule(
  stateCode,
  cityName
) {

  return StrategyRules.strategyRules.find(

    rule =>

      rule.state_code ===
      stateCode

      &&

      rule.city_name ===
      cityName

  );
}


// =============================================
// DEFAULT ASSUMPTIONS
// =============================================

function getStrategyAssumptions(
  stateCode,
  cityName
) {

  const rule =
    getStrategyRule(
      stateCode,
      cityName
    );

  if (!rule) {

    return {

      avg_appreciation_rate: 6,

      avg_rental_yield: 3,

      rent_growth_rate: 5,

      vacancy_rate: 3,

      maintenance_inflation: 5,

      equity_return_rate: 12,

      debt_return_rate: 7,

      inflation_rate: 6,

      sell_threshold_score: 50,

      keep_threshold_score: 50

    };
  }

  return rule;
}


// =============================================
// DROPDOWN HELPERS
// =============================================

function populateStrategyStates(
  dropdownId
) {

  const dropdown =

    document.getElementById(
      dropdownId
    );

  if (!dropdown) return;

  dropdown.innerHTML =

    '<option value="">Select State</option>';

  StrategyRules.states

    .sort((a, b) =>

      a.state_name.localeCompare(
        b.state_name
      )

    )

    .forEach(state => {

      dropdown.innerHTML += `

        <option value="${state.state_code}">
          ${state.state_name}
        </option>

      `;
    });
}


function populateStrategyCities(

  stateDropdownId,

  cityDropdownId

) {

  const stateDropdown =

    document.getElementById(
      stateDropdownId
    );

  const cityDropdown =

    document.getElementById(
      cityDropdownId
    );

  if (

    !stateDropdown ||

    !cityDropdown

  ) {

    return;
  }

  const stateCode =
    stateDropdown.value;

  cityDropdown.innerHTML =

    '<option value="">Select City</option>';

  if (!stateCode) {

    cityDropdown.innerHTML =

      '<option value="">Select State First</option>';

    return;
  }

  StrategyRules.cities

    .filter(city =>

      city.state_code ===
      stateCode

    )

    .sort((a, b) =>

      a.city_name.localeCompare(
        b.city_name
      )

    )

    .forEach(city => {

      cityDropdown.innerHTML += `

        <option value="${city.city_name}">
          ${city.city_name}
        </option>

      `;
    });
}


// =============================================
// EXPORTS
// =============================================

window.loadStrategyRules =
  loadStrategyRules;

window.getStrategyState =
  getStrategyState;

window.getStrategyCity =
  getStrategyCity;

window.getStrategyCities =
  getStrategyCities;

window.getStrategyRule =
  getStrategyRule;

window.getStrategyAssumptions =
  getStrategyAssumptions;

window.populateStrategyStates =
  populateStrategyStates;

window.populateStrategyCities =
  populateStrategyCities;