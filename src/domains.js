(function (global) {
  "use strict";

  const registry = global.OpenPCMDomains.createDomainRegistry();

  registry.register(global.OpenPCMEvidenceDomain);
  if (global.OpenPCMTasksDomain) registry.register(global.OpenPCMTasksDomain);

  global.OpenPCMDomainRegistry = registry;
  global.OpenPCMDomainRoutes = () => registry.routes();
  global.OpenPCMDomainStorageKeys = () => registry.storageKeys();
})(typeof window !== "undefined" ? window : globalThis);
