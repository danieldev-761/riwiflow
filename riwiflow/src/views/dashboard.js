// views/dashboard.js — Kanban board

import { getAllTasks, getAllUsers, createTask, updateTask, deleteTask } from "../js/api.js";
import { getSession, clearSession } from "../js/auth.js";
import { navigate } from "../js/router.js";

const COLUMNS = [
  { id: "todo",        label: "To Do",       countClass: "bg-surface-container-high text-on-surface-variant" },
  { id: "in progress", label: "In Progress",  countClass: "bg-primary-container text-on-primary" },
  { id: "in review",   label: "In Review",    countClass: "bg-surface-container-high text-on-surface-variant" },
  { id: "done",        label: "Done",         countClass: "bg-surface-container-high text-on-surface-variant" },
];

let currentUser  = null;
let allUsers     = [];
let allTasks     = [];
let appContainer = null;

const db = {
  render: () => {
    
    return `
      <div id="dashboard-container" class="flex-1 flex overflow-hidden w-full h-full">
        <aside class="hidden md:flex flex-col pt-md pb-xl gap-xs h-full bg-surface-container-low border-r border-outline-variant w-[280px] shrink-0">
          <div class="px-gutter mb-xl">
            <h1 class="font-headline-md text-headline-md font-bold text-primary">Riwiflow</h1>
            <p class="font-body-sm text-body-sm text-on-surface-variant">Product Team</p>
          </div>
          <nav class="flex-1 space-y-1">
            <a class="flex items-center bg-primary-fixed text-on-primary-fixed-variant rounded-lg mx-2 px-4 py-3 font-body-sm text-body-sm transition-all scale-[0.98]" href="#" onclick="return false;">
              <span class="material-symbols-outlined mr-3">dashboard</span><span>Dashboard</span>
            </a>
            <a class="flex items-center text-secondary hover:text-primary hover:bg-primary-container/10 px-4 py-3 mx-2 font-body-sm text-body-sm rounded-lg transition-all" href="#" onclick="return false;">
              <span class="material-symbols-outlined mr-3">assignment</span><span>Projects</span>
            </a>
            <a class="flex items-center text-secondary hover:text-primary hover:bg-primary-container/10 px-4 py-3 mx-2 font-body-sm text-body-sm rounded-lg transition-all" href="#" onclick="return false;">
              <span class="material-symbols-outlined mr-3">group</span><span>Team</span>
            </a>
            <a class="flex items-center text-secondary hover:text-primary hover:bg-primary-container/10 px-4 py-3 mx-2 font-body-sm text-body-sm rounded-lg transition-all" href="#" onclick="return false;">
              <span class="material-symbols-outlined mr-3">bar_chart</span><span>Reports</span>
            </a>
            <a class="flex items-center text-secondary hover:text-primary hover:bg-primary-container/10 px-4 py-3 mx-2 font-body-sm text-body-sm rounded-lg transition-all" href="#" onclick="return false;">
              <span class="material-symbols-outlined mr-3">settings</span><span>Settings</span>
            </a>
          </nav>
          <div class="px-4 mt-auto" id="sidebar-action">
            <!-- New project button will be injected here if admin -->
          </div>
        </aside>
        <main class="flex-1 flex flex-col min-w-0">
          <header class="flex justify-between items-center h-16 px-gutter w-full bg-surface border-b border-outline-variant z-40">
            <div class="flex items-center gap-4 flex-1">
              <div class="relative max-w-md w-full">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input id="search-input" class="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-full font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Search tasks or files..." type="text" />
              </div>
            </div>
            <div class="flex items-center gap-4 ml-4">
              <button class="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors">notifications</button>
              <button class="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors">help_outline</button>
              <img id="logout-btn" alt="User profile" class="w-8 h-8 rounded-full border border-outline-variant object-cover cursor-pointer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2-sF_Qd9jEF33fUrS3vMvdoA8rbw2_a6jzv7r_6oDikCkrertidHwLgqAtWuKvLnRx7Lcsi79ZYj4FBaL_pETFxeyeF27_PhXy-KnuioiYgCwYTKcWDEuZoRksSf8Jb0_ZmsxJkpTFGZ2bW8aTl5fhcA4DOHQQal_vu1KVBcizoM56dHRc7Ce_vkUul2aL96DSeDmqR4YdfGUuoIQkUF_F8AX45U05tmCFg7YyPH6xtgAx7e31u5_5e2rQxm_tgBEgnhV-LsqsEDH" title="Logout" />
            </div>
          </header>
          <div class="flex-1 overflow-x-auto p-gutter custom-scrollbar" id="board-scroll">
            <div class="flex gap-gutter h-full" id="kanban-board">
              <!-- Columns will be injected here -->
              <div class="flex-1 flex items-center justify-center" id="loading-state">
                <div class="text-center space-y-md">
                  <span class="material-symbols-outlined text-primary text-5xl animate-spin"></span>
                  <p class="font-body-md text-body-md text-on-surface-variant">Loading board…</p>
                </div>
              </div>
            </div>
          </div>
        </main>
        <div id="modal-overlay" class="hidden fixed inset-0 bg-inverse-surface/40 z-50 flex items-center justify-center p-gutter">
          <div id="modal-box" class="bg-surface rounded-xl border border-outline-variant shadow-xl w-full max-w-lg"></div>
        </div>
      </div>
    `;
  },
  mounted: async () => {
    appContainer = document.getElementById("app");
    currentUser = getSession();

    // Adjust body and container classes immediately
    document.body.className = "bg-background text-on-background overflow-hidden h-screen flex";
    const dashContainer = document.getElementById("dashboard-container");
    if (dashContainer) dashContainer.className = "flex-1 flex overflow-hidden w-full h-full bg-background";

    // Setup basic UI logic (Logout, Search)
    document.getElementById("logout-btn").addEventListener("click", handleLogout);
    document.getElementById("search-input").addEventListener("input", (e) => {
      filterCards(e.target.value.trim().toLowerCase());
    });
    document.getElementById("modal-overlay").addEventListener("click", (e) => {
      if (e.target.id === "modal-overlay") closeModal();
    });

    // If we already have tasks, render immediately to avoid flicker
    if (allTasks.length > 0) {
      buildBoardUI();
      return;
    }

    try {
      [allTasks, allUsers] = await Promise.all([getAllTasks(), getAllUsers()]);
      buildBoardUI();
    } catch {
      const board = document.getElementById("kanban-board");
      if (board) {
        board.innerHTML = `
          <div class="flex-1 flex items-center justify-center">
            <div class="text-center space-y-md p-xl bg-error-container rounded-xl max-w-md">
              <span class="material-symbols-outlined text-error text-4xl">wifi_off</span>
              <p class="font-headline-md text-headline-md text-error">Cannot connect to server</p>
              <p class="font-body-md text-body-md text-on-surface-variant">Make sure json-server is running</p>
            </div>
          </div>
        `;
      }
    }
  },
};

