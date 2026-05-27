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
  const path = window.location.pathname;
  const loggedIn = isLoggedIn();

  if (path === "/dashboard" && !loggedIn) {
    navigate("/login");
    return;
  }

  if ((path === "/login" || path === "/") && loggedIn) {
    navigate("/dashboard");
    return;
  }

  // Reset body classes to default before mounting the view
  document.body.className = "bg-surface-container-lowest text-on-surface min-h-screen flex flex-col";

  const page = routes[path] || routes["/"];
  if (page) page.mounted();
}
