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

window.addEventListener("DOMContentLoaded", () => {

  document
    .querySelectorAll('input[type="number"]')
    .forEach(input => {

      formatNumberInput(input);
    });

  loadSavedComparison();
});

// ==============================
// LOCAL STORAGE AUTOSAVE
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
      localStorage.getItem("compareDraft")
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
// GLOBAL TOTALS
// ==============================

let totalA = 0;
let totalB = 0;

// ==============================
// VALIDATION
// ==============================

function validateCompareForm() {

  const requiredFields = [

    "aName",
    "aBase",
    "aRegistration",
    "aMaintenance",
    "aSuperArea",

    "bName",
    "bBase",
    "bRegistration",
    "bMaintenance",
    "bSuperArea"
  ];

  let valid = true;
  let firstInvalid = null;

  requiredFields.forEach(id => {

    const input =
      document.getElementById(id);

    const error =
      document.getElementById(`${id}Error`);

    const value =
      input?.value?.trim();

    if (!value) {

      valid = false;

      input.classList.add("invalid");

      if (error) {
        error.classList.add("show");
      }

      if (!firstInvalid) {
        firstInvalid = input;
      }

    } else {

      input.classList.remove("invalid");

      if (error) {
        error.classList.remove("show");
      }
    }
  });

  if (firstInvalid) {

    firstInvalid.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    firstInvalid.focus();
  }

  return valid;
}

// ==============================
// EMI
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
  ) return 0;

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

function calculateFiveYearMaintenance(initial) {

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
    value * Math.pow(1 + rate, years)
  );
}

// ==============================
// MAIN COMPARISON
// ==============================

