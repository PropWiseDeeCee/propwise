// ==============================
// PROPERTY CALCULATOR CORE
// ==============================

function calculateLoan(
  propertyCost,
  downPayment,
  interestRate,
  tenureYears
) {

  const principal =
    propertyCost - downPayment;

  const monthlyRate =
    interestRate / 12 / 100;

  const totalMonths =
    tenureYears * 12;

  const emi =
    (
      principal *
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
    totalPayment - principal;

  return {

    principal,

    emi:
      Math.round(emi),

    totalPayment:
      Math.round(totalPayment),

    totalInterest:
      Math.round(totalInterest)
  };
}


// ==============================
// GLOBAL EXPORTS
// ==============================

window.calculateLoan =
  calculateLoan;