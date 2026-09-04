// ==============================
// HELPERS
// ==============================

function getCompareValue(id) {

  const raw =
    document.getElementById(id)?.value || "0";

  return Number(
    raw.replace(/,/g, "")
  );
}

function formatCurrency(value) {

  return `₹${Math.round(value)
    .toLocaleString("en-IN")}`;
}

function formatNumberInput(input) {

  input.addEventListener("input", e => {

    let value =
      e.target.value.replace(/,/g, "");

    if (!value) return;

    if (isNaN(value)) return;

    const parts = value.split(".");

    parts[0] =
      Number(parts[0])
      .toLocaleString("en-IN");

    e.target.value =
      parts.join(".");
  });
}

// ==============================
// AUTO FORMAT
// ==============================

window.addEventListener(
  "DOMContentLoaded",
  () => {

    document
      .querySelectorAll(
        'input[inputmode="numeric"]'
      )
      .forEach(input => {

        formatNumberInput(input);
      });

    loadSavedComparison();
  }
);

// ==============================
// LOCAL STORAGE
// ==============================

function autoSaveComparison() {

  const fields = {};

  document
    .querySelectorAll("input")
    .forEach(input => {

      fields[input.id] =
        input.value;
    });

  localStorage.setItem(
    "compareDraft",
    JSON.stringify(fields)
  );
}

function loadSavedComparison() {

  const saved =
    JSON.parse(
      localStorage.getItem(
        "compareDraft"
      )
    );

  if (!saved) return;

  Object.keys(saved).forEach(id => {

    const input =
      document.getElementById(id);

    if (input) {

      input.value = saved[id];
    }
  });
}

document.addEventListener(
  "input",
  autoSaveComparison
);

// ==============================
// GLOBALS
// ==============================

let totalA = 0;
let totalB = 0;

// ==============================
// EMI CALCULATOR
// ==============================

function calculateEMI(
  principal,
  annualRate,
  years
) {

  if (
    !principal ||
    !annualRate ||
    !years
  ) {

    return 0;
  }

  const monthlyRate =
    annualRate / 12 / 100;

  const months =
    years * 12;

  const emi =
    principal *
    monthlyRate *
    Math.pow(
      1 + monthlyRate,
      months
    ) /
    (
      Math.pow(
        1 + monthlyRate,
        months
      ) - 1
    );

  return Math.round(emi);
}

// ==============================
// MAINTENANCE
// ==============================

function calculateFiveYearMaintenance(
  initial
) {

  let total = 0;

  let current = initial;

  for (let i = 0; i < 5; i++) {

    total += current;

    current *= 1.1;
  }

  return Math.round(total);
}

// ==============================
// APPRECIATION
// ==============================

function calculateFutureValue(
  value,
  rate = 0.06,
  years = 5
) {

  return Math.round(
    value * Math.pow(
      1 + rate,
      years
    )
  );
}

// ==============================
// VALIDATION WITH ERROR MESSAGES
// ==============================

function showValidationError(id, message) {

  const input =
    document.getElementById(id);

  if (!input) return;

  input.classList.add("invalid");
  input.style.borderColor = "#dc2626";

  // Create or update error message
  let errorDiv =
    document.getElementById(
      `${id}ErrorMsg`
    );

  if (!errorDiv) {

    errorDiv =
      document.createElement("div");

    errorDiv.id = `${id}ErrorMsg`;
    errorDiv.className = "form-error-message";
    errorDiv.style.cssText = `
      color: #dc2626;
      font-size: 12px;
      margin-top: 4px;
      display: block;
      font-weight: 500;
    `;

    input.parentNode.appendChild(
      errorDiv
    );
  }

  errorDiv.textContent = message;
  errorDiv.style.display = "block";

  // Expand section
  const section =
    input?.closest("details");

  if (section) {
    section.open = true;
  }
}

function clearValidationErrors() {

  document
    .querySelectorAll(
      ".form-error-message"
    )
    .forEach(error => {

      error.style.display = "none";
    });

  document
    .querySelectorAll("input, select")
    .forEach(input => {

      input.classList.remove("invalid");
      input.style.borderColor = "";
    });
}

