/**
 * ============================================================================
 * PROPWISE INDIA
 * SUPPORT TICKET SERVICE
 * ============================================================================
 * Centralized service for Support Ticket operations.
 *
 * Hardened for partial page load, missing Supabase init, and empty runtime
 * environments while preserving the existing PropWise API contract.
 * ============================================================================
 */

const ApiResponseHelper = typeof ApiResponse !== "undefined"
    ? ApiResponse
    : {
        success(data = null) {
            return { success: true, data, error: null };
        },
        error(message = "Something went wrong.") {
            return { success: false, data: null, error: message };
        }
    };

class TicketService {

    constructor() {
        this.table = "support_tickets";
        this.supabase = null;
        this.refreshClient();
    }

    refreshClient() {
        this.supabase =
            (typeof getSupabaseClient === "function" ? getSupabaseClient() : null) ||
            (typeof initSupabase === "function" ? initSupabase() : null);

        return this.supabase;
    }

    getClient() {
        if (!this.supabase) {
            this.refreshClient();
        }

        return this.supabase || null;
    }

    normalizeError(error) {
        if (!error) return "Support service failed.";
        if (typeof error === "string") return error;
        return error.message || "Support service failed.";
    }

    sanitizeText(value) {
        return String(value ?? "")
            .replace(/\s+/g, " ")
            .trim();
    }

    validateTicketData(ticketData = {}) {
        if (!ticketData || typeof ticketData !== "object") {
            return {
                valid: false,
                error: "Ticket payload is invalid."
            };
        }

        const requiredFields = [
            "user_id",
            "category",
            "subject",
            "message"
        ];

        for (const field of requiredFields) {
            if (!ticketData[field]) {
                return {
                    valid: false,
                    error: `Missing required ticket field: ${field}`
                };
            }
        }

        return {
            valid: true,
            ticket: {
                ...ticketData,
                category: this.sanitizeText(ticketData.category),
                subject: this.sanitizeText(ticketData.subject),
                message: this.sanitizeText(ticketData.message),
                name: this.sanitizeText(ticketData.name || ""),
                email: this.sanitizeText(ticketData.email || "")
            }
        };
    }

    async getCurrentUser() {
        try {
            const client = this.getClient();

            if (!client || !client.auth) {
                return ApiResponseHelper.error("Support service is unavailable.");
            }

            const { data: { user }, error } = await client.auth.getUser();

            if (error) {
                return ApiResponseHelper.error(this.normalizeError(error));
            }

            return ApiResponseHelper.success(user);
        } catch (err) {
            return ApiResponseHelper.error(this.normalizeError(err));
        }
    }

    async createTicket(ticketData) {
        try {
            const client = this.getClient();

            if (!client || !client.from) {
                return ApiResponseHelper.error("Support service is unavailable right now.");
            }

            const validation = this.validateTicketData(ticketData);
            if (!validation.valid) {
                return ApiResponseHelper.error(validation.error);
            }

            const preparedTicket = {
                ...validation.ticket,
                current_page: this.getCurrentPage(),
                source_url: typeof window !== "undefined" ? window.location.href : "",
                client_info: this.getClientInfo()
            };

            const { data, error } = await client
                .from(this.table)
                .insert(preparedTicket)
                .select()
                .single();

            if (error) {
                console.error("Ticket creation failed:", error);
                return ApiResponseHelper.error(this.normalizeError(error));
            }

            return ApiResponseHelper.success(data);
        } catch (err) {
            console.error("Ticket creation error:", err);
            return ApiResponseHelper.error(this.normalizeError(err));
        }
    }

    async getMyTickets(userId) {
        try {
            const client = this.getClient();

            if (!client || !client.from) {
                return ApiResponseHelper.error("Support service is unavailable.");
            }

            const { data, error } = await client
                .from(this.table)
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (error) {
                return ApiResponseHelper.error(this.normalizeError(error));
            }

            return ApiResponseHelper.success(data);
        } catch (err) {
            return ApiResponseHelper.error(this.normalizeError(err));
        }
    }

    async getTicket(ticketId) {
        try {
            const client = this.getClient();

            if (!client || !client.from) {
                return ApiResponseHelper.error("Support service is unavailable.");
            }

            const { data, error } = await client
                .from(this.table)
                .select("*")
                .eq("id", ticketId)
                .single();

            if (error) {
                return ApiResponseHelper.error(this.normalizeError(error));
            }

            return ApiResponseHelper.success(data);
        } catch (err) {
            return ApiResponseHelper.error(this.normalizeError(err));
        }
    }

