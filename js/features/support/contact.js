/**
 * ============================================================================
 * PROPWISE INDIA
 * SUPPORT CENTER
 * ============================================================================
 * Bootstrap Compatible Version
 * ============================================================================
 */

"use strict";

/* ============================================================================
   STATE
============================================================================ */

let supportUser = null;

/* ============================================================================
   DOM
============================================================================ */

const form =
    document.getElementById("contactForm");

const category =
    document.getElementById("category");

const subject =
    document.getElementById("subject");

const message =
    document.getElementById("message");

const submitButton =
    document.getElementById("submitButton");

const submitButtonText =
    document.getElementById("submitButtonText");

const loginCard =
    document.getElementById("loginRequiredCard");

const supportForm =
    document.querySelector(".support-form");

const loggedInUser =
    document.getElementById("loggedInUser");

const userName =
    document.getElementById("userName");

const userEmail =
    document.getElementById("userEmail");

const honeypot =
    document.getElementById("website");

const PAGE_LOAD_TIME =
    Date.now();

const ticketHistoryToggle =
    document.getElementById("ticketHistoryToggle");

const ticketHistoryContent =
    document.querySelector(".ticket-history-content");

const ticketHistoryList =
    document.getElementById("ticketHistoryList");

let ticketHistory = [];
let currentTicketFilter = "All";
let currentTicketSort = "newest";

/* ============================================================================
   PAGE INITIALIZER
============================================================================ */

async function loadContactPage() {

    try {

        supportUser = await getUser();

        if (!supportUser) {

            showLoginRequired();

            return;

        }

        showSupportForm();

        populateUser();

        bindSupportCards();

        bindForm();

        initTicketModal();

        initTicketHistory();

    }

    catch (error) {

        console.error(error);

        if (typeof Toast !== "undefined") {
            Toast.error(
                "Unable to load Support Center."
            );
        }

    }

}

window.loadContactPage =
    loadContactPage;

/* ============================================================================
   LOGIN STATE
============================================================================ */

function showLoginRequired() {

    if (loginCard)
        loginCard.style.display = "block";

    if (supportForm)
        supportForm.style.display = "none";

}

function showSupportForm() {

    if (loginCard)
        loginCard.style.display = "none";

    if (supportForm)
        supportForm.style.display = "block";

    if (loggedInUser)
        loggedInUser.style.display = "flex";

}

/* ============================================================================
   USER
============================================================================ */

function populateUser() {

    if (!supportUser)
        return;

    const meta =
        supportUser.user_metadata || {};

    if (userName) {
        userName.textContent =
            meta.full_name ||
            meta.name ||
            "PropWise User";
    }

    if (userEmail) {
        userEmail.textContent =
            supportUser.email || "";
    }

}

/* ============================================================================
   CATEGORY CARDS
============================================================================ */

function bindSupportCards() {

    const cards =

        document.querySelectorAll(

            ".support-card"

        );

    if (!cards.length) return;

    cards.forEach(card => {

        card.addEventListener(

            "click",

            () => {

                cards.forEach(c =>

                    c.classList.remove(

                        "active"

                    )

                );

                card.classList.add(

                    "active"

                );

                const selected =

                    card.dataset.category;

                if (category) {
                    category.value = selected;
                }

                updatePlaceholders(selected);

            }

        );

    });

}

/* ============================================================================
   PLACEHOLDERS
============================================================================ */

function updatePlaceholders(selected) {

    if (subject) {
        subject.placeholder = "Subject";
    }

    if (message) {
        message.placeholder = "How can we help you today?";
    }

    switch (selected) {

        case "Bug Report":

            if (subject) subject.placeholder = "Briefly describe the issue";
            if (message) message.placeholder = "Please explain what happened, how to reproduce it, and what you expected.";
            break;

        case "Feature Request":

            if (subject) subject.placeholder = "Feature request title";
            if (message) message.placeholder = "Describe your idea and why it would improve PropWise.";
            break;

        case "Partnership":

            if (subject) subject.placeholder = "Partnership opportunity";
            if (message) message.placeholder = "Tell us about your company and collaboration proposal.";
            break;

        case "Billing":

            if (subject) subject.placeholder = "Billing issue";
            if (message) message.placeholder = "Please provide payment details and explain the issue.";
            break;

        default:

            if (subject) subject.placeholder = "Subject";
            if (message) message.placeholder = "How can we help you today?";
    }

}

