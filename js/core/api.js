// ======================
// SUPABASE CLIENT
// =====================

function requireSupabase() {

  let client =
    window.getSupabaseClient?.();

  // Force init if missing
  if (!client && window.initSupabase) {

    client = window.initSupabase();
  }

  if (!client) {

    throw new Error(
      "Supabase client not initialized"
    );
  }

  return client;
}



// ==============================
// AUTH
// ==============================

async function getUser() {
  try {
    if (!requireSupabase()) return null;
    const { data } = await requireSupabase().auth.getUser();
    return data?.user || null;
  } catch {
    return null;
  }
}

async function signIn() {
  const email = document.getElementById("email")?.value?.trim();
  const password = document.getElementById("password")?.value;

  if (!email || !password) {
    throw new Error("Enter email and password");
  }

  const { data, error } = await requireSupabase().auth.signInWithPassword({
    email,
    password
  });

  if (error) throw new Error(error.message);

  return data;
}

async function signUp() {
  const fullName = document.getElementById("fullName")?.value?.trim();
  const email = document.getElementById("email")?.value?.trim();
  const password = document.getElementById("password")?.value;

  if (!email || !password) {
    throw new Error("Enter email and password");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const { data, error } = await requireSupabase().auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || ""
      }
    }
  });

  if (error) throw new Error(error.message);

  return data;
}

function setAuthMessage(message, type = "error") {
  const el = document.getElementById("authError");

  if (!el) return;

  el.textContent = message || "";
  el.className = type === "success"
    ? "auth-message auth-message-success"
    : "auth-message auth-message-error";
}

function setAuthLoading(buttonId, isLoading, loadingText) {
  const button = document.getElementById(buttonId);

  if (!button) return;

  if (!button.dataset.defaultText) {
    button.dataset.defaultText =
      button.textContent.trim();
  }

  button.disabled = isLoading;
  button.textContent = isLoading
    ? loadingText
    : button.dataset.defaultText;
}

function normalizeRole(role = "") {
  return String(role)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function isAdminRole(role = "") {
  return [
    "admin",
    "super_admin"
  ].includes(normalizeRole(role));
}

async function handleLogin(event) {
  event?.preventDefault?.();

  try {
    setAuthMessage("");
    setAuthLoading("loginBtn", true, "Logging in...");

    await signIn();

// ==============================
// SMART REDIRECT
// ==============================

const redirectPath =

  localStorage.getItem(
    "postLoginRedirect"
  ) ||

  "dashboard.html";

// CLEANUP
localStorage.removeItem(
  "postLoginRedirect"
);

// REDIRECT
window.location.href =
  appPath(redirectPath);

  } catch (error) {
    setAuthMessage(error.message || "Login failed");
  } finally {
    setAuthLoading("loginBtn", false);
  }
}

async function handleSignup(event) {
  event?.preventDefault?.();

  try {
    setAuthMessage("");
    setAuthLoading("signupBtn", true, "Creating account...");

    const data = await signUp();

    if (data?.session) {
      window.location.href =
        appPath("dashboard.html");
      return;
    }

    setAuthMessage(
      "Account created. Check your email to confirm your sign up.",
      "success"
    );

  } catch (error) {
    setAuthMessage(error.message || "Sign up failed");
  } finally {
    setAuthLoading("signupBtn", false);
  }
}

async function handleLogout() {
  await logout();
}

async function updateAuthUI() {
  const authButtons =
    document.getElementById("authButtons");

  const profileSection =
    document.getElementById("profileSection");

  if (!authButtons && !profileSection) return;

  const user = await getUser();

  if (!user) {
    if (authButtons) {
      authButtons.style.display = "flex";
    }

    if (profileSection) {
      profileSection.style.display = "none";
    }

    return;
  }

  if (authButtons) {
    authButtons.style.display = "none";
  }

  if (profileSection) {
    profileSection.style.display = "inline-block";
  }

  const profileAvatar =
  document.getElementById(
    "profileAvatar"
  );

const profileEmail =
  document.getElementById(
    "profileEmail"
  );

const firstLetter =
  (
    user.user_metadata?.full_name ||
    user.email ||
    "U"
  )
    .charAt(0)
    .toUpperCase();

if (profileAvatar) {

  profileAvatar.textContent =
    firstLetter;
}

if (profileEmail) {

  profileEmail.textContent =
    user.email || "";
}

  const adminNavItem =
    document.getElementById("adminNavItem");

  if (adminNavItem) {
    const profile = await getProfile();

    adminNavItem.style.display =
      isAdminRole(profile?.role)
        ? "flex"
        : "none";
  }
}

async function logout() {

  try {

    if (requireSupabase()) {

      await requireSupabase().auth.signOut();
    }

  } catch (err) {

    console.error("Logout failed", err);
  }

  window.location.href =
    appPath("index.html");
}

// ==============================
// PROFILE + RBAC
// ==============================

async function getProfile() {
  const user = await getUser();

  if (!user) return null;

  const fallbackProfile = {
  id: user.id,
  email: user.email,
  full_name: user.user_metadata?.full_name || "",
  role:
    user.app_metadata?.role ||
    user.user_metadata?.role ||
    "user",
  created_at: user.created_at || new Date().toISOString()
};

  const { data, error } = await requireSupabase()
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return fallbackProfile;
  }

  if (data) {

    return {
      ...fallbackProfile,
      ...data,
      role:
        data.role ||
        fallbackProfile.role
    };
  }

  const { data: created, error: createError } = await requireSupabase()
    .from("profiles")
    .insert([fallbackProfile])
    .select("*")
    .maybeSingle();

  if (createError) {
    console.error(createError);
    return fallbackProfile;
  }

  return created || fallbackProfile;
}

async function isSuperAdmin() {
  const profile = await getProfile();

  return isAdminRole(profile?.role);
}

window.signIn = signIn;

window.signUp = signUp;

window.logout = logout;

window.handleLogin = handleLogin;

window.handleSignup = handleSignup;

window.handleLogout = handleLogout;

window.updateAuthUI = updateAuthUI;

window.getUser = getUser;

window.getProfile = getProfile;

window.isSuperAdmin = isSuperAdmin;

window.isAdminRole = isAdminRole;

