const STORAGE_KEY = "openpcm_evidence_v3";
const LEGACY_KEYS = ["openpcm_evidence_v2", "pcm_mobile_entries_v1"];
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

function uuid() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return "ev_" + Date.now() + "_" + Math.random().toString(16).slice(2);
}

function loadEntries() {
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(current)) return current;
  } catch {}

  for (const key of LEGACY_KEYS) {
    try {
      const legacy = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(legacy) && legacy.length) {
        saveEntries(legacy.map(normalizeEntry));
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      }
    } catch {}
  }

  return [];
}

function normalizeEntry(e) {
  return {
    id: e.id || uuid(),
    title: e.title || "Untitled",
    medium: e.medium || e.type || "Other",
    reaction: e.reaction || "Not sure yet",
    cognitive_state: e.cognitive_state || e.cognitive || "Not recorded",
    tags: Array.isArray(e.tags) ? e.tags : (Array.isArray(e.reasons) ? e.reasons : []),
    note: e.note || e.notes || "",
    timestamp_utc: e.timestamp_utc || e.created_utc || new Date().toISOString(),
    updated_utc: e.updated_utc || null
  };
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.map(normalizeEntry)));
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
    </button>
  `;
}

function renderRecent() {
  const entries = loadEntries().slice(-3).reverse();
  $("recent-list").innerHTML = entries.length
    ? entries.map(entryHtml).join("")
    : `<div class="empty">No evidence yet. Add your first entry.</div>`;
}

function filteredEntries() {
  const search = $("search")?.value?.toLowerCase() || "";
  let entries = loadEntries().slice().sort((a,b) => new Date(b.timestamp_utc) - new Date(a.timestamp_utc));

  if (activeFilter !== "All") entries = entries.filter(e => e.medium === activeFilter);

  if (search) {
    entries = entries.filter(e =>
      e.title.toLowerCase().includes(search) ||
      (e.note || "").toLowerCase().includes(search) ||
      (e.tags || []).join(" ").toLowerCase().includes(search)
    );
  }

  return entries;
}

function renderLibrary() {
  const entries = filteredEntries();
  $("library-count").textContent = String(entries.length);
  $("entries").innerHTML = entries.length
    ? entries.map(entryHtml).join("")
    : `<div class="empty">No matching evidence.</div>`;
}

function renderDetail() {
  if (!selectedDetailId) return;
  const entry = loadEntries().find(e => e.id === selectedDetailId);
  if (!entry) {
    setView("library");
    return;
  }

  $("detail-card").innerHTML = `
    <p class="eyebrow">${escapeHtml(entry.medium)}</p>
    <h2>${escapeHtml(entry.title)}</h2>
    <p><strong>${escapeHtml(entry.reaction)}</strong></p>
    <p>${escapeHtml(entry.cognitive_state || "No cognitive state")}</p>
    ${entry.tags?.length ? `<div class="tags">${entry.tags.map(escapeHtml).join(", ")}</div>` : ""}
    ${entry.note ? `<div class="note">${escapeHtml(entry.note)}</div>` : ""}
    <p class="meta">Created: ${escapeHtml(new Date(entry.timestamp_utc).toLocaleString())}</p>
    ${entry.updated_utc ? `<p class="meta">Updated: ${escapeHtml(new Date(entry.updated_utc).toLocaleString())}</p>` : ""}
    <div class="detail-actions">
      <button class="primary" id="edit-entry">Edit</button>
      <button class="danger" id="delete-entry">Delete</button>
      <button class="secondary" data-nav="library">Back to Library</button>
    </div>
  `;

  $("edit-entry").addEventListener("click", () => startEdit(entry.id));
  $("delete-entry").addEventListener("click", () => deleteEntry(entry.id));
  document.querySelector("#detail-card [data-nav='library']").addEventListener("click", () => setView("library"));
}

function renderStats() {
  const entries = loadEntries();
  const byType = {};
  const byReaction = {};
  for (const e of entries) {
    byType[e.medium] = (byType[e.medium] || 0) + 1;
    byReaction[e.reaction] = (byReaction[e.reaction] || 0) + 1;
  }

  const topType = Object.entries(byType).sort((a,b)=>b[1]-a[1])[0]?.join(": ") || "None";
  const topReaction = Object.entries(byReaction).sort((a,b)=>b[1]-a[1])[0]?.join(": ") || "None";

  $("stats").innerHTML = `
    <div class="stat-grid">
      <div class="stat"><strong>${entries.length}</strong>Total entries</div>
      <div class="stat"><strong>${escapeHtml(topType)}</strong>Top type</div>
      <div class="stat"><strong>${escapeHtml(topReaction)}</strong>Top reaction</div>
      <div class="stat"><strong>${new Set(entries.flatMap(e => e.tags || [])).size}</strong>Unique tags</div>
    </div>
  `;
}

function renderAll() {
  renderRecent();
  renderLibrary();
  renderStats();
  renderDetail();
  bindEntryButtons();
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
  document.querySelectorAll("#chips button").forEach(b => {
    b.classList.toggle("selected", selectedTags.has(b.dataset.tag));
  });

  $("save-confirm").textContent = "";
  setView("add");
}

function deleteEntry(id) {
  const entry = loadEntries().find(e => e.id === id);
  if (!entry) return;
  if (!confirm(`Delete "${entry.title}"?`)) return;

  saveEntries(loadEntries().filter(e => e.id !== id));
  selectedDetailId = null;
  setView("library");
}

function checkDuplicateTitle() {
  const title = $("title").value.trim().toLowerCase();
  const editingId = $("editing-id").value;
  if (!title) {
    $("duplicate-warning").textContent = "";
    return;
  }

  const duplicate = loadEntries().find(e =>
    e.title.toLowerCase() === title && e.id !== editingId
  );

  $("duplicate-warning").textContent = duplicate
    ? `Existing entry found: ${duplicate.title}. You may want to edit it instead.`
    : "";
}

document.addEventListener("DOMContentLoaded", () => {
  $("greeting").textContent = nowGreeting();

  document.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", () => setView(btn.dataset.nav));
  });

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
    const title = $("title").value.trim();
    if (!title) {
      $("save-confirm").textContent = "Please enter a title.";
      return;
    }

    const editingId = $("editing-id").value;
    const entries = loadEntries();

    const entry = {
      id: editingId || uuid(),
      title,
      medium: $("medium").value,
      reaction: $("reaction").value,
      cognitive_state: $("cognitive").value,
      tags: Array.from(selectedTags),
      note: $("note").value.trim(),
      timestamp_utc: editingId
        ? (entries.find(e => e.id === editingId)?.timestamp_utc || new Date().toISOString())
        : new Date().toISOString(),
      updated_utc: editingId ? new Date().toISOString() : null
    };

    const next = editingId
      ? entries.map(e => e.id === editingId ? entry : e)
      : [...entries, entry];

    saveEntries(next);
    lastSaved = editingId ? null : entry.id;

    $("undo").disabled = Boolean(editingId);
    $("save-confirm").textContent = editingId ? "Updated." : "Saved.";
    clearForm();
    renderAll();

    if (editingId) {
      selectedDetailId = entry.id;
      setView("detail");
    }
  });

  $("cancel-edit").addEventListener("click", () => {
    clearForm();
    setView("library");
  });

  $("undo").addEventListener("click", () => {
    if (!lastSaved) return;
    const entries = loadEntries().filter(e => e.id !== lastSaved);
    saveEntries(entries);
    lastSaved = null;
    $("undo").disabled = true;
    $("save-confirm").textContent = "Last save undone.";
    renderAll();
  });

  $("export").addEventListener("click", () => {
    const payload = {
      schema_version: "openpcm_mobile_export_v3",
      exported_utc: new Date().toISOString(),
      evidence: loadEntries()
    };
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
    if (Array.isArray(data)) saveEntries(data);
    else if (Array.isArray(data.evidence)) saveEntries(data.evidence);
    else {
      alert("No evidence array found.");
      return;
    }
    renderAll();
  });

  $("clear").addEventListener("click", () => {
    if (confirm("Clear all local evidence?")) {
      localStorage.removeItem(STORAGE_KEY);
      renderAll();
    }
  });

  renderAll();
});
