(function (global) {
  "use strict";

  function createJsonStorage(storage, key) {
    if (!storage) throw new Error("Storage adapter is required.");
    if (!key) throw new Error("Storage key is required.");

    return {
      load(fallback = null) {
        const raw = storage.getItem(key);
        if (!raw) return fallback;

        try {
          return JSON.parse(raw);
        } catch {
          return fallback;
        }
      },

      save(value) {
        storage.setItem(key, JSON.stringify(value));
        return value;
      },

      clear() {
        storage.removeItem(key);
      }
    };
  }

  const api = {
    createJsonStorage
  };

  global.OpenPCMStorageService = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
