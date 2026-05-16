// ==============================
// PROFILE UI
// ==============================

async function loadProfilePage() {
  const profile =
    await getProfile();

  const el =
    document.getElementById("profileContent");

  if (!el) return;

  if (!profile) {
    el.innerHTML = `
      <p>Unable to load profile.</p>
    `;
    return;
  }

  const adminQuickCard =
    document.getElementById("adminQuickCard");

  if (adminQuickCard && isAdminRole(profile.role)) {
    adminQuickCard.style.display = "block";
  }

  el.innerHTML = `
    <div class="profile-form">
      <div class="form-group">
        <label class="form-label" for="fullName">Full Name</label>
        <input
          id="fullName"
          class="form-input"
          type="text"
          placeholder="Enter your full name"
          value="${escapeHtml(profile.full_name || "")}"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Email Address</label>
        <input
          class="form-input"
          type="email"
          value="${escapeHtml(profile.email)}"
          disabled
        />
      </div>

      <div class="form-group">
        <label class="form-label">Role</label>
        <input
          class="form-input"
          type="text"
          value="${escapeHtml(profile.role)}"
          disabled
        />
      </div>

      <div class="form-group">
        <label class="form-label">Member Since</label>
        <input
          class="form-input"
          type="text"
          value="${escapeHtml(new Date(profile.created_at).toLocaleDateString())}"
          disabled
        />
      </div>

      <button onclick="updateProfile()">
        Save Profile
      </button>

      <div
        id="profileMessage"
        class="small-text"
        style="margin-top:15px;"
      ></div>
    </div>
  `;
}

async function updateProfile() {
  const msg =
    document.getElementById("profileMessage");

  if (!msg) return;

  msg.textContent = "Saving...";

  const user =
    await getUser();

  const fullName =
    document.getElementById("fullName")?.value || "";

  const { error } =
    await requireSupabase()
      .from("profiles")
      .update({
        full_name: fullName
      })
      .eq("id", user.id);

  if (error) {
    msg.innerHTML = `
      <span style="color:#dc2626;">
        ${escapeHtml(error.message)}
      </span>
    `;
    return;
  }

  msg.innerHTML = `
    <span style="color:#16a34a;">
      Profile updated successfully
    </span>
  `;
}

window.loadProfilePage = loadProfilePage;
window.updateProfile = updateProfile;
