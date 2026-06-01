// views/teams.js — Gestión de Equipo (Estilo Bento: Formulario + Tabla)
// Simplificado para explicación lineal: El formulario y la lista conviven en la misma pantalla.

import { getAllUsers, createUser, updateUser, deleteUser, getTasksByUserId } from "../js/api.js";
import { getSession } from "../js/auth.js";
import { navigate } from "../js/router.js";
import {
    mountShell,
    renderView,
    openModal,
    closeModal,
    updateSidebarActionBtn,
    updateSearchPlaceholder,
    bindSearchInput,
    setShellActionHandler,
} from "../js/layout.js";

const ROOT_ADMIN_ID = "1";
let currentUser = null;
let allUsers    = [];

const teams = {
    render: () => "", // El contenido se inyecta vía renderView en mounted()
    mounted: async () => {
        currentUser = getSession();
        const isAdmin = currentUser.role === "admin";

        // 1. Preparamos el marco de la app
        mountShell("/team");
        if (isAdmin) updateSidebarActionBtn({ icon: "person_add", label: "New Member" });
        updateSearchPlaceholder("Search team members...");

        // 2. Cargamos datos y dibujamos la vista Bento
        await loadAndRenderTeam();
        bindSearchInput(filterTeamMembers);

        // 3. Escuchamos eventos globales (como el botón del sidebar)
        setShellActionHandler(handleNewUserAction);
    }
};

/**
 * loadAndRenderTeam: Obtiene los usuarios y dibuja el formulario al lado de la tabla.
 */
async function loadAndRenderTeam() {
    try {
        allUsers = await getAllUsers();
        renderBentoLayout();
    } catch (err) {
        renderView(`<div class="p-xl text-error bg-error-container rounded-xl">Error al conectar con el servidor.</div>`);
    }
}

function renderBentoLayout() {
    const isAdmin = currentUser.role === "admin";

    renderView(`
        <div class="space-y-xl animate-fade-in">
            <header>
                <h2 class="font-headline-lg text-headline-lg text-on-surface">Team Directory</h2>
                <p class="text-on-surface-variant font-body-md">Manage roles, access, and member information.</p>
            </header>

            <div class="grid grid-cols-1 xl:grid-cols-12 gap-xl">
                <!-- Columna Izquierda: Formulario (Solo Admin) -->
                ${isAdmin ? `
                <section class="xl:col-span-4 h-fit sticky top-4">
                    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
                        <div class="flex items-center gap-sm mb-lg border-b border-outline-variant pb-md">
                            <span class="material-symbols-outlined text-primary" id="form-icon">person_add</span>
                            <h3 class="font-headline-sm text-headline-sm" id="form-title">Add Member</h3>
                        </div>
                        <form id="user-form" onsubmit="return false;" class="space-y-md">
                            <input type="hidden" id="f-id" value=""/>
                            <div class="space-y-xs">
                                <label class="font-label-md text-on-surface-variant block">Full Name</label>
                                <input id="f-name" type="text" required class="w-full h-10 px-md rounded-lg border border-outline focus:border-primary outline-none text-body-sm" placeholder="e.g. Maria Sanchez"/>
                            </div>
                            <div class="space-y-xs">
                                <label class="font-label-md text-on-surface-variant block">Email Address</label>
                                <input id="f-email" type="email" required class="w-full h-10 px-md rounded-lg border border-outline focus:border-primary outline-none text-body-sm" placeholder="maria@company.com"/>
                            </div>
                            <div class="space-y-xs">
                                <label class="font-label-md text-on-surface-variant block">Password</label>
                                <input id="f-password" type="password" class="w-full h-10 px-md rounded-lg border border-outline focus:border-primary outline-none text-body-sm" placeholder="••••••••"/>
                            </div>
                            <div class="space-y-xs">
                                <label class="font-label-md text-on-surface-variant block">Role</label>
                                <select id="f-role" class="w-full h-10 px-md rounded-lg border border-outline focus:border-primary outline-none text-body-sm bg-white">
                                    <option value="coder">Coder</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <p id="form-error" class="hidden text-error font-body-sm bg-error-container px-md py-sm rounded-lg"></p>
                            <div class="pt-md flex gap-sm">
                                <button id="btn-cancel" type="button" class="hidden flex-1 border border-outline-variant py-3 rounded-lg hover:bg-surface-container-low transition-all">Cancel</button>
                                <button id="btn-submit" type="submit" class="flex-[2] bg-primary text-on-primary font-label-md py-3 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-sm">
                                    <span class="material-symbols-outlined">save</span> Save Member
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
                ` : ""}

                <!-- Columna Derecha: Lista de Miembros -->
                <section class="${isAdmin ? "xl:col-span-8" : "xl:col-span-12"}">
                    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
                        <div class="px-lg py-md bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
                            <h3 class="font-headline-sm">Active Members</h3>
                            <span class="font-label-md text-on-surface-variant">${allUsers.length} total</span>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-surface-container-low border-b border-outline-variant font-label-md text-on-surface-variant">
                                        <th class="px-lg py-md">Member</th>
                                        <th class="px-lg py-md">Email</th>
                                        <th class="px-lg py-md">Role</th>
                                        ${isAdmin ? `<th class="px-lg py-md text-right">Actions</th>` : ""}
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-outline-variant/50" id="team-users-table-body">
                                    ${allUsers.map(u => renderUserRow(u, isAdmin)).join("")}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    `);

    attachListeners();
}

function renderUserRow(user, isAdmin) {
    const isSelf = String(user.id) === String(currentUser.id);
    const isRootAdmin = String(user.id) === ROOT_ADMIN_ID;
    const roleClass = user.role === "admin" ? "bg-primary-fixed text-on-primary-fixed-variant" : "bg-surface-container-high text-on-surface-variant";

    return `
    <tr class="user-row hover:bg-surface-container-low transition-colors group">
        <td class="px-lg py-md">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-[10px] font-bold text-on-primary-fixed">${user.name[0].toUpperCase()}</div>
                <div>
                    <p class="font-label-md text-on-surface">${user.name}</p>
                    ${isSelf ? `<span class="text-[10px] text-primary font-bold">YOU</span>` : ""}
                </div>
            </div>
        </td>
        <td class="px-lg py-md font-body-sm text-on-surface-variant">${user.email}</td>
        <td class="px-lg py-md">
            <span class="${roleClass} px-2 py-0.5 rounded-full font-label-sm text-label-sm capitalize">${user.role}</span>
        </td>
        ${isAdmin ? `
        <td class="px-lg py-md text-right">
            <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="btn-edit-user p-2 rounded-lg hover:bg-surface-container text-primary transition-all active:scale-90" data-id="${user.id}">
                    <span class="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button class="btn-delete-user p-2 rounded-lg hover:bg-error-container text-error transition-all active:scale-90 ${(isSelf || isRootAdmin) ? "opacity-30 cursor-not-allowed" : ""}" data-id="${user.id}" ${(isSelf || isRootAdmin) ? "disabled" : ""}>
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
            </div>
        </td>` : ""}
    </tr>`;
}


// LÓGICA DE CONTROL


function attachListeners() {
    const form = document.getElementById("user-form");
    if (!form) return;

    form.addEventListener("submit", handleSaveUser);
    document.getElementById("btn-cancel")?.addEventListener("click", resetForm);

    document.querySelectorAll(".btn-edit-user").forEach(btn => {
        btn.addEventListener("click", () => {
            const user = allUsers.find(u => String(u.id) === String(btn.dataset.id));
            if (user) loadUserIntoForm(user);
        });
    });

    document.querySelectorAll(".btn-delete-user").forEach(btn => {
        btn.addEventListener("click", () => openDeleteModal(btn.dataset.id));
    });
}

function loadUserIntoForm(user) {
    document.getElementById("f-id").value = user.id;
    document.getElementById("f-name").value = user.name;
    document.getElementById("f-email").value = user.email;
    const roleInput = document.getElementById("f-role");
    if (roleInput) {
        roleInput.value = user.role;
        roleInput.disabled = user.role === "admin";
    }
    document.getElementById("f-password").value = "";

    document.getElementById("form-title").textContent = "Edit Member";
    document.getElementById("form-icon").textContent = "edit";
    document.getElementById("btn-cancel").classList.remove("hidden");
    document.getElementById("f-name").focus();
}

function resetForm() {
    const form = document.getElementById("user-form");
    if (form) form.reset();
    document.getElementById("f-id").value = "";
    document.getElementById("form-title").textContent = "Add Member";
    document.getElementById("form-icon").textContent = "person_add";
    document.getElementById("btn-cancel").classList.add("hidden");
    document.getElementById("form-error").classList.add("hidden");
}

async function handleSaveUser() {
    const submitBtn = document.getElementById("btn-submit");
    const id = document.getElementById("f-id").value;
    const userData = {
        name: document.getElementById("f-name").value.trim(),
        email: document.getElementById("f-email").value.trim(),
        role: document.getElementById("f-role").value,
        password: document.getElementById("f-password").value
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="material-symbols-outlined animate-spin">progress_activity</span> Saving...`;

    try {
        if (id) {
            if (!userData.password) delete userData.password;
            await updateUser(id, userData);
        } else {
            if (!userData.password) throw new Error("Password required");
            await createUser(userData);
        }
        await loadAndRenderTeam();
        resetForm();
    } catch (err) {
        const errEl = document.getElementById("form-error");
        errEl.textContent = "Error saving user. Check data/connection.";
        errEl.classList.remove("hidden");
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span class="material-symbols-outlined">save</span> Save Member`;
    }
}

function openDeleteModal(id) {
    const user = allUsers.find(u => String(u.id) === String(id));
    openModal(`
        <div class="p-lg space-y-md">
            <h2 class="font-headline-md text-error flex items-center gap-2">
                <span class="material-symbols-outlined">person_remove</span> Delete Member?
            </h2>
            <p class="font-body-md text-on-surface-variant">Are you sure you want to delete <b>${user?.name}</b>?</p>
            <div class="flex justify-end gap-sm pt-md">
                <button id="modal-cancel" type="button" class="px-lg py-2 border rounded-lg font-label-md">Cancel</button>
                <button id="confirm-delete" class="px-lg py-2 bg-error text-on-error rounded-lg font-label-md hover:opacity-90">Delete</button>
            </div>
        </div>
    `);

    document.getElementById("modal-cancel")?.addEventListener("click", closeModal);
    document.getElementById("confirm-delete").onclick = async () => {
        const delBtn = document.getElementById("confirm-delete");
        if (delBtn) {
            delBtn.disabled = true;
            delBtn.innerHTML = "Checking…";
        }

        try {
            const assigned = await getTasksByUserId(id);

            if (assigned.length > 0) {
                // Inform the user that deletion is blocked due to assigned tasks
                const box = document.getElementById("modal-box");
                if (box) {
                    box.innerHTML = `
                        <div class="p-lg space-y-md">
                            <h2 class="font-headline-md text-error">Cannot delete user</h2>
                            <p class="font-body-md text-on-surface-variant">User <b>${user?.name}</b> has ${assigned.length} assigned task(s). Reassign or remove those tasks before deleting the user.</p>
                            <div class="flex justify-end gap-sm pt-md">
                                <button id="modal-view-tasks" class="px-lg py-2 bg-primary text-on-primary rounded-lg font-label-md">View assigned tasks</button>
                                <button id="modal-ok" class="px-lg py-2 border rounded-lg font-label-md">OK</button>
                            </div>
                        </div>
                    `;
                    document.getElementById("modal-ok").addEventListener("click", closeModal);
                    document.getElementById("modal-view-tasks").addEventListener("click", () => {
                        sessionStorage.setItem("focusUserId", String(id));
                        closeModal();
                        navigate("/dashboard");
                    });
                }
                return;
            }

            await deleteUser(id);
            closeModal();
            loadAndRenderTeam();
        } catch (err) {
            console.error("Error deleting user:", err);
            const errEl = document.getElementById("form-error");
            if (errEl) {
                errEl.textContent = "Error al eliminar usuario. Intenta de nuevo.";
                errEl.classList.remove("hidden");
            }
        }
    };
}

function filterTeamMembers(query) {
    document.querySelectorAll("#team-users-table-body tr.user-row").forEach((row) => {
        const name = row.querySelector("td:nth-child(1) p")?.textContent.toLowerCase() || "";
        const email = row.querySelector("td:nth-child(2)")?.textContent.toLowerCase() || "";
        const role = row.querySelector("td:nth-child(3) span")?.textContent.toLowerCase() || "";
        const match = name.includes(query) || email.includes(query) || role.includes(query);
        row.style.display = match ? "" : "none";
    });
}

function handleNewUserAction() {
    resetForm();
    document.getElementById("f-name")?.focus();
}

export default teams;
