// =============================================
// PROPWISE COMPARE DATA
// =============================================


// =============================================
// STATE DROPDOWN
// =============================================

function populateStateDropdown(
  dropdownId
) {

  const dropdown =
    document.getElementById(
      dropdownId
    );

  if (!dropdown) return;

  dropdown.innerHTML =
    '<option value="">Select State</option>';

  CalculatorRules.states

    .sort((a, b) =>
      a.state_name.localeCompare(
        b.state_name
      )
    )

    .forEach(state => {

      dropdown.innerHTML += `

        <option value="${state.state_code}">
          ${state.state_name}
        </option>

      `;
    });
}


// =============================================
// CITY DROPDOWN
// =============================================

function populateCityDropdown(
  stateDropdownId,
  cityDropdownId
) {

  const stateDropdown =
    document.getElementById(
      stateDropdownId
    );

  const cityDropdown =
    document.getElementById(
      cityDropdownId
    );

  if (
    !stateDropdown ||
    !cityDropdown
  ) {

    return;
  }

  const stateCode =
    stateDropdown.value;

  cityDropdown.innerHTML =
    '<option value="">Select City</option>';

  if (!stateCode) {

    cityDropdown.innerHTML =
      '<option value="">Select State First</option>';

    return;
  }

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

      cityDropdown.innerHTML += `

        <option value="${city.city_name}">
          ${city.city_name}
        </option>

      `;
    });
}


// =============================================
// PROPERTY A
// =============================================

function handleAStateChange() {

  populateCityDropdown(
    "aState",
    "aCity"
  );
}


// =============================================
// PROPERTY B
// =============================================

function handleBStateChange() {

  populateCityDropdown(
    "bState",
    "bCity"
  );
}


// =============================================
// INITIALIZE
// =============================================

async function initCompareDropdowns() {

  if (
    !window.CalculatorRules ||
    !CalculatorRules.states
  ) {

    console.error(
      "CalculatorRules not loaded"
    );

    return;
  }

  populateStateDropdown(
    "aState"
  );

  populateStateDropdown(
    "bState"
  );

  document
    .getElementById("aState")
    ?.addEventListener(
      "change",
      handleAStateChange
    );

  document
    .getElementById("bState")
    ?.addEventListener(
      "change",
      handleBStateChange
    );

  console.log(
    "Compare dropdowns initialized"
  );
}


// =============================================
// HELPERS
// =============================================

function getSelectedStateA() {

  return document
    .getElementById("aState")
    ?.value;
}

function getSelectedCityA() {

  return document
    .getElementById("aCity")
    ?.value;
}

function getSelectedStateB() {

  return document
    .getElementById("bState")
    ?.value;
}

function getSelectedCityB() {

  return document
    .getElementById("bCity")
    ?.value;
}


// =============================================
// EXPORTS
// =============================================

window.initCompareDropdowns =
  initCompareDropdowns;

window.getSelectedStateA =
  getSelectedStateA;

window.getSelectedCityA =
  getSelectedCityA;

window.getSelectedStateB =
  getSelectedStateB;

window.getSelectedCityB =
  getSelectedCityB;