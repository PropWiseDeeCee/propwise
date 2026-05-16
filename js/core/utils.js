function formatDateTime(value) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleString();
}

window.debounce = debounce;
window.formatCurrency =
  formatCurrency;