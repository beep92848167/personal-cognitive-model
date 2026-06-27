const Core = window.OpenPCMCore;
const Validation = window.OpenPCMValidation;
const Detail = window.OpenPCMDetail;
const Portable = window.OpenPCMPortable;
const Discover = window.OpenPCMDiscover;
const Calibration = window.OpenPCMCalibration;
const Profile = window.OpenPCMProfile;

let selectedTags = new Set();
let activeFilter = "All";
let lastSaved = null;
let selectedDetailId = null;

const $ = (id) => document.getElementById(id);


function nowGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning, Mark";
  if (hour < 17) return "Good afternoon, Mark";
  return "Good evening, Mark";
}

function loadEntries() {
  return Core.loadEntriesFromStorage();
}

function saveEntries(entries) {
  Core.saveEntriesToStorage(entries);
}

function loadRecommendationFeedback() {
  return Calibration.loadFeedback();
}

function saveRecommendationFeedback(items) {
  Calibration.saveFeedback(items);
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function setView(name) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  $(`view-${name}`).classList.add("active");
  document.querySelectorAll("[data-nav]").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(`[data-nav="${name}"]`).forEach(b => b.classList.add("active"));
  renderAll();
}

function entryHtml(e) {
  return `
    <button class="entry" data-entry-id="${escapeHtml(e.id)}">
      <div class="entry-title">${escapeHtml(e.title)}</div>
      <div class="meta">${escapeHtml(e.medium)} • ${escapeHtml(e.reaction)} • ${escapeHtml(e.cognitive_state || "No cognitive state")}</div>
      ${e.tags?.length ? `<div class="tags">${e.tags.map(escapeHtml).join(", ")}</div>` : ""}
      ${e.note ? `<div class="note">${escapeHtml(e.note)}</div>` : ""}
      <div class="meta">${escapeHtml(new Date(e.timestamp_utc).toLocaleString())}</div>
    </button>`;
}

function renderRecent() {
  const entries = Core.sortNewestFirst(loadEntries()).slice(0, 3);
  $("recent-list").innerHTML = entries.length ? entries.map(entryHtml).join("") : `<div class="empty">No evidence yet. Add your first entry.</div>`;
}

function filteredEntries() {
  return Core.filterEntries(Core.sortNewestFirst(loadEntries()), { search: $("search")?.value || "", medium: activeFilter });
}

function renderLibrary() {
  const entries = filteredEntries();
  $("library-count").textContent = String(entries.length);
  $("entries").innerHTML = entries.length ? entries.map(entryHtml).join("") : `<div class="empty">No matching evidence.</div>`;
}

function renderDetail() {
  if (!selectedDetailId) return;
  const entry = loadEntries().find(e => e.id === selectedDetailId);
  if (!entry) {
    selectedDetailId = null;
    setView("library");
    return;
  }

  $("detail-card").innerHTML = Detail.renderDetailHtml(entry);

  $("edit-entry").addEventListener("click", () => startEdit(entry.id));
  $("delete-entry").addEventListener("click", () => deleteEntry(entry.id));
  document.querySelector("#detail-card [data-nav='library']").addEventListener("click", () => setView("library"));
}


function renderDiscover() {
  const entries = loadEntries();
  const feedback = loadRecommendationFeedback();
  const summary = Discover.buildDiscoverSummary(entries, [], { profileSource: window.OpenPCMProfileSeed, feedback });
  const recommendations = summary.recommendations.slice(0, 3);

  $("discover-content").innerHTML = entries.length ? `
    <p class="eyebrow">Explainable matches</p>
    <h2>Discover</h2>
    ${summary.profileSourceSummary?.cognition ? `<p class="meta">Profile source: ${escapeHtml(summary.profileSourceSummary.cognition)}</p>` : ""}
    ${summary.topTags.length ? `<p class="meta">Current preference signals: ${summary.topTags.map(escapeHtml).join(", ")}</p>` : ""}
    <div class="list">
      ${recommendations.length ? recommendations.map(rec => `
        <article class="entry">
          <div class="entry-title">${escapeHtml(rec.title)} <span class="badge">${rec.score}%</span></div>
          <div class="meta">${escapeHtml(rec.medium)}${rec.feedback ? ` • calibrated from ${escapeHtml(String(rec.originalScore))}%` : ""}</div>
          ${rec.reasons.length ? `<div class="tags">Reasons: ${rec.reasons.map(escapeHtml).join(", ")}</div>` : ""}
          ${rec.risks.length ? `<div class="warning-text">Risks: ${rec.risks.map(escapeHtml).join(", ")}</div>` : ""}
          ${rec.feedback ? `<div class="confirm">Your feedback: ${rec.feedback.value > 0 ? "good fit" : rec.feedback.value < 0 ? "not for me" : "neutral"}</div>` : ""}
          ${rec.note ? `<div class="note">${escapeHtml(rec.note)}</div>` : ""}
          <div class="detail-actions">
            <button class="secondary" data-rec-feedback="positive" data-rec-title="${escapeHtml(rec.title)}">Good fit</button>
            <button class="secondary" data-rec-feedback="negative" data-rec-title="${escapeHtml(rec.title)}">Not for me</button>
          </div>
        </article>
      `).join("") : `<div class="empty">No recommendations yet. Add more liked evidence.</div>`}
    </div>
  ` : `
    <p class="eyebrow">Explainable matches</p>
    <h2>Discover</h2>
    <p>Add evidence first. Recommendations are generated from your saved reactions and tags.</p>
  `;
}