async function compareAdvanced() {

  const btn =
    document.getElementById("compareBtn");

  btn.disabled = true;
  btn.innerText = "Analyzing...";

  try {

    const valid =
      validateCompareForm();

    if (!valid) {
  btn.disabled = false;
  btn.innerText = "Compare Properties";
  return;
}

    // ==========================
    // PROPERTY NAMES
    // ==========================

    const aName =
      document.getElementById("aName").value;

    const bName =
      document.getElementById("bName").value;

    // ==========================
    // PROPERTY A
    // ==========================

    const a = {

      base: getCompareValue("aBase"),
      gst: getCompareValue("aGst"),
      registration: getCompareValue("aRegistration"),
      parking: getCompareValue("aParking"),
      clubhouse: getCompareValue("aClubhouse"),
      maintenance: getCompareValue("aMaintenance"),
      floorRise: getCompareValue("aFloorRise"),
      legal: getCompareValue("aLegal"),
      superArea: getCompareValue("aSuperArea"),
      carpetArea: getCompareValue("aCarpetArea"),
      rent: getCompareValue("aRent"),
      loan: getCompareValue("aLoan"),
      interest: getCompareValue("aInterest"),
      tenure: getCompareValue("aTenure")
    };

    // ==========================
    // PROPERTY B
    // ==========================

    const b = {

      base: getCompareValue("bBase"),
      gst: getCompareValue("bGst"),
      registration: getCompareValue("bRegistration"),
      parking: getCompareValue("bParking"),
      clubhouse: getCompareValue("bClubhouse"),
      maintenance: getCompareValue("bMaintenance"),
      floorRise: getCompareValue("bFloorRise"),
      legal: getCompareValue("bLegal"),
      superArea: getCompareValue("bSuperArea"),
      carpetArea: getCompareValue("bCarpetArea"),
      rent: getCompareValue("bRent"),
      loan: getCompareValue("bLoan"),
      interest: getCompareValue("bInterest"),
      tenure: getCompareValue("bTenure")
    };

    // ==========================
    // TOTALS
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

    const winner =
      totalA < totalB
        ? aName
        : bName;

    const savings =
      Math.abs(totalA - totalB);

    // ==========================
    // PRICE PER SQFT
    // ==========================

    const priceSqftA =
      totalA / a.superArea;

    const priceSqftB =
      totalB / b.superArea;

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
          ((a.rent * 12) / totalA) * 100
        ).toFixed(2)
        : 0;

    const yieldB =
      b.rent
        ? (
          ((b.rent * 12) / totalB) * 100
        ).toFixed(2)
        : 0;

    // ==========================
    // GLOBAL PDF DATA
    // ==========================

    window.latestComparisonData = {

      aName,
      bName,

      winner,

      savings:
        formatCurrency(savings),

      timestamp:
        new Date().toLocaleString(),

      recommendation:
        `${winner} appears financially stronger based on ownership cost, appreciation potential and financial efficiency.`,

      rows: [

        {
          label: "Total Cost",
          a: formatCurrency(totalA),
          b: formatCurrency(totalB)
        },

        {
          label: "Price/Sq.ft",
          a: formatCurrency(priceSqftA),
          b: formatCurrency(priceSqftB)
        },

        {
          label: "Monthly EMI",
          a: formatCurrency(emiA),
          b: formatCurrency(emiB)
        },

        {
          label: "Rental Yield",
          a: `${yieldA}%`,
          b: `${yieldB}%`
        }
      ]
    };

    // ==========================
    // SHOW RESULT
    // ==========================

    document.getElementById(
      "resultCard"
    ).style.display = "block";

    // ==========================
    // SUMMARY
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
          ${formatCurrency(savings)}
        </p>

      </div>
    `;

    // ==========================
    // TABLE
    // ==========================

    document.getElementById(
      "comparisonTable"
    ).innerHTML = `

      <table class="pdf-table">

        <tr>
          <th>Metric</th>
          <th>${aName}</th>
          <th>${bName}</th>
        </tr>

        <tr>
          <td>Total Cost</td>
          <td>${formatCurrency(totalA)}</td>
          <td>${formatCurrency(totalB)}</td>
        </tr>

        <tr>
          <td>Price/Sq.ft</td>
          <td>${formatCurrency(priceSqftA)}</td>
          <td>${formatCurrency(priceSqftB)}</td>
        </tr>

        <tr>
          <td>Rental Yield</td>
          <td>${yieldA}%</td>
          <td>${yieldB}%</td>
        </tr>

        <tr>
          <td>Monthly EMI</td>
          <td>${formatCurrency(emiA)}</td>
          <td>${formatCurrency(emiB)}</td>
        </tr>

      </table>
    `;

    // ==========================
    // SHOW SECTIONS
    // ==========================

    document.getElementById(
      "chartSection"
    ).style.display = "block";

    document.getElementById(
      "aiSection"
    ).style.display = "block";

    // ==========================
    // CHARTS
    // ==========================

    renderAppreciationChart({

      aName,
      bName,

      aBase: a.base,
      bBase: b.base
    });

    // ==========================
    // OWNERSHIP
    // ==========================

    renderOwnershipProjection({

      aName,
      bName,

      totalA,
      totalB,

      maintenanceA: a.maintenance,
      maintenanceB: b.maintenance
    });

    // ==========================
    // AI RECOMMENDATION
    // ==========================

    renderAIRecommendation({

      winner,

      savings,

      yieldA,
      yieldB,

      emiA,
      emiB
    });

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
// SAVE COMPARISON
// ==============================

async function saveComparison() {

  if (!totalA || !totalB) {

    alert(
      "Please compare properties first"
    );

    return;
  }

  const user =
    await getUser();

  if (!user) {

    alert(
      "Please login"
    );

    return;
  }

  const payload = {

    user_id: user.id,

    property_a:
      document.getElementById("aName").value,

    property_b:
      document.getElementById("bName").value,

    property_a_price: totalA,

    property_b_price: totalB,

    created_at:
      new Date().toISOString()
  };

  const { error } =
    await supabaseClient
      .from("comparisons")
      .insert([payload]);

  if (error) {

    console.error(error);

    alert(error.message);

    return;
  }

  alert(
    "Comparison saved successfully"
  );
}