function buildBoardUI() {
  const isAdmin = currentUser.role === "admin";
  const board = document.getElementById("kanban-board");
  const sidebarAction = document.getElementById("sidebar-action");

  if (board) {
    board.innerHTML = COLUMNS.map(col => renderColumn(col)).join("");
  }

  if (sidebarAction && isAdmin) {
    sidebarAction.innerHTML = `
      <button id="new-project-btn" class="w-full bg-primary text-on-primary py-3 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity">
        <span class="material-symbols-outlined">add</span> New Project
      </button>
    `;
    document.getElementById("new-project-btn").addEventListener("click", () => openTaskModal(null));
  }

  // Links silence fix
  document.querySelectorAll('a[href="#"]').forEach(a => a.addEventListener('click', e => e.preventDefault()));

  attachCardListeners();
}

function renderColumn(col) {
  const tasks = allTasks.filter(t => t.status === col.id);
  return `
    <div class="kanban-column flex flex-col w-1/4 h-full" data-col="${col.id}">
      <div class="flex items-center justify-between mb-md">
        <div class="flex items-center gap-2">
          <h3 class="font-title-sm text-title-sm text-on-surface">${col.label}</h3>
          <span class="${col.countClass} px-2 py-0.5 rounded-full font-label-sm text-label-sm col-count">${tasks.length}</span>
        </div>
        <button class="material-symbols-outlined text-outline">more_horiz</button>
      </div>
      <div class="flex-1 space-y-md p-2 bg-surface-container-low/50 rounded-xl overflow-y-auto custom-scrollbar" id="col-${col.id.replace(/ /g, "-")}">
        ${tasks.length > 0
          ? tasks.map(t => renderCard(t, col.id)).join("")
          : `<div class="text-center py-xl text-on-surface-variant font-body-sm text-body-sm">No tasks</div>`
        }
      </div>
    </div>
  `;
}