    async getAllTickets() {
        try {
            const client = this.getClient();

            if (!client || !client.from) {
                return ApiResponseHelper.error("Support service is unavailable.");
            }

            const { data, error } = await client
                .from(this.table)
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                return ApiResponseHelper.error(this.normalizeError(error));
            }

            return ApiResponseHelper.success(data || []);
        } catch (err) {
            return ApiResponseHelper.error(this.normalizeError(err));
        }
    }

    async updateTicketStatus(ticketId, status, adminNote = "") {
        try {
            const client = this.getClient();

            if (!client || !client.from) {
                return ApiResponseHelper.error("Support service is unavailable.");
            }

            if (!ticketId) {
                return ApiResponseHelper.error("Ticket reference is missing.");
            }

            const allowedStatuses = ["Open", "Pending", "Waiting for Info", "Closed"];
            const nextStatus = status && allowedStatuses.includes(status)
                ? status
                : "Open";

            const updatePayload = {
                status: nextStatus,
                updated_at: new Date().toISOString()
            };

            if (typeof adminNote === "string") {
                updatePayload.admin_note = this.sanitizeText(adminNote);
            }

            const query = client
                .from(this.table)
                .update(updatePayload)
                .or(`id.eq.${ticketId},ticket_number.eq.${ticketId}`)
                .select();

            const { data, error } = await query;

            if (error) {
                console.error("Ticket update failed:", error);
                return ApiResponseHelper.error(this.normalizeError(error));
            }

            if (!data || !data.length) {
                return ApiResponseHelper.error("Ticket not found or update was rejected.");
            }

            return ApiResponseHelper.success(data[0]);
        } catch (err) {
            console.error("Ticket update error:", err);
            return ApiResponseHelper.error(this.normalizeError(err));
        }
    }

    async canCreateTicketToday(userId) {
        try {
            const client = this.getClient();

            if (!client || !client.from) {
                return ApiResponseHelper.error("Support service is unavailable.");
            }

            if (!userId) {
                return ApiResponseHelper.error("User session is required.");
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { count, error } = await client
                .from(this.table)
                .select("*", { count: "exact", head: true })
                .eq("user_id", userId)
                .gte("created_at", today.toISOString());

            if (error) {
                return ApiResponseHelper.error(this.normalizeError(error));
            }

            return ApiResponseHelper.success(count < 5);
        } catch (err) {
            return ApiResponseHelper.error(this.normalizeError(err));
        }
    }

    async isDuplicate(userId, subject, message) {
        try {
            const client = this.getClient();

            if (!client || !client.from) {
                return ApiResponseHelper.error("Support service is unavailable.");
            }

            if (!userId || !subject || !message) {
                return ApiResponseHelper.error("Duplicate check requires user, subject, and message.");
            }

            const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();

            const { data, error } = await client
                .from(this.table)
                .select("id")
                .eq("user_id", userId)
                .eq("subject", subject)
                .eq("message", message)
                .gte("created_at", since)
                .limit(1);

            if (error) {
                return ApiResponseHelper.error(this.normalizeError(error));
            }

            return ApiResponseHelper.success(data.length > 0);
        } catch (err) {
            return ApiResponseHelper.error(this.normalizeError(err));
        }
    }

    getClientInfo() {
        const nav = typeof navigator !== "undefined" ? navigator : {};
        const screen = typeof window !== "undefined" ? window.screen : null;

        return {
            browser: this.getBrowserInfo(),
            os: this.getOperatingSystem(),
            device: this.getDeviceType(),
            language: nav.language || "unknown",
            timezone: (() => {
                try {
                    return Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
                } catch {
                    return "unknown";
                }
            })(),
            screen: screen ? `${screen.width}x${screen.height}` : "unknown",
            userAgent: nav.userAgent || "unknown"
        };
    }

    getCurrentPage() {
        if (typeof window === "undefined" || !window.location) {
            return "unknown";
        }

        return window.location.pathname.split("/").pop() || "unknown";
    }

    getBrowserInfo() {
        const ua = (typeof navigator !== "undefined" ? navigator.userAgent : "") || "";

        if (ua.includes("Edg")) return "Microsoft Edge";
        if (ua.includes("Chrome")) return "Google Chrome";
        if (ua.includes("Firefox")) return "Mozilla Firefox";
        if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
        return "Unknown";
    }

    getDeviceType() {
        const width = typeof window !== "undefined" ? window.innerWidth : 0;

        if (width <= 768) return "Mobile";
        if (width <= 1024) return "Tablet";
        return "Desktop";
    }

    getOperatingSystem() {
        const ua = (typeof navigator !== "undefined" ? navigator.userAgent : "") || "";

        if (ua.includes("Windows")) return "Windows";
        if (ua.includes("Mac")) return "macOS";
        if (ua.includes("Android")) return "Android";
        if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
        if (ua.includes("Linux")) return "Linux";
        return "Unknown";
    }
}

window.Services = window.Services || {};
window.Services.ticket = new TicketService();
window.TicketService = TicketService;
