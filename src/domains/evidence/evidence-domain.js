(function (global) {
  "use strict";

  function getEvidenceCore() {
    return global.OpenPCMEvidence || {};
  }

  function services() {
    return {
      validation: global.OpenPCMValidationService || null,
      importExport: global.OpenPCMImportExportService || null
    };
  }

  function normalizeEntries(data) {
    const entries = Array.isArray(data) ? data : [];
    const core = getEvidenceCore();

    if (typeof core.normalizeEntry === "function") {
      return entries.map(entry => core.normalizeEntry(entry));
    }

    return entries.map(entry => Object.assign({}, entry));
  }

  function validateEvidenceEntries(data) {
    const issues = [];
    const entries = Array.isArray(data) ? data : [];

    entries.forEach((entry, index) => {
      if (!entry || typeof entry !== "object") {
        issues.push({
          index,
          severity: "error",
          code: "invalid-entry",
          message: "Evidence entry must be an object."
        });
        return;
      }

      if (!entry.title || typeof entry.title !== "string" || !entry.title.trim()) {
        issues.push({
          index,
          severity: "warning",
          code: "missing-title",
          message: "Evidence entry is missing a title."
        });
      }
    });

    return issues;
  }

  function importEvidenceData(data) {
    const importExport = services().importExport;
    if (importExport) return importExport.importList(data, entry => normalizeEntries([entry])[0]);
    return normalizeEntries(Array.isArray(data) ? data : []);
  }

  function exportEvidenceData(data) {
    const importExport = services().importExport;
    if (importExport) return importExport.exportList(data, entry => normalizeEntries([entry])[0]);
    return normalizeEntries(Array.isArray(data) ? data : []);
  }

  const evidenceDomain = {
    id: "evidence",
    title: "Evidence",
    description: "Evidence items, provenance, ratings, tags, and library filtering.",
    routes: [
      { id: "evidence-library", title: "Evidence Library", hash: "#evidence" }
    ],
    storageKeys: ["openpcm.evidence", "evidenceEntries"],
    requirements: [
      "REQ-EVIDENCE-001",
      "REQ-EVIDENCE-002",
      "REQ-EVIDENCE-003",
      "REQ-EVIDENCE-004",
      "REQ-EVIDENCE-005",
      "REQ-EVIDENCE-006",
      "REQ-LIBRARY-001",
      "REQ-LIBRARY-002",
      "REQ-DOMAIN-004",
      "REQ-DOMAIN-005"
    ],
    validate: validateEvidenceEntries,
    importData: importEvidenceData,
    exportData: exportEvidenceData
  };

  global.OpenPCMEvidenceDomain = evidenceDomain;
  global.OpenPCMEvidenceDomainAPI = {
    validateEvidenceEntries,
    importEvidenceData,
    exportEvidenceData,
    normalizeEntries
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = evidenceDomain;
  }
})(typeof window !== "undefined" ? window : globalThis);