function renderCard(task, colId) {
  const isAdmin    = currentUser.role === "admin";
  const canEdit    = isAdmin || task.userId === currentUser.id;
  const isDone     = colId === "done";
  const isActive   = colId === "in progress";
  const isInReview = colId === "in review";

  const assignedUser = allUsers.find(u => u.id === task.userId);
  const assignedName = assignedUser ? assignedUser.name : "Unassigned";
  const initials     = assignedName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  const badgeClass  = "bg-primary-fixed text-on-primary-fixed-variant px-2 py-0.5 rounded-full font-label-sm text-label-sm";
  const cardBorder  = isActive ? "border-l-4 border-l-primary border border-outline-variant" : "border border-outline-variant";
  const cardOpacity = isDone ? "opacity-80 bg-surface/60" : "bg-surface";
  const titleClass  = isDone ? "line-through" : "";
  const cursorClass = canEdit ? "cursor-grab active:cursor-grabbing" : "";

  return `
    <div class="task-card ${cardOpacity} ${cardBorder} rounded-xl p-md shadow-sm relative group ${cursorClass}" draggable="true" data-task-id="${task.id}">
      ${canEdit ? `
        <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 bg-surface/80 rounded-lg p-1 transition-opacity">
          <button class="btn-edit material-symbols-outlined text-outline hover:text-primary text-sm p-0.5 rounded transition-colors" data-id="${task.id}">edit</button>
          ${isAdmin ? `<button class="btn-delete material-symbols-outlined text-outline hover:text-error text-sm p-0.5 rounded transition-colors" data-id="${task.id}">delete</button>` : ""}
        </div>
      ` : ""}
      <div class="flex items-start justify-between mb-xs">
        <span class="${badgeClass}">${task.category || "General"}</span>
        ${isDone
          ? `<span class="material-symbols-outlined text-tertiary-container text-sm" style="font-variation-settings: 'FILL' 1">check_circle</span>`
          : `<span class="material-symbols-outlined text-outline text-sm">attach_file</span>`
        }
      </div>
      <h4 class="font-label-md text-label-md text-on-surface mb-xs ${titleClass}">${task.title}</h4>
      <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">${task.description}</p>
      <div class="mt-md flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full border-2 border-surface bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center text-[10px] font-bold">${initials}</div>
          <span class="font-body-sm text-body-sm text-on-surface-variant">${assignedName}</span>
        </div>
        ${isInReview
          ? isAdmin
            ? `<button class="text-primary font-label-sm text-label-sm hover:underline">Review now</button>`
            : `<span class="font-label-sm text-label-sm text-outline">Waiting...</span>`
          : `<span class="font-label-sm text-label-sm ${isActive ? "text-primary font-bold" : "text-outline"} flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">${isActive ? "hourglass_empty" : isDone ? "task_alt" : "schedule"}</span>
              ${isActive ? "Today" : isDone ? "Completed" : "2d"}
            </span>`
        }
      </div>
    </div>
  `;
}

function attachCardListeners() {
  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const task = allTasks.find((t) => String(t.id) === btn.dataset.id);
      if (task) openTaskModal(task);
    });
  });

  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openDeleteConfirmation(btn.dataset.id);
    });
  });

  initDragAndDrop();
}

