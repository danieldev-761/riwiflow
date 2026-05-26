// api.js — All communication with json-server (http://localhost:3000)

const BASE_URL = "http://localhost:3000";

// ─────────────────────────────────────────
// USERS
// ─────────────────────────────────────────

// Fetch all users and find one matching email + password
async function loginUser(email, password) {
  const response = await fetch(`${BASE_URL}/users`);
  if (!response.ok) throw new Error("Could not connect to the server.");

  const users = await response.json();
  const user = users.find(
    (u) => u.email === email && u.password === password
  );
  return user || null; // returns user object or null if not found
}

// Get all users (used to populate "assign to" dropdown)
async function getAllUsers() {
  const response = await fetch(`${BASE_URL}/users`);
  if (!response.ok) throw new Error("Failed to fetch users.");
  return response.json();
}

// ─────────────────────────────────────────
// TASKS
// ─────────────────────────────────────────

// Get all tasks from the API
async function getAllTasks() {
  const response = await fetch(`${BASE_URL}/tasks`);
  if (!response.ok) throw new Error("Failed to fetch tasks.");
  return response.json();
}

// Create a new task (Admin only)
async function createTask(taskData) {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });
  if (!response.ok) throw new Error("Failed to create task.");
  return response.json();
}

// Update an existing task by ID (PATCH = partial update)
async function updateTask(taskId, updatedFields) {
  const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedFields),
  });
  if (!response.ok) throw new Error("Failed to update task.");
  return response.json();
}

// Delete a task by ID (Admin only)
async function deleteTask(taskId) {
  const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete task.");
  return true;
}

export { loginUser, getAllUsers, getAllTasks, createTask, updateTask, deleteTask };
