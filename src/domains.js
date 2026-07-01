(function (global) {
  "use strict";

  const registry = global.OpenPCMDomains.createDomainRegistry();
  registry.register(global.OpenPCMEvidenceDomain);

  global.OpenPCMDomainRegistry = registry;
})(typeof window !== "undefined" ? window : globalThis);
