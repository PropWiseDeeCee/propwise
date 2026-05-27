// =============================================
// PROPWISE INDIA
// ADVANCED PROPERTY RULE ENGINE
// =============================================


// =============================================
// GST RULES
// =============================================

const GST_RULES = {

  underConstruction: {

    standard: 0.05,

    affordable: 0.01
  },

  readyToMove: 0,

  resale: 0
};


// =============================================
// AFFORDABLE HOUSING RULES
// =============================================

const AFFORDABLE_HOUSING_RULES = {

  metroMaxPrice: 4500000,

  nonMetroMaxPrice: 4500000,

  metroMaxSqft: 645,

  nonMetroMaxSqft: 968
};


// =============================================
// INDIA PROPERTY RULE DATABASE
// =============================================

const PROPERTY_STATE_RULES = {

  // =============================================
  // KARNATAKA
  // =============================================

  KA: {

    code: "KA",

    name: "Karnataka",

    authorityRules: {

      BBMP: {

        municipalSurcharge: 0.01,

        guidanceMultiplier: 1.15
      },

      BDA: {

        municipalSurcharge: 0.008,

        guidanceMultiplier: 1.10
      }
    },

    cities: {

      Bangalore: {

        metro: true,

        luxuryThreshold: 10000000,

        authority: "BBMP",

        premiumZoneFactor: 1.12,

        parkingPremiumFactor: 1.15,

        interiorCostPerSqft: 2400,

        guidanceValueFactor: 1.18
      },

      Mysore: {

        metro: false,

        luxuryThreshold: 7000000,

        authority: "BDA",

        premiumZoneFactor: 1.03,

        parkingPremiumFactor: 1.05,

        interiorCostPerSqft: 1600,

        guidanceValueFactor: 1.04
      }
    },

    residential: {

      standard: {

        stampDuty: 0.05,

        registration: 0.01
      },

      luxury: {

        stampDuty: 0.06,

        registration: 0.01
      }
    },

    agricultural: {

      stampDuty: 0.05,

      registration: 0.01
    },

    womenConcession: {

      enabled: false,

      discount: 0
    }
  },


  // =============================================
  // DELHI
  // =============================================

  DL: {

    code: "DL",

    name: "Delhi",

    authorityRules: {

      DDA: {

        municipalSurcharge: 0.01,

        guidanceMultiplier: 1.20
      },

      MCD: {

        municipalSurcharge: 0.008,

        guidanceMultiplier: 1.12
      }
    },

    cities: {

      "New Delhi": {

        metro: true,

        luxuryThreshold: 20000000,

        authority: "DDA",

        premiumZoneFactor: 1.25,

        parkingPremiumFactor: 1.22,

        interiorCostPerSqft: 3200,

        guidanceValueFactor: 1.28
      }
    },

    residential: {

      standard: {

        stampDuty: 0.06,

        registration: 0.01
      },

      luxury: {

        stampDuty: 0.07,

        registration: 0.01
      }
    },

    agricultural: {

      stampDuty: 0.05,

      registration: 0.01
    },

    womenConcession: {

      enabled: true,

      discount: 0.01
    }
  },


  // =============================================
  // HARYANA
  // =============================================

  HR: {

    code: "HR",

    name: "Haryana",

    authorityRules: {

      HUDA: {

        municipalSurcharge: 0.01,

        guidanceMultiplier: 1.16
      }
    },

    cities: {

      Gurgaon: {

        metro: true,

        luxuryThreshold: 15000000,

        authority: "HUDA",

        premiumZoneFactor: 1.20,

        parkingPremiumFactor: 1.18,

        interiorCostPerSqft: 2800,

        guidanceValueFactor: 1.22
      }
    },

    residential: {

      standard: {

        stampDuty: 0.06,

        registration: 0.01
      },

      luxury: {

        stampDuty: 0.07,

        registration: 0.01
      }
    },

    agricultural: {

      stampDuty: 0.05,

      registration: 0.01
    },

    womenConcession: {

      enabled: true,

      discount: 0.02
    }
  },


  // =============================================
  // MAHARASHTRA
  // =============================================

  MH: {

    code: "MH",

    name: "Maharashtra",

    authorityRules: {

      BMC: {

        municipalSurcharge: 0.012,

        guidanceMultiplier: 1.30
      },

      PMC: {

        municipalSurcharge: 0.009,

        guidanceMultiplier: 1.16
      }
    },

    cities: {

      Mumbai: {

        metro: true,

        luxuryThreshold: 25000000,

        authority: "BMC",

        premiumZoneFactor: 1.35,

        parkingPremiumFactor: 1.30,

        interiorCostPerSqft: 4500,

        guidanceValueFactor: 1.40
      },

      Pune: {

        metro: true,

        luxuryThreshold: 14000000,

        authority: "PMC",

        premiumZoneFactor: 1.15,

        parkingPremiumFactor: 1.12,

        interiorCostPerSqft: 2400,

        guidanceValueFactor: 1.18
      }
    },

    residential: {

      standard: {

        stampDuty: 0.06,

        registration: 0.01
      },

      luxury: {

        stampDuty: 0.07,

        registration: 0.01
      }
    },

    agricultural: {

      stampDuty: 0.05,

      registration: 0.01
    },

    womenConcession: {

      enabled: true,

      discount: 0.01
    }
  },


  // =============================================
  // TAMIL NADU
  // =============================================

  TN: {

    code: "TN",

    name: "Tamil Nadu",

    authorityRules: {

      CMDA: {

        municipalSurcharge: 0.009,

        guidanceMultiplier: 1.12
      }
    },

    cities: {

      Chennai: {

        metro: true,

        luxuryThreshold: 15000000,

        authority: "CMDA",

        premiumZoneFactor: 1.18,

        parkingPremiumFactor: 1.12,

        interiorCostPerSqft: 2600,

        guidanceValueFactor: 1.20
      }
    },

    residential: {

      standard: {

        stampDuty: 0.07,

        registration: 0.04
      },

      luxury: {

        stampDuty: 0.08,

        registration: 0.04
      }
    },

    agricultural: {

      stampDuty: 0.07,

      registration: 0.04
    },

    womenConcession: {

      enabled: false,

      discount: 0
    }
  },


  // =============================================
  // TELANGANA
  // =============================================

  TS: {

    code: "TS",

    name: "Telangana",

    authorityRules: {

      GHMC: {

        municipalSurcharge: 0.008,

        guidanceMultiplier: 1.14
      }
    },

    cities: {

      Hyderabad: {

        metro: true,

        luxuryThreshold: 15000000,

        authority: "GHMC",

        premiumZoneFactor: 1.16,

        parkingPremiumFactor: 1.14,

        interiorCostPerSqft: 2400,

        guidanceValueFactor: 1.18
      }
    },

    residential: {

      standard: {

        stampDuty: 0.04,

        registration: 0.01
      },

      luxury: {

        stampDuty: 0.05,

        registration: 0.01
      }
    },

    agricultural: {

      stampDuty: 0.04,

      registration: 0.01
    },

    womenConcession: {

      enabled: false,

      discount: 0
    }
  },


  // =============================================
  // UTTAR PRADESH
  // =============================================

  UP: {

    code: "UP",

    name: "Uttar Pradesh",

    authorityRules: {

      NOIDA: {

        municipalSurcharge: 0.01,

        guidanceMultiplier: 1.18
      },

      GNIDA: {

        municipalSurcharge: 0.011,

        guidanceMultiplier: 1.22
      }
    },

    cities: {

      Noida: {

        metro: true,

        luxuryThreshold: 14000000,

        authority: "NOIDA",

        premiumZoneFactor: 1.15,

        parkingPremiumFactor: 1.14,

        interiorCostPerSqft: 2200,

        guidanceValueFactor: 1.20
      },

      "Greater Noida": {

        metro: true,

        luxuryThreshold: 12000000,

        authority: "GNIDA",

        premiumZoneFactor: 1.12,

        parkingPremiumFactor: 1.10,

        interiorCostPerSqft: 2000,

        guidanceValueFactor: 1.14
      }
    },

    residential: {

      standard: {

        stampDuty: 0.07,

        registration: 0.01
      },

      luxury: {

        stampDuty: 0.08,

        registration: 0.01
      }
    },

    agricultural: {

      stampDuty: 0.06,

      registration: 0.01
    },

    womenConcession: {

      enabled: true,

      discount: 0.01
    }
  },


  // =============================================
  // OTHER STATES / UT
  // =============================================

  OTHER: {

    code: "OTHER",

    name: "Other States / UT",

    authorityRules: {

      DEFAULT: {

        municipalSurcharge: 0.005,

        guidanceMultiplier: 1.05
      }
    },

    cities: {},

    residential: {

      standard: {

        stampDuty: 0.06,

        registration: 0.01
      },

      luxury: {

        stampDuty: 0.07,

        registration: 0.01
      }
    },

    agricultural: {

      stampDuty: 0.05,

      registration: 0.01
    },

    womenConcession: {

      enabled: false,

      discount: 0
    }
  }
};


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

  const stateRules =

    PROPERTY_STATE_RULES[state]

    ||

    PROPERTY_STATE_RULES.OTHER;

  // =============================================
  // CITY RULES
  // =============================================

  const cityRules =

    stateRules.cities[city]

    ||

    {

      metro: false,

      authority: "DEFAULT",

      luxuryThreshold: 10000000,

      premiumZoneFactor: 1,

      parkingPremiumFactor: 1,

      interiorCostPerSqft: 1800,

      guidanceValueFactor: 1
    };

  // =============================================
  // AUTHORITY RULES
  // =============================================

  const authorityRules =

    stateRules.authorityRules[
      cityRules.authority
    ]

    ||

    stateRules.authorityRules.DEFAULT

    ||

    {

      municipalSurcharge: 0,

      guidanceMultiplier: 1
    };

  // =============================================
  // PROPERTY CATEGORY RULES
  // =============================================

  let categoryRules;

  if (
    propertyCategory ===
    "agricultural"
  ) {

    categoryRules =
      stateRules.agricultural;
  }

  else {

    const isLuxury =

      propertyPrice >=
      cityRules.luxuryThreshold;

    categoryRules =

      isLuxury

        ?

        stateRules
          .residential
          .luxury

        :

        stateRules
          .residential
          .standard;
  }

  // =============================================
  // WOMEN CONCESSION
  // =============================================

  let stampDuty =
    categoryRules.stampDuty;

  if (

    buyerGender === "female"

    &&

    stateRules
      .womenConcession
      .enabled

  ) {

    stampDuty -=

      stateRules
        .womenConcession
        .discount;
  }

  // =============================================
  // GST LOGIC
  // =============================================

  let gstRate = 0;

  if (
    propertyType ===
    "under_construction"
  ) {

    gstRate =

      isAffordableHousing

        ?

        GST_RULES
          .underConstruction
          .affordable

        :

        GST_RULES
          .underConstruction
          .standard;
  }

  // =============================================
  // GUIDANCE VALUE LOGIC
  // =============================================

  const effectiveGuidanceFactor =

    authorityRules.guidanceMultiplier *

    cityRules.guidanceValueFactor;

  const estimatedGuidanceValue =

    propertyPrice *
    effectiveGuidanceFactor;

  // =============================================
  // MUNICIPAL SURCHARGE
  // =============================================

  const municipalSurchargeRate =

    authorityRules
      .municipalSurcharge;

  // =============================================
  // INTERIOR ESTIMATE
  // =============================================

  const estimatedInteriorCost =

    sqft *
    cityRules.interiorCostPerSqft;

  // =============================================
  // PREMIUM ZONE ADJUSTMENT
  // =============================================

  const premiumAdjustedValue =

    propertyPrice *
    cityRules.premiumZoneFactor;

  return {

    stateName:
      stateRules.name,

    cityRules,

    authorityRules,

    stampDuty,

    registration:
      categoryRules.registration,

    gstRate,

    municipalSurchargeRate,

    estimatedGuidanceValue,

    estimatedInteriorCost,

    premiumAdjustedValue,

    effectiveGuidanceFactor,

    isLuxury:

      propertyPrice >=
      cityRules.luxuryThreshold
  };
}


// =============================================
// GLOBAL EXPORTS
// =============================================

window.PROPERTY_STATE_RULES =
  PROPERTY_STATE_RULES;

window.resolvePropertyRules =
  resolvePropertyRules;

window.GST_RULES =
  GST_RULES;

window.AFFORDABLE_HOUSING_RULES =
  AFFORDABLE_HOUSING_RULES;