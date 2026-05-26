// views/dashboard.js — Kanban board, styled to match the reference board.html design

import { getAllTasks, getAllUsers, createTask, updateTask, deleteTask } from "../js/api.js";
import { getSession, clearSession } from "../js/auth.js";
import { navigate } from "../js/router.js";

// Kanban columns — order defines left-to-right display
const COLUMNS = [
  { id: "todo",        label: "To Do",       countClass: "bg-surface-container-high text-on-surface-variant" },
  { id: "in progress", label: "In Progress",  countClass: "bg-primary-container text-on-primary" },
  { id: "in review",   label: "In Review",    countClass: "bg-surface-container-high text-on-surface-variant" },
  { id: "done",        label: "Done",         countClass: "bg-surface-container-high text-on-surface-variant" },
];

// Module-level state (shared between functions)
let currentUser  = null;
let allUsers     = [];
let allTasks     = [];
let appContainer = null;

// ─────────────────────────────────────────
// ENTRY POINT
// ─────────────────────────────────────────

const db = {
  mounted: async () => {
    const container = document.getElementById("app");
    appContainer = container;
  currentUser  = getSession();
  
  document.body.className = "bg-background text-on-background overflow-hidden h-screen flex";

  // Loading skeleton
  container.innerHTML = `
    <div class="flex-1 flex items-center justify-center">
      <div class="text-center space-y-md">
        <span class="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
        <p class="font-body-md text-body-md text-on-surface-variant">Loading board…</p>
      </div>
    </div>
  `;

  try {
    // Fetch tasks and users in parallel
    [allTasks, allUsers] = await Promise.all([getAllTasks(), getAllUsers()]);
  } catch {
    container.innerHTML = `
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center space-y-md p-xl bg-error-container rounded-xl max-w-md">
          <span class="material-symbols-outlined text-error text-4xl">wifi_off</span>
          <p class="font-headline-md text-headline-md text-error">Cannot connect to server</p>
          <p class="font-body-md text-body-md text-on-surface-variant">
            Make sure json-server is running:<br>
            <code class="bg-surface px-sm py-xs rounded font-mono text-primary">npx json-server db.json</code>
          </p>
        </div>
      </div>
    `;
    return;
  }

  buildBoard(container);
  }
};

// ─────────────────────────────────────────
// BUILD THE FULL BOARD LAYOUT
// ─────────────────────────────────────────

