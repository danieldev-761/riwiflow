// auth.js — Session management via localStorage

const SESSION_KEY = "riwiflow_session";

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function getSession() {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function isLoggedIn() {
  return getSession() !== null;
}

function hasRole(role) {
  const user = getSession();
  return user !== null && user.role === role;
}

export { saveSession, getSession, clearSession, isLoggedIn, hasRole };
