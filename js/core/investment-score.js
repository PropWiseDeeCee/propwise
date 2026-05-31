// =========================================
// PROPWISE INVESTMENT SCORE ENGINE
// =========================================

function calculateInvestmentScore({

  ownershipCost,
  emi,
  rentalYield,
  appreciationPercent

}) {

  const costScore = Math.max(
    0,
    35 - (ownershipCost / 10000000) * 5
  );

  const yieldScore = Math.min(
    25,
    rentalYield * 5
  );

  const emiScore = Math.max(
    0,
    20 - (emi / 100000) * 10
  );

  const appreciationScore = Math.min(
    20,
    appreciationPercent
  );

  const score =

    costScore +
    yieldScore +
    emiScore +
    appreciationScore;

  return Math.max(
    0,
    Math.min(100, Math.round(score))
  );
}

function getInvestmentGrade(score) {

  if (score >= 85)
    return "Excellent";

  if (score >= 70)
    return "Good";

  if (score >= 55)
    return "Average";

  return "High Risk";
}

function calculateAppreciationPercent(
  basePrice,
  growthRate = 0.06,
  years = 5
) {

  const futureValue =

    basePrice *

    Math.pow(
      1 + growthRate,
      years
    );

  return (

    (
      futureValue -
      basePrice
    )

    /

    basePrice

  ) * 100;
}

window.calculateAppreciationPercent =
  calculateAppreciationPercent;

window.calculateInvestmentScore =
  calculateInvestmentScore;

window.getInvestmentGrade =
  getInvestmentGrade;