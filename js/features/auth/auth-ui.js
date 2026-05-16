// ==============================
// AUTH UI
// ==============================

function initAuthForm() {
  const loginForm =
    document.getElementById("loginForm");

  const signupForm =
    document.getElementById("signupForm");

  if (loginForm) {
    loginForm.addEventListener(
      "submit",
      handleLogin
    );
  }

  if (signupForm) {
    signupForm.addEventListener(
      "submit",
      handleSignup
    );
  }
}

document.addEventListener(
  "DOMContentLoaded",
  initAuthForm
);

window.initAuthForm = initAuthForm;
