// =============================================
// PROPWISE STRATEGY UI
// =============================================

window.latestStrategyData = null;


// =============================================
// HELPERS
// =============================================

function getNumericValue(id) {

  const value =
    document.getElementById(id)?.value || "0";

  return Number(
    value.toString().replace(/,/g, "")
  );
}

function setInputValue(
  id,
  value
) {

  const element =
    document.getElementById(id);

  if (!element) return;

  element.value = value ?? "";
}


// =============================================
// STATE -> CITY
// =============================================

function handleStrategyStateChange() {

  populateStrategyCities(
    "state",
    "city"
  );

  loadStrategyDefaults();
}


// =============================================
// CITY -> ASSUMPTIONS
// =============================================

function handleStrategyCityChange() {

  loadStrategyDefaults();
}


function loadStrategyDefaults() {

  const state =
    document.getElementById("state")
      ?.value;

  const city =
    document.getElementById("city")
      ?.value;

  if (!state || !city) {

    return;
  }

  const assumptions =

    getStrategyAssumptions(
      state,
      city
    );

  setInputValue(
    "appreciationRate",
    assumptions.avg_appreciation_rate
  );

  setInputValue(
    "equityReturnRate",
    assumptions.equity_return_rate
  );

  setInputValue(
    "inflationRate",
    assumptions.inflation_rate
  );

  setInputValue(
    "rentGrowthRate",
    assumptions.rent_growth_rate
  );

  setInputValue(
    "vacancyRate",
    assumptions.vacancy_rate
  );
}


// =============================================
// VALIDATION
// =============================================

function validateStrategyInputs() {

  const requiredFields = [

    "propertyValue",

    "monthlyRent",

    "state",

    "city",

    "projectionYears"

  ];

  let isValid = true;

  requiredFields.forEach(id => {

    const element =
      document.getElementById(id);

    if (
      !element ||
      !element.value
    ) {

      element?.classList.add(
        "invalid"
      );

      isValid = false;

    } else {

      element.classList.remove(
        "invalid"
      );
    }

  });

  return isValid;
}


// =============================================
// BUILD INPUT MODEL
// =============================================

function buildStrategyInput() {

  return {

    propertyValue:
      getNumericValue(
        "propertyValue"
      ),

    purchasePrice:
      getNumericValue(
        "purchasePrice"
      ),

    purchaseYear:
      Number(
        document.getElementById(
          "purchaseYear"
        )?.value || 0
      ),

    outstandingLoan:
      getNumericValue(
        "outstandingLoan"
      ),

    monthlyRent:
      getNumericValue(
        "monthlyRent"
      ),

    annualMaintenance:
      getNumericValue(
        "annualMaintenance"
      ),

    annualPropertyTax:
      getNumericValue(
        "annualPropertyTax"
      ),

    projectionYears:
      Number(
        document.getElementById(
          "projectionYears"
        )?.value || 10
      ),

    state:
      document.getElementById(
        "state"
      )?.value,

    city:
      document.getElementById(
        "city"
      )?.value,

    appreciationRate:
      Number(
        document.getElementById(
          "appreciationRate"
        )?.value || 6
      ),

    rentGrowthRate:
      Number(
        document.getElementById(
          "rentGrowthRate"
        )?.value || 5
      ),

    vacancyRate:
      Number(
        document.getElementById(
          "vacancyRate"
        )?.value || 3
      ),

    equityReturnRate:
      Number(
        document.getElementById(
          "equityReturnRate"
        )?.value || 12
      ),

    inflationRate:
      Number(
        document.getElementById(
          "inflationRate"
        )?.value || 6
      )

  };
}


// =============================================
// ANALYZE
// =============================================

