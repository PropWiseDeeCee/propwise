// ==============================
// HELPERS
// ==============================

function getCompareValue(id) {
  return Number(document.getElementById(id)?.value || 0);
}

function formatCurrency(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}

// ==============================
// VALIDATION
// ==============================

function validateCompareForm() {

  const requiredFields = [

    {
      id: "aName",
      message: "Please enter Property A name"
    },

    {
      id: "aBase",
      message: "Please enter Property A base price"
    },

    {
      id: "aRegistration",
      message: "Please enter Property A registration charges"
    },

    {
      id: "aMaintenance",
      message: "Please enter Property A maintenance cost"
    },

    {
      id: "bName",
      message: "Please enter Property B name"
    },

    {
      id: "bBase",
      message: "Please enter Property B base price"
    },

    {
      id: "bRegistration",
      message: "Please enter Property B registration charges"
    },

    {
      id: "bMaintenance",
      message: "Please enter Property B maintenance cost"
    }

  ];

  let firstInvalidField = null;
  let valid = true;

  requiredFields.forEach(field => {

    const input =
      document.getElementById(field.id);

    const error =
      document.getElementById(`${field.id}Error`);

    const value =
      input.value.trim();

    if (!value || Number(value) < 0) {

      valid = false;

      input.classList.add("invalid");

      if (error) {
        error.innerText = field.message;
        error.classList.add("show");
      }

      if (!firstInvalidField) {
        firstInvalidField = input;
      }

    } else {

      input.classList.remove("invalid");

      if (error) {
        error.classList.remove("show");
      }
    }

  });

  // SMOOTH SCROLL
  if (firstInvalidField) {

    firstInvalidField.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    firstInvalidField.focus();
  }

  return valid;
}

// ==============================
// MAIN COMPARISON
// ==============================

function compareAdvanced() {

  const valid = validateCompareForm();

  if (!valid) {
    return;
  }

  const aName =
    document.getElementById("aName")?.value || "Property A";

  const bName =
    document.getElementById("bName")?.value || "Property B";

  // PROPERTY A
  const a = {
    base: getCompareValue("aBase"),
    gst: getCompareValue("aGst"),
    registration: getCompareValue("aRegistration"),
    parking: getCompareValue("aParking"),
    clubhouse: getCompareValue("aClubhouse"),
    maintenance: getCompareValue("aMaintenance"),
    floorRise: getCompareValue("aFloorRise"),
    legal: getCompareValue("aLegal")
  };

  // PROPERTY B
  const b = {
    base: getCompareValue("bBase"),
    gst: getCompareValue("bGst"),
    registration: getCompareValue("bRegistration"),
    parking: getCompareValue("bParking"),
    clubhouse: getCompareValue("bClubhouse"),
    maintenance: getCompareValue("bMaintenance"),
    floorRise: getCompareValue("bFloorRise"),
    legal: getCompareValue("bLegal")
  };

  const aTotal =
    Object.values(a).reduce((x, y) => x + y, 0);

  const bTotal =
    Object.values(b).reduce((x, y) => x + y, 0);

  const better =
    aTotal < bTotal ? aName : bName;

  const savings =
    Math.abs(aTotal - bTotal);

  const resultCard =
    document.getElementById("resultCard");

  const resultDetails =
    document.getElementById("resultDetails");

  const comparisonTable =
    document.getElementById("comparisonTable");

  const ownershipProjection =
    document.getElementById("ownershipProjection");

  resultCard.style.display = "block";

  // MAIN RESULT
  resultDetails.innerHTML = `

    <div class="compare-result-grid">

      <div class="compare-result-box">

        <h3>${escapeHtml(aName)}</h3>

        <div class="compare-price">
          ${formatCurrency(aTotal)}
        </div>

      </div>

      <div class="compare-result-box">

        <h3>${escapeHtml(bName)}</h3>

        <div class="compare-price">
          ${formatCurrency(bTotal)}
        </div>

      </div>

    </div>

    <div class="winner-box">

      <h3>
        Better Financial Option:
        ${escapeHtml(better)}
      </h3>

      <p>
        Estimated Savings:
        <strong>${formatCurrency(savings)}</strong>
      </p>

    </div>
  `;

  // TABLE
  comparisonTable.innerHTML = `

    <h2 style="margin-bottom:20px;">
      Detailed Cost Comparison
    </h2>

    <div class="compare-table-wrapper">

      <table class="compare-table">

        <tr>
          <th>Expense</th>
          <th>${escapeHtml(aName)}</th>
          <th>${escapeHtml(bName)}</th>
        </tr>

        ${[
          ["Base Price", a.base, b.base],
          ["GST", a.gst, b.gst],
          ["Registration", a.registration, b.registration],
          ["Parking", a.parking, b.parking],
          ["Clubhouse", a.clubhouse, b.clubhouse],
          ["Maintenance", a.maintenance, b.maintenance],
          ["Floor Rise", a.floorRise, b.floorRise],
          ["Legal Fees", a.legal, b.legal]
        ].map(row => `
          <tr>
            <td>${row[0]}</td>
            <td>${formatCurrency(row[1])}</td>
            <td>${formatCurrency(row[2])}</td>
          </tr>
        `).join("")}

        <tr class="compare-total-row">
          <td>Total Cost</td>
          <td>${formatCurrency(aTotal)}</td>
          <td>${formatCurrency(bTotal)}</td>
        </tr>

      </table>

    </div>
  `;

  // 5 YEAR PROJECTION
  const yearlyGrowth = 1.08;

  let aFive =
    aTotal + (a.maintenance * 5 * yearlyGrowth);

  let bFive =
    bTotal + (b.maintenance * 5 * yearlyGrowth);

  ownershipProjection.innerHTML = `

    <h2 style="margin-bottom:20px;">
      5-Year Ownership Projection
    </h2>

    <div class="projection-grid">

      <div class="projection-card">

        <h3>${escapeHtml(aName)}</h3>

        <div class="projection-price">
          ${formatCurrency(Math.round(aFive))}
        </div>

      </div>

      <div class="projection-card">

        <h3>${escapeHtml(bName)}</h3>

        <div class="projection-price">
          ${formatCurrency(Math.round(bFive))}
        </div>

      </div>

    </div>
  `;

  resultCard.scrollIntoView({
    behavior: "smooth"
  });
}

// ==============================
// SAVE
// ==============================

async function saveComparison() {

  const user = await getUser();

  if (!user) {

    alert("Please login first");

    window.location.href = "login.html";

    return;
  }

  const data = {

    user_id: user.id,

    property_a:
      document.getElementById("aName")?.value || "Property A",

    property_b:
      document.getElementById("bName")?.value || "Property B"
  };

  const { error } = await supabaseClient
    .from("comparisons")
    .insert([data]);

  if (error) {

    console.error(error);

    alert("Failed to save comparison");

    return;
  }

  alert("Comparison saved successfully");
}