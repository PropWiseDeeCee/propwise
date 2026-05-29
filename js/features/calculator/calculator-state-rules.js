// =============================================
// PROPWISE DATABASE RULE ENGINE
// =============================================


// =============================================
// CONFIG HELPER
// =============================================

function getConfigValue(
  key,
  defaultValue = 0
) {

  return Number(

    CalculatorRules.config[key]

  ) || defaultValue;
}


// =============================================
// AFFORDABLE HOUSING
// =============================================

function isAffordableHousing({

  propertyPrice,
  sqft,
  metro

}) {

  const metroMaxPrice =

    getConfigValue(
      "metro_max_price",
      4500000
    );

  const metroMaxSqft =

    getConfigValue(
      "metro_max_sqft",
      645
    );

  const nonMetroMaxPrice =

    getConfigValue(
      "non_metro_max_price",
      4500000
    );

  const nonMetroMaxSqft =

    getConfigValue(
      "non_metro_max_sqft",
      968
    );

  if (metro) {

    return (

      propertyPrice <= metroMaxPrice

      &&

      sqft <= metroMaxSqft

    );
  }

  return (

    propertyPrice <= nonMetroMaxPrice

    &&

    sqft <= nonMetroMaxSqft

  );
}


// =============================================
// STATE LOOKUP
// =============================================

function getStateData(stateCode) {

  return CalculatorRules.states.find(

    state =>

      state.state_code ===
      stateCode

  );
}


// =============================================
// CITY LOOKUP
// =============================================

function getCityData(

  stateCode,
  cityName

) {

  return CalculatorRules.cities.find(

    city =>

      city.state_code ===
      stateCode

      &&

      city.city_name ===
      cityName

  );
}


// =============================================
// AUTHORITY LOOKUP
// =============================================

function getAuthorityData(

  stateCode,
  authorityCode

) {

  return CalculatorRules.authorities.find(

    authority =>

      authority.state_code ===
      stateCode

      &&

      authority.authority_code ===
      authorityCode

  );
}


// =============================================
// WOMEN CONCESSION LOOKUP
// =============================================

function getWomenConcession(
  stateCode
) {

  return CalculatorRules
    .womenConcessions
    .find(

      item =>

        item.state_code ===
        stateCode

    );
}


// =============================================
// PROPERTY RULE LOOKUP
// =============================================

function getPropertyRule({

  stateCode,
  propertyCategory,
  slabType

}) {

  return CalculatorRules
    .propertyRules
    .find(

      rule =>

        rule.state_code ===
        stateCode

        &&

        rule.property_category ===
        propertyCategory

        &&

        rule.slab_type ===
        slabType

    );
}


// =============================================
// GST LOOKUP
// =============================================

function getGstRule({

  propertyType,
  affordableHousing

}) {

  return CalculatorRules
    .gstRules
    .find(

      gst =>

        gst.property_type ===
        propertyType

        &&

        gst.affordable_housing ===
        affordableHousing

    );
}


// =============================================
// PROPERTY RULE RESOLVER
// =============================================

function resolvePropertyRules({

  state,
  city,
  propertyPrice,
  propertyCategory,
  buyerGender,
  propertyType,
  isAffordableHousing,
  sqft = 0

}) {

  // =============================================
  // STATE
  // =============================================

  const stateData =

    getStateData(state)

    ||

    {

      state_name:
        "Other States"

    };

  // =============================================
  // CITY
  // =============================================

  const cityData =

    getCityData(
      state,
      city
    )

    ||

    {

      metro: false,

      authority_code:
        "DEFAULT",

      luxury_threshold:
        10000000,

      premium_zone_factor:
        1,

      parking_premium_factor:
        1,

      interior_cost_per_sqft:
        1800,

      guidance_value_factor:
        1

    };

  // =============================================
  // AUTHORITY
  // =============================================

  const authorityData =

    getAuthorityData(

      state,

      cityData.authority_code

    )

    ||

    {

      municipal_surcharge:
        0,

      guidance_multiplier:
        1

    };

  // =============================================
  // WOMEN CONCESSION
  // =============================================

  const womenConcession =

    getWomenConcession(
      state
    );

  // =============================================
  // LUXURY CHECK
  // =============================================

  const isLuxury =

    propertyPrice >=

    (
      cityData
        .luxury_threshold
      || 10000000
    );

  // =============================================
  // PROPERTY RULE
  // =============================================

  const slabType =

    propertyCategory ===
    "agricultural"

      ? "standard"

      : isLuxury

        ? "luxury"

        : "standard";

  const propertyRule =

    getPropertyRule({

      stateCode: state,

      propertyCategory,

      slabType

    })

    ||

    {

      stamp_duty: 0.05,

      registration: 0.01

    };

  // =============================================
  // STAMP DUTY
  // =============================================

  let stampDuty =

    Number(
      propertyRule.stamp_duty
    ) || 0;

  if (

    buyerGender ===
    "female"

    &&

    womenConcession
      ?.enabled

  ) {

    stampDuty -=

      Number(
        womenConcession.discount
      ) || 0;
  }

  // =============================================
  // GST
  // =============================================

  const gstRule =

    getGstRule({

      propertyType,

      affordableHousing:
        isAffordableHousing

    });

  const gstRate =

    gstRule

      ? Number(
          gstRule.gst_rate
        )

      : 0;

  // =============================================
  // CALCULATIONS
  // =============================================

  const effectiveGuidanceFactor =

    (
      authorityData
        .guidance_multiplier
      || 1
    )

    *

    (
      cityData
        .guidance_value_factor
      || 1
    );

  const estimatedGuidanceValue =

    propertyPrice *

    effectiveGuidanceFactor;

  const municipalSurchargeRate =

    authorityData
      .municipal_surcharge

    || 0;

  const estimatedInteriorCost =

    sqft *

    (
      cityData
        .interior_cost_per_sqft
      || 1800
    );

  const premiumAdjustedValue =

    propertyPrice *

    (
      cityData
        .premium_zone_factor
      || 1
    );

  // =============================================
  // RETURN
  // =============================================

  return {

    stateName:
      stateData.state_name,

    cityRules: {

      metro:
        cityData.metro,

      authority:
        cityData.authority_code,

      luxuryThreshold:
        cityData.luxury_threshold,

      premiumZoneFactor:
        cityData.premium_zone_factor,

      parkingPremiumFactor:
        cityData.parking_premium_factor,

      interiorCostPerSqft:
        cityData.interior_cost_per_sqft,

      guidanceValueFactor:
        cityData.guidance_value_factor

    },

    authorityRules: {

      municipalSurcharge:
        municipalSurchargeRate,

      guidanceMultiplier:
        authorityData
          .guidance_multiplier || 1

    },

    stampDuty,

    registration:

      Number(
        propertyRule.registration
      ) || 0,

    gstRate,

    municipalSurchargeRate,

    estimatedGuidanceValue,

    estimatedInteriorCost,

    premiumAdjustedValue,

    effectiveGuidanceFactor,

    isLuxury

  };
}


// =============================================
// EXPORTS
// =============================================

window.resolvePropertyRules =
  resolvePropertyRules;

window.isAffordableHousing =
  isAffordableHousing;

window.getConfigValue =
  getConfigValue;