async function analyzeStrategy() {

  const button =

    document.getElementById(
      "analyzeStrategyBtn"
    );

  if (button) {

    button.disabled = true;

    button.innerText =
      "Analyzing...";
  }

  try {

    if (
      !validateStrategyInputs()
    ) {

      alert(
        "Please complete all required fields."
      );

      return;
    }

    const inputData =

      buildStrategyInput();

    const result =

      calculateStrategyAnalysis(
        inputData
      );

    window.latestStrategyData = {

      inputData,

      result

    };

    localStorage.setItem(
  "propwise_strategy_report",
  JSON.stringify(
    window.latestStrategyData
  )
);

    renderStrategyDashboard(
      result
    );

    renderStrategyCharts(
      result,
      inputData
    );

    document.getElementById(
      "resultCard"
    ).style.display =
      "block";

    document.getElementById(
      "resultCard"
    ).scrollIntoView({

      behavior: "smooth"

    });

  }

  catch (error) {

    console.error(error);

    alert(
      "Failed to analyze strategy."
    );
  }

  finally {

    if (button) {

      button.disabled = false;

      button.innerText =
        "Analyze Strategy";
    }
  }
}


// =============================================
// DASHBOARD
// =============================================

function renderStrategyDashboard(
  result
) {

  const container =

    document.getElementById(
      "strategyResults"
    );

  if (!container) return;

  const recommendation =

    result.recommendation;

  container.innerHTML = `

<div class="strategy-summary">

  <div class="recommendation-card">

    <div class="recommendation-label">

      Recommendation

    </div>

    <h2>

      ${recommendation.action}

    </h2>

    <p>

      ${recommendation.reason}

    </p>

  </div>

  <div class="strategy-metrics">

    <div class="strategy-metric-card">

      <h3>
        Keep Wealth
      </h3>

      <p>
        ₹${formatStrategyCurrency(
          result.keepScenario.keepWealth
        )}
      </p>

    </div>

    <div class="strategy-metric-card">

      <h3>
        Sell Wealth
      </h3>

      <p>
        ₹${formatStrategyCurrency(
          result.sellScenario.sellWealth
        )}
      </p>

    </div>

    <div class="strategy-metric-card">

      <h3>
        Opportunity Cost
      </h3>

      <p>
        ₹${formatStrategyCurrency(
          result.opportunityCost
        )}
      </p>

    </div>

    <div class="strategy-metric-card">

      <h3>
        Strategy Score
      </h3>

      <p>
        ${result.strategyScore}/100
      </p>

      <small>

        ${result.strategyGrade}

      </small>

    </div>

  </div>

</div>

`;

}


// =============================================
// RESET
// =============================================

function resetStrategy() {

  document
    .querySelectorAll(
      "#strategyForm input, #strategyForm select"
    )
    .forEach(field => {

      field.value = "";
    });

  document.getElementById(
    "resultCard"
  ).style.display =
    "none";

if (
  typeof destroyStrategyCharts ===
  "function"
) {

  destroyStrategyCharts();
}
localStorage.removeItem(
  "propwise_strategy_report"
);

  window.latestStrategyData =
    null;
}




// =============================================
// INIT
// =============================================

async function initStrategyPage() {

  try {

   if (
  typeof initSupabase ===
  "function"
) {

  initSupabase();
}

    await loadStrategyRules();

    populateStrategyStates(
      "state"
    );

    document
      .getElementById("state")
      ?.addEventListener(

        "change",

        handleStrategyStateChange
      );

    document
      .getElementById("city")
      ?.addEventListener(

        "change",

        handleStrategyCityChange
      );

    document
      .getElementById(
        "analyzeStrategyBtn"
      )
      ?.addEventListener(

        "click",

        analyzeStrategy
      );

    document
      .getElementById(
        "resetStrategyBtn"
      )
      ?.addEventListener(

        "click",

        resetStrategy
      );

    console.log(
      "Strategy page initialized"
    );

  }

  catch (error) {

    console.error(
      "Strategy init failed",
      error
    );
  }
}



// =============================================
// EXPORTS
// =============================================

window.analyzeStrategy =
  analyzeStrategy;

window.resetStrategy =
  resetStrategy;

window.initStrategyPage =
  initStrategyPage;