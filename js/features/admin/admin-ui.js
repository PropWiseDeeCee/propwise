// ==============================
// ADMIN UI
// ==============================

async function loadAdmin() {
  const adminEl =
    document.getElementById("admin");

  if (!adminEl) return;

  adminEl.innerHTML = `
    <section class="admin-section">
      <div class="loading">Checking admin access...</div>
    </section>
  `;

  const user = await getUser();

  if (!user) {
    window.location.href =
      appPath("login.html");

    return;
  }

  const profile = await getProfile();

  if (!isAdminRole(profile?.role)) {
    adminEl.innerHTML = `
      <section class="admin-section">
        <div class="admin-access-card">
          <h1>Admin Access Required</h1>
          <p>
            You are signed in as
            <strong>${escapeHtml(user.email || "this user")}</strong>,
            but this account is not marked as an admin.
          </p>
          <p class="small-text">
            Current role: ${escapeHtml(profile?.role || "user")}
          </p>
          <a class="btn btn-primary" href="dashboard.html">
            Go to Dashboard
          </a>
        </div>
      </section>
    `;

    return;
  }

  adminEl.innerHTML = `
    <section class="admin-section">
      <div class="admin-header">
        <div>
          <h1 class="admin-title">Admin Dashboard</h1>
          <p class="admin-subtitle">
            Platform activity, saved comparisons, users and visitor journeys.
          </p>
        </div>

        <div class="admin-actions">
          <a class="btn btn-outline" href="dashboard.html">
            Dashboard
          </a>
        </div>
      </div>

      <div id="adminMetrics" class="admin-metrics">
        <div class="loading">Loading admin metrics...</div>
      </div>

      <div class="admin-panel-grid">
        <div class="card">
          <h2>Top Pages</h2>
          <div id="adminTopPages" class="admin-list">
            <div class="loading">Loading top pages...</div>
          </div>
        </div>

        <div class="card">
          <h2>Recent Activity</h2>
          <div id="adminRecentActivity" class="admin-list">
            <div class="loading">Loading recent activity...</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>User Journeys</h2>
        <div id="adminJourneys" class="admin-list">
          <div class="loading">Loading journeys...</div>
        </div>
      </div>

      <div class="card admin-ticket-panel">
        <div class="admin-ticket-header">
          <div>
            <h2>Support Tickets</h2>
            <p>Review incoming support issues, update progress, and request more details from the user.</p>
          </div>
        </div>

        <div class="admin-ticket-toolbar">
          <div id="adminTicketSummary" class="admin-ticket-summary"></div>
          <div id="adminTicketFilters" class="admin-ticket-filters" aria-label="Ticket filters">
            <button type="button" class="admin-ticket-filter-btn is-active" data-ticket-filter="All">All</button>
            <button type="button" class="admin-ticket-filter-btn" data-ticket-filter="Open">Open</button>
            <button type="button" class="admin-ticket-filter-btn" data-ticket-filter="Pending">Pending</button>
            <button type="button" class="admin-ticket-filter-btn" data-ticket-filter="Waiting for Info">Waiting for Info</button>
            <button type="button" class="admin-ticket-filter-btn" data-ticket-filter="Closed">Closed</button>
          </div>
        </div>

        <div id="adminTickets" class="admin-ticket-list">
          <div class="loading">Loading support tickets...</div>
        </div>
      </div>
    </section>
  `;

  await Promise.all([
    loadAdminAnalytics(),
    loadAdminTickets()
  ]);
}