function buildBoard(container) {
  // Ensure container stays as a full flex row for the sidebar+main layout
  container.innerHTML = "";

  const isAdmin = currentUser.role === "admin";

  // Get user initials for the topbar avatar
  const initials = currentUser.name
    .split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const boardHTML = `
    <!-- ══════════════════════════════
         SIDEBAR (matches reference)
    ══════════════════════════════ -->
    <aside class="hidden md:flex flex-col pt-md pb-xl gap-xs h-full bg-surface-container-low border-r border-outline-variant w-[280px] shrink-0">

      <!-- Brand -->
      <div class="px-gutter mb-xl">
        <h1 class="font-headline-md text-headline-md font-bold text-primary">RiwiFlow</h1>
        <p class="font-body-sm text-body-sm text-on-surface-variant">Product Team</p>
      </div>

      <!-- Navigation links -->
      <nav class="flex-1 space-y-1">
        <a class="flex items-center bg-primary-fixed text-on-primary-fixed-variant rounded-lg mx-2 px-4 py-3 font-body-sm text-body-sm transition-all scale-[0.98]" href="#">
          <span class="material-symbols-outlined mr-3">dashboard</span>
          Dashboard
        </a>
        <a class="flex items-center text-secondary hover:text-primary hover:bg-primary-container/10 px-4 py-3 mx-2 font-body-sm text-body-sm rounded-lg transition-all" href="#">
          <span class="material-symbols-outlined mr-3">assignment</span>
          Projects
        </a>
        <a class="flex items-center text-secondary hover:text-primary hover:bg-primary-container/10 px-4 py-3 mx-2 font-body-sm text-body-sm rounded-lg transition-all" href="#">
          <span class="material-symbols-outlined mr-3">group</span>
          Team
        </a>
        <a class="flex items-center text-secondary hover:text-primary hover:bg-primary-container/10 px-4 py-3 mx-2 font-body-sm text-body-sm rounded-lg transition-all" href="#">
          <span class="material-symbols-outlined mr-3">bar_chart</span>
          Reports
        </a>
        <a class="flex items-center text-secondary hover:text-primary hover:bg-primary-container/10 px-4 py-3 mx-2 font-body-sm text-body-sm rounded-lg transition-all" href="#">
          <span class="material-symbols-outlined mr-3">settings</span>
          Settings
        </a>
      </nav>

      <!-- Sidebar bottom: New Task (admin) + user info + logout -->
      <div class="px-4 mt-auto">
        ${isAdmin ? `
          <button id="new-project-btn"
            class="w-full bg-primary text-on-primary py-3 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity">
            <span class="material-symbols-outlined" data-icon="add">add</span>
            New Project
          </button>
        ` : ""}
      </div>
    </aside>

    <!-- ══════════════════════════════
         MAIN CONTENT AREA
    ══════════════════════════════ -->
    <main class="flex-1 flex flex-col min-w-0">

      <!-- Top bar (matches reference) -->
      <header class="flex justify-between items-center h-16 px-gutter w-full bg-surface border-b border-outline-variant z-40">
        <div class="flex items-center gap-4 flex-1">
          <div class="relative max-w-md w-full">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" data-icon="search">search</span>
            <input
              id="search-input"
              class="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-full font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Search tasks or files..."
              type="text"
            />
          </div>
        </div>
        <div class="flex items-center gap-4 ml-4">
          <button class="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors" data-icon="notifications">
            notifications
          </button>
          <button class="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors" data-icon="help_outline">
            help_outline
          </button>
          <img
            alt="User profile"
            class="w-8 h-8 rounded-full border border-outline-variant object-cover"
            id="logout-btn"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2-sF_Qd9jEF33fUrS3vMvdoA8rbw2_a6jzv7r_6oDikCkrertidHwLgqAtWuKvLnRx7Lcsi79ZYj4FBaL_pETFxeyeF27_PhXy-KnuioiYgCwYTKcWDEuZoRksSf8Jb0_ZmsxJkpTFGZ2bW8aTl5fhcA4DOHQQal_vu1KVBcizoM56dHRc7Ce_vkUul2aL96DSeDmqR4YdfGUuoIQkUF_F8AX45U05tmCFg7YyPH6xtgAx7e31u5_5e2rQxm_tgBEgnhV-LsqsEDH"
            title="Click to logout"
          />
        </div>
      </header>

      <!-- Board area (matches reference layout) -->
      <div class="flex-1 overflow-x-auto p-gutter custom-scrollbar" id="board-scroll">
        <div class="flex gap-gutter h-full min-w-full" id="kanban-board">
          ${COLUMNS.map(col => renderColumn(col)).join("")}
        </div>
      </div>
    </main>

    <!-- ══════════════════════════════
         MODAL OVERLAY (hidden)
    ══════════════════════════════ -->
    <div id="modal-overlay"
      class="hidden fixed inset-0 bg-inverse-surface/40 z-50 flex items-center justify-center p-gutter">
      <div id="modal-box" class="modal-enter bg-surface rounded-xl border border-outline-variant shadow-xl w-full max-w-lg"></div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', boardHTML);

  // ── Event listeners ──
  document.getElementById("logout-btn").addEventListener("click", handleLogout);

  if (isAdmin) {
    const newProjBtn = document.getElementById("new-project-btn");
    if (newProjBtn) newProjBtn.addEventListener("click", () => openTaskModal(null));
  }

  // Live search filter
  document.getElementById("search-input").addEventListener("input", (e) => {
    filterCards(e.target.value.trim().toLowerCase());
  });

  // Close modal on overlay click
  document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target.id === "modal-overlay") closeModal();
  });

  // Attach edit/delete listeners on cards
  attachCardListeners();
}

// ─────────────────────────────────────────
// RENDER A KANBAN COLUMN
// ─────────────────────────────────────────

function renderColumn(col) {
  const tasks = allTasks.filter(t => t.status === col.id);

  return `
    <div class="kanban-column flex flex-col w-1/4 h-full" data-col="${col.id}">

      <!-- Column header -->
      <div class="flex items-center justify-between mb-md">
        <div class="flex items-center gap-2">
          <h3 class="font-title-sm text-title-sm text-on-surface">${col.label}</h3>
          <span class="${col.countClass} px-2 py-0.5 rounded-full font-label-sm text-label-sm col-count">${tasks.length}</span>
        </div>
        <button class="material-symbols-outlined text-outline" data-icon="more_horiz">more_horiz</button>
      </div>

      <!-- Cards container -->
      <div class="flex-1 space-y-md p-2 bg-surface-container-low/50 rounded-xl overflow-y-auto custom-scrollbar" id="col-${col.id.replace(/ /g, "-")}">
        ${tasks.length > 0
          ? tasks.map(t => renderCard(t, col.id)).join("")
          : `<div class="text-center py-xl text-on-surface-variant font-body-sm text-body-sm">No tasks</div>`
        }
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────
// RENDER A SINGLE TASK CARD
// ─────────────────────────────────────────

function renderCard(task, colId) {
  const isAdmin  = currentUser.role === "admin";
  const isOwner  = task.userId === currentUser.id;
  const canEdit  = isAdmin || isOwner;
  const isDone   = colId === "done";
  const isActive = colId === "in progress";
  const isInReview = colId === "in review";

  // Find assigned user
  const assignedUser = allUsers.find(u => u.id === task.userId);
  const assignedName = assignedUser ? assignedUser.name : "Unassigned";
  const initials     = assignedName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  // Role badge color
  const roleBadgeClass = assignedUser?.role === "admin"
    ? "bg-tertiary-fixed text-on-tertiary-fixed"
    : "bg-primary-fixed text-on-primary-fixed-variant";

  // Card border style: active tasks get a left accent (same as reference)
  const cardBorder = isActive
    ? "border-l-4 border-l-primary border border-outline-variant"
    : "border border-outline-variant";

  // Done cards: muted opacity, strikethrough title (same as reference)
  const cardOpacity = isDone ? "opacity-80" : "";
  const titleClass  = isDone ? "line-through" : "";

  return `
    <div class="task-card bg-surface ${cardBorder} rounded-xl p-md shadow-sm ${cardOpacity}" data-task-id="${task.id}">

      <!-- Card top row: role badge + actions -->
      <div class="flex items-start justify-between mb-xs">
        <span class="${roleBadgeClass} px-2 py-0.5 rounded-full font-label-sm text-label-sm">
          ${assignedUser?.role === "admin" ? "Admin" : "Coder"}
        </span>
        <div class="flex items-center gap-1">
          ${isDone ? `<span class="material-symbols-outlined text-sm" style="font-variation-settings:'FILL' 1;color:#8f4200">check_circle</span>` : ""}
          ${canEdit ? `
            <button class="btn-edit material-symbols-outlined text-outline hover:text-primary text-sm p-0.5 rounded transition-colors" data-id="${task.id}" title="Edit task">
              edit
            </button>
          ` : ""}
          ${isAdmin ? `
            <button class="btn-delete material-symbols-outlined text-outline hover:text-error text-sm p-0.5 rounded transition-colors" data-id="${task.id}" title="Delete task">
              delete
            </button>
          ` : ""}
        </div>
      </div>

      <!-- Title -->
      <h4 class="font-label-md text-label-md text-on-surface mb-xs ${titleClass}">
        ${task.title}
      </h4>

      <!-- Description (clamped to 2 lines) -->
      <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
        ${task.description}
      </p>

      <!-- Card footer: avatar + assignee name -->
      <div class="mt-md flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="flex -space-x-2">
            <div class="w-6 h-6 rounded-full border-2 border-surface bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center text-[10px] font-bold">${initials}</div>
          </div>
          ${!isInReview ? `<span class="font-body-sm text-body-sm text-on-surface-variant">${assignedName}</span>` : ""}
        </div>
        ${isInReview ? `
          ${isAdmin ? `
            <button class="text-primary font-label-sm text-label-sm hover:underline">
              Review now
            </button>
          ` : `
            <span class="font-label-sm text-label-sm text-outline">Waiting...</span>
          `}
        ` : `
          <span class="font-label-sm text-label-sm ${isActive ? 'text-primary font-bold' : 'text-outline'} flex items-center gap-1">
            <span class="material-symbols-outlined text-sm" data-icon="${isActive ? 'hourglass_empty' : 'schedule'}">
              ${isActive ? 'hourglass_empty' : 'schedule'}
            </span>
            ${isActive ? 'Today' : isDone ? 'Completed' : '2d'}
          </span>
        `}
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────
// CARD LISTENERS (edit / delete)
// ─────────────────────────────────────────

function attachCardListeners() {
  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      const taskId = btn.dataset.id; // Obtener el ID como cadena de texto
      const task = allTasks.find((t) => String(t.id) === taskId); // Comparar IDs como cadenas de texto

      if (!task) {
        alert("Task not found.");
        return;
      }

      openTaskModal(task);
    });
  });

  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();

      const taskId = btn.dataset.id; // Obtener el ID como cadena de texto

      if (confirm("Delete this task? This action cannot be undone.")) {
        await handleDeleteTask(taskId);
      }
    });
  });
}

// ─────────────────────────────────────────
// LIVE SEARCH FILTER
// ─────────────────────────────────────────

function filterCards(query) {
  document.querySelectorAll(".task-card").forEach(card => {
    const title = card.querySelector("h4")?.textContent.toLowerCase() || "";
    const desc  = card.querySelector("p")?.textContent.toLowerCase() || "";
    card.style.display = (title.includes(query) || desc.includes(query)) ? "" : "none";
  });
}

// ─────────────────────────────────────────
// MODAL — Create or Edit a task
// ─────────────────────────────────────────

function openTaskModal(task = null) {
  const isAdmin = currentUser.role === "admin";
  const isEditing = Boolean(task);

  const overlay = document.getElementById("modal-overlay");
  const box     = document.getElementById("modal-box");

  // Status <select> options
  const statusOptions = COLUMNS.map(col => `
    <option value="${col.id}" ${isEditing && task.status === col.id ? "selected" : ""}>
      ${col.label}
    </option>
  `).join("");

  // User <select> options (admin only, filtered to coders)
  const userOptions = allUsers.map(u => `
    <option value="${u.id}" ${isEditing && task.userId === u.id ? "selected" : ""}>
      ${u.name} (${u.role})
    </option>
  `).join("");

  box.className = "modal-enter bg-surface rounded-xl border border-outline-variant shadow-xl w-full max-w-lg";

  box.innerHTML = `
    <!-- Modal header -->
    <div class="flex items-center justify-between px-xl pt-xl pb-lg border-b border-outline-variant">
      <h2 class="font-headline-md text-headline-md text-on-surface">
        ${isEditing ? "Edit Task" : "New Task"}
      </h2>
      <button id="modal-close"
        class="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-1 rounded-full transition-colors">
        close
      </button>
    </div>

    <!-- Modal body -->
    <div class="px-xl py-lg space-y-lg">

      <!-- Title (admin only) -->
      ${isAdmin ? `
        <div class="space-y-sm">
          <label class="font-label-md text-label-md text-on-surface">Title</label>
          <input
            id="f-title"
            type="text"
            placeholder="Task title…"
            value="${isEditing ? task.title : ""}"
            class="w-full px-md py-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring transition-all placeholder:text-outline"
          />
        </div>
      ` : `
        <!-- Coders see the title as read-only -->
        <div class="space-y-sm">
          <label class="font-label-md text-label-md text-on-surface">Title</label>
          <p class="px-md py-md bg-surface-container border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface-variant">
            ${isEditing ? task.title : "—"}
          </p>
        </div>
      `}

      <!-- Description (everyone can edit) -->
      <div class="space-y-sm">
        <label class="font-label-md text-label-md text-on-surface">Description</label>
        <textarea
          id="f-desc"
          rows="3"
          placeholder="What needs to be done?"
          class="w-full px-md py-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring transition-all placeholder:text-outline resize-none"
        >${isEditing ? task.description : ""}</textarea>
      </div>

      <!-- Status (everyone can change) -->
      <div class="space-y-sm">
        <label class="font-label-md text-label-md text-on-surface">Status</label>
        <select
          id="f-status"
          class="w-full px-md py-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring transition-all"
        >${statusOptions}</select>
      </div>

      <!-- Assigned to (admin only) -->
      ${isAdmin ? `
        <div class="space-y-sm">
          <label class="font-label-md text-label-md text-on-surface">Assigned to</label>
          <select
            id="f-user"
            class="w-full px-md py-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring transition-all"
          >${userOptions}</select>
        </div>
      ` : ""}
    </div>

    <!-- Modal footer -->
    <div class="flex items-center justify-end gap-sm px-xl pb-xl">
      <button id="modal-cancel"
        class="px-lg py-md border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors">
        Cancel
      </button>
      <button id="modal-save"
        class="px-lg py-md bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-sm">
        <span class="material-symbols-outlined text-[18px]">${isEditing ? "save" : "add_task"}</span>
        ${isEditing ? "Save changes" : "Create task"}
      </button>
    </div>
  `;

  overlay.classList.remove("hidden");

  // Listeners
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-cancel").addEventListener("click", closeModal);
  document.getElementById("modal-save").addEventListener("click", () => handleSaveTask(task, isEditing, isAdmin));
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
}

// ─────────────────────────────────────────
// SAVE TASK
// ─────────────────────────────────────────

async function handleSaveTask(task, isEditing, isAdmin) {
  const saveBtn = document.getElementById("modal-save");
  saveBtn.disabled = true;
  saveBtn.innerHTML = `<span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Saving…`;

  const description = document.getElementById("f-desc").value.trim();
  const status      = document.getElementById("f-status").value;
  const title       = isAdmin ? document.getElementById("f-title").value.trim() : (task?.title || "");
  const userId      = isAdmin ? document.getElementById("f-user").value : (task?.userId || currentUser.id);

  if (isAdmin && !title) {
    alert("Title is required.");
    saveBtn.disabled = false;
    saveBtn.innerHTML = `<span class="material-symbols-outlined text-[18px]">${isEditing ? "save" : "add_task"}</span> ${isEditing ? "Save changes" : "Create task"}`;
    return;
  }

  try {
    if (isEditing) {
      // Admin can change all fields; Coder can only change status + description
      const payload = isAdmin
        ? { title, description, status, userId }
        : { description, status };

      const updated = await updateTask(task.id, payload);

      // Sync local state
      const idx = allTasks.findIndex(t => t.id === task.id);
      allTasks[idx] = updated;
    } else {
      // Create new task (admin only)
      const created = await createTask({ title, description, status, userId });
      allTasks.push(created);
    }

    closeModal();
    buildBoard(appContainer);
  } catch {
    alert("Failed to save. Please try again.");
    saveBtn.disabled = false;
    saveBtn.innerHTML = `<span class="material-symbols-outlined text-[18px]">${isEditing ? "save" : "add_task"}</span> ${isEditing ? "Save changes" : "Create task"}`;
  }
}

export default db;

// ─────────────────────────────────────────
// DELETE TASK
// ─────────────────────────────────────────

async function handleDeleteTask(taskId) {
  try {
    await deleteTask(taskId);
    allTasks = allTasks.filter(t => String(t.id) !== taskId); // Comparar IDs como cadenas de texto
    buildBoard(appContainer);
  } catch {
    alert("Failed to delete task.");
  }
}

// ─────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────

function handleLogout() {
  clearSession();
  navigate("/login");
}