/* ============================================================================
   FORM
============================================================================ */

function bindForm() {

    if (!form) return;

    form.addEventListener(

        "submit",

        async function (event) {

            event.preventDefault();

            await submitTicket();

        }

    );

}

function initTicketHistory() {

    const toggle = document.querySelector(".ticket-history-toggle");
    const panel = document.querySelector(".ticket-history-card");
    const sortSelect = document.getElementById("ticketSortSelect");

    if (!toggle || !panel) return;

    document.querySelectorAll(".ticket-filter-btn").forEach((button) => {
        button.addEventListener("click", () => {
            currentTicketFilter = button.dataset.status || "All";
            document.querySelectorAll(".ticket-filter-btn").forEach((item) => {
                item.classList.toggle("active", item.dataset.status === currentTicketFilter);
            });
            renderTicketHistory();
        });
    });

    if (sortSelect) {
        sortSelect.addEventListener("change", (event) => {
            currentTicketSort = event.target.value || "newest";
            renderTicketHistory();
        });
    }

    toggle.addEventListener("click", async () => {

        const isExpanded = panel.classList.toggle("expanded");
        toggle.setAttribute("aria-expanded", String(isExpanded));

        const content = document.querySelector(".ticket-history-content");
        if (content) {
            content.style.display = isExpanded ? "block" : "none";
        }

        if (isExpanded && supportUser?.id) {
            await loadTicketHistory();
        }

    });

    if (supportUser?.id) {
        panel.classList.add("expanded");
        toggle.setAttribute("aria-expanded", "true");
        const content = document.querySelector(".ticket-history-content");
        if (content) content.style.display = "block";
        loadTicketHistory();
    }

}

function getPriorityRank(priority) {
    const value = String(priority || "Medium").toLowerCase();

    if (value.includes("high")) return 3;
    if (value.includes("medium")) return 2;
    if (value.includes("low")) return 1;
    return 0;
}

function sortTicketHistory(items) {
    const copy = [...items];

    copy.sort((a, b) => {
        const aDate = new Date(a.created_at || 0).getTime();
        const bDate = new Date(b.created_at || 0).getTime();

        if (currentTicketSort === "oldest") {
            return aDate - bDate;
        }

        if (currentTicketSort === "priority") {
            const priorityDiff = getPriorityRank(b.priority) - getPriorityRank(a.priority);
            if (priorityDiff !== 0) return priorityDiff;
            return bDate - aDate;
        }

        return bDate - aDate;
    });

    return copy;
}

function updateTicketSummary() {
    const summaryPills = document.querySelectorAll(".ticket-summary-pill");
    if (!summaryPills.length) return;

    const counts = {
        All: ticketHistory.length,
        Open: ticketHistory.filter((ticket) => (ticket.status || "Open") === "Open").length,
        Pending: ticketHistory.filter((ticket) => (ticket.status || "Open") === "Pending").length,
        "Waiting for Info": ticketHistory.filter((ticket) => (ticket.status || "Open") === "Waiting for Info").length,
        Closed: ticketHistory.filter((ticket) => (ticket.status || "Open") === "Closed").length
    };

    summaryPills.forEach((pill) => {
        const key = pill.dataset.summary || "All";
        const total = counts[key] ?? 0;
        const strong = pill.querySelector("strong");
        if (strong) strong.textContent = String(total);
    });
}

