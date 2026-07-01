(function (global) {
  "use strict";

  function issue({ index = null, severity = "warning", code = "issue", message = "" } = {}) {
    return { index, severity, code, message };
  }

  function requireArray(data, code = "invalid-list", message = "Data must be an array.") {
    return Array.isArray(data) ? [] : [issue({ severity: "error", code, message })];
  }

  function requireObject(value, index, code = "invalid-object", message = "Item must be an object.") {
    if (value && typeof value === "object" && !Array.isArray(value)) return [];
    return [issue({ index, severity: "error", code, message })];
  }

  function requireNonEmptyString(value, index, code = "missing-title", message = "Value is required.") {
    if (typeof value === "string" && value.trim()) return [];
    return [issue({ index, severity: "warning", code, message })];
  }

  function requireOneOf(value, allowed, index, code = "invalid-value", label = "value") {
    if (value == null || value === "") return [];
    if (allowed.includes(value)) return [];
    return [issue({
      index,
      severity: "warning",
      code,
      message: `Unknown ${label}: ${value}`
    })];
  }

  const api = {
    issue,
    requireArray,
    requireObject,
    requireNonEmptyString,
    requireOneOf
  };

  global.OpenPCMValidationService = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
