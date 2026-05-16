// ==============================
// PROPERTY COST CALCULATOR UI
// ==============================

function calculate() {

  const basePrice =
    parseFloat(
      document.getElementById("basePrice")?.value || 0
    );

  const charges =
    parseFloat(
      document.getElementById("chargesInput")?.value || 0
    );

  const state =
    document.getElementById("state")?.value;

  if (!basePrice) {

    alert("Please enter property price");

    return;
  }

  let registrationRate = 0.05;

  switch (state) {

    case "KA":
      registrationRate = 0.056;
      break;

    case "MH":
      registrationRate = 0.06;
      break;

    case "TN":
      registrationRate = 0.07;
      break;

    case "DL":
      registrationRate = 0.06;
      break;
  }

  const registration =
    basePrice * registrationRate;

  const total =
    basePrice +
    charges +
    registration;

  const resultDiv =
    document.getElementById("calcResult");

  if (!resultDiv) return;

  resultDiv.innerHTML = `

    <div class="result-card">

      <h3>Total Estimated Cost</h3>

      <p>
        Base Price:
        ₹${basePrice.toLocaleString()}
      </p>

      <p>
        Registration:
        ₹${Math.round(registration).toLocaleString()}
      </p>

      <p>
        Additional Charges:
        ₹${charges.toLocaleString()}
      </p>

      <hr style="margin:10px 0;">

      <h2>
        ₹${Math.round(total).toLocaleString()}
      </h2>

    </div>
  `;
}


window.calculate = calculate;