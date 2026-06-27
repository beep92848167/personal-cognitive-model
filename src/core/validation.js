(function (global) {
  const Core = global.OpenPCMCore;

  function titleValue(title = "") {
    return String(title || "").trim();
  }

  function validateTitle(title = "") {
    const value = titleValue(title);
    const errors = value ? [] : ["Please enter a title."];
    return {
      valid: errors.length === 0,
      value,
      errors
    };
  }

  function validateTags(tags = []) {
    const valid = Array.isArray(tags) && tags.every(tag => typeof tag === "string" && tag.trim());
    return {
      valid,
      value: Array.isArray(tags) ? tags.map(tag => String(tag).trim()).filter(Boolean) : [],
      errors: valid ? [] : ["Tags must be non-empty text values."]
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
      value: {
        ...entry,
        title: title.value,
        tags: tags.value
      }
    };
  }

  global.OpenPCMValidation = {
    titleValue,
    validateTitle,
    validateTags,
    findDuplicateTitle,
    duplicateTitleWarning,
    validateEntry
  };
})(window);