async function loadAdminTickets() {
  const container = document.getElementById("adminTickets");
  if (!container) return;

  const panel = container.closest(".admin-ticket-panel");
  const summaryEl = panel ? panel.querySelector("#adminTicketSummary") : null;
  const filterButtons = panel ? panel.querySelectorAll(".admin-ticket-filter-btn") : [];
  const activeFilter = window.__adminTicketFilter || "All";

  try {
    window.Services = window.Services || {};

    const service = window.Services.ticket || (
      typeof TicketService === "function" ? new TicketService() : null
    );

    if (!service) {
      container.innerHTML = '<div class="admin-empty-state">Support ticket service is unavailable right now.</div>';
      return;
    }

    window.Services.ticket = service;

    const result = await service.getAllTickets();

    if (!result.success || !Array.isArray(result.data)) {
      container.innerHTML = `<div class="admin-empty-state">${escapeHtml(result.error || "Support tickets are unavailable right now.")}</div>`;
      if (summaryEl) summaryEl.innerHTML = "";
      return;
    }

    const allTickets = result.data.slice().sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const filteredTickets = activeFilter === "All"
      ? allTickets
      : allTickets.filter((ticket) => (ticket.status || "Open") === activeFilter);

    if (summaryEl) {
      const counts = {
        All: allTickets.length,
        Open: allTickets.filter((ticket) => (ticket.status || "Open") === "Open").length,
        Pending: allTickets.filter((ticket) => (ticket.status || "Open") === "Pending").length,
        "Waiting for Info": allTickets.filter((ticket) => (ticket.status || "Open") === "Waiting for Info").length,
        Closed: allTickets.filter((ticket) => (ticket.status || "Open") === "Closed").length
      };

      summaryEl.innerHTML = [
        "All",
        "Open",
        "Pending",
        "Waiting for Info",
        "Closed"
      ].map((label) => `
        <span class="admin-ticket-summary-pill ${activeFilter === label ? "is-active" : ""}">
          ${escapeHtml(label)} <strong>${counts[label]}</strong>
        </span>
      `).join("");
    }

    filterButtons.forEach((button) => {
      const isActive = button.dataset.ticketFilter === activeFilter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      button.onclick = () => {
        window.__adminTicketFilter = button.dataset.ticketFilter || "All";
        loadAdminTickets();
      };
    });

    if (!allTickets.length) {
      container.innerHTML = '<div class="admin-empty-state">No support tickets have been submitted yet.</div>';
      return;
    }

    if (!filteredTickets.length) {
      container.innerHTML = '<div class="admin-empty-state">No support tickets match this filter.</div>';
      return;
    }

    container.innerHTML = filteredTickets.map((ticket) => {
      const ticketId = ticket.id || "";
      const status = ticket.status || "Open";
      const subject = ticket.subject || "Untitled ticket";
      const category = ticket.category || "General";
      const priority = ticket.priority || "Medium";
      const sender = ticket.name || ticket.email || "Unknown user";
      const createdAt = ticket.created_at ? new Date(ticket.created_at).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      }) : "Unknown time";
      const note = ticket.admin_note || "";

      return `
        <div class="admin-ticket-item">
          <div class="admin-ticket-topline">
            <div>
              <span class="admin-ticket-id">#${escapeHtml(ticket.ticket_number || ticketId)}</span>
              <h3>${escapeHtml(subject)}</h3>
            </div>
            <span class="admin-ticket-status admin-ticket-status-${escapeHtml(status.toLowerCase().replace(/\s+/g, "-"))}">${escapeHtml(status)}</span>
          </div>

          <div class="admin-ticket-meta">
            <span><strong>User:</strong> ${escapeHtml(sender)}</span>
            <span><strong>Email:</strong> ${escapeHtml(ticket.email || "Not provided")}</span>
            <span><strong>Category:</strong> ${escapeHtml(category)}</span>
            <span><strong>Priority:</strong> ${escapeHtml(priority)}</span>
            <span><strong>Created:</strong> ${escapeHtml(createdAt)}</span>
          </div>

          <p class="admin-ticket-message">${escapeHtml(ticket.message || "No message provided.")}</p>

          <div class="admin-ticket-actions">
            <label>
              <span>Status</span>
              <select data-ticket-status-select="${escapeHtml(ticketId)}">
                <option value="Open" ${status === "Open" ? "selected" : ""}>Open</option>
                <option value="Pending" ${status === "Pending" ? "selected" : ""}>Pending</option>
                <option value="Waiting for Info" ${status === "Waiting for Info" ? "selected" : ""}>Waiting for Info</option>
                <option value="Closed" ${status === "Closed" ? "selected" : ""}>Closed</option>
              </select>
            </label>

            <label>
              <span>Admin note</span>
              <textarea data-ticket-note="${escapeHtml(ticketId)}" rows="3" placeholder="Add a follow-up note or request information...">${escapeHtml(note)}</textarea>
            </label>

            <button type="button" class="btn btn-primary admin-ticket-save" data-ticket-id="${escapeHtml(ticketId)}">Update Ticket</button>
          </div>
        </div>
      `;
    }).join("");

    const saveButtons = container.querySelectorAll(".admin-ticket-save");
    saveButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const ticketId = button.dataset.ticketId;
        const ticketCard = button.closest(".admin-ticket-item");

        if (!ticketId || !ticketCard) return;

        const selectEl = ticketCard.querySelector("select[data-ticket-status-select]");
        const noteEl = ticketCard.querySelector("textarea[data-ticket-note]");

        if (!selectEl || !noteEl) return;

        button.disabled = true;
        button.textContent = "Updating...";

        try {
          const result = await service.updateTicketStatus(ticketId, selectEl.value, noteEl.value);

          if (!result.success) {
            if (typeof Toast !== "undefined") {
              Toast.error(result.error || "Unable to update the ticket.");
            }
            button.disabled = false;
            button.textContent = "Update Ticket";
            return;
          }

          if (typeof Toast !== "undefined") {
            Toast.success("Ticket updated.");
          }

          await loadAdminTickets();
        } catch (error) {
          console.error("Ticket update failed:", error);

          if (typeof Toast !== "undefined") {
            Toast.error("Unable to update this ticket right now.");
          }

          button.disabled = false;
          button.textContent = "Update Ticket";
        }
      });
    });
  } catch (error) {
    console.error("Ticket load failed:", error);
    container.innerHTML = `<div class="admin-empty-state">Unable to load support tickets. ${escapeHtml(error?.message || "Unknown error")}</div>`;
  }
}

window.loadAdmin = loadAdmin;
window.loadAdminDashboard = loadAdmin;
