(function (global) {
  "use strict";

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function importList(data, normalize) {
    const items = Array.isArray(data) ? data : [];
    const normalizer = typeof normalize === "function" ? normalize : item => item;
    return items.map(item => normalizer(cloneJson(item)));
  }

  function exportList(data, normalize) {
    const items = Array.isArray(data) ? data : [];
    const normalizer = typeof normalize === "function" ? normalize : item => item;
    return items.map(item => normalizer(cloneJson(item)));
  }

  const api = {
    cloneJson,
    importList,
    exportList
  };

  global.OpenPCMImportExportService = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
