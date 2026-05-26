// router.js — SPA routing (History API) with Auth Guards

import login from "../views/login.js";
import db from "../views/dashboard.js";
import { isLoggedIn } from "./auth.js";

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
  const loggedIn = isLoggedIn();


  // If trying to access dashboard WITHOUT credentials, send to login
  if (path === "/dashboard" && !loggedIn) {
    navigate("/login");
    return;
  }

  // If trying to access login (or /) WITH credentials, send to dashboard
  if ((path === "/login" || path === "/") && loggedIn) {
    navigate("/dashboard");
    return;
  }

  // Render the requested page or default to login
  const page = routes[path] || routes["/"];
  
  if (page) {
    page.mounted();
  }
}
