/**
 * ============================================================================
 * PROPWISE INDIA
 * TOAST NOTIFICATION COMPONENT
 * ----------------------------------------------------------------------------
 * Usage:
 *
 * Toast.success("Saved successfully");
 * Toast.error("Something went wrong");
 * Toast.warning("Duplicate ticket");
 * Toast.info("Login required");
 * ============================================================================
 */

class Toast {

    static show(message, type = "info") {

        let container = document.getElementById("toastContainer");

        if (!container) {

            container = document.createElement("div");

            container.id = "toastContainer";

            document.body.appendChild(container);

        }

        const toast = document.createElement("div");

        toast.className = `toast toast-${type}`;

        toast.innerHTML = `
            <div class="toast-content">

                <span class="toast-icon">

                    ${this.icon(type)}

                </span>

                <span class="toast-message">

                    ${message}

                </span>

            </div>
        `;

        container.appendChild(toast);

        requestAnimationFrame(() => {

            toast.classList.add("show");

        });

        setTimeout(() => {

            toast.classList.remove("show");

            setTimeout(() => {

                toast.remove();

            }, 300);

        }, 3500);

    }

    static success(message) {

        this.show(message, "success");

    }

    static error(message) {

        this.show(message, "error");

    }

    static warning(message) {

        this.show(message, "warning");

    }

    static info(message) {

        this.show(message, "info");

    }

    static icon(type) {

        switch (type) {

            case "success":
                return "✅";

            case "error":
                return "❌";

            case "warning":
                return "⚠️";

            default:
                return "ℹ️";

        }

    }

}

window.Toast = Toast;