function renderStats() {
  const stats = Core.buildStats(loadEntries());
  $("stats").innerHTML = `
    <div class="stat-grid">
      <div class="stat"><strong>${stats.total}</strong>Total entries</div>
      <div class="stat"><strong>${escapeHtml(stats.topType)}</strong>Top type</div>
      <div class="stat"><strong>${escapeHtml(stats.topReaction)}</strong>Top reaction</div>
      <div class="stat"><strong>${stats.uniqueTags}</strong>Unique tags</div>
    </div>`;
}

function renderAll() {
  renderRecent();
  renderLibrary();
  renderStats();
  renderDiscover();
  renderDetail();
  bindEntryButtons();
  bindRecommendationFeedback();
}


function bindRecommendationFeedback() {
  document.querySelectorAll("[data-rec-feedback]").forEach(btn => {
    btn.addEventListener("click", () => {
      const existing = loadRecommendationFeedback();
      const updated = Calibration.upsertFeedback(existing, {
        title: btn.dataset.recTitle,
        value: btn.dataset.recFeedback === "positive" ? 1 : -1
      });
      saveRecommendationFeedback(updated);
      renderDiscover();
    });
  });
}

function bindEntryButtons() {
  document.querySelectorAll("[data-entry-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedDetailId = btn.dataset.entryId;
      setView("detail");
    });
  });
}

function clearForm() {
  $("editing-id").value = "";
  $("form-title").textContent = "Add Evidence";
  $("title").value = "";
  $("note").value = "";
  $("duplicate-warning").textContent = "";
  $("cancel-edit").hidden = true;
  selectedTags.clear();
  document.querySelectorAll("#chips button").forEach(b => b.classList.remove("selected"));
}

function startEdit(id) {
  const entry = loadEntries().find(e => e.id === id);
  if (!entry) return;

  $("editing-id").value = entry.id;
  $("form-title").textContent = "Edit Evidence";
  $("title").value = entry.title;
  $("medium").value = entry.medium;
  $("reaction").value = entry.reaction;
  $("cognitive").value = entry.cognitive_state || "Not recorded";
  $("note").value = entry.note || "";
  $("cancel-edit").hidden = false;

  selectedTags = new Set(entry.tags || []);
  document.querySelectorAll("#chips button").forEach(b => b.classList.toggle("selected", selectedTags.has(b.dataset.tag)));

  $("save-confirm").textContent = "";
  setView("add");
}

function deleteEntry(id) {
  const entry = loadEntries().find(e => e.id === id);
  if (!entry) return;
  if (!confirm(`Delete "${entry.title}"?`)) return;
  saveEntries(Core.removeEntry(loadEntries(), id));
  selectedDetailId = null;
  setView("library");
}

function checkDuplicateTitle() {
  $("duplicate-warning").textContent = Validation.duplicateTitleWarning(loadEntries(), $("title").value, $("editing-id").value);
}

function currentFormEntry(editingId, entries) {
  return {
    id: editingId || Core.createId(),
    title: $("title").value,
    medium: $("medium").value,
    reaction: $("reaction").value,
    cognitive_state: $("cognitive").value,
    tags: Array.from(selectedTags),
    note: $("note").value,
    timestamp_utc: editingId ? (entries.find(e => e.id === editingId)?.timestamp_utc || new Date().toISOString()) : new Date().toISOString(),
    updated_utc: editingId ? new Date().toISOString() : null
  };
}

document.addEventListener("DOMContentLoaded", () => {
  $("greeting").textContent = nowGreeting();

  document.querySelectorAll("[data-nav]").forEach(btn => btn.addEventListener("click", () => setView(btn.dataset.nav)));

  document.querySelectorAll("#chips button").forEach(btn => {
    btn.addEventListener("click", () => {
      const tag = btn.dataset.tag;
      if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        btn.classList.remove("selected");
      } else {
        selectedTags.add(tag);
        btn.classList.add("selected");
      }
    });
  });

  document.querySelectorAll(".filter").forEach(btn => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.filter;
      document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderLibrary();
    });
  });

  $("search").addEventListener("input", renderLibrary);
  $("title").addEventListener("input", checkDuplicateTitle);

  $("save").addEventListener("click", () => {
    const editingId = $("editing-id").value;
    const entries = loadEntries();
    const entry = currentFormEntry(editingId, entries);
    const validation = Validation.validateEntry(entry, entries, { editingId });

    if (!validation.valid) {
      $("save-confirm").textContent = validation.errors[0];
      return;
    }

    saveEntries(Core.upsertEntry(entries, validation.value));
    lastSaved = editingId ? null : validation.value.id;

    $("undo").disabled = Boolean(editingId);
    $("save-confirm").textContent = editingId ? "Updated." : "Saved.";
    clearForm();
    renderAll();

    if (editingId) {
      selectedDetailId = validation.value.id;
      setView("detail");
    }
  });

  $("cancel-edit").addEventListener("click", () => {
    clearForm();
    setView("library");
  });

  $("undo").addEventListener("click", () => {
    if (!lastSaved) return;
    saveEntries(Core.removeEntry(loadEntries(), lastSaved));
    lastSaved = null;
    $("undo").disabled = true;
    $("save-confirm").textContent = "Last save undone.";
    renderAll();
  });

  $("export").addEventListener("click", () => {
    const payload = Portable.buildExportPayload(loadEntries());
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "openpcm-mobile-export.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  $("import").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const data = JSON.parse(await file.text());
    try {
      saveEntries(Portable.extractEvidence(data));
    } catch (err) {
      alert(err.message || "No evidence array found.");
      return;
    }
    renderAll();
  });

  $("clear").addEventListener("click", () => {
    if (confirm("Clear all local evidence?")) {
      localStorage.removeItem(Core.DEFAULT_STORAGE_KEY);
      renderAll();
    }
  });

  renderAll();
});