function validateComparisonInputs() {

  clearValidationErrors();

  let isValid = true;
  const errors = [];

  // Validation rules
  const validations = [
    { id: "aName", msg: "Property A name required" },
    { id: "aState", msg: "Select state for Property A" },
    { id: "aCity", msg: "Select city for Property A" },
    { id: "aPropertyType", msg: "Select property type for Property A" },
    { id: "aPropertyCategory", msg: "Select category for Property A" },
    { id: "aBase", msg: "Enter property price for Property A" },
    { id: "bName", msg: "Property B name required" },
    { id: "bState", msg: "Select state for Property B" },
    { id: "bCity", msg: "Select city for Property B" },
    { id: "bPropertyType", msg: "Select property type for Property B" },
    { id: "bPropertyCategory", msg: "Select category for Property B" },
    { id: "bBase", msg: "Enter property price for Property B" }
  ];

  validations.forEach(({ id, msg }) => {

    const input =
      document.getElementById(id);

    if (
      !input ||
      !input.value ||
      !input.value.toString().trim()
    ) {

      showValidationError(id, msg);
      errors.push(msg);
      isValid = false;
    }
  });

  // Show toast with first error if any
  if (errors.length > 0) {
    if (typeof Toast !== "undefined") {
      Toast.error(errors[0]);
    }
  }

  return isValid;
}

// ==============================
// MAIN COMPARISON
// ==============================

