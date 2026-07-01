(function (global) {
  "use strict";

  function services() {
    return {
      validation: global.OpenPCMValidationService || null,
      importExport: global.OpenPCMImportExportService || null
    };
  }

  const DEFAULT_TASK_STATUS = "open";
  const VALID_STATUSES = ["open", "in_progress", "blocked", "done", "archived"];
  const VALID_PRIORITIES = ["low", "medium", "high", "critical"];

  function createTaskId() {
    if (global.crypto && typeof global.crypto.randomUUID === "function") return global.crypto.randomUUID();
    return `task_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function normalizeTask(task = {}, options = {}) {
    const now = options.now || new Date().toISOString();
    const idFactory = options.idFactory || createTaskId;
    const status = VALID_STATUSES.includes(task.status) ? task.status : DEFAULT_TASK_STATUS;
    const priority = VALID_PRIORITIES.includes(task.priority) ? task.priority : "medium";

    return {
      id: task.id || idFactory(),
      title: task.title || "Untitled task",
      description: task.description || task.note || "",
      status,
      priority,
      tags: Array.isArray(task.tags) ? task.tags : [],
      due_utc: task.due_utc || task.due || null,
      created_utc: task.created_utc || now,
      updated_utc: task.updated_utc || null,
      completed_utc: task.completed_utc || (status === "done" ? now : null)
    };
  }

  function normalizeTasks(tasks = [], options = {}) {
    return Array.isArray(tasks) ? tasks.map(task => normalizeTask(task, options)) : [];
  }

  function validateTasks(data) {
    const issues = [];
    const tasks = Array.isArray(data) ? data : [];

    if (!Array.isArray(data)) {
      issues.push({
        severity: "error",
        code: "invalid-task-list",
        message: "Tasks data must be an array."
      });
      return issues;
    }

    tasks.forEach((task, index) => {
      if (!task || typeof task !== "object") {
        issues.push({ index, severity: "error", code: "invalid-task", message: "Task must be an object." });
        return;
      }

      if (!task.title || typeof task.title !== "string" || !task.title.trim()) {
        issues.push({ index, severity: "warning", code: "missing-title", message: "Task is missing a title." });
      }

      if (task.status && !VALID_STATUSES.includes(task.status)) {
        issues.push({ index, severity: "warning", code: "invalid-status", message: `Unknown task status: ${task.status}` });
      }

      if (task.priority && !VALID_PRIORITIES.includes(task.priority)) {
        issues.push({ index, severity: "warning", code: "invalid-priority", message: `Unknown task priority: ${task.priority}` });
      }
    });

    return issues;
  }

  function importTaskData(data) {
    const importExport = services().importExport;
    if (importExport) return importExport.importList(data, normalizeTask);
    return normalizeTasks(Array.isArray(data) ? data : []);
  }

  function exportTaskData(data) {
    const importExport = services().importExport;
    if (importExport) return importExport.exportList(data, normalizeTask);
    return normalizeTasks(Array.isArray(data) ? data : []);
  }

  const tasksDomain = {
    id: "tasks",
    title: "Tasks",
    description: "Tasks, status, priority, due dates, tags, and completion tracking.",
    routes: [
      { id: "task-list", title: "Tasks", hash: "#tasks" }
    ],
    storageKeys: [
      "openpcm.tasks",
      "taskEntries"
    ],
    requirements: [
      "REQ-TASKS-001",
      "REQ-TASKS-002",
      "REQ-TASKS-003",
      "REQ-TASKS-004"
    ],
    validate: validateTasks,
    importData: importTaskData,
    exportData: exportTaskData
  };

  global.OpenPCMTasksDomain = tasksDomain;
  global.OpenPCMTasksDomainAPI = {
    DEFAULT_TASK_STATUS,
    VALID_STATUSES,
    VALID_PRIORITIES,
    normalizeTask,
    normalizeTasks,
    validateTasks,
    importTaskData,
    exportTaskData
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = tasksDomain;
  }
})(typeof window !== "undefined" ? window : globalThis);