function initDragAndDrop() {
  const cards = document.querySelectorAll(".task-card");
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    card.addEventListener("dragstart", function(ev) {
      const taskId = card.dataset.taskId;
      const task = allTasks.find(t => String(t.id) === taskId);
      const isAdmin = currentUser.role === "admin";
      const isOwner = task && String(task.userId) === String(currentUser.id);

      if (!isAdmin && !isOwner) {
        ev.preventDefault();
        return;
      }

      ev.dataTransfer.setData("text/plain", taskId);
      card.style.opacity = "0.4";
    });

    card.addEventListener("dragend", function() {
      card.style.opacity = "1";
    });
  }

  const columns = document.querySelectorAll(".kanban-column");
  for (let j = 0; j < columns.length; j++) {
    const column = columns[j];
    const zone = column.querySelector(".flex-1");

    zone.addEventListener("dragover", function(ev) {
      ev.preventDefault();
      zone.style.outline = "2px dashed #5300b7";
      zone.style.backgroundColor = "rgba(83, 0, 183, 0.05)";
    });

    zone.addEventListener("dragleave", function() {
      zone.style.outline = "";
      zone.style.backgroundColor = "";
    });

    zone.addEventListener("drop", async function(ev) {
      ev.preventDefault();
      zone.style.outline = "";
      zone.style.backgroundColor = "";

      const taskId = ev.dataTransfer.getData("text/plain");
      const newStatus = column.dataset.col;

      const task = allTasks.find(t => String(t.id) === taskId);

      if (!task || task.status === newStatus) return;

      try {
        const updated = await updateTask(task.id, { status: newStatus });
        const idx = allTasks.findIndex(t => t.id === task.id);
        if (idx !== -1) allTasks[idx] = updated;
        buildBoardUI();
      } catch (err) {
        console.error("Error al mover la tarea:", err);
      }
    });
  }
}

function filterCards(query) {
  document.querySelectorAll(".task-card").forEach(card => {
    const title = card.querySelector("h4")?.textContent.toLowerCase() || "";
    const desc  = card.querySelector("p")?.textContent.toLowerCase() || "";
    card.style.display = (title.includes(query) || desc.includes(query)) ? "" : "none";
  });
}

function openTaskModal(task = null) {
  const isAdmin   = currentUser.role === "admin";
  const isEditing = Boolean(task);
  const overlay   = document.getElementById("modal-overlay");
  const box       = document.getElementById("modal-box");

  const statusOptions = COLUMNS.map(col => `
    <option value="${col.id}" ${isEditing && task.status === col.id ? "selected" : ""}>${col.label}</option>
  `).join("");

  const userOptions = allUsers.map(u => `
    <option value="${u.id}" ${isEditing && task.userId === u.id ? "selected" : ""}>${u.name} (${u.role})</option>
  `).join("");

  box.innerHTML = `
    <form id="task-form" onsubmit="return false;">
      <div class="flex items-center justify-between px-xl pt-xl pb-lg border-b border-outline-variant">
        <h2 class="font-headline-md text-headline-md text-on-surface">${isEditing ? "Edit Task" : "New Task"}</h2>
        <button id="modal-close" type="button" class="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-1 rounded-full">close</button>
      </div>
      <div class="px-xl py-lg space-y-lg">
        <p id="task-error" class="hidden text-error font-body-sm text-body-sm bg-error-container px-md py-sm rounded-lg"></p>
        <div class="space-y-sm">
          <label class="font-label-md text-label-md text-on-surface" for="f-title">Title</label>
          <input id="f-title" type="text" value="${isEditing ? task.title : ""}" ${!isAdmin ? "disabled" : ""} required class="w-full px-md py-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring"/>
        </div>
        <div class="space-y-sm">
          <label class="font-label-md text-label-md text-on-surface" for="f-desc">Description</label>
          <textarea id="f-desc" rows="3" required class="w-full px-md py-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring resize-none">${isEditing ? task.description : ""}</textarea>
        </div>
        <div class="space-y-sm">
          <label class="font-label-md text-label-md text-on-surface" for="f-status">Status</label>
          <select id="f-status" class="w-full px-md py-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring">${statusOptions}</select>
        </div>
        ${isAdmin ? `
          <div class="space-y-sm">
            <label class="font-label-md text-label-md text-on-surface" for="f-user">Assigned to</label>
            <select id="f-user" class="w-full px-md py-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring">${userOptions}</select>
          </div>
        ` : ""}
      </div>
      <div class="flex items-center justify-end gap-sm px-xl pb-xl">
        <button id="modal-cancel" type="button" class="px-lg py-md border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors">Cancel</button>
        <button id="modal-save" type="submit" class="px-lg py-md bg-primary text-on-primary rounded-lg font-label-md text-label-md flex items-center gap-sm hover:opacity-90 active:scale-[0.98] transition-all">
          <span class="material-symbols-outlined text-[18px]">${isEditing ? "save" : "add_task"}</span>
          ${isEditing ? "Save changes" : "Create task"}
        </button>
      </div>
    </form>
  `;

  overlay.classList.remove("hidden");
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-cancel").addEventListener("click", closeModal);
  document.getElementById("task-form").addEventListener("submit", () => handleSaveTask(task, isEditing, isAdmin));
}

