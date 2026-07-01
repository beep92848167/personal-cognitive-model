(function (global) {
  "use strict";

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
      "REQ-LIBRARY-002"
    ],

    validate(data) {
      const issues = [];
      const entries = Array.isArray(data) ? data : [];

      entries.forEach((entry, index) => {
        if (!entry || typeof entry !== "object") {
          issues.push({ index, severity: "error", message: "Evidence entry must be an object." });
          return;
        }
        if (!entry.title || typeof entry.title !== "string") {
          issues.push({ index, severity: "warning", message: "Evidence entry is missing a title." });
        }
      });

      return issues;
    },

    importData(data) {
      return Array.isArray(data) ? data.slice() : [];
    },

    exportData(data) {
      return Array.isArray(data) ? data.slice() : [];
    }
  };

  global.OpenPCMEvidenceDomain = evidenceDomain;
  if (typeof module !== "undefined" && module.exports) module.exports = evidenceDomain;
})(typeof window !== "undefined" ? window : globalThis);
