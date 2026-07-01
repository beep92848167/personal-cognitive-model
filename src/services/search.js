(function (global) {
  "use strict";

  function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
  }

  function tokenize(value) {
    return normalizeText(value)
      .split(/\s+/)
      .map(token => token.trim())
      .filter(Boolean);
  }

  function buildSearchText(item, fields = []) {
    return fields
      .flatMap(field => {
        const value = item ? item[field] : "";
        return Array.isArray(value) ? value : [value];
      })
      .map(normalizeText)
      .join(" ");
  }

  function matchesQuery(item, query, fields = []) {
    const tokens = tokenize(query);
    if (tokens.length === 0) return true;

    const haystack = buildSearchText(item, fields);
    return tokens.every(token => haystack.includes(token));
  }

  const api = {
    normalizeText,
    tokenize,
    buildSearchText,
    matchesQuery
  };

  global.OpenPCMSearchService = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
