// api.js — All communication with json-server (http://localhost:3000)

const BASE_URL = "http://localhost:3000";

async function loginUser(email, password) {
  const response = await fetch(`${BASE_URL}/users`);
  if (!response.ok) throw new Error("Could not connect to the server.");
  const users = await response.json();
  const user = users.find((u) => u.email === email && u.password === password);
  return user || null;
}

async function getAllUsers() {
  const response = await fetch(`${BASE_URL}/users`);
  if (!response.ok) throw new Error("Failed to fetch users.");
  return response.json();
}

// TASKS

async function getAllTasks() {
  const response = await fetch(`${BASE_URL}/tasks`);
  if (!response.ok) throw new Error("Failed to fetch tasks.");
  return response.json();
}

async function createTask(taskData) {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });
  if (!response.ok) throw new Error("Failed to create task.");
  return response.json();
}

async function updateTask(taskId, updatedFields) {
  const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedFields),
  });
  if (!response.ok) throw new Error("Failed to update task.");
  return response.json();
}

async function deleteTask(taskId) {
  const response = await fetch(`${BASE_URL}/tasks/${taskId}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete task.");
  return true;
}

// USERS

async function createUser(userData) {
  const response = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error("Failed to create user.");
  return response.json();
}

async function updateUser(userId, updatedFields) {
  const response = await fetch(`${BASE_URL}/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedFields),
  });
  if (!response.ok) throw new Error("Failed to update user.");
  return response.json();
}

async function deleteUser(userId) {
  const response = await fetch(`${BASE_URL}/users/${userId}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete user.");
  return true;
}

export { loginUser, getAllUsers, getAllTasks, createTask, updateTask, deleteTask, createUser, updateUser, deleteUser };
