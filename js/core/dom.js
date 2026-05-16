// ==============================
// DOM HELPERS
// ==============================

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showError(msg, targetId = "analysisResult") {
  const el =
    document.getElementById(targetId);

  if (!el) return;

  el.innerHTML = `
    <div class="error-message">
      ${escapeHtml(msg)}
    </div>
  `;
}

window.escapeHtml = escapeHtml;
window.showError = showError;
