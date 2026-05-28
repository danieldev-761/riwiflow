// router.js — SPA routing (History API) with Auth Guards

import login from "../views/login.js";
import db from "../views/dashboard.js";
import { isLoggedIn } from "./auth.js";

const routes = {
  "/": login,
  "/login": login,
  "/dashboard": db,
};

export function navigate(path) {
  window.history.pushState({}, "", path);
  router();
}

export function router() {
  let path = window.location.pathname;
  const loggedIn = isLoggedIn();

  // Auth Guards - Linear style like the TL
  if (path === "/" || path === "/login") {
    if (loggedIn) {
      path = "/dashboard";
      window.history.pushState({}, "", path);
    }
  }

  if (path === "/dashboard") {
    if (!loggedIn) {
      path = "/login";
      window.history.pushState({}, "", path);
    }
  }

  const page = routes[path] || routes["/"];

  // Atomic DOM Update: One operation for the HTML
  document.getElementById("app").innerHTML = page.render();

  document.body.className = "bg-surface-container-lowest text-on-surface min-h-screen flex flex-col";
  
  // Logic mounting
  page.mounted();
}
