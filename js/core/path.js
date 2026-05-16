// ==============================
// PATH HELPERS
// ==============================

function getAssetPrefix() {
  return window.location.pathname.includes("/guides/")
    ? "../"
    : "";
}

function appPath(path = "") {
  return `${getAssetPrefix()}${path}`;
}

window.getAssetPrefix = getAssetPrefix;
window.appPath = appPath;
