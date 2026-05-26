// auth.js — Session management using localStorage

const SESSION_KEY = "riwiflow_session";

// Save the logged-in user object to localStorage
function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// Get the current session (returns user object or null)
function getSession() {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

// Clear the session (logout)
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// Check if a user is currently logged in
function isLoggedIn() {
  return getSession() !== null;
}

// Check if the current user has a specific role
function hasRole(role) {
  const user = getSession();
  return user !== null && user.role === role;
}

export { saveSession, getSession, clearSession, isLoggedIn, hasRole };
