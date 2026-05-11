// ==============================
// PROPERTY COMPARISON ENGINE
// ==============================

function getCompareValue(id) {
  return Number(document.getElementById(id)?.value || 0);
}

function formatCurrency(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function calculatePropertyTotal(prefix) {

  return (
    getCompareValue(`${prefix}Base`) +
    getCompareValue(`${prefix}Gst`) +
    getCompareValue(`${prefix}Registration`) +
    getCompareValue(`${prefix}Parking`) +
    getCompareValue(`${prefix}Clubhouse`) +
    getCompareValue(`${prefix}Maintenance`) +
    getCompareValue(`${prefix}FloorRise`) +
    getCompareValue(`${prefix}Legal`)
  );
}

function compareAdvanced() {

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

  // DETAILED TABLE
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

        <tr>
          <td>Base Price</td>
          <td>${formatCurrency(a.base)}</td>
          <td>${formatCurrency(b.base)}</td>
        </tr>

        <tr>
          <td>GST</td>
          <td>${formatCurrency(a.gst)}</td>
          <td>${formatCurrency(b.gst)}</td>
        </tr>

        <tr>
          <td>Registration</td>
          <td>${formatCurrency(a.registration)}</td>
          <td>${formatCurrency(b.registration)}</td>
        </tr>

        <tr>
          <td>Parking</td>
          <td>${formatCurrency(a.parking)}</td>
          <td>${formatCurrency(b.parking)}</td>
        </tr>

        <tr>
          <td>Clubhouse</td>
          <td>${formatCurrency(a.clubhouse)}</td>
          <td>${formatCurrency(b.clubhouse)}</td>
        </tr>

        <tr>
          <td>Maintenance</td>
          <td>${formatCurrency(a.maintenance)}</td>
          <td>${formatCurrency(b.maintenance)}</td>
        </tr>

        <tr>
          <td>Floor Rise</td>
          <td>${formatCurrency(a.floorRise)}</td>
          <td>${formatCurrency(b.floorRise)}</td>
        </tr>

        <tr>
          <td>Legal Fees</td>
          <td>${formatCurrency(a.legal)}</td>
          <td>${formatCurrency(b.legal)}</td>
        </tr>

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

        <p>
          Estimated 5-year ownership cost
          including maintenance escalation.
        </p>

      </div>

      <div class="projection-card">

        <h3>${escapeHtml(bName)}</h3>

        <div class="projection-price">
          ${formatCurrency(Math.round(bFive))}
        </div>

        <p>
          Estimated 5-year ownership cost
          including maintenance escalation.
        </p>

      </div>

    </div>
  `;
}

// ==============================
// SAVE COMPARISON
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