(function (global) {
  const Core = global.OpenPCMCore;

  const ERRORS = {
    titleRequired: "Please enter a title.",
    tagsInvalid: "Tags must be non-empty text values."
  };

  function textValue(value = "") {
    return String(value || "").trim();
  }

  function normalizeTags(tags = []) {
    return Array.isArray(tags)
      ? tags.map(tag => textValue(tag)).filter(Boolean)
      : [];
  }

  function titleValue(title = "") {
    return textValue(title);
  }

  function validateTitle(title = "") {
    const value = titleValue(title);
    const errors = value ? [] : [ERRORS.titleRequired];
    return {
      valid: errors.length === 0,
      value,
      errors
    };
  }

  function validateTags(tags = []) {
    const value = normalizeTags(tags);
    const valid = Array.isArray(tags) && tags.every(tag => typeof tag === "string" && textValue(tag));
    return {
      valid,
      value,
      errors: valid ? [] : [ERRORS.tagsInvalid]
    };
  }

  function findDuplicateTitle(entries = [], title = "", editingId = "") {
    if (Core && typeof Core.findDuplicateTitle === "function") {
      return Core.findDuplicateTitle(entries, title, editingId);
    }

    const target = titleValue(title).toLowerCase();
    if (!target) return null;
    return entries.find(entry => String(entry.title || "").toLowerCase() === target && entry.id !== editingId) || null;
  }

  function duplicateTitleWarning(entries = [], title = "", editingId = "") {
    const duplicate = findDuplicateTitle(entries, title, editingId);
    return duplicate ? `Existing entry found: ${duplicate.title}. You may want to edit it instead.` : "";
  }

  function normalizeEntryInput(entry = {}) {
    return {
      ...entry,
      title: titleValue(entry.title),
      note: textValue(entry.note),
      tags: normalizeTags(entry.tags || [])
    };
  }

  function validateEntry(entry = {}, entries = [], options = {}) {
    const editingId = options.editingId || entry.id || "";
    const title = validateTitle(entry.title);
    const tags = validateTags(entry.tags || []);
    const errors = [...title.errors, ...tags.errors];
    const duplicate = findDuplicateTitle(entries, title.value, editingId);
    const warnings = duplicate ? [duplicateTitleWarning(entries, title.value, editingId)] : [];

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      duplicate,
      value: normalizeEntryInput(entry)
    };
  }

  global.OpenPCMValidation = {
    ERRORS,
    textValue,
    titleValue,
    normalizeTags,
    normalizeEntryInput,
    validateTitle,
    validateTags,
    findDuplicateTitle,
    duplicateTitleWarning,
    validateEntry
  };
})(window);
