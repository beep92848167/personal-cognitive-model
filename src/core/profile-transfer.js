(function (global) {
  const EXPORT_SCHEMA_VERSION = "openpcm_profile_export_v1";

  function clone(value) {
    return JSON.parse(JSON.stringify(value ?? null));
  }

  function exportProfile(profileSource = {}, options = {}) {
    const exportedAt = options.exported_at_utc || new Date().toISOString();
    return {
      schemaVersion: EXPORT_SCHEMA_VERSION,
      exported_at_utc: exportedAt,
      source: options.source || profileSource.source || "OpenPCM",
      profile: clone(profileSource.profile || {}),
      knowledge: clone(profileSource.knowledge || {}),
      media: clone(profileSource.media || {}),
      metadata: {
        app: "OpenPCM",
        exportKind: "personal-cognitive-model",
        note: options.note || ""
      }
    };
  }

  function validateProfileExport(data = {}) {
    const errors = [];
    if (!data || typeof data !== "object") errors.push("Export must be an object.");
    if (data.schemaVersion !== EXPORT_SCHEMA_VERSION) errors.push(`Unsupported schemaVersion: ${data.schemaVersion || "missing"}.`);
    if (!data.profile || typeof data.profile !== "object") errors.push("Missing profile object.");
    if (!data.knowledge || typeof data.knowledge !== "object") errors.push("Missing knowledge object.");
    if (!data.media || typeof data.media !== "object") errors.push("Missing media object.");

    return {
      ok: errors.length === 0,
      errors
    };
  }

  function mergeObjects(base = {}, incoming = {}) {
    const result = clone(base) || {};
    for (const [key, value] of Object.entries(incoming || {})) {
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        result[key] &&
        typeof result[key] === "object" &&
        !Array.isArray(result[key])
      ) {
        result[key] = mergeObjects(result[key], value);
      } else {
        result[key] = clone(value);
      }
    }
    return result;
  }

  function importProfile(currentSource = {}, exportData = {}, options = {}) {
    const validation = validateProfileExport(exportData);
    if (!validation.ok) {
      return {
        ok: false,
        errors: validation.errors,
        profileSource: currentSource
      };
    }

    const mode = options.mode || "merge";
    const imported = {
      schemaVersion: currentSource.schemaVersion || "openpcm_profile_seed_v1",
      source: exportData.source || currentSource.source || "OpenPCM",
      profile: clone(exportData.profile),
      knowledge: clone(exportData.knowledge),
      media: clone(exportData.media)
    };

    if (mode === "replace") {
      return {
        ok: true,
        mode,
        errors: [],
        profileSource: imported
      };
    }

    return {
      ok: true,
      mode: "merge",
      errors: [],
      profileSource: {
        schemaVersion: currentSource.schemaVersion || "openpcm_profile_seed_v1",
        source: currentSource.source || exportData.source || "OpenPCM",
        profile: mergeObjects(currentSource.profile || {}, exportData.profile || {}),
        knowledge: mergeObjects(currentSource.knowledge || {}, exportData.knowledge || {}),
        media: mergeObjects(currentSource.media || {}, exportData.media || {})
      }
    };
  }

  function exportProfileText(profileSource = {}, options = {}) {
    return JSON.stringify(exportProfile(profileSource, options), null, 2);
  }

  function parseProfileText(text = "") {
    try {
      const data = JSON.parse(String(text || ""));
      const validation = validateProfileExport(data);
      return { ok: validation.ok, data, errors: validation.errors };
    } catch (error) {
      return { ok: false, data: null, errors: [error.message] };
    }
  }

  function profileTransferSummary(profileExport = {}) {
    return {
      schemaVersion: profileExport.schemaVersion || "",
      profileSections: Object.keys(profileExport.profile || {}).length,
      knowledgeSections: Object.keys(profileExport.knowledge || {}).length,
      mediaSections: Object.keys(profileExport.media || {}).length,
      exported_at_utc: profileExport.exported_at_utc || ""
    };
  }

  global.OpenPCMProfileTransfer = {
    EXPORT_SCHEMA_VERSION,
    exportProfile,
    exportProfileText,
    validateProfileExport,
    parseProfileText,
    importProfile,
    profileTransferSummary
  };
})(window);