function renderTicketHistory() {
    if (!ticketHistoryList || !ticketHistory.length) {
        return;
    }

    const visibleTickets = sortTicketHistory(ticketHistory).filter((ticket) => {
        const status = (ticket.status || "Open").trim();
        return currentTicketFilter === "All" || status === currentTicketFilter;
    });

    if (!visibleTickets.length) {
        ticketHistoryList.innerHTML = '<p class="ticket-history-empty">No tickets match the selected filter.</p>';
        return;
    }

    const rendered = visibleTickets
        .map((ticket) => {
            const createdAt = ticket.created_at ? new Date(ticket.created_at).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short"
            }) : "Unknown time";

            const statusLabel = ticket.status || "Open";
            const status = statusLabel.toLowerCase();
            const statusClass = status.includes("closed")
                ? "status-closed"
                : status.includes("waiting") || status.includes("info")
                    ? "status-pending"
                    : status.includes("pending")
                        ? "status-pending"
                        : "status-open";
            const number = ticket.ticket_number || ticket.id || "TKT";
            const subject = ticket.subject || "Untitled ticket";
            const message = ticket.message || "No ticket details were provided.";
            const category = ticket.category || "General";
            const priority = ticket.priority || "Medium";
            const ticketId = ticket.id || "";
            const isClosed = statusLabel === "Closed";

            return `
                <article class="ticket-item">
                    <div class="ticket-item-header">
                        <div class="ticket-item-title-wrap">
                            <span class="ticket-item-number">${escapeHtml(number)}</span>
                            <h3 class="ticket-item-title">${escapeHtml(subject)}</h3>
                        </div>
                    </div>

                    <div class="ticket-meta-row">
                        <span class="ticket-meta-pill ${statusClass}">${escapeHtml(statusLabel)}</span>
                        <span class="ticket-meta-pill">${escapeHtml(category)}</span>
                        <span class="ticket-meta-pill">Priority: ${escapeHtml(priority)}</span>
                    </div>

                    <p class="ticket-item-message">${escapeHtml(message)}</p>

                    <div class="ticket-item-actions">
                        <button class="ticket-detail-button" data-ticket-id="${escapeHtml(ticketId)}" type="button">View details</button>
                        <button class="ticket-status-action" data-ticket-id="${escapeHtml(ticketId)}" data-ticket-status="${escapeHtml(statusLabel)}" type="button">${isClosed ? "Reopen ticket" : "Mark resolved"}</button>
                    </div>

                    <div class="ticket-item-details ticket-item-meta-inline">
                        <div class="ticket-detail"><strong>Created:</strong> ${escapeHtml(createdAt)}</div>
                    </div>
                </article>
            `;
        })
        .join("");

    ticketHistoryList.innerHTML = rendered;
    bindTicketActions();
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function initTicketModal() {

    const modal = document.getElementById("ticketDetailModal");
    const closeButton = document.querySelector(".ticket-detail-close");

    if (!modal) return;

    modal.addEventListener("click", (event) => {
        if (event.target instanceof HTMLElement && event.target.dataset.closeModal === "true") {
            closeTicketModal();
        }
    });

    if (closeButton) {
        closeButton.addEventListener("click", closeTicketModal);
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("is-open")) {
            closeTicketModal();
        }
    });

}

function openTicketModal(ticketId) {

    const modal = document.getElementById("ticketDetailModal");
    if (!modal) return;

    const ticket = (ticketHistory || []).find((item) => String(item.id) === String(ticketId));
    if (!ticket) return;

    const status = ticket.status || "Open";
    const createdAt = ticket.created_at ? new Date(ticket.created_at).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    }) : "Unknown time";

    const badge = document.getElementById("ticketDetailBadge");
    const title = document.getElementById("ticketDetailTitle");
    const statusEl = document.getElementById("ticketDetailStatus");
    const categoryEl = document.getElementById("ticketDetailCategory");
    const priorityEl = document.getElementById("ticketDetailPriority");
    const createdEl = document.getElementById("ticketDetailCreated");
    const pageEl = document.getElementById("ticketDetailPage");
    const emailEl = document.getElementById("ticketDetailEmail");
    const messageEl = document.getElementById("ticketDetailMessage");
    const sourceEl = document.getElementById("ticketDetailSource");

    if (badge) badge.textContent = `Ticket #${ticket.ticket_number || ticket.id || "TKT"}`;
    if (title) title.textContent = ticket.subject || "Untitled ticket";
    if (statusEl) statusEl.textContent = status;
    if (categoryEl) categoryEl.textContent = ticket.category || "General";
    if (priorityEl) priorityEl.textContent = ticket.priority || "Medium";
    if (createdEl) createdEl.textContent = createdAt;
    if (pageEl) pageEl.textContent = ticket.current_page || "Unknown page";
    if (emailEl) emailEl.textContent = ticket.email || "Not provided";
    if (messageEl) messageEl.textContent = ticket.message || "No ticket details were provided.";
    if (sourceEl) sourceEl.textContent = ticket.source_url || "Unknown source";

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

}

