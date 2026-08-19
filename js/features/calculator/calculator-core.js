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

  if (!loanAmount || !tenureYears || interestRate < 0) {

    return {
      emi: 0,
      totalPayment: 0,
      totalInterest: 0
    };
  }

  if (interestRate === 0) {

    const interestFreePayment =
      loanAmount / (tenureYears * 12);

    return {
      emi: interestFreePayment,
      totalPayment: loanAmount,
      totalInterest: 0
    };
  }

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

  monthlyIncome,

  monthlyExpenses = 0,

  existingEmi = 0
) {

  if (!monthlyIncome) {

    return {

      level: "Moderate",

      className: "moderate",

      ratio: 0,

      emiRatio: 0,

      monthlySurplus: 0,

      totalMonthlyDebt: existingEmi + emi
    };
  }

  const ratio =
    ((existingEmi + emi) / monthlyIncome) * 100;

  const affordabilityData = {

    ratio,

    emiRatio:
      (emi / monthlyIncome) * 100,

    monthlySurplus:
      monthlyIncome - monthlyExpenses - existingEmi - emi,

    totalMonthlyDebt:
      existingEmi + emi
  };

  if (ratio <= 35) {

    return {

      level: "Safe",

      className: "safe",

      ...affordabilityData
    };
  }

  if (ratio <= 50) {

    return {

      level: "Moderate",

      className: "moderate",

      ...affordabilityData
    };
  }

  return {

    level: "Risky",

    className: "risky",

    ...affordabilityData
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
    legalCharges,
    brokerage = 0,
    loanProcessingFee = 0,
    movingCosts = 0,
    mortgageCharges = 0,
    utilityDeposits = 0,
    firstYearPropertyTax = 0,
    annualMaintenance = 0,
    monthlyExpenses = 0,
    existingEmi = 0,
    expectedRent = 0,
    appreciationRate = 6

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

    legalCharges +

    brokerage +

    loanProcessingFee +

    movingCosts +

    mortgageCharges +

    utilityDeposits +

    firstYearPropertyTax;

  // =============================================
  // TOTAL PROPERTY COST
  // =============================================

  const purchaseCost =

    basePrice +

    stampDuty +

    registration +

    municipalSurcharge +

    gst +

    hiddenCharges;

  const totalCost =

    purchaseCost +

    interiorEstimate;

  // =============================================
  // LOAN
  // =============================================

  const loanAmount =

  Math.max(

    purchaseCost - downPayment,

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

      monthlyIncome,

      monthlyExpenses,

      existingEmi
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

    hiddenCharges +

    interiorEstimate;

  // =============================================
  // OWNERSHIP COST
  // =============================================

  const fiveYearEMI =
    loanData.emi * 60;

  const fiveYearMaintenance =
    annualMaintenance *
    (1 + 1.1 + Math.pow(1.1, 2) + Math.pow(1.1, 3) + Math.pow(1.1, 4));

  const fiveYearOwnershipCost =

    upfrontCash +

    fiveYearEMI +

    fiveYearMaintenance;

  // =============================================
// INVESTMENT SCORE
// =============================================

const appreciationPercent =
  calculateAppreciationPercent(
    basePrice,

    appreciationRate || 6
  );

const rentalYield =
  expectedRent > 0
    ? (expectedRent * 12 / basePrice) * 100
    : 0;

const investmentScore =
  calculateInvestmentScore({

    ownershipCost:
      fiveYearOwnershipCost,

    emi:
      loanData.emi,

    rentalYield,

    appreciationPercent
  });

const investmentGrade =
  getInvestmentGrade(
    investmentScore
  );

  return {

    stampDuty,

    registration,

    gst,

    municipalSurcharge,

    hiddenCharges,

    fiveYearMaintenance,

    interiorEstimate,

    totalCost,

    purchaseCost,

    loanAmount,

    upfrontCash,

    fiveYearOwnershipCost,

    affordableHousing,

    cityRules,

    resolvedRules,

    ...loanData,

       investmentScore,

      rentalYield,

      appreciationPercent,

    investmentGrade,

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