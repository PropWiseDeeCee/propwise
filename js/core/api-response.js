/**
 * ============================================================================
 * PROPWISE INDIA
 * API RESPONSE HELPER
 * ----------------------------------------------------------------------------
 * Standard response format used across all services.
 *
 * Author: PropWise India
 * ============================================================================
 */

class ApiResponse {

    /**
     * Success response
     * @param {*} data
     * @returns {Object}
     */
    static success(data = null) {

        return {
            success: true,
            data,
            error: null
        };

    }

    /**
     * Error response
     * @param {String} message
     * @returns {Object}
     */
    static error(message = "Something went wrong.") {

        return {
            success: false,
            data: null,
            error: message
        };

    }

}

/* Make globally available */
window.ApiResponse = ApiResponse;