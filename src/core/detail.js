(function (global) {
  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatTimestamp(timestamp, formatter) {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "";
    return formatter ? formatter(date) : date.toLocaleString();
  }

  function buildDetailViewModel(entry, options = {}) {
    if (!entry) return null;

    const formatDate = options.formatDate || ((date) => date.toLocaleString());

    return {
      id: entry.id || "",
      medium: entry.medium || "Other",
      title: entry.title || "",
      reaction: entry.reaction || "Not sure yet",
      cognitiveState: entry.cognitive_state || "No cognitive state",
      tags: Array.isArray(entry.tags) ? entry.tags : [],
      note: entry.note || "",
      created: formatTimestamp(entry.timestamp_utc, formatDate),
      updated: entry.updated_utc ? formatTimestamp(entry.updated_utc, formatDate) : ""
    };
  }

  function renderDetailHtml(entry, options = {}) {
    const model = buildDetailViewModel(entry, options);
    if (!model) return "";

    return `
    <p class="eyebrow">${escapeHtml(model.medium)}</p>
    <h2>${escapeHtml(model.title)}</h2>
    <p><strong>${escapeHtml(model.reaction)}</strong></p>
    <p>${escapeHtml(model.cognitiveState)}</p>
    ${model.tags.length ? `<div class="tags">${model.tags.map(escapeHtml).join(", ")}</div>` : ""}
    ${model.note ? `<div class="note">${escapeHtml(model.note)}</div>` : ""}
    ${model.created ? `<p class="meta">Created: ${escapeHtml(model.created)}</p>` : ""}
    ${model.updated ? `<p class="meta">Updated: ${escapeHtml(model.updated)}</p>` : ""}
    <div class="detail-actions">
      <button class="primary" id="edit-entry">Edit</button>
      <button class="danger" id="delete-entry">Delete</button>
      <button class="secondary" data-nav="library">Back to Library</button>
    </div>`;
  }

  global.OpenPCMDetail = {
    escapeHtml,
    buildDetailViewModel,
    renderDetailHtml
  };
})(window);