function openDeleteConfirmation(taskId) {
  const overlay = document.getElementById("modal-overlay");
  const box     = document.getElementById("modal-box");

  box.innerHTML = `
    <div class="px-xl pt-xl pb-lg space-y-md">
      <div class="flex items-center gap-md text-error">
        <span class="material-symbols-outlined text-3xl">delete_forever</span>
        <h2 class="font-headline-md text-headline-md">Delete Task?</h2>
      </div>
      <p class="font-body-md text-body-md text-on-surface-variant">
        This action cannot be undone. Are you sure you want to permanently delete this task?
      </p>
    </div>
    <div class="flex items-center justify-end gap-sm px-xl pb-xl">
      <button id="confirm-cancel" class="px-lg py-md border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors">Cancel</button>
      <button id="confirm-delete" class="px-lg py-md bg-error text-on-error rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-sm">
        <span class="material-symbols-outlined text-[18px]">delete</span> Delete
      </button>
    </div>
  `;

  overlay.classList.remove("hidden");
  document.getElementById("confirm-cancel").addEventListener("click", closeModal);
  document.getElementById("confirm-delete").addEventListener("click", async () => {
    const delBtn = document.getElementById("confirm-delete");
    delBtn.disabled = true;
    delBtn.innerHTML = "Deleting...";
    await handleDeleteTask(taskId);
    closeModal();
  });
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
}

async function handleSaveTask(task, isEditing, isAdmin) {
  const saveBtn     = document.getElementById("modal-save");
  const errorEl     = document.getElementById("task-error");
  const description = document.getElementById("f-desc").value.trim();
  const status      = document.getElementById("f-status").value;
  const title       = isAdmin ? document.getElementById("f-title").value.trim() : (task?.title || "");
  const userId      = isAdmin ? document.getElementById("f-user").value : (task?.userId || currentUser.id);

  if (isAdmin && !title) { showModalError("Title is required."); return; }

  saveBtn.disabled  = true;
  saveBtn.innerHTML = `<span class="material-symbols-outlined text-[18px] animate-spin"></span> Saving…`;
  errorEl.classList.add("hidden");

  try {
    if (isEditing) {
      const payload = isAdmin ? { title, description, status, userId } : { description, status };
      const updated = await updateTask(task.id, payload);
      const idx = allTasks.findIndex(t => t.id === task.id);
      if (idx !== -1) allTasks[idx] = updated;
    } else {
      const created = await createTask({ title, description, status, userId });
      allTasks.push(created);
    }
    closeModal();
    buildBoardUI();
  } catch {
    showModalError("Error saving task. Please check your connection.");
    saveBtn.disabled  = false;
    saveBtn.innerHTML = `<span class="material-symbols-outlined text-[18px]">${isEditing ? "save" : "add_task"}</span> ${isEditing ? "Save changes" : "Create task"}`;
  }
}

function showModalError(msg) {
  const errorEl = document.getElementById("task-error");
  if (errorEl) { errorEl.textContent = msg; errorEl.classList.remove("hidden"); }
}

async function handleDeleteTask(taskId) {
  try {
    await deleteTask(taskId);
    allTasks = allTasks.filter(t => String(t.id) !== taskId);
    buildBoardUI();
  } catch {
    const errorEl = document.getElementById("task-error");
    if (errorEl) showModalError("Error deleting task.");
    else console.error("Error deleting task");
  }
}

function handleLogout() {
  clearSession();
  navigate("/login");
}

export default db;
