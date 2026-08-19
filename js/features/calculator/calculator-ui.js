async function populateStates() {

  const stateSelect =
    document.getElementById("state");

  if (!stateSelect) return;

  stateSelect.innerHTML =
    '<option value="">Select State</option>';

  CalculatorRules.states.forEach(
    state => {

      stateSelect.innerHTML += `

        <option value="${state.state_code}">
          ${state.state_name}
        </option>

      `;
    }
  );
}

function populateCities() {

  const stateCode =
    document.getElementById("state")
      ?.value;

  const citySelect =
    document.getElementById("city");

  if (!citySelect) return;

  citySelect.innerHTML =
    '<option value="">Select City</option>';

  CalculatorRules.cities

    .filter(city =>
      city.state_code === stateCode
    )

    .sort((a, b) =>
      a.city_name.localeCompare(
        b.city_name
      )
    )

    .forEach(city => {

      citySelect.innerHTML += `

        <option value="${city.city_name}">
          ${city.city_name}
        </option>

      `;
    });
}

// =============================================
// PROPWISE CALCULATOR UI ENGINE
// =============================================


function getInputValue(id) {

  return parseFloat(

    document.getElementById(id)?.value || 0
  );
}


function getInputText(id) {

  return document.getElementById(id)?.value || "";
}


// =============================================
// RENDER DASHBOARD
// =============================================

