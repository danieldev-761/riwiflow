// router.js — SPA routing (History API)

import login from "../views/login.js";
import db from "../views/dashboard.js";

// Map of route paths to render functions
const routes = {
  "/": login,
  "/login": login,
  "/dashboard": db,
};

// Navigate to a given route programmatically
export function navigate(path) {
  window.history.pushState({}, "", path);
  router();
}

export function router() {
  const path = window.location.pathname;
  const page = routes[path] || routes["/"];
  
  if (page) {
    page.mounted();
  }
}