function closeTicketModal() {

    const modal = document.getElementById("ticketDetailModal");
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

}

function bindTicketActions() {

    document.querySelectorAll(".ticket-detail-button").forEach((button) => {
        button.addEventListener("click", () => {
            openTicketModal(button.dataset.ticketId);
        });
    });

    document.querySelectorAll(".ticket-status-action").forEach((button) => {
        button.addEventListener("click", async () => {
            const ticketId = button.dataset.ticketId;
            const status = button.dataset.ticketStatus === "Closed" ? "Open" : "Closed";

            if (!ticketId || !window.Services?.ticket) return;

            button.disabled = true;
            button.textContent = "Updating...";

            const result = await window.Services.ticket.updateTicketStatus(ticketId, status);

            if (!result.success) {
                if (typeof Toast !== "undefined") {
                    Toast.error(result.error || "Unable to update ticket status.");
                }
                button.disabled = false;
                button.textContent = status === "Closed" ? "Mark resolved" : "Reopen ticket";
                return;
            }

            await loadTicketHistory();
        });
    });

}

async function loadTicketHistory() {

    if (!supportUser?.id) {
        if (ticketHistoryList) {
            ticketHistoryList.innerHTML = '<p class="ticket-history-empty">Sign in to view your support tickets.</p>';
        }
        return;
    }

    if (!ticketHistoryList) return;

    let ticketService = window.Services?.ticket;

    if (!ticketService && typeof TicketService === "function") {
        window.Services = window.Services || {};
        window.Services.ticket = new TicketService();
        ticketService = window.Services.ticket;
    }

    if (!ticketService) {
        ticketHistoryList.innerHTML = '<p class="ticket-history-empty">Support ticket history is unavailable right now.</p>';
        return;
    }

    ticketHistoryList.innerHTML = '<p class="ticket-history-empty">Loading your tickets...</p>';

    const result = await ticketService.getMyTickets(supportUser.id);

    if (!result.success || !Array.isArray(result.data)) {
        ticketHistoryList.innerHTML = `<p class="ticket-history-empty">${escapeHtml(result.error || "Unable to load your support tickets.")}</p>`;
        return;
    }

    if (!result.data.length) {
        ticketHistoryList.innerHTML = '<p class="ticket-history-empty">No support tickets yet. Your tickets will appear here once you submit one.</p>';
        return;
    }

    ticketHistory = result.data.slice();
    updateTicketSummary();
    renderTicketHistory();

}

/* ============================================================================
   SUBMIT
============================================================================ */