function renderDashboard(result) {

  const dashboard =
    document.getElementById(
      "financialDashboard"
    );

  if (!dashboard) return;

  const affordabilityColor =
    result.affordability.className === "safe"
      ? "#10b981"
      : result.affordability.className === "moderate"
      ? "#f59e0b"
      : "#ef4444";

  const insights = [];

  if (result.affordableHousing) {
    insights.push("Affordable housing GST rule applied.");
  }

  if (result.cityRules.metro) {
    insights.push("Metro city rules applied.");
  }

  if (result.resolvedRules.isLuxury) {
    insights.push("Luxury slab charges may apply.");
  }

  if (result.affordability.monthlySurplus < 0) {
    insights.push("Your estimated monthly cash flow is negative after expenses and debt.");
  } else if (result.affordability.monthlySurplus < result.emi) {
    insights.push("Your monthly buffer is smaller than the new EMI. Keep an emergency reserve before committing.");
  }

  if (!insights.length) {
    insights.push("Review the assumptions below with your lender, builder, or local authority.");
  }

  dashboard.innerHTML = `
    <div class="summary-panel">
      <div class="summary-top">
        <div class="summary-label">All-in planning cost</div>
        <div class="summary-total">₹${formatCurrency(result.totalCost)}</div>
        <div class="summary-caption">
          Includes purchase charges, estimated interiors, and the optional costs entered below.
          The loan estimate excludes interiors because lenders may not finance them.
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Purchase cost before interiors</div>
          <div class="metric-value">₹${formatCurrency(result.purchaseCost)}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Cash needed upfront</div>
          <div class="metric-value">₹${formatCurrency(result.upfrontCash)}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Monthly EMI</div>
          <div class="metric-value">₹${formatCurrency(result.emi)}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Monthly buffer after debt</div>
          <div class="metric-value">₹${formatCurrency(result.affordability.monthlySurplus)}</div>
        </div>
      </div>

      <div class="result-grid">
        <div class="result-column">
          <div class="affordability-card">
            <div class="affordability-title">Monthly affordability</div>
            <div class="affordability-pill ${result.affordability.className}">${result.affordability.level}</div>
            <div class="affordability-text">
              Total debt uses ${result.affordability.ratio.toFixed(1)}% of monthly income.
              New EMI uses ${result.affordability.emiRatio.toFixed(1)}%.
            </div>
            <div class="health-bar" aria-label="Debt to income ratio">
              <span style="width:${Math.min(result.affordability.ratio, 100)}%; background:${affordabilityColor};"></span>
            </div>
            <div class="affordability-text">
              Monthly buffer after household expenses and all EMIs:
              <strong>₹${formatCurrency(result.affordability.monthlySurplus)}</strong>
            </div>
          </div>

          <div class="result-card">
            <div class="result-card-title">Where the money goes</div>
            <div class="breakdown-list">
              <div class="breakdown-item"><span class="breakdown-label">Property price</span><strong>₹${formatCurrency(result.totalCost - result.interiorEstimate - result.hiddenCharges - result.stampDuty - result.registration - result.gst - result.municipalSurcharge)}</strong></div>
              <div class="breakdown-item"><span class="breakdown-label">Stamp duty</span><strong>₹${formatCurrency(result.stampDuty)}</strong></div>
              <div class="breakdown-item"><span class="breakdown-label">Registration</span><strong>₹${formatCurrency(result.registration)}</strong></div>
              <div class="breakdown-item"><span class="breakdown-label">GST</span><strong>₹${formatCurrency(result.gst)}</strong></div>
              <div class="breakdown-item"><span class="breakdown-label">Municipal charges</span><strong>₹${formatCurrency(result.municipalSurcharge)}</strong></div>
              <div class="breakdown-item"><span class="breakdown-label">Additional costs</span><strong>₹${formatCurrency(result.hiddenCharges)}</strong></div>
              <div class="breakdown-item"><span class="breakdown-label">Interior estimate</span><strong>₹${formatCurrency(result.interiorEstimate)}</strong></div>
            </div>
          </div>
        </div>

        <div class="result-column">
          <div class="result-card chart-card">
            <div class="result-card-title">Cost composition</div>
            <div class="chart-wrapper"><canvas id="costBreakdownChart"></canvas></div>
          </div>

          <div class="result-card">
            <div class="result-card-title">What to review</div>
            <ul class="insight-list">${insights.map(insight => `<li>${insight}</li>`).join("")}</ul>
          </div>

          <div class="result-card assumptions-card">
            <div class="result-card-title">Calculation assumptions</div>
            <div class="assumption-list">
              <span>Interest rate <strong>${getInputValue("interestRate").toFixed(1)}%</strong></span>
              <span>Loan tenure <strong>${getInputValue("tenureYears")} years</strong></span>
              <span>Interior estimate <strong>₹${formatCurrency(result.interiorEstimate)}</strong></span>
              <span>Expected rental yield <strong>${result.rentalYield.toFixed(1)}%</strong></span>
              <span>Five-year maintenance <strong>₹${formatCurrency(result.fiveYearMaintenance)}</strong></span>
              <span>Five-year ownership cost <strong>₹${formatCurrency(result.fiveYearOwnershipCost)}</strong></span>
            </div>
            <p class="assumption-note">Charges are estimates and may vary with guidance value, authority rules, exemptions, lender terms, and the agreement structure.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// =============================================
// Cost Breakdown Chart
// =============================================

function renderCostBreakdownChart(result) {

  const canvas =
    document.getElementById(
      "costBreakdownChart"
    );

  if (!canvas) return;

  const existingChart =
    Chart.getChart(canvas);

  if (existingChart) {

    existingChart.destroy();
  }

  new Chart(canvas, {

    type: "doughnut",

    data: {

      labels: [

        "Property Price",

        "Stamp Duty",

        "Registration",

        "GST",

        "Municipal Charges",

        "Additional Costs",

        "Interiors"
      ],

      datasets: [

        {

          data: [

            result.totalCost
              - result.interiorEstimate
              - result.hiddenCharges
              - result.stampDuty
              - result.registration
              - result.gst
              - result.municipalSurcharge,

            result.stampDuty,

            result.registration,

            result.gst,

            result.municipalSurcharge,

            result.hiddenCharges,

            result.interiorEstimate
          ],

          borderWidth: 0
        }
      ]
    },

    options: {

      responsive: true,

      plugins: {

        legend: {

          position: "bottom",

          labels: {

            color: "#ffffff"
          }
        }
      }
    }
  });
}

// =============================================
// Validation
// =============================================

function showValidationMessage(message) {

  let validationBox =

    document.getElementById(
      "validationMessage"
    );

  if (!validationBox) return;

  validationBox.innerHTML = `

    <div class="validation-box">

      <div class="validation-icon">
        ⚠
      </div>

      <div class="validation-text">

        ${message}

      </div>

    </div>
  `;
}


function hideValidationMessage() {

  const validationBox =

    document.getElementById(
      "validationMessage"
    );

  if (validationBox) {

    validationBox.innerHTML = "";
  }
}

function openFieldSection(field) {

  const section =
    field?.closest("details");

  if (section) {

    section.open = true;
  }
}

// =============================================
// MAIN CALCULATOR
// =============================================

function calculatePropertyPlan() {

  const requiredFields = [

  {
    id: "basePrice",
    label: "Property Price"
  },

  {
    id: "sqft",
    label: "Property Size"
  },

  {
    id: "city",
    label: "City"
  },

  {
    id: "state",
    label: "State"
  },

  {
    id: "downPayment",
    label: "Down Payment"
  },

  {
    id: "monthlyIncome",
    label: "Monthly Income"
  },

  {
    id: "monthlyExpenses",
    label: "Monthly Household Expenses"
  }
];

let missingFields = [];

requiredFields.forEach(field => {

  const el =
    document.getElementById(field.id);

  if (

    !el ||

    !el.value ||

    (el.type === "number" && Number(el.value) < 0) ||

    (el.id !== "monthlyExpenses" &&
      el.type === "number" && Number(el.value) <= 0)

  ) {

    missingFields.push(field.label);

    el?.classList.add("input-error");

    openFieldSection(el);
  }

  else {

    el?.classList.remove("input-error");
  }
});

if (missingFields.length > 0) {

  showValidationMessage(

    "Please complete all required fields."
  );

  document
    .querySelector(".input-error")
    ?.scrollIntoView({

      behavior: "smooth",

      block: "center"
    });

  return;
}

hideValidationMessage();

const basePrice =
  getInputValue("basePrice");

  const data = {

    basePrice,

    sqft:
      getInputValue("sqft"),

    state:
      getInputText("state"),

    city:
      getInputText("city"),

    propertyType:
      getInputText("propertyType"),

    propertyCategory:
      getInputText(
        "propertyCategory"
      ),

    buyerGender:
      getInputText(
        "buyerGender"
      ),

    downPayment:
      getInputValue(
        "downPayment"
      ),

    interestRate:
      getInputValue(
        "interestRate"
      ),

    tenureYears:
      getInputValue(
        "tenureYears"
      ),

    monthlyIncome:
      getInputValue(
        "monthlyIncome"
      ),

    parkingCharges:
      getInputValue(
        "parkingCharges"
      ),

    floorRiseCharges:
      getInputValue(
        "floorRiseCharges"
      ),

    clubhouseCharges:
      getInputValue(
        "clubhouseCharges"
      ),

    maintenanceDeposit:
      getInputValue(
        "maintenanceDeposit"
      ),

    legalCharges:
      getInputValue(
        "legalCharges"
      ),

    brokerage:
      getInputValue(
        "brokerage"
      ),

    loanProcessingFee:
      getInputValue(
        "loanProcessingFee"
      ),

    movingCosts:
      getInputValue(
        "movingCosts"
      ),

    mortgageCharges:
      getInputValue(
        "mortgageCharges"
      ),

    utilityDeposits:
      getInputValue(
        "utilityDeposits"
      ),

    firstYearPropertyTax:
      getInputValue(
        "firstYearPropertyTax"
      ),

    annualMaintenance:
      getInputValue(
        "annualMaintenance"
      ),

    monthlyExpenses:
      getInputValue(
        "monthlyExpenses"
      ),

    existingEmi:
      getInputValue(
        "existingEmi"
      ),

    expectedRent:
      getInputValue(
        "expectedRent"
      ),

    appreciationRate:
      getInputValue(
        "appreciationRate"
      )
  };

  const result =
    calculatePropertyFinancials(
      data
    );

  renderDashboard(result);
  renderCostBreakdownChart(result);
  const resultsSection =
  document.getElementById(
    "resultsSection"
  );

if (resultsSection) {

  resultsSection.style.display =
    "block";

  resultsSection.scrollIntoView({

    behavior: "smooth",

    block: "start"
  });
}
}



// =============================================
// Reset Button
// =============================================
function resetCalculator() {

  const fields =

    document.querySelectorAll(

      "input, select"
    );

  fields.forEach(field => {

    if (

      field.type === "number"

      ||

      field.type === "text"

    ) {

      if (
  field.id === "interestRate"
) {

  field.value = 8.5;
}

else if (
  field.id === "tenureYears"
) {

  field.value = 20;
}

else {

  field.value = "";
}
    }

    if (field.tagName === "SELECT") {
      field.selectedIndex = 0;
    }

    field.classList.remove(
      "input-error"
    );
  });

  document.getElementById(
    "interestRate"
  ).value = 8.5;

  document.getElementById(
    "tenureYears"
  ).value = 20;

  const dashboard =
  document.getElementById(
    "financialDashboard"
  );

if (dashboard) {

  dashboard.innerHTML = "";
}

const resultsSection =
  document.getElementById(
    "resultsSection"
  );

if (resultsSection) {

  resultsSection.style.display =
    "none";
}

document
  .querySelectorAll(".calc-step")
  .forEach((section, index) => {

    section.open =
      index < 2;
  });

  populateCities();

  updateInteriorRatePreview();
}

// =============================================
//  CALCULATIONS
// =============================================

function initCalculator() {

  const dashboard =
    document.getElementById(
      "resultsSection"
    );

  if (dashboard) {

    dashboard.style.display = "none";
  }

  const inputs =
    document.querySelectorAll(
      "input, select"
    );

  inputs.forEach(input => {

    input.addEventListener(
      "input",
      () => {

        input.classList.remove(
          "input-error"
        );

        saveCalculatorDraft();
      }
    );

    input.addEventListener(
      "change",
      saveCalculatorDraft
    );
  });

  // NEW CODE
  document
    .getElementById("state")
    ?.addEventListener(
      "change",
      populateCities
    );

  document
    .getElementById("state")
    ?.addEventListener(
      "change",
      updateInteriorRatePreview
    );

  document
    .getElementById("city")
    ?.addEventListener(
      "change",
      updateInteriorRatePreview
    );

}

function saveCalculatorDraft() {

  const draft = {};

  document
    .querySelectorAll("input, select")
    .forEach(input => {
      draft[input.id] = input.value;
    });

  localStorage.setItem(
    "calculatorDraft",
    JSON.stringify(draft)
  );
}

async function restoreCalculatorDraft() {

  const saved = localStorage.getItem("calculatorDraft");

  if (!saved) return;

  try {
    const draft = JSON.parse(saved);
    const state = document.getElementById("state");

    if (state && draft.state) {
      state.value = draft.state;
      populateCities();
    }

    Object.keys(draft).forEach(id => {
      const input = document.getElementById(id);

      if (input && id !== "state") {
        input.value = draft[id];
      }
    });

    updateInteriorRatePreview();
  } catch (error) {
    localStorage.removeItem("calculatorDraft");
  }
}

function updateInteriorRatePreview() {

  const state = getInputText("state");
  const city = getInputText("city");
  const preview = document.getElementById("interiorRatePreview");

  if (!preview) return;

  const cityData = CalculatorRules.cities.find(item =>
    item.state_code === state && item.city_name === city
  );

  const rate = cityData?.interior_cost_per_sqft || 1800;

  preview.textContent =
    `₹${formatCurrency(rate)} per sqft in the current estimate`;
}


// =============================================
// INIT
// =============================================

document.addEventListener(

  "DOMContentLoaded",

  async () => {

    window.initSupabase();

    await loadCalculatorRules();

    await populateStates();

    await restoreCalculatorDraft();

    initCalculator();

    updateInteriorRatePreview();
  }
);


// =============================================
// GLOBAL EXPORTS
// =============================================

window.calculatePropertyPlan =
  calculatePropertyPlan;
