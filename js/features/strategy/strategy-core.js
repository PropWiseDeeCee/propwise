// =============================================
// PROPWISE STRATEGY ENGINE
// =============================================


// =============================================
// FORMATTERS
// =============================================

function formatStrategyCurrency(value) {

  return new Intl.NumberFormat(
    "en-IN",
    {
      maximumFractionDigits: 0
    }
  ).format(
    Math.round(value || 0)
  );
}


// =============================================
// CAGR PROJECTION
// =============================================

function projectFutureValue(
  principal,
  annualRate,
  years
) {

  return principal *
    Math.pow(
      1 + annualRate / 100,
      years
    );
}


// =============================================
// RENTAL YIELD
// =============================================

function calculateRentalYield({

  propertyValue,

  monthlyRent

}) {

  if (
    !propertyValue ||
    propertyValue <= 0
  ) {

    return 0;
  }

  return (

    (
      monthlyRent * 12
    )

    /

    propertyValue

  ) * 100;
}


// =============================================
// KEEP PROPERTY
// =============================================

function calculateKeepScenario(data) {

  const {

    propertyValue,

    monthlyRent,

    annualMaintenance,

    annualPropertyTax,

    projectionYears,

    appreciationRate,

    rentGrowthRate,

    vacancyRate,

    inflationRate

  } = data;

  let totalRentIncome = 0;

  let totalMaintenance = 0;

  let totalPropertyTax = 0;

  let currentRent =
    monthlyRent * 12;

  let currentMaintenance =
    annualMaintenance;

  let currentTax =
    annualPropertyTax;

  for (

    let year = 1;

    year <= projectionYears;

    year++

  ) {

    const netRent =

      currentRent *

      (
        1 -
        vacancyRate / 100
      );

    totalRentIncome +=
      netRent;

    totalMaintenance +=
      currentMaintenance;

    totalPropertyTax +=
      currentTax;

    currentRent *=

      (
        1 +
        rentGrowthRate / 100
      );

    currentMaintenance *=

      (
        1 +
        inflationRate / 100
      );

    currentTax *=

      (
        1 +
        inflationRate / 100
      );
  }

  const futurePropertyValue =

    projectFutureValue(

      propertyValue,

      appreciationRate,

      projectionYears

    );

  const keepWealth =

    futurePropertyValue +

    totalRentIncome -

    totalMaintenance -

    totalPropertyTax;

  return {

    futurePropertyValue,

    totalRentIncome,

    totalMaintenance,

    totalPropertyTax,

    keepWealth

  };
}


// =============================================
// SELL & INVEST
// =============================================

function calculateSellScenario(data) {

  const {

    propertyValue,

    outstandingLoan,

    projectionYears,

    equityReturnRate

  } = data;

  const saleProceeds =

    Math.max(

      propertyValue -
      outstandingLoan,

      0

    );

  const futureInvestmentValue =

    projectFutureValue(

      saleProceeds,

      equityReturnRate,

      projectionYears

    );

  return {

    saleProceeds,

    futureInvestmentValue,

    sellWealth:
      futureInvestmentValue

  };
}


// =============================================
// OPPORTUNITY COST
// =============================================

function calculateOpportunityCost(

  keepWealth,

  sellWealth

) {

  return Math.abs(

    keepWealth -

    sellWealth

  );
}


// =============================================
// MARKET STRENGTH
// =============================================

function calculateMarketStrength(

  cityData,

  strategyRule

) {

  let score = 0;

  if (cityData?.metro) {
    score += 8;
  }

  if (
    Number(
      cityData?.premium_zone_factor || 1
    ) >= 1.10
  ) {
    score += 6;
  }

  if (
    Number(
      cityData?.guidance_value_factor || 1
    ) >= 1.10
  ) {
    score += 6;
  }

  if (
    Number(
      strategyRule?.avg_appreciation_rate || 0
    ) >= 8
  ) {
    score += 5;
  }
  else if (
    Number(
      strategyRule?.avg_appreciation_rate || 0
    ) >= 6
  ) {
    score += 3;
  }

  return Math.min(
    score,
    20
  );
}


// =============================================
// STRATEGY SCORE
// =============================================

