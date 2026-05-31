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

  dashboard.innerHTML = `

    <div class="summary-panel">

      <div class="summary-top">

        <div class="summary-label">
          Total Estimated Cost
        </div>

        <div class="summary-total">
          ₹${formatCurrency(result.totalCost)}
        </div>

        <div class="summary-caption">

          Includes registration,
          stamp duty, GST,
          interior estimate,
          municipal charges,
          and hidden costs.

        </div>

      </div>

      <div class="metrics-grid">

        <div class="metric-card">

          <div class="metric-label">
            Monthly EMI
          </div>

          <div class="metric-value">
            ₹${formatCurrency(result.emi)}
          </div>

        </div>

        <div class="metric-card">

          <div class="metric-label">
            Total Interest
          </div>

          <div class="metric-value">
            ₹${formatCurrency(
              result.totalInterest
            )}
          </div>

        </div>

        <div class="metric-card">

          <div class="metric-label">
            Upfront Cash
          </div>

          <div class="metric-value">
            ₹${formatCurrency(
              result.upfrontCash
            )}
          </div>

        </div>

        <div class="metric-card">

          <div class="metric-label">
            5Y Ownership
          </div>

          <div class="metric-value">
            ₹${formatCurrency(
              result.fiveYearOwnershipCost
            )}
          </div>

          <div class="metric-card">

  <div class="metric-label">
    Investment Score
  </div>

  <div class="metric-value">
    ${result.investmentScore}/100
  </div>

</div>

        </div>

      </div>

      <div class="affordability-card">

        <div class="affordability-title">
          Affordability Analysis
        </div>

        <div class="
          affordability-pill
          ${result.affordability.className}
        ">

          ${result.affordability.level}

        </div>

        <div class="affordability-text">

          EMI to income ratio:
          ${result.affordability.ratio.toFixed(1)}%

        </div>



      </div>

      <div class="breakdown-list">

        <div class="breakdown-item">

          <div class="breakdown-label">
            Stamp Duty
          </div>

          <div class="breakdown-value">
            ₹${formatCurrency(
              result.stampDuty
            )}
          </div>

        </div>
        <div class="affordability-card">

  <div class="affordability-title">
    Financial Health
  </div>

  <div
    style="
      width:100%;
      height:12px;
      background:rgba(255,255,255,0.08);
      border-radius:999px;
      overflow:hidden;
      margin-bottom:14px;
    "
  >

    <div
      style="
        width:${Math.min(result.affordability.ratio, 100)}%;
        height:100%;
        background:
          ${
            result.affordability.className === "safe"
              ? "#10b981"
              : result.affordability.className === "moderate"
              ? "#f59e0b"
              : "#ef4444"
          };
      "
    ></div>

  </div>

  <div class="affordability-text">

    Recommended EMI ratio:
    below 35% of monthly income.

  </div>

</div>


<div
  style="
    margin-top:24px;
    background:rgba(255,255,255,0.04);
    border-radius:18px;
    padding:18px;
  "
>

  <div
    style="
      font-size:15px;
      font-weight:700;
      margin-bottom:16px;
    "
  >
    Cost Composition
  </div>

  <div class="chart-wrapper">

  <canvas
    id="costBreakdownChart"
  ></canvas>

</div>

</div>


<div class="affordability-card">

  <div class="affordability-title">
    Smart Insights
  </div>

  <div class="affordability-text">

    ${
      result.affordableHousing
        ? "✓ Affordable housing GST benefit applied.<br><br>"
        : ""
    }

    ${
      result.affordability.level === "Risky"
        ? "⚠ EMI burden is financially risky.<br><br>"
        : ""
    }

    ${
      result.cityRules.metro
        ? "✓ Metro city property detected.<br><br>"
        : ""
    }

    ${
      result.resolvedRules.isLuxury
        ? "⚠ Luxury slab charges applicable.<br><br>"
        : ""
    }

    Guidance-value-based adjustments included.

  </div>

  <div class="affordability-card">

  <div class="affordability-title">
    Investment Rating
  </div>

  <div class="
    affordability-pill
    ${
      result.investmentScore >= 85
        ? "safe"
        : result.investmentScore >= 70
        ? "moderate"
        : "risky"
    }
  ">

    ${result.investmentGrade}

  </div>

  <div class="affordability-text">

    PropWise Score:
    ${result.investmentScore}/100

  </div>

</div>

</div>

        <div class="breakdown-item">

          <div class="breakdown-label">
            Registration
          </div>

          <div class="breakdown-value">
            ₹${formatCurrency(
              result.registration
            )}
          </div>

        </div>

        <div class="breakdown-item">

          <div class="breakdown-label">
            GST
          </div>

          <div class="breakdown-value">
            ₹${formatCurrency(
              result.gst
            )}
          </div>

        </div>

        <div class="breakdown-item">

          <div class="breakdown-label">
            Municipal Charges
          </div>

          <div class="breakdown-value">
            ₹${formatCurrency(
              result.municipalSurcharge
            )}
          </div>

        </div>

        <div class="breakdown-item">

          <div class="breakdown-label">
            Interior Estimate
          </div>

          <div class="breakdown-value">
            ₹${formatCurrency(
              result.interiorEstimate
            )}
          </div>

        </div>

        <div class="breakdown-item">

          <div class="breakdown-label">
            Hidden Charges
          </div>

          <div class="breakdown-value">
            ₹${formatCurrency(
              result.hiddenCharges
            )}
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

        "Base Price",

        "Stamp Duty",

        "GST",

        "Registration",

        "Interior",

        "Hidden Charges"
      ],

      datasets: [

        {

          data: [

            result.totalCost
              - result.hiddenCharges
              - result.stampDuty
              - result.registration
              - result.gst,

            result.stampDuty,

            result.gst,

            result.registration,

            result.interiorEstimate,

            result.hiddenCharges
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
    id: "downPayment",
    label: "Down Payment"
  },

  {
    id: "monthlyIncome",
    label: "Monthly Income"
  }
];

let missingFields = [];

requiredFields.forEach(field => {

  const el =
    document.getElementById(field.id);

  if (

    !el ||

    !el.value ||

    el.value.trim() === "" ||

    Number(el.value) <= 0

  ) {

    missingFields.push(field.label);

    el?.classList.add("input-error");
  }

  else {

    el?.classList.remove("input-error");
  }
});

if (missingFields.length > 0) {

  showValidationMessage(

    "Please complete all required fields."
  );

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

      "input"
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
      }
    );
  });

  // NEW CODE
  document
    .getElementById("state")
    ?.addEventListener(
      "change",
      populateCities
    );

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

    initCalculator();
  }
);


// =============================================
// GLOBAL EXPORTS
// =============================================

window.calculatePropertyPlan =
  calculatePropertyPlan;