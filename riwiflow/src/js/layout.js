// js/layout.js — Cascarón compartido (Sidebar + Header)


import { getSession, clearSession } from "./auth.js";
import { navigate } from "./router.js";

/**
 * mountShell: Deja preparado el marco de la aplicación (Sidebar y Header).
 * Solo se construye si no existe en el DOM, luego actualiza el estado activo.
 */
export function mountShell(activePath) {
    const app = document.getElementById("app");
    
    // Si el "marco" (board-scroll) no existe, inyectamos todo el cascarón
    if (!document.getElementById("board-scroll")) {
        const currentUser = getSession();
        const isAdmin = currentUser?.role === "admin";

        // Estilos base del body para que el layout ocupe toda la pantalla
        document.body.className = "bg-background text-on-background overflow-hidden h-screen flex";
        app.className = "flex w-full h-full overflow-hidden";

        app.innerHTML = `
            ${buildSidebar(isAdmin)}
            <main class="flex-1 flex flex-col min-w-0">
                ${buildHeader()}
                <div class="flex-1 overflow-x-auto p-gutter custom-scrollbar" id="board-scroll">
                    <!-- Inyección de vistas (Dashboard, Team...) -->
                </div>
            </main>
            ${buildModalOverlay()}
        `;

        attachShellListeners();
    }

    // Siempre actualizamos qué botón del menú se ve resaltado
    updateActiveNav(activePath);
}

// renderView: función para que se cambie la info o contenido según página activa sin recargar el Sidebar ni el Header.

export function renderView(html) {
    const container = document.getElementById("board-scroll");
    if (container) container.innerHTML = html;
}


// COMPONENTES DEL CASCARÓN (HTML)


function buildSidebar(isAdmin) {
    return `
    <aside class="hidden md:flex flex-col pt-md pb-xl gap-xs h-full bg-surface-container-low border-r border-outline-variant w-[280px] shrink-0">
        <div class="px-gutter mb-xl">
            <h1 class="font-headline-md text-headline-md font-bold text-primary">Riwiflow</h1>
            <p class="font-body-sm text-body-sm text-on-surface-variant">Product Team</p>
        </div>
        <nav class="flex-1 space-y-1">
            <a id="nav-dashboard" class="nav-item flex items-center px-4 py-3 mx-2 rounded-lg cursor-pointer transition-all">
                <span class="material-symbols-outlined mr-3">dashboard</span><span>Dashboard</span>
            </a>
            <a class="nav-item flex items-center px-4 py-3 mx-2 rounded-lg cursor-pointer transition-all text-secondary hover:bg-primary-container/10 hover:text-primary font-body-sm" href="#" onclick="event.preventDefault();" aria-disabled="true">
                <span class="material-symbols-outlined mr-3">assignment</span><span>Projects</span>
            </a>
            <a id="nav-team" class="nav-item flex items-center px-4 py-3 mx-2 rounded-lg cursor-pointer transition-all text-secondary hover:bg-primary-container/10 hover:text-primary font-body-sm">
                <span class="material-symbols-outlined mr-3">group</span><span>Team</span>
            </a>
            <a class="nav-item flex items-center px-4 py-3 mx-2 rounded-lg cursor-pointer transition-all text-secondary hover:bg-primary-container/10 hover:text-primary font-body-sm" href="#" onclick="event.preventDefault();" aria-disabled="true">
                <span class="material-symbols-outlined mr-3">bar_chart</span><span>Reports</span>
            </a>
            <a class="nav-item flex items-center px-4 py-3 mx-2 rounded-lg cursor-pointer transition-all text-secondary hover:bg-primary-container/10 hover:text-primary font-body-sm" href="#" onclick="event.preventDefault();" aria-disabled="true">
                <span class="material-symbols-outlined mr-3">settings</span><span>Settings</span>
            </a>
        </nav>
        <div class="px-4 mt-auto">
            ${isAdmin ? `
            <button id="shell-action-btn" class="w-full bg-primary text-on-primary py-3 rounded-xl font-label-md flex items-center justify-center gap-2 shadow-sm hover:opacity-90">
                <span class="material-symbols-outlined">add</span><span id="shell-action-label">New Action</span>
            </button>
            ` : ""}
        </div>
    </aside>`;
}

