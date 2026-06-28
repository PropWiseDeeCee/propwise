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

    }

    catch (error) {

        console.error(error);

        Toast.error(

            "Unable to load Support Center."

        );

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

    userName.textContent =

        meta.full_name ||

        meta.name ||

        "PropWise User";

    userEmail.textContent =
        supportUser.email;

}

/* ============================================================================
   CATEGORY CARDS
============================================================================ */

function bindSupportCards() {

    const cards =

        document.querySelectorAll(

            ".support-card"

        );

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

                category.value =
                    selected;

                updatePlaceholders(

                    selected

                );

            }

        );

    });

}

/* ============================================================================
   PLACEHOLDERS
============================================================================ */

function updatePlaceholders(selected) {

    switch (selected) {

        case "Bug Report":

            subject.placeholder =
                "Briefly describe the issue";

            message.placeholder =
                "Please explain what happened, how to reproduce it, and what you expected.";

            break;

        case "Feature Request":

            subject.placeholder =
                "Feature request title";

            message.placeholder =
                "Describe your idea and why it would improve PropWise.";

            break;

        case "Partnership":

            subject.placeholder =
                "Partnership opportunity";

            message.placeholder =
                "Tell us about your company and collaboration proposal.";

            break;

        case "Billing":

            subject.placeholder =
                "Billing issue";

            message.placeholder =
                "Please provide payment details and explain the issue.";

            break;

        default:

            subject.placeholder =
                "Subject";

            message.placeholder =
                "How can we help you today?";

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

/* ============================================================================
   SUBMIT
============================================================================ */

async function submitTicket() {

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

        Toast.warning(

            "Please wait a few seconds before submitting."

        );

        return;

    }

    /* -----------------------------
       Validation
    ----------------------------- */

    if (!category.value) {

        Toast.warning(

            "Please choose a category."

        );

        return;

    }

    if (!subject.value.trim()) {

        subject.focus();

        Toast.warning(

            "Please enter a subject."

        );

        return;

    }

    if (!message.value.trim()) {

        message.focus();

        Toast.warning(

            "Please enter your message."

        );

        return;

    }

    /* -----------------------------
       Daily Limit
    ----------------------------- */

    const dailyLimit =

        await Services.ticket

            .canCreateTicketToday(

                supportUser.id

            );

    if (!dailyLimit.success) {

        Toast.error(

            dailyLimit.error

        );

        return;

    }

    if (!dailyLimit.data) {

        Toast.warning(

            "You have reached today's limit of 5 support tickets."

        );

        return;

    }

    /* -----------------------------
       Duplicate Detection
    ----------------------------- */

    const duplicate =

        await Services.ticket

            .isDuplicate(

                supportUser.id,

                subject.value.trim(),

                message.value.trim()

            );

    if (!duplicate.success) {

        Toast.error(

            duplicate.error

        );

        return;

    }

    if (duplicate.data) {

        Toast.info(

            "A similar support ticket was submitted recently."

        );

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

        name: userName.textContent,

        email: supportUser.email,

        category: category.value,

        priority: getPriority(),

        subject: subject.value.trim(),

        message: message.value.trim(),

        current_page:
            Services.ticket.getCurrentPage(),

        source_url:
            window.location.href,

        client_info:
            Services.ticket.getClientInfo()

    };

    /* =========================================================================
       CREATE TICKET
    ========================================================================= */

    const result = await Services.ticket.createTicket(ticket);

    setLoading(false);

    if (!result.success) {

        Toast.error(

            result.error ||

            "Unable to create support ticket."

        );

        return;

    }

    Toast.success(

        `Support ticket ${result.data.ticket_number} created successfully.`

    );

    form.reset();

    category.value = "General";

    updatePlaceholders("General");

}

/* ============================================================================
   PRIORITY
============================================================================ */

function getPriority() {

    switch (category.value) {

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

    submitButtonText.textContent =

        isLoading

            ? "Creating Ticket..."

            : "Create Support Ticket";

}