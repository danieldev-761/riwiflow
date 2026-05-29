// router.js — SPA routing (History API) with Auth Guards

import login from "../views/login.js";
import db from "../views/dashboard.js";
import { isLoggedIn } from "./auth.js";
import team from "../views/teams.js"; 

const routes = {
  "/": login,
  "/login": login,
  "/dashboard": db,
  "/team": team, 
};

export function navigate(path) {
  window.history.pushState({}, "", path);
  router();
}

export function router() {
  let path = window.location.pathname;
  const loggedIn = isLoggedIn();

  // Auth Guards - Linear style 
  if (path === "/" || path === "/login") {
    if (loggedIn) {
      path = "/dashboard";
      window.history.pushState({}, "", path);
    }
  }

  if (path === "/dashboard" || path === "/team") {
    if (!loggedIn) {
      path = "/login";
      window.history.pushState({}, "", path);
    }
  }

  const page = routes[path] || routes["/"];

  // One operation for the HTML
  document.getElementById("app").innerHTML = page.render();

  document.body.className = "bg-surface-container-lowest text-on-surface min-h-screen flex flex-col";
  
  // Logic mounting
  page.mounted();
}
