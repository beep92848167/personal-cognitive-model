(function (global) {
  "use strict";

  function normalizeDomain(domain) {
    if (!domain || typeof domain !== "object") throw new Error("Domain must be an object.");
    if (!domain.id || typeof domain.id !== "string") throw new Error("Domain requires a string id.");
    if (!domain.title || typeof domain.title !== "string") throw new Error(`Domain ${domain.id} requires a string title.`);

    return {
      id: domain.id,
      title: domain.title,
      description: domain.description || "",
      routes: Array.isArray(domain.routes) ? domain.routes.slice() : [],
      storageKeys: Array.isArray(domain.storageKeys) ? domain.storageKeys.slice() : [],
      validate: typeof domain.validate === "function" ? domain.validate : () => [],
      importData: typeof domain.importData === "function" ? domain.importData : data => data,
      exportData: typeof domain.exportData === "function" ? domain.exportData : data => data,
      requirements: Array.isArray(domain.requirements) ? domain.requirements.slice() : []
    };
  }

  function createDomainRegistry() {
    const domains = new Map();

    return {
      register(domain) {
        const normalized = normalizeDomain(domain);
        if (domains.has(normalized.id)) throw new Error(`Domain already registered: ${normalized.id}`);
        domains.set(normalized.id, normalized);
        return normalized;
      },
      get(id) {
        return domains.get(id) || null;
      },
      list() {
        return Array.from(domains.values()).sort((a, b) => a.id.localeCompare(b.id));
      },
      has(id) {
        return domains.has(id);
      },
      clear() {
        domains.clear();
      }
    };
  }

  const api = { createDomainRegistry, normalizeDomain };
  global.OpenPCMDomains = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
