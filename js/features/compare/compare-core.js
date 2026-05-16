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
// VALIDATION
// ==============================

function showValidationError(id) {

  const input =
    document.getElementById(id);

  const error =
    document.getElementById(
      `${id}Error`
    );

  if (input) {

    input.classList.add("invalid");
  }

  if (error) {

    error.classList.add("show");
  }
}

function clearValidationErrors() {

  document
    .querySelectorAll(".validation-error")
    .forEach(error => {

      error.classList.remove("show");
    });

  document
    .querySelectorAll("input")
    .forEach(input => {

      input.classList.remove("invalid");
    });
}

function validateComparisonInputs() {

  clearValidationErrors();

  let isValid = true;

  const requiredFields = [

    "aName",
    "aBase",
    "aRegistration",
    "aMaintenance",

    "bName",
    "bBase",
    "bRegistration",
    "bMaintenance"
  ];

  requiredFields.forEach(id => {

    const input =
      document.getElementById(id);

    if (
      !input ||
      !input.value.trim()
    ) {

      showValidationError(id);

      isValid = false;
    }
  });

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

  btn.innerText =
    "Analyzing...";
    if (!validateComparisonInputs()) {

  btn.disabled = false;

  btn.innerText =
    "Compare Properties";

  return;
}

  try {

    // ==========================
    // PROPERTY NAMES
    // ==========================

    const aName =
      document.getElementById(
        "aName"
      )?.value || "Property A";

    const bName =
      document.getElementById(
        "bName"
      )?.value || "Property B";

    // ==========================
    // PROPERTY A
    // ==========================

    const a = {

      base:
        getCompareValue("aBase"),

      gst:
        getCompareValue("aGst"),

      registration:
        getCompareValue(
          "aRegistration"
        ),

      parking:
        getCompareValue(
          "aParking"
        ),

      clubhouse:
        getCompareValue(
          "aClubhouse"
        ),

      maintenance:
        getCompareValue(
          "aMaintenance"
        ),

      floorRise:
        getCompareValue(
          "aFloorRise"
        ),

      legal:
        getCompareValue(
          "aLegal"
        ),

      superArea:
        getCompareValue(
          "aSuperArea"
        ),

      rent:
        getCompareValue(
          "aRent"
        ),

      loan:
        getCompareValue(
          "aLoan"
        ),

      interest:
        getCompareValue(
          "aInterest"
        ),

      tenure:
        getCompareValue(
          "aTenure"
        )
    };

    // ==========================
    // PROPERTY B
    // ==========================

    const b = {

      base:
        getCompareValue("bBase"),

      gst:
        getCompareValue("bGst"),

      registration:
        getCompareValue(
          "bRegistration"
        ),

      parking:
        getCompareValue(
          "bParking"
        ),

      clubhouse:
        getCompareValue(
          "bClubhouse"
        ),

      maintenance:
        getCompareValue(
          "bMaintenance"
        ),

      floorRise:
        getCompareValue(
          "bFloorRise"
        ),

      legal:
        getCompareValue(
          "bLegal"
        ),

      superArea:
        getCompareValue(
          "bSuperArea"
        ),

      rent:
        getCompareValue(
          "bRent"
        ),

      loan:
        getCompareValue(
          "bLoan"
        ),

      interest:
        getCompareValue(
          "bInterest"
        ),

      tenure:
        getCompareValue(
          "bTenure"
        )
    };

    // ==========================
    // TOTAL COST
    // ==========================

    totalA =
      a.base +
      a.gst +
      a.registration +
      a.parking +
      a.clubhouse +
      a.maintenance +
      a.floorRise +
      a.legal;

    totalB =
      b.base +
      b.gst +
      b.registration +
      b.parking +
      b.clubhouse +
      b.maintenance +
      b.floorRise +
      b.legal;

    // ==========================
    // WINNER
    // ==========================

    const winner =
      totalA < totalB
        ? aName
        : bName;

    const savings =
      Math.abs(
        totalA - totalB
      );

    // ==========================
    // PRICE / SQFT
    // ==========================

    const priceSqftA =
      a.superArea
        ? totalA / a.superArea
        : 0;

    const priceSqftB =
      b.superArea
        ? totalB / b.superArea
        : 0;

    // ==========================
    // EMI
    // ==========================

    const emiA =
      calculateEMI(
        a.loan,
        a.interest,
        a.tenure
      );

    const emiB =
      calculateEMI(
        b.loan,
        b.interest,
        b.tenure
      );

    // ==========================
    // RENTAL YIELD
    // ==========================

    const yieldA =
      a.rent
        ? (
          (
            (a.rent * 12) /
            totalA
          ) * 100
        ).toFixed(2)
        : 0;

    const yieldB =
      b.rent
        ? (
          (
            (b.rent * 12) /
            totalB
          ) * 100
        ).toFixed(2)
        : 0;

    // ==========================
    // PDF DATA
    // ==========================

    window.latestComparisonData = {

      aName,
      bName,

      totalA,
      totalB,

      winner,
      savings,

      yieldA,
      yieldB,

      emiA,
      emiB
    };

    // ==========================
    // SHOW RESULT
    // ==========================

    document.getElementById(
      "resultCard"
    ).style.display = "block";

    document.getElementById(
      "chartSection"
    ).style.display = "block";

    document.getElementById(
      "aiSection"
    ).style.display = "block";

    // ==========================
    // RESULT SUMMARY
    // ==========================

    document.getElementById(
      "resultDetails"
    ).innerHTML = `

      <div class="winner-box">

        <h2>
          Recommended:
          ${winner}
        </h2>

        <p>

          Estimated Savings:

          <strong>
            ${formatCurrency(
              savings
            )}
          </strong>

        </p>

      </div>
    `;

    // ==========================
    // TABLE
    // ==========================

    document.getElementById(
      "comparisonTable"
    ).innerHTML = `

      <div class="compare-table-wrapper">

        <table class="compare-table">

          <tr>

            <th>
              Metric
            </th>

            <th>
              ${aName}
            </th>

            <th>
              ${bName}
            </th>

          </tr>

          <tr>

            <td>
              Total Cost
            </td>

            <td>
              ${formatCurrency(
                totalA
              )}
            </td>

            <td>
              ${formatCurrency(
                totalB
              )}
            </td>

          </tr>

          <tr>

            <td>
              Price / Sq.ft
            </td>

            <td>
              ${formatCurrency(
                priceSqftA
              )}
            </td>

            <td>
              ${formatCurrency(
                priceSqftB
              )}
            </td>

          </tr>

          <tr>

            <td>
              Rental Yield
            </td>

            <td>
              ${yieldA}%
            </td>

            <td>
              ${yieldB}%
            </td>

          </tr>

          <tr>

            <td>
              Monthly EMI
            </td>

            <td>
              ${formatCurrency(
                emiA
              )}
            </td>

            <td>
              ${formatCurrency(
                emiB
              )}
            </td>

          </tr>

        </table>

      </div>
    `;

    // ==========================
    // CHARTS
    // ==========================

    if (
      typeof renderAppreciationChart ===
      "function"
    ) {

      renderAppreciationChart({

        aName,
        bName,

        aBase: a.base,
        bBase: b.base
      });
    }

    // ==========================
    // OWNERSHIP
    // ==========================

    if (
      typeof renderOwnershipProjection ===
      "function"
    ) {

      renderOwnershipProjection({

        aName,
        bName,

        totalA,
        totalB,

        maintenanceA:
          a.maintenance,

        maintenanceB:
          b.maintenance
      });
    }

    // ==========================
    // AI
    // ==========================

    if (
      typeof renderAIRecommendation ===
      "function"
    ) {

      renderAIRecommendation({

        winner,
        savings,

        yieldA,
        yieldB,

        emiA,
        emiB
      });
    }

  } catch (err) {

    console.error(err);

    alert(
      "Failed to compare properties"
    );

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

  localStorage.setItem(

    "lastComparison",

    JSON.stringify(
      window.latestComparisonData || {}
    )
  );

  alert(
    "Comparison saved successfully"
  );
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
}