async function compareAdvanced() {

  const btn =
    document.getElementById(
      "compareBtn"
    );

  btn.disabled = true;
  btn.innerText = "Analyzing...";

  if (!validateComparisonInputs()) {

    btn.disabled = false;
    btn.innerText =
      "Compare Properties";

    // Scroll to first error
    setTimeout(() => {
      const invalidField =
        document.querySelector(
          ".form-input.invalid"
        );

      if (invalidField) {
        invalidField.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    }, 100);

    return;
  }

  try {


// PROPERTY A

const aName =
  document.getElementById("aName").value;

const aState =
  document.getElementById("aState").value;

const aCity =
  document.getElementById("aCity").value;

const aType =
  document.getElementById("aPropertyType").value;

const aCategory =
  document.getElementById("aPropertyCategory").value;

const aBase =
  getCompareValue("aBase");

const aSqft =
  getCompareValue("aSuperArea");

const aRent =
  getCompareValue("aRent");

const aMaintenance =
  getCompareValue("aMaintenance");

const aLoan =
  getCompareValue("aLoan");

const aInterest =
  Number(
    document.getElementById("aInterest").value || 0
  );

const aTenure =
  Number(
    document.getElementById("aTenure").value || 0
  );

// PROPERTY B

const bName =
  document.getElementById("bName").value;

const bState =
  document.getElementById("bState").value;

const bCity =
  document.getElementById("bCity").value;

const bType =
  document.getElementById("bPropertyType").value;

const bCategory =
  document.getElementById("bPropertyCategory").value;

const bBase =
  getCompareValue("bBase");

const bSqft =
  getCompareValue("bSuperArea");

const bRent =
  getCompareValue("bRent");

const bMaintenance =
  getCompareValue("bMaintenance");

const bLoan =
  getCompareValue("bLoan");

const bInterest =
  Number(
    document.getElementById("bInterest").value || 0
  );

const bTenure =
  Number(
    document.getElementById("bTenure").value || 0
  );

// DB RULES

const rulesA =
  resolvePropertyRules({

    state: aState,
    city: aCity,

    propertyPrice: aBase,

    propertyCategory: aCategory,

    propertyType: aType,

    buyerGender: "male",

    isAffordableHousing: false,

    sqft: aSqft
  });

const rulesB =
  resolvePropertyRules({

    state: bState,
    city: bCity,

    propertyPrice: bBase,

    propertyCategory: bCategory,

    propertyType: bType,

    buyerGender: "male",

    isAffordableHousing: false,

    sqft: bSqft
  });

// TAXES

const gstA =
  aBase * rulesA.gstRate;

const gstB =
  bBase * rulesB.gstRate;

const registrationA =
  aBase *
  (
    rulesA.stampDuty +
    rulesA.registration
  );

const registrationB =
  bBase *
  (
    rulesB.stampDuty +
    rulesB.registration
  );

// TOTAL COST

totalA =
  aBase +
  gstA +
  registrationA;

totalB =
  bBase +
  gstB +
  registrationB;

// EMI

const emiA =
  calculateEMI(
    aLoan,
    aInterest,
    aTenure
  );

const emiB =
  calculateEMI(
    bLoan,
    bInterest,
    bTenure
  );

// RENTAL YIELD

const yieldA =
  aBase > 0
    ? Number(
        (
          (aRent * 12) /
          aBase
        ) * 100
      ).toFixed(2)
    : 0;

const yieldB =
  bBase > 0
    ? Number(
        (
          (bRent * 12) /
          bBase
        ) * 100
      ).toFixed(2)
    : 0;

// PRICE / SQFT

const priceSqftA =
  aSqft > 0
    ? aBase / aSqft
    : 0;

const priceSqftB =
  bSqft > 0
    ? bBase / bSqft
    : 0;

// APPRECIATION

const futureValueA =
  calculateFutureValue(aBase);

const futureValueB =
  calculateFutureValue(bBase);

// OWNERSHIP COST

const ownershipCostA =

  totalA +

  calculateFiveYearMaintenance(
    aMaintenance
  );

const ownershipCostB =

  totalB +

  calculateFiveYearMaintenance(
    bMaintenance
  );

// =========================================
// INVESTMENT SCORE
// =========================================

const appreciationPercentA =

  (
    (
      futureValueA -
      aBase
    ) /
    aBase
  ) * 100;

const appreciationPercentB =

  (
    (
      futureValueB -
      bBase
    ) /
    bBase
  ) * 100;

const scoreA =
  calculateInvestmentScore({

    ownershipCost:
      ownershipCostA,

    emi:
      emiA,

    rentalYield:
      Number(yieldA),

    appreciationPercent:
      appreciationPercentA
  });

const scoreB =
  calculateInvestmentScore({

    ownershipCost:
      ownershipCostB,

    emi:
      emiB,

    rentalYield:
      Number(yieldB),

    appreciationPercent:
      appreciationPercentB
  });

const gradeA =
  getInvestmentGrade(
    scoreA
  );

const gradeB =
  getInvestmentGrade(
    scoreB
  );

const scoreDifference =
  Math.abs(scoreA - scoreB);

let recommendationStrength;

let confidenceLevel;

if (scoreDifference >= 15) {

  recommendationStrength =
    "Strong Recommendation";

  confidenceLevel =
    "High Confidence";

} else if (scoreDifference >= 7) {

  recommendationStrength =
    "Moderate Recommendation";

  confidenceLevel =
    "Medium Confidence";

} else {

  recommendationStrength =
    "Properties are financially comparable";

  confidenceLevel =
    "Low Confidence";
}

const winner =

  scoreA >= scoreB

    ? aName

    : bName;

const savings =
  Math.abs(
    ownershipCostA -
    ownershipCostB
  );

  // WINNER

// PDF + SAVE DATA

window.latestComparisonData = {

  aName,
  bName,

  totalA,
  totalB,

  gstA,
  gstB,

  registrationA,
  registrationB,

  emiA,
  emiB,

  ownershipCostA,
  ownershipCostB,

  yieldA,
  yieldB,

  priceSqftA,
  priceSqftB,

  futureValueA,
  futureValueB,

  aBase,
bBase,

aLoan,
bLoan,

aMaintenance,
bMaintenance,

scoreDifference,

recommendationStrength,

confidenceLevel,

stampDutyA:
  aBase * rulesA.stampDuty,

stampDutyB:
  bBase * rulesB.stampDuty,

registrationFeeA:
  aBase * rulesA.registration,

registrationFeeB:
  bBase * rulesB.registration,

fiveYearMaintenanceA:
  calculateFiveYearMaintenance(
    aMaintenance
  ),

fiveYearMaintenanceB:
  calculateFiveYearMaintenance(
    bMaintenance
  ),

scoreA,
scoreB,

gradeA,
gradeB,

  recommended: winner,

  recommendation: `

${winner} achieved the higher PropWise Investment Score.

${aName}: ${scoreA}/100 (${gradeA})

${bName}: ${scoreB}/100 (${gradeB})

Score Difference:
${Math.abs(scoreA - scoreB)} points

Evaluation Factors:

• 5-Year Ownership Cost

• Rental Yield Potential

• EMI Affordability

• Appreciation Potential

`,

  savings
};

// SHOW RESULTS

document.getElementById(
  "resultCard"
).style.display = "block";

document.getElementById(
  "chartSection"
).style.display = "block";

document.getElementById(
  "aiSection"
).style.display = "block";

document.getElementById(
  "resultDetails"
).innerHTML = `

  <div class="winner-box">

    <h2>
  Recommended:
  ${winner}
</h2>

<p>

  Investment Scores

  <br>

  <strong>
    ${aName}
  </strong>

  : ${scoreA}/100

  (${gradeA})

  <br>

  <strong>
    ${bName}
  </strong>

  : ${scoreB}/100

  (${gradeB})

</p>

    <p>

      Estimated Savings:

      <strong>
        ${formatCurrency(savings)}
      </strong>

    </p>

  </div>
`;

document.getElementById(
  "comparisonTable"
).innerHTML = `

  <div class="compare-table-wrapper">

    <table class="compare-table">

    <tr>
  <th>Metric</th>
  <th>${aName}</th>
  <th>${bName}</th>
</tr>

<tr>

  <td>
    Investment Score
  </td>

  <td>
    ${scoreA}/100
    (${gradeA})
  </td>

  <td>
    ${scoreB}/100
    (${gradeB})
  </td>

</tr>


    <tr>
  <td>Base Price</td>
  <td>${formatCurrency(aBase)}</td>
  <td>${formatCurrency(bBase)}</td>
</tr>

<tr>
  <td>GST</td>
  <td>${formatCurrency(gstA)}</td>
  <td>${formatCurrency(gstB)}</td>
</tr>

<tr>
  <td>Stamp Duty</td>
  <td>${formatCurrency(
    aBase * rulesA.stampDuty
  )}</td>
  <td>${formatCurrency(
    bBase * rulesB.stampDuty
  )}</td>
</tr>

<tr>
  <td>Registration</td>
  <td>${formatCurrency(
    aBase * rulesA.registration
  )}</td>
  <td>${formatCurrency(
    bBase * rulesB.registration
  )}</td>
</tr>

<tr>
  <td>Total Acquisition Cost</td>
  <td>${formatCurrency(totalA)}</td>
  <td>${formatCurrency(totalB)}</td>
</tr>

<tr>
  <td>Loan Amount</td>
  <td>${formatCurrency(aLoan)}</td>
  <td>${formatCurrency(bLoan)}</td>
</tr>

<tr>
  <td>Annual Maintenance</td>
  <td>${formatCurrency(aMaintenance)}</td>
  <td>${formatCurrency(bMaintenance)}</td>
</tr>

<tr>
  <td>5-Year Maintenance</td>
  <td>${formatCurrency(
    calculateFiveYearMaintenance(
      aMaintenance
    )
  )}</td>
  <td>${formatCurrency(
    calculateFiveYearMaintenance(
      bMaintenance
    )
  )}</td>
</tr>

<tr>
  <td>5-Year Ownership Cost</td>
  <td>${formatCurrency(
    ownershipCostA
  )}</td>
  <td>${formatCurrency(
    ownershipCostB
  )}</td>
</tr>

<tr>
  <td>Price / Sq.ft</td>
  <td>${formatCurrency(priceSqftA)}</td>
  <td>${formatCurrency(priceSqftB)}</td>
</tr>

<tr>
  <td>Monthly EMI</td>
  <td>${formatCurrency(emiA)}</td>
  <td>${formatCurrency(emiB)}</td>
</tr>

<tr>
  <td>Rental Yield</td>
  <td>${yieldA}%</td>
  <td>${yieldB}%</td>
</tr>

<tr>
  <td>5-Year Appreciation</td>
  <td>${formatCurrency(
    futureValueA
  )}</td>
  <td>${formatCurrency(
    futureValueB
  )}</td>
</tr>

    </table>

  </div>
`;

renderAppreciationChart({
  aName,
  bName,
  aBase,
  bBase
});

// SCROLL TO RESULTS
setTimeout(() => {
  const resultCard =
    document.getElementById(
      "resultCard"
    );

  if (resultCard) {
    resultCard.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}, 500);

renderOwnershipProjection({

  aName,
  bName,

  totalA,
  totalB,

  maintenanceA: aMaintenance,

  maintenanceB: bMaintenance
});

renderAIRecommendation({

  winner,
  savings,

  yieldA,
  yieldB,

  emiA,
  emiB,

  scoreA,
  scoreB,

  gradeA,
  gradeB
});


} catch (err) {

  console.error(
    "Comparison error:",
    err
  );

  if (typeof Toast !== "undefined") {
    Toast.error(
      "Failed to compare properties"
    );
  }


} finally {


btn.disabled = false;

btn.innerText =
  "Compare Properties";


}
}

// ==============================
// SAVE
// ==============================

function saveComparison() {

  if (!window.latestComparisonData) {
    if (typeof Toast !== "undefined") {
      Toast.warning("Please run a comparison first");
    }
    return;
  }

  try {
    localStorage.setItem(
      "lastComparison",
      JSON.stringify(
        window.latestComparisonData || {}
      )
    );

    if (typeof Toast !== "undefined") {
      Toast.success("Comparison saved successfully");
    }
  } catch (err) {
    console.error("Save failed:", err);
    if (typeof Toast !== "undefined") {
      Toast.error("Failed to save comparison");
    }
  }
}


// ==============================
// RESET
// ==============================

function resetComparison() {

  document
    .querySelectorAll("input")
    .forEach(input => {

      input.value = "";
    });

  document
    .querySelectorAll("select")
    .forEach(select => {

      select.value = "";
    });

  clearValidationErrors();

  localStorage.removeItem(
    "compareDraft"
  );

  localStorage.removeItem(
    "lastComparison"
  );

  window.latestComparisonData =
    null;

  document.getElementById(
    "resultCard"
  ).style.display = "none";

  document.getElementById(
    "chartSection"
  ).style.display = "none";

  document.getElementById(
    "aiSection"
  ).style.display = "none";

  if (
    typeof destroyExistingChart ===
    "function"
  ) {

    destroyExistingChart();
  }

  document
    .querySelectorAll(".compare-step")
    .forEach((section, index) => {

      section.open =
        index % 3 !== 2;
    });

  if (typeof Toast !== "undefined") {
    Toast.info("Form reset successfully");
  }
}