function calculateStrategyScore({

  rentalYield,

  appreciationRate,

  keepWealth,

  sellWealth,

  cityData,

  strategyRule

}) {

  let score = 0;

  // Rental Yield (25)

  if (rentalYield >= 4) {

    score += 25;

  } else if (
    rentalYield >= 3
  ) {

    score += 20;

  } else if (
    rentalYield >= 2
  ) {

    score += 15;

  } else {

    score += 10;
  }

  // Appreciation (30)

  if (
    appreciationRate >= 8
  ) {

    score += 30;

  } else if (
    appreciationRate >= 6
  ) {

    score += 25;

  } else if (
    appreciationRate >= 4
  ) {

    score += 20;

  } else {

    score += 10;
  }

  // Wealth Advantage (25)

  const wealthDifference =

    keepWealth -
    sellWealth;

  if (
    wealthDifference > 0
  ) {

    score += 25;

  } else if (
    wealthDifference > -500000
  ) {

    score += 15;

  } else {

    score += 5;
  }

  // Market Strength (20)

  score += calculateMarketStrength(

    cityData,

    strategyRule

  );

  return Math.min(
    score,
    100
  );
}


// =============================================
// STRATEGY GRADE
// =============================================

function getStrategyGrade(score) {

  if (score >= 81)
    return "Excellent Hold";

  if (score >= 61)
    return "Good Hold";

  if (score >= 41)
    return "Neutral";

  return "Sell Candidate";
}


// =============================================
// RECOMMENDATION
// =============================================

function generateRecommendation({

  keepWealth,

  sellWealth

}) {

  if (
    sellWealth <= 0
  ) {

    return {

      action: "KEEP",

      confidence: "High",

      reason:
        "Alternative investment scenario could not be evaluated."

    };
  }

  const differencePercent =

    (

      (
        keepWealth -
        sellWealth
      )

      /

      sellWealth

    ) * 100;

  if (
    differencePercent > 10
  ) {

    return {

      action: "KEEP",

      confidence: "High",

      reason:
        `Holding the property is projected to generate ${differencePercent.toFixed(1)}% more wealth than selling and investing.`

    };
  }

  if (
    differencePercent < -10
  ) {

    return {

      action: "SELL",

      confidence: "High",

      reason:
        `Selling and investing is projected to generate ${Math.abs(differencePercent).toFixed(1)}% more wealth than retaining the property.`

    };
  }

  return {

    action: "NEUTRAL",

    confidence: "Medium",

    reason:
      "Both scenarios generate similar long-term outcomes."

  };
}


// =============================================
// MASTER ANALYSIS
// =============================================

function calculateStrategyAnalysis(data) {

  const {

    state,

    city,

    propertyValue,

    monthlyRent,

    appreciationRate

  } = data;

  const cityData =

    getStrategyCity(
      state,
      city
    ) || {};

  const strategyRule =

    getStrategyRule(
      state,
      city
    ) || {};

  const keepScenario =

    calculateKeepScenario(
      data
    );

  const sellScenario =

    calculateSellScenario(
      data
    );

  const rentalYield =

    calculateRentalYield({

      propertyValue,

      monthlyRent

    });

  const opportunityCost =

    calculateOpportunityCost(

      keepScenario.keepWealth,

      sellScenario.sellWealth

    );

  const strategyScore =

    calculateStrategyScore({

      rentalYield,

      appreciationRate,

      keepWealth:
        keepScenario.keepWealth,

      sellWealth:
        sellScenario.sellWealth,

      cityData,

      strategyRule

    });

  const strategyGrade =

    getStrategyGrade(
      strategyScore
    );

  const recommendation =

    generateRecommendation({

      keepWealth:
        keepScenario.keepWealth,

      sellWealth:
        sellScenario.sellWealth

    });

  return {

    keepScenario,

    sellScenario,

    rentalYield,

    opportunityCost,

    strategyScore,

    strategyGrade,

    recommendation

  };
}


// =============================================
// EXPORTS
// =============================================

window.calculateStrategyAnalysis =
  calculateStrategyAnalysis;

window.calculateKeepScenario =
  calculateKeepScenario;

window.calculateSellScenario =
  calculateSellScenario;

window.calculateStrategyScore =
  calculateStrategyScore;

window.getStrategyGrade =
  getStrategyGrade;

window.generateRecommendation =
  generateRecommendation;

window.formatStrategyCurrency =
  formatStrategyCurrency;