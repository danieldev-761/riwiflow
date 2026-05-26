// views/login.js — Login screen, styled to match the reference login.html design

import { loginUser } from "../js/api.js";
import { saveSession } from "../js/auth.js";
import { navigate } from "../js/router.js";

const login = {
  mounted: () => {
    const container = document.getElementById("app");
  // Reset container for login (full page, not flex sidebar layout)
  container.className = "flex-1 min-h-full";
  // Set body to full-screen centering for the login page
  container.className = 'flex-1 flex flex-col min-h-full bg-surface-container-lowest text-on-surface';
  container.innerHTML = `
    <main class="flex-grow flex items-center justify-center px-gutter py-xxl">
      <div class="w-full max-w-[440px] space-y-xl">

        <!-- Brand -->
        <div class="text-center space-y-md">
          <h1 class="font-headline-md text-headline-md font-bold text-primary tracking-tight">
            RiwiFlow
          </h1>
          <p class="font-body-md text-body-md text-on-surface-variant">
            Sign in to your professional workspace
          </p>
        </div>

        <!-- Login card -->
        <div class="bg-surface-container-lowest border border-outline-variant p-xl rounded-xl space-y-lg transition-all">
          <form id="login-form" class="space-y-lg" novalidate>

            <!-- Email -->
            <div class="space-y-sm">
              <label class="font-label-md text-label-md text-on-surface" for="email">
                Email address
              </label>
              <input
                class="w-full px-md py-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring transition-all placeholder:text-outline"
                id="email"
                type="email"
                placeholder="name@company.com"
                autocomplete="email"
                required
              />
            </div>

            <!-- Password -->
            <div class="space-y-sm">
              <div class="flex justify-between items-center">
                <label class="font-label-md text-label-md text-on-surface" for="password">
                  Password
                </label>
              </div>
              <input
                class="w-full px-md py-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring transition-all placeholder:text-outline"
                id="password"
                type="password"
                placeholder="••••••••"
                autocomplete="current-password"
                required
              />
            </div>

            <!-- Error message (hidden by default) -->
            <p id="login-error" class="hidden text-error font-body-sm text-body-sm bg-error-container px-md py-sm rounded-lg"></p>

            <!-- Submit button -->
            <div class="pt-sm">
              <button
                id="login-btn"
                type="submit"
                class="w-full bg-primary hover:opacity-90 text-on-primary font-label-md text-label-md py-md px-lg rounded-lg transition-all active:scale-[0.98] duration-150 flex items-center justify-center gap-sm"
              >
                Login
                <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </form>

          <!-- Divider -->
          <div class="relative py-sm">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-outline-variant"></div>
            </div>
            <div class="relative flex justify-center">
              <span class="bg-surface-container-lowest px-md text-outline font-label-sm text-label-sm uppercase tracking-widest">
                test credentials
              </span>
            </div>
          </div>

          <!-- Quick-fill credential hints -->
          <div class="grid grid-cols-2 gap-sm">
            <button
              id="hint-admin"
              class="flex flex-col items-center py-md border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors duration-200"
            >
              <span class="material-symbols-outlined text-primary mb-xs">admin_panel_settings</span>
              <span class="font-label-sm text-label-sm text-on-surface">Admin</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant">admin@riwiflow.dev</span>
            </button>
            <button
              id="hint-coder"
              class="flex flex-col items-center py-md border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors duration-200"
            >
              <span class="material-symbols-outlined text-secondary mb-xs">code</span>
              <span class="font-label-sm text-label-sm text-on-surface">Coder</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant">coder@riwiflow.dev</span>
            </button>
          </div>
        </div>

      </div>
    </main>

    <!-- Atmospheric background blur (same as reference) -->
    <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-fixed/20 blur-[120px] rounded-full"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-primary-fixed/10 blur-[100px] rounded-full"></div>
    </div>
  `;

  // ── References to DOM elements ──
  const form     = document.getElementById("login-form");
  const errorEl  = document.getElementById("login-error");
  const btn      = document.getElementById("login-btn");
  const emailEl  = document.getElementById("email");
  const passEl   = document.getElementById("password");

  // ── Quick-fill buttons ──
  document.getElementById("hint-admin").addEventListener("click", () => {
    emailEl.value = "admin@riwiflow.dev";
    passEl.value  = "admin123";
  });

  document.getElementById("hint-coder").addEventListener("click", () => {
    emailEl.value = "coder@riwiflow.dev";
    passEl.value  = "coder123";
  });

  // ── Form submit ──
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email    = emailEl.value.trim();
    const password = passEl.value.trim();

    // Basic validation
    if (!email || !password) {
      showError("Please fill in all fields.");
      return;
    }

    // Loading state
    btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Signing in…`;
    btn.disabled  = true;
    errorEl.classList.add("hidden");

    try {
      const user = await loginUser(email, password);

      if (user) {
        saveSession(user);      // persist session in localStorage
        navigate("/dashboard"); // redirect to the board
      } else {
        showError("Invalid email or password. Please try again.");
        resetBtn();
      }
    } catch {
      showError("Cannot connect to the server. Make sure json-server is running on port 3000.");
      resetBtn();
    }
  });

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.remove("hidden");
  }

  function resetBtn() {
    btn.disabled  = false;
    btn.innerHTML = `Login <span class="material-symbols-outlined text-[18px]">arrow_forward</span>`;
  }
  }
};

export default login;
