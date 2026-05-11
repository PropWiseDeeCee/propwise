// ==============================
// HELPERS
// ==============================

function getCompareValue(id) {
  return Number(document.getElementById(id)?.value || 0);
}

function formatCurrency(value) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

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

  let firstInvalid = null;
  let valid = true;

  requiredFields.forEach(id => {

    const input =
      document.getElementById(id);

    const error =
      document.getElementById(`${id}Error`);

    const value =
      input?.value?.trim();

    if (!value || Number(value) < 0) {

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

function calculateEMI(principal, annualRate, years) {

  if (!principal || !annualRate || !years) {
    return 0;
  }

  const monthlyRate =
    annualRate / 12 / 100;

  const months =
    years * 12;

  const emi =
    principal *
    monthlyRate *
    Math.pow(1 + monthlyRate, months) /
    (Math.pow(1 + monthlyRate, months) - 1);

  return Math.round(emi);
}

// ==============================
// MAINTENANCE PROJECTION
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

function calculateFutureValue(value, rate = 0.06, years = 5) {

  return Math.round(
    value * Math.pow(1 + rate, years)
  );
}
// ==============================
// LOCALITY ENGINE
// ==============================

function getLocalityScore(name = "") {

  const locality =
    name.toLowerCase().trim();

  const localityData = {

    // BANGALORE
    whitefield: {
      score: 9,
      reason:
        "Strong IT demand, metro expansion and high rental demand."
    },

    sarjapur: {
      score: 8,
      reason:
        "Rapid growth corridor with strong appreciation potential."
    },

    hebbal: {
      score: 9,
      reason:
        "Premium North Bangalore growth zone near airport corridor."
    },

    electronic: {
      score: 7,
      reason:
        "Stable IT employment zone with moderate appreciation."
    },

    indiranagar: {
      score: 10,
      reason:
        "Prime luxury locality with strong resale value."
    },

    // HYDERABAD
    gachibowli: {
      score: 9,
      reason:
        "Top IT corridor with excellent rental market."
    },

    hitech: {
      score: 9,
      reason:
        "Strong commercial ecosystem and premium demand."
    },

    // MUMBAI
    bandra: {
      score: 10,
      reason:
        "Premium Mumbai locality with elite resale demand."
    },

    powai: {
      score: 9,
      reason:
        "Strong corporate demand and premium housing ecosystem."
    },

    // NCR
    gurgaon: {
      score: 9,
      reason:
        "High-end commercial and residential demand."
    },

    noida: {
      score: 8,
      reason:
        "Infrastructure-led appreciation with improving connectivity."
    },

    // PUNE
    hinjewadi: {
      score: 8,
      reason:
        "Major IT employment hub with strong rental market."
    },

    // CHENNAI
    omr: {
      score: 8,
      reason:
        "Major IT and residential growth corridor."
    }
  };

  for (const key in localityData) {

    if (locality.includes(key)) {

      return {
        found: true,
        locality: key,
        score: localityData[key].score,
        reason: localityData[key].reason
      };
    }
  }

  return {
    found: false,
    locality: name,
    score: 5,
    reason:
      "This locality is currently not available in PropWise intelligence database. Neutral baseline assumptions applied."
  };
}

// ==============================
// AI RECOMMENDATION
// ==============================

function generateRecommendation(data) {

  const {

    aName,
    bName,

    totalA,
    totalB,

    yieldA,
    yieldB,

    futureA,
    futureB,

    localityA,
    localityB

  } = data;

  const better =
    totalA < totalB
      ? aName
      : bName;

  let reasons = [];

  if (yieldA > yieldB) {

    reasons.push(
      `${aName} offers stronger rental yield potential.`
    );

  } else {

    reasons.push(
      `${bName} offers stronger rental yield potential.`
    );
  }

  if (futureA > futureB) {

    reasons.push(
      `${aName} shows better long-term appreciation projection.`
    );

  } else {

    reasons.push(
      `${bName} shows better long-term appreciation projection.`
    );
  }

  if (localityA.score > localityB.score) {

    reasons.push(
      `${aName} locality fundamentals appear stronger.`
    );

  } else {

    reasons.push(
      `${bName} locality fundamentals appear stronger.`
    );
  }

  return `

    <div class="recommendation-box">

      <h3>
        Recommended Option:
        ${better}
      </h3>

      <ul>

        ${reasons.map(r => `
          <li>${r}</li>
        `).join("")}

        <li>
          <strong>${aName} Locality Insight:</strong>
          ${localityA.reason}
        </li>

        <li>
          <strong>${bName} Locality Insight:</strong>
          ${localityB.reason}
        </li>

      </ul>

    </div>
  `;
}

// ==============================
// APPRECIATION CHART
// ==============================

let comparisonChart = null;

function renderAppreciationChart(
  aName,
  bName,
  totalA,
  totalB
) {

  const ctx =
    document.getElementById(
      "appreciationChart"
    );

  if (!ctx) return;

  if (comparisonChart) {
    comparisonChart.destroy();
  }

  const years = [1,2,3,4,5];

  const aData = years.map(year =>
    Math.round(
      totalA * Math.pow(1.08, year)
    )
  );

  const bData = years.map(year =>
    Math.round(
      totalB * Math.pow(1.08, year)
    )
  );

  comparisonChart = new Chart(ctx, {

    type: "line",

    data: {

      labels:
        years.map(y => `Year ${y}`),

      datasets: [

        {
          label: aName,
          data: aData,
          borderWidth: 3,
          tension: 0.3
        },

        {
          label: bName,
          data: bData,
          borderWidth: 3,
          tension: 0.3
        }
      ]
    },

    options: {
      responsive: true
    }
  });
}

// ==============================
// PDF EXPORT
// ==============================

async function downloadComparisonPDF() {

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  const content =
    document.getElementById(
      "resultCard"
    ).innerText;

  const lines =
    doc.splitTextToSize(content, 170);

  doc.setFontSize(18);

  doc.text(
    "PropWise Property Comparison",
    20,
    20
  );

  doc.setFontSize(11);

  doc.text(lines, 20, 40);

  doc.save(
    "propwise-comparison.pdf"
  );
}

// ==============================
// MAIN COMPARISON
// ==============================

function compareAdvanced() {

  const valid =
    validateCompareForm();

  if (!valid) return;

  const aName =
    document.getElementById("aName").value;

  const bName =
    document.getElementById("bName").value;

  const localityA =
  getLocalityScore(
    document.getElementById("aLocality").value
  );

const localityB =
  getLocalityScore(
    document.getElementById("bLocality").value
  );

  // ==============================
  // PROPERTY A
  // ==============================

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

  // ==============================
  // PROPERTY B
  // ==============================

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

  // ==============================
  // TOTALS
  // ==============================

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

  // ==============================
  // PRICE / SQFT
  // ==============================

  const pricePerSqftA =
    totalA / a.superArea;

  const pricePerSqftB =
    totalB / b.superArea;

  // ==============================
  // CARPET EFFICIENCY
  // ==============================

  const efficiencyA =
    a.carpetArea
      ? ((a.carpetArea / a.superArea) * 100).toFixed(1)
      : "N/A";

  const efficiencyB =
    b.carpetArea
      ? ((b.carpetArea / b.superArea) * 100).toFixed(1)
      : "N/A";

  // ==============================
  // RENTAL YIELD
  // ==============================

  const yieldA =
    a.rent
      ? (((a.rent * 12) / totalA) * 100).toFixed(2)
      : "N/A";

  const yieldB =
    b.rent
      ? (((b.rent * 12) / totalB) * 100).toFixed(2)
      : "N/A";

  // ==============================
  // EMI
  // ==============================

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

  // ==============================
  // 5 YEAR MAINTENANCE
  // ==============================

  const maintenanceA =
    calculateFiveYearMaintenance(
      a.maintenance
    );

  const maintenanceB =
    calculateFiveYearMaintenance(
      b.maintenance
    );

  // ==============================
  // FUTURE VALUE
  // ==============================

  const futureA =
    calculateFutureValue(totalA);

  const futureB =
    calculateFutureValue(totalB);

  // ==============================
  // BETTER OPTION
  // ==============================

  const better =
    totalA < totalB
      ? aName
      : bName;

  const savings =
    Math.abs(totalA - totalB);

  // ==============================
  // DOM
  // ==============================

  const resultCard =
    document.getElementById("resultCard");

  const resultDetails =
    document.getElementById("resultDetails");

  const comparisonTable =
    document.getElementById("comparisonTable");

  const ownershipProjection =
    document.getElementById("ownershipProjection");

  resultCard.style.display = "block";

  // ==============================
  // RESULT UI
  // ==============================

  resultDetails.innerHTML = `

    <div class="compare-result-grid">

      <div class="compare-result-box">

        <h3>${aName}</h3>

        <div class="compare-price">
          ${formatCurrency(totalA)}
        </div>

        <div class="metric-list">

          <div class="metric-item">
            Price/sq.ft:
            <strong>${formatCurrency(pricePerSqftA)}</strong>
          </div>

          <div class="metric-item">
            Carpet Efficiency:
            <strong>${efficiencyA}%</strong>
          </div>

          <div class="metric-item">
            Rental Yield:
            <strong>${yieldA}%</strong>
          </div>

          <div class="metric-item">
            Estimated EMI:
            <strong>${formatCurrency(emiA)}</strong>
          </div>

        </div>

      </div>

      <div class="compare-result-box">

        <h3>${bName}</h3>

        <div class="compare-price">
          ${formatCurrency(totalB)}
        </div>

        <div class="metric-list">

          <div class="metric-item">
            Price/sq.ft:
            <strong>${formatCurrency(pricePerSqftB)}</strong>
          </div>

          <div class="metric-item">
            Carpet Efficiency:
            <strong>${efficiencyB}%</strong>
          </div>

          <div class="metric-item">
            Rental Yield:
            <strong>${yieldB}%</strong>
          </div>

          <div class="metric-item">
            Estimated EMI:
            <strong>${formatCurrency(emiB)}</strong>
          </div>

        </div>

      </div>

    </div>

    <div class="winner-box">

      <h3>
        Better Financial Option:
        ${better}
      </h3>

      <p>
        Estimated Savings:
        <strong>${formatCurrency(savings)}</strong>
      </p>

    </div>
  `;

  // ==============================
  // DETAILED TABLE
  // ==============================

  comparisonTable.innerHTML = `

    <h2 style="margin-bottom:20px;">
      Detailed Cost Comparison
    </h2>

    <div class="compare-table-wrapper">

      <table class="compare-table">

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
          <td>Price per sq.ft</td>
          <td>${formatCurrency(pricePerSqftA)}</td>
          <td>${formatCurrency(pricePerSqftB)}</td>
        </tr>

        <tr>
          <td>Carpet Efficiency</td>
          <td>${efficiencyA}%</td>
          <td>${efficiencyB}%</td>
        </tr>

        <tr>
          <td>Rental Yield</td>
          <td>${yieldA}%</td>
          <td>${yieldB}%</td>
        </tr>

        <tr>
          <td>Estimated EMI</td>
          <td>${formatCurrency(emiA)}</td>
          <td>${formatCurrency(emiB)}</td>
        </tr>

        <tr>
  <td>Locality Score</td>
  <td>${localityA.score}/10</td>
  <td>${localityB.score}/10</td>
</tr>

      </table>

    </div>
  `;

  // ==============================
  // PROJECTIONS
  // ==============================

  ownershipProjection.innerHTML = `

    <h2 style="margin-bottom:20px;">
      5-Year Ownership Projection
    </h2>

    <div class="projection-grid">

      <div class="projection-card">

        <h3>${aName}</h3>

        <p>
          5 Year Maintenance:
          <strong>${formatCurrency(maintenanceA)}</strong>
        </p>

        <p>
          Projected Property Value:
          <strong>${formatCurrency(futureA)}</strong>
        </p>

      </div>

      <div class="projection-card">

        <h3>${bName}</h3>

        <p>
          5 Year Maintenance:
          <strong>${formatCurrency(maintenanceB)}</strong>
        </p>

        <p>
          Projected Property Value:
          <strong>${formatCurrency(futureB)}</strong>
        </p>

      </div>

    </div>
  `;
document.getElementById(
  "chartSection"
).style.display = "block";

document.getElementById(
  "aiSection"
).style.display = "block";

renderAppreciationChart(
  aName,
  bName,
  totalA,
  totalB
);

document.getElementById(
  "aiRecommendation"
).innerHTML =
  generateRecommendation({

    aName,
    bName,

    totalA,
    totalB,

    yieldA:
      Number(yieldA) || 0,

    yieldB:
      Number(yieldB) || 0,

    futureA,
    futureB,

    localityA,
    localityB
  });
  
  resultCard.scrollIntoView({
    behavior: "smooth"
  });
}

// ==============================
// SAVE
// ==============================

async function saveComparison() {

  const user =
    await getUser();

  if (!user) {

    alert("Please login first");

    window.location.href =
      "login.html";

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

    alert(
      error.message ||
      "Failed to save comparison"
    );

    return;
  }

  alert("Comparison saved successfully");
}