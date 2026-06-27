const STORAGE_KEY = "openpcm_evidence_v2";
let selectedTags = new Set();
let activeFilter = "All";
let lastSaved = null;

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
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
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
    <div class="entry">
      <div class="entry-title">${escapeHtml(e.title)}</div>
      <div class="meta">${escapeHtml(e.medium)} • ${escapeHtml(e.reaction)} • ${escapeHtml(e.cognitive_state || "No cognitive state")}</div>
      ${e.tags?.length ? `<div class="tags">${e.tags.map(escapeHtml).join(", ")}</div>` : ""}
      ${e.note ? `<div class="note">${escapeHtml(e.note)}</div>` : ""}
      <div class="meta">${escapeHtml(new Date(e.timestamp_utc).toLocaleString())}</div>
    </div>
  `;
}

function renderRecent() {
  const entries = loadEntries().slice(-3).reverse();
  $("recent-list").innerHTML = entries.length
    ? entries.map(entryHtml).join("")
    : `<div class="empty">No evidence yet. Add your first entry.</div>`;
}

function renderLibrary() {
  const search = $("search")?.value?.toLowerCase() || "";
  let entries = loadEntries().slice().reverse();

  if (activeFilter !== "All") {
    entries = entries.filter(e => e.medium === activeFilter);
  }

  if (search) {
    entries = entries.filter(e =>
      e.title.toLowerCase().includes(search) ||
      (e.note || "").toLowerCase().includes(search) ||
      (e.tags || []).join(" ").toLowerCase().includes(search)
    );
  }

  $("library-count").textContent = String(entries.length);
  $("entries").innerHTML = entries.length
    ? entries.map(entryHtml).join("")
    : `<div class="empty">No matching evidence.</div>`;
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
}

function clearForm() {
  $("title").value = "";
  $("note").value = "";
  selectedTags.clear();
  document.querySelectorAll("#chips button").forEach(b => b.classList.remove("selected"));
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

  $("save").addEventListener("click", () => {
    const title = $("title").value.trim();
    if (!title) {
      $("save-confirm").textContent = "Please enter a title.";
      return;
    }

    const entry = {
      id: uuid(),
      title,
      medium: $("medium").value,
      reaction: $("reaction").value,
      cognitive_state: $("cognitive").value,
      tags: Array.from(selectedTags),
      note: $("note").value.trim(),
      timestamp_utc: new Date().toISOString()
    };

    const entries = loadEntries();
    entries.push(entry);
    saveEntries(entries);
    lastSaved = entry.id;

    $("undo").disabled = false;
    $("save-confirm").textContent = "Saved.";
    clearForm();
    renderAll();
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
      schema_version: "openpcm_mobile_export_v2",
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
