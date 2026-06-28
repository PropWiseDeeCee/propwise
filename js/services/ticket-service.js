/**
 * ============================================================================
 * PROPWISE INDIA
 * SUPPORT TICKET SERVICE
 * ============================================================================
 * Centralized service for Support Ticket operations.
 *
 * Uses the existing PropWise Supabase client.
 * ============================================================================
 */

class TicketService {

    constructor() {

        this.table = "support_tickets";

        this.supabase = getSupabaseClient();

        if (!this.supabase) {
            this.supabase = initSupabase();
        }

        if (!this.supabase) {
            throw new Error("Unable to initialize Supabase client.");
        }

    }

    /**
     * ------------------------------------------------------------------------
     * Returns authenticated user
     * ------------------------------------------------------------------------
     */

    async getCurrentUser() {

        try {

            const {
                data: { user },
                error
            } = await this.supabase.auth.getUser();

            if (error) {
                return ApiResponse.error(error.message);
            }

            return ApiResponse.success(user);

        }

        catch (err) {

            return ApiResponse.error(err.message);

        }

    }

    /**
     * ------------------------------------------------------------------------
     * Create Ticket
     * ------------------------------------------------------------------------
     */

    async createTicket(ticketData) {

        try {

            const {

                data,

                error

            } = await this.supabase

                .from(this.table)

                .insert(ticketData)

                .select()

                .single();

            if (error) {

                console.error(error);

                return ApiResponse.error(error.message);

            }

            return ApiResponse.success(data);

        }

        catch (err) {

            console.error(err);

            return ApiResponse.error(err.message);

        }

    }

    /**
     * ------------------------------------------------------------------------
     * My Tickets
     * ------------------------------------------------------------------------
     */

    async getMyTickets(userId) {

        try {

            const {

                data,

                error

            } = await this.supabase

                .from(this.table)

                .select("*")

                .eq("user_id", userId)

                .order("created_at", {

                    ascending: false

                });

            if (error) {

                return ApiResponse.error(error.message);

            }

            return ApiResponse.success(data);

        }

        catch (err) {

            return ApiResponse.error(err.message);

        }

    }

    /**
     * ------------------------------------------------------------------------
     * Ticket By ID
     * ------------------------------------------------------------------------
     */

    async getTicket(ticketId) {

        try {

            const {

                data,

                error

            } = await this.supabase

                .from(this.table)

                .select("*")

                .eq("id", ticketId)

                .single();

            if (error) {

                return ApiResponse.error(error.message);

            }

            return ApiResponse.success(data);

        }

        catch (err) {

            return ApiResponse.error(err.message);

        }

    }

    /**
     * ------------------------------------------------------------------------
     * Daily Limit Check
     * ------------------------------------------------------------------------
     */

    async canCreateTicketToday(userId) {

        try {

            const today = new Date();

            today.setHours(0,0,0,0);

            const {

                count,

                error

            } = await this.supabase

                .from(this.table)

                .select("*", {

                    count: "exact",

                    head: true

                })

                .eq("user_id", userId)

                .gte(

                    "created_at",

                    today.toISOString()

                );

            if (error) {

                return ApiResponse.error(error.message);

            }

            return ApiResponse.success(

                count < 5

            );

        }

        catch(err){

            return ApiResponse.error(err.message);

        }

    }

    /**
     * ------------------------------------------------------------------------
     * Duplicate Detection
     * ------------------------------------------------------------------------
     */

    async isDuplicate(userId, subject, message) {

        try {

            const since = new Date(

                Date.now() - 10 * 60 * 1000

            ).toISOString();

            const {

                data,

                error

            } = await this.supabase

                .from(this.table)

                .select("id")

                .eq("user_id", userId)

                .eq("subject", subject)

                .eq("message", message)

                .gte("created_at", since)

                .limit(1);

            if (error) {

                return ApiResponse.error(error.message);

            }

            return ApiResponse.success(

                data.length > 0

            );

        }

        catch(err){

            return ApiResponse.error(err.message);

        }

    }
        /**
     * ------------------------------------------------------------------------
     * Client Information
     * ------------------------------------------------------------------------
     */

    getClientInfo() {

        return {

            browser: this.getBrowserInfo(),

            os: this.getOperatingSystem(),

            device: this.getDeviceType(),

            language: navigator.language,

            timezone: Intl.DateTimeFormat()
                .resolvedOptions()
                .timeZone,

            screen: `${window.screen.width}x${window.screen.height}`,

            userAgent: navigator.userAgent

        };

    }

    /**
     * ------------------------------------------------------------------------
     * Current Page
     * ------------------------------------------------------------------------
     */

    getCurrentPage() {

        return window.location.pathname
            .split("/")
            .pop();

    }

    /**
     * ------------------------------------------------------------------------
     * Browser Detection
     * ------------------------------------------------------------------------
     */

    getBrowserInfo() {

        const ua = navigator.userAgent;

        if (ua.includes("Edg"))
            return "Microsoft Edge";

        if (ua.includes("Chrome"))
            return "Google Chrome";

        if (ua.includes("Firefox"))
            return "Mozilla Firefox";

        if (
            ua.includes("Safari") &&
            !ua.includes("Chrome")
        )
            return "Safari";

        return "Unknown";

    }

    /**
     * ------------------------------------------------------------------------
     * Device Detection
     * ------------------------------------------------------------------------
     */

    getDeviceType() {

        const width = window.innerWidth;

        if (width <= 768)
            return "Mobile";

        if (width <= 1024)
            return "Tablet";

        return "Desktop";

    }

    /**
     * ------------------------------------------------------------------------
     * Operating System
     * ------------------------------------------------------------------------
     */

    getOperatingSystem() {

        const ua = navigator.userAgent;

        if (ua.includes("Windows"))
            return "Windows";

        if (ua.includes("Mac"))
            return "macOS";

        if (ua.includes("Android"))
            return "Android";

        if (
            ua.includes("iPhone") ||
            ua.includes("iPad")
        )
            return "iOS";

        if (ua.includes("Linux"))
            return "Linux";

        return "Unknown";

    }

    /**
     * ------------------------------------------------------------------------
     * Refresh Supabase Client
     * ------------------------------------------------------------------------
     */

    refreshClient() {

        this.supabase = getSupabaseClient();

        if (!this.supabase) {

            this.supabase = initSupabase();

        }

        return this.supabase;

    }

}

/**
 * ============================================================================
 * Service Registration
 * ============================================================================
 */

window.Services = window.Services || {};

window.Services.ticket = new TicketService();