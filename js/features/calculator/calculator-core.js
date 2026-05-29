// =============================================
// PROPWISE PROPERTY FINANCIAL ENGINE
// =============================================


// =============================================
// FORMATTERS
// =============================================

function formatCurrency(value) {

  return new Intl.NumberFormat(

    "en-IN",

    {

      maximumFractionDigits: 0
    }

  ).format(Math.round(value || 0));
}


// =============================================
// EMI CALCULATION
// =============================================

function calculateLoan(

  loanAmount,

  interestRate,

  tenureYears
) {

  const monthlyRate =
    interestRate / 12 / 100;

  const totalMonths =
    tenureYears * 12;

  const emi =

    (

      loanAmount *

      monthlyRate *

      Math.pow(

        1 + monthlyRate,

        totalMonths
      )

    ) /

    (

      Math.pow(

        1 + monthlyRate,

        totalMonths
      ) - 1
    );

  const totalPayment =
    emi * totalMonths;

  const totalInterest =
    totalPayment - loanAmount;

  return {

    emi,

    totalPayment,

    totalInterest
  };
}


// =============================================
// AFFORDABILITY ENGINE
// =============================================

function getAffordabilityLevel(

  emi,

  monthlyIncome
) {

  if (!monthlyIncome) {

    return {

      level: "Moderate",

      className: "moderate",

      ratio: 0
    };
  }

  const ratio =
    (emi / monthlyIncome) * 100;

  if (ratio <= 35) {

    return {

      level: "Safe",

      className: "safe",

      ratio
    };
  }

  if (ratio <= 50) {

    return {

      level: "Moderate",

      className: "moderate",

      ratio
    };
  }

  return {

    level: "Risky",

    className: "risky",

    ratio
  };
}



// =============================================
// MAIN PROPERTY CALCULATOR
// =============================================

function calculatePropertyFinancials(data) {

  const {

    basePrice,
    downPayment,
    interestRate,
    tenureYears,
    monthlyIncome,
    state,
    city,
    propertyType,
    propertyCategory,
    buyerGender,
    sqft,

    parkingCharges,
    floorRiseCharges,
    clubhouseCharges,
    maintenanceDeposit,
    legalCharges

  } = data;

  // =============================================
  // CITY RULES
  // =============================================

 const cityData =

  CalculatorRules.cities.find(

    cityItem =>

      cityItem.state_code === state

      &&

      cityItem.city_name === city

  )

  ||

  {

    metro: false

  };

const cityRules = {

  metro:
    cityData.metro || false

};

  // =============================================
  // AFFORDABLE HOUSING
  // =============================================

  const affordableHousing =

    isAffordableHousing({

      propertyPrice: basePrice,

      sqft,

      metro: cityRules.metro
    });

  // =============================================
  // RESOLVE RULES
  // =============================================

  const resolvedRules =
    resolvePropertyRules({

      state,
      city,
      propertyPrice: basePrice,
      propertyCategory,
      buyerGender,
      propertyType,
      isAffordableHousing:
        affordableHousing,
      sqft
    });

  // =============================================
  // GOVERNMENT CHARGES
  // =============================================

  const stampDuty =

    basePrice *
    resolvedRules.stampDuty;

  const registration =

    basePrice *
    resolvedRules.registration;

  const municipalSurcharge =

    basePrice *
    resolvedRules
      .municipalSurchargeRate;

  // =============================================
  // GST
  // =============================================

  const gst =

    basePrice *
    resolvedRules.gstRate;

  // =============================================
  // INTERIOR ESTIMATE
  // =============================================

  const interiorEstimate =

    resolvedRules
      .estimatedInteriorCost;

  // =============================================
  // HIDDEN CHARGES
  // =============================================

  const hiddenCharges =

    parkingCharges +

    floorRiseCharges +

    clubhouseCharges +

    maintenanceDeposit +

    legalCharges;

  // =============================================
  // TOTAL PROPERTY COST
  // =============================================

  const totalCost =

    basePrice +

    stampDuty +

    registration +

    municipalSurcharge +

    gst +

    hiddenCharges;

  // =============================================
  // LOAN
  // =============================================

  const loanAmount =

  Math.max(

    totalCost - downPayment,

    0

  );

const loanData =

  loanAmount > 0

    ?

    calculateLoan(

      loanAmount,

      interestRate,

      tenureYears

    )

    :

    {

      emi: 0,

      totalPayment: 0,

      totalInterest: 0

    };

  // =============================================
  // AFFORDABILITY
  // =============================================

  const affordability =
    getAffordabilityLevel(

      loanData.emi,

      monthlyIncome
    );

  // =============================================
  // UPFRONT CASH
  // =============================================

  const upfrontCash =

    downPayment +

    stampDuty +

    registration +

    municipalSurcharge +

    gst +

    hiddenCharges;

  // =============================================
  // OWNERSHIP COST
  // =============================================

  const fiveYearEMI =
    loanData.emi * 60;

  const fiveYearOwnershipCost =

    upfrontCash +

    fiveYearEMI;

  return {

    stampDuty,

    registration,

    gst,

    municipalSurcharge,

    hiddenCharges,

    interiorEstimate,

    totalCost,

    loanAmount,

    upfrontCash,

    fiveYearOwnershipCost,

    affordableHousing,

    cityRules,

    resolvedRules,

    ...loanData,

    affordability
  };
}


// =============================================
// GLOBAL EXPORTS
// =============================================

window.formatCurrency =
  formatCurrency;

window.calculateLoan =
  calculateLoan;

window.calculatePropertyFinancials =
  calculatePropertyFinancials;

window.getAffordabilityLevel =
  getAffordabilityLevel;