async function submitTicket() {

    if (!supportUser?.id) {
        if (typeof Toast !== "undefined") {
            Toast.error("You must be signed in to submit a support ticket.");
        }
        return;
    }

    if (!window.Services?.ticket) {
        window.Services = window.Services || {};
        if (typeof TicketService === "function") {
            window.Services.ticket = new TicketService();
        }
    }

    const ticketService = window.Services?.ticket;
    if (!ticketService) {
        if (typeof Toast !== "undefined") {
            Toast.error("Support service is unavailable right now.");
        }
        return;
    }

    /* -----------------------------
       Honeypot
    ----------------------------- */

    if (

        honeypot &&

        honeypot.value.trim() !== ""

    ) {

        return;

    }

    /* -----------------------------
       Human Verification
    ----------------------------- */

    if (

        Date.now() - PAGE_LOAD_TIME < 5000

    ) {

        if (typeof Toast !== "undefined") {
            Toast.warning(
                "Please wait a few seconds before submitting."
            );
        }

        return;

    }

    /* -----------------------------
       Validation
    ----------------------------- */

    if (!category || !category.value) {

        if (typeof Toast !== "undefined") {
            Toast.warning(
                "Please choose a category."
            );
        }

        return;

    }

    if (!subject || !subject.value.trim()) {

        subject?.focus?.();

        if (typeof Toast !== "undefined") {
            Toast.warning(
                "Please enter a subject."
            );
        }

        return;

    }

    if (!message || !message.value.trim()) {

        message?.focus?.();

        if (typeof Toast !== "undefined") {
            Toast.warning(
                "Please enter your message."
            );
        }

        return;

    }

    /* -----------------------------
       Daily Limit
    ----------------------------- */

    const dailyLimit =

        await ticketService

            .canCreateTicketToday(

                supportUser.id

            );

    if (!dailyLimit.success) {

        if (typeof Toast !== "undefined") {
            Toast.error(
                dailyLimit.error || "Unable to verify ticket limit."
            );
        }

        return;

    }

    if (!dailyLimit.data) {

        if (typeof Toast !== "undefined") {
            Toast.warning(
                "You have reached today's limit of 5 support tickets."
            );
        }

        return;

    }

    /* -----------------------------
       Duplicate Detection
    ----------------------------- */

    const duplicate =

        await ticketService

            .isDuplicate(

                supportUser.id,

                subject.value.trim(),

                message.value.trim()

            );

    if (!duplicate.success) {

        if (typeof Toast !== "undefined") {
            Toast.error(
                duplicate.error || "Unable to check for duplicate tickets."
            );
        }

        return;

    }

    if (duplicate.data) {

        if (typeof Toast !== "undefined") {
            Toast.info(
                "A similar support ticket was submitted recently."
            );
        }

        return;

    }

    /* -----------------------------
       Loading
    ----------------------------- */

    setLoading(true);

        /* =========================================================================
       BUILD TICKET
    ========================================================================= */

    const ticket = {

        user_id: supportUser.id,

        name: userName?.textContent || supportUser.user_metadata?.full_name || "PropWise User",

        email: supportUser.email || "",

        category: category.value,

        priority: getPriority(),

        subject: subject.value.trim(),

        message: message.value.trim(),

        current_page:
            ticketService.getCurrentPage(),

        source_url:
            window.location.href,

        client_info:
            ticketService.getClientInfo()

    };

    /* =========================================================================
       CREATE TICKET
    ========================================================================= */

    const result = await ticketService.createTicket(ticket);

    setLoading(false);

    if (!result.success) {

        if (typeof Toast !== "undefined") {
            Toast.error(
                result.error ||
                "Unable to create support ticket."
            );
        }

        return;

    }

    if (typeof Toast !== "undefined") {
        Toast.success(
            `Support ticket ${result.data.ticket_number} created successfully.`
        );
    }

    if (form) {
        form.reset();
    }

    if (category) {
        category.value = "General";
    }

    updatePlaceholders("General");

}

/* ============================================================================
   PRIORITY
============================================================================ */

function getPriority() {

    const selected = category?.value || "General";

    switch (selected) {

        case "Bug Report":
            return "High";

        case "Account Issue":
            return "High";

        case "Billing":
            return "High";

        case "Feature Request":
            return "Low";

        case "Partnership":
            return "Medium";

        default:
            return "Medium";

    }

}

/* ============================================================================
   LOADING
============================================================================ */

function setLoading(isLoading) {

    if (!submitButton)
        return;

    submitButton.disabled = isLoading;

    submitButton.classList.toggle(

        "loading",

        isLoading

    );

    if (submitButtonText) {
        submitButtonText.textContent =
            isLoading
                ? "Creating Ticket..."
                : "Create Support Ticket";
    }

}