function buildHeader() {
    return `
    <header class="flex justify-between items-center h-16 px-gutter bg-surface border-b border-outline-variant z-40">
        <div class="flex items-center gap-4 flex-1">
            <div class="relative max-w-md w-full">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input id="search-input" class="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-full text-body-md focus:outline-none" placeholder="Search..." type="text" />
            </div>
        </div>
        <div class="flex items-center gap-4 ml-4">
            <button class="material-symbols-outlined text-on-surface-variant p-2 hover:bg-surface-container-low rounded-full">notifications</button>
            <img id="logout-btn" alt="User profile" class="w-8 h-8 rounded-full border border-outline-variant cursor-pointer object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2-sF_Qd9jEF33fUrS3vMvdoA8rbw2_a6jzv7r_6oDikCkrertidHwLgqAtWuKvLnRx7Lcsi79ZYj4FBaL_pETFxeyeF27_PhXy-KnuioiYgCwYTKcWDEuZoRksSf8Jb0_ZmsxJkpTFGZ2bW8aTl5fhcA4DOHQQal_vu1KVBcizoM56dHRc7Ce_vkUul2aL96DSeDmqR4YdfGUuoIQkUF_F8AX45U05tmCFg7YyPH6xtgAx7e31u5_5e2rQxm_tgBEgnhV-LsqsEDH" title="Logout" />
        </div>
    </header>`;
}

function buildModalOverlay() {
    return `<div id="modal-overlay" class="hidden fixed inset-0 bg-inverse-surface/40 z-50 flex items-center justify-center p-gutter">
        <div id="modal-box" class="bg-surface rounded-xl border border-outline-variant shadow-xl w-full max-w-lg overflow-hidden"></div>
    </div>`;
}

// LÓGICA DE CONTROL (EVENTOS)

function attachShellListeners() {
    document.getElementById("logout-btn").addEventListener("click", () => {
        clearSession();
        navigate("/login");
    });

    document.getElementById("nav-dashboard").addEventListener("click", () => navigate("/dashboard"));
    document.getElementById("nav-team").addEventListener("click", () => navigate("/team"));

    document.getElementById("shell-action-btn")?.addEventListener("click", () => {
        window.dispatchEvent(new CustomEvent("shell:action"));
    });

    document.getElementById("modal-overlay").addEventListener("click", (e) => {
        if (e.target.id === "modal-overlay") closeModal();
    });
}

function updateActiveNav(activePath) {
    const navItems = { "/dashboard": "nav-dashboard", "/team": "nav-team" };
    
    // Resetear todos los estilos de navegación
    Object.values(navItems).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.className = "nav-item flex items-center px-4 py-3 mx-2 rounded-lg cursor-pointer transition-all text-secondary hover:bg-primary-container/10 hover:text-primary font-body-sm";
    });

    // Activa el actual según ruta
    const activeId = navItems[activePath];
    const activeEl = document.getElementById(activeId);
    if (activeEl) {
        activeEl.className = "nav-item flex items-center px-4 py-3 mx-2 rounded-lg cursor-pointer transition-all bg-primary-fixed text-on-primary-fixed-variant scale-[0.98] font-body-sm";
    }
}

// Helpers compartidos que usan las vistas
export function openModal(html) {
    const box = document.getElementById("modal-box");
    if (box) {
        box.innerHTML = html;
        document.getElementById("modal-overlay")?.classList.remove("hidden");
    }
}

export function closeModal() {
    document.getElementById("modal-overlay")?.classList.add("hidden");
}

export function updateSidebarActionBtn({ icon, label }) {
    const btn = document.getElementById("shell-action-btn");
    const lbl = document.getElementById("shell-action-label");
    if (btn) {
        btn.querySelector(".material-symbols-outlined").textContent = icon;
        if (lbl) lbl.textContent = label;
    }
}

export function updateSearchPlaceholder(text) {
    const input = document.getElementById("search-input");
    if (input) input.placeholder = text;
}

export function bindSearchInput(onInput) {
    const input = document.getElementById("search-input");
    if (!input || typeof onInput !== "function") return;

    input.oninput = () => {
        onInput(input.value.trim().toLowerCase());
    };
}
