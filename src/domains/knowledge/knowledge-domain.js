(function (global) {
  "use strict";

  const VALID_KINDS = ["concept", "note", "reference", "question", "model"];
  const VALID_STATUSES = ["draft", "active", "review", "archived"];

  function services() {
    return {
      validation: global.OpenPCMValidationService || null,
      importExport: global.OpenPCMImportExportService || null,
      search: global.OpenPCMSearchService || null
    };
  }

  function createKnowledgeId() {
    if (global.crypto && typeof global.crypto.randomUUID === "function") return global.crypto.randomUUID();
    return `knowledge_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function normalizeKnowledgeItem(item = {}, options = {}) {
    const now = options.now || new Date().toISOString();
    const idFactory = options.idFactory || createKnowledgeId;
    const kind = VALID_KINDS.includes(item.kind) ? item.kind : "note";
    const status = VALID_STATUSES.includes(item.status) ? item.status : "active";

    return {
      id: item.id || idFactory(),
      title: item.title || "Untitled knowledge item",
      summary: item.summary || item.description || "",
      body: item.body || item.note || "",
      kind,
      status,
      tags: Array.isArray(item.tags) ? item.tags : [],
      links: Array.isArray(item.links) ? item.links : [],
      source_ids: Array.isArray(item.source_ids) ? item.source_ids : [],
      created_utc: item.created_utc || now,
      updated_utc: item.updated_utc || null
    };
  }

  function normalizeKnowledgeItems(items = [], options = {}) {
    return Array.isArray(items) ? items.map(item => normalizeKnowledgeItem(item, options)) : [];
  }

  function validateKnowledgeItems(data) {
    const validation = services().validation;
    const issues = [];

    if (!Array.isArray(data)) {
      if (validation) return validation.requireArray(data, "invalid-knowledge-list", "Knowledge data must be an array.");
      return [{ severity: "error", code: "invalid-knowledge-list", message: "Knowledge data must be an array." }];
    }

    data.forEach((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        issues.push({ index, severity: "error", code: "invalid-knowledge-item", message: "Knowledge item must be an object." });
        return;
      }

      if (validation) {
        issues.push(...validation.requireNonEmptyString(item.title, index, "missing-title", "Knowledge item is missing a title."));
        issues.push(...validation.requireOneOf(item.kind, VALID_KINDS, index, "invalid-kind", "knowledge kind"));
        issues.push(...validation.requireOneOf(item.status, VALID_STATUSES, index, "invalid-status", "knowledge status"));
      } else {
        if (!item.title || typeof item.title !== "string" || !item.title.trim()) {
          issues.push({ index, severity: "warning", code: "missing-title", message: "Knowledge item is missing a title." });
        }
        if (item.kind && !VALID_KINDS.includes(item.kind)) {
          issues.push({ index, severity: "warning", code: "invalid-kind", message: `Unknown knowledge kind: ${item.kind}` });
        }
        if (item.status && !VALID_STATUSES.includes(item.status)) {
          issues.push({ index, severity: "warning", code: "invalid-status", message: `Unknown knowledge status: ${item.status}` });
        }
      }

      if (item.links && !Array.isArray(item.links)) {
        issues.push({ index, severity: "warning", code: "invalid-links", message: "Knowledge item links must be an array." });
      }

      if (item.source_ids && !Array.isArray(item.source_ids)) {
        issues.push({ index, severity: "warning", code: "invalid-source-ids", message: "Knowledge item source_ids must be an array." });
      }
    });

    return issues;
  }

  function importKnowledgeData(data) {
    const importExport = services().importExport;
    if (importExport) return importExport.importList(data, normalizeKnowledgeItem);
    return normalizeKnowledgeItems(Array.isArray(data) ? data : []);
  }

  function exportKnowledgeData(data) {
    const importExport = services().importExport;
    if (importExport) return importExport.exportList(data, normalizeKnowledgeItem);
    return normalizeKnowledgeItems(Array.isArray(data) ? data : []);
  }

  function searchKnowledge(data, query) {
    const search = services().search;
    const items = normalizeKnowledgeItems(data);
    if (!search) return items;

    return items.filter(item => search.matchesQuery(item, query, ["title", "summary", "body", "tags", "kind", "status"]));
  }

  const knowledgeDomain = {
    id: "knowledge",
    title: "Knowledge",
    description: "Concepts, notes, references, questions, models, source links, and reusable thinking material.",
    routes: [
      { id: "knowledge-library", title: "Knowledge", hash: "#knowledge" }
    ],
    storageKeys: [
      "openpcm.knowledge",
      "knowledgeEntries"
    ],
    requirements: [
      "REQ-KNOWLEDGE-001",
      "REQ-KNOWLEDGE-002",
      "REQ-KNOWLEDGE-003",
      "REQ-KNOWLEDGE-004",
      "REQ-KNOWLEDGE-005"
    ],
    validate: validateKnowledgeItems,
    importData: importKnowledgeData,
    exportData: exportKnowledgeData,
    search: searchKnowledge
  };

  global.OpenPCMKnowledgeDomain = knowledgeDomain;
  global.OpenPCMKnowledgeDomainAPI = {
    VALID_KINDS,
    VALID_STATUSES,
    normalizeKnowledgeItem,
    normalizeKnowledgeItems,
    validateKnowledgeItems,
    importKnowledgeData,
    exportKnowledgeData,
    searchKnowledge
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = knowledgeDomain;
  }
})(typeof window !== "undefined" ? window : globalThis);
