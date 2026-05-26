# Riwiflow 

Riwiflow is a high-performance, minimalist Kanban-style project management application built with vanilla JavaScript and modern web standards. It features a polished Material Design aesthetic, secure authenticated routing, and a real-time responsive interface.

##  Features

-   **Polished Kanban Board**: Interactive board with columns (To Do, In Progress, In Review, Done) and dynamic task counters.
-   **Role-Based Views**: Admin and Coder roles with specific permissions for creating, editing, and deleting tasks.
-   **Secure Authentication**: Persistent session management using `localStorage` and custom Auth Guards to protect routes.
-   **Custom UI Dialogs**: Zero reliance on native browser dialogs (`alert`, `confirm`). All feedback is handled through integrated forms and custom modals.
-   **Live Search**: Instant task filtering by title or description.
-   **Responsive Design**: Modern, "Atmospheric" UI built with Tailwind CSS, fully responsive for professional workspaces.
-   **SPA Routing**: Smooth navigation using the History API without page reloads.

## 🛠️ Tech Stack

-   **Frontend**: Vanilla JavaScript (ES6+), HTML5, Tailwind CSS.
-   **Icons & Fonts**: Google Material Symbols, Inter Font.
-   **Backend (Mock)**: JSON Server for a full REST API experience.
-   **Build Tool**: Vite for fast development and optimized production builds.

##  Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v22.12.0 or higher recommended)
-   npm (comes with Node.js)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/riwiflow.git
    cd riwiflow
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Project

You need to run both the **Backend API** and the **Frontend Server**.

1.  **Start the Backend (JSON Server)**:
    In one terminal, run:
    ```bash
    npx json-server db.json
    ```
    This will start the mock REST API at `http://localhost:3000`.

2.  **Start the Frontend (Vite)**:
    In a second terminal, run:
    ```bash
    npm run dev
    ```
    The application will be available at the URL shown in your terminal (usually `http://localhost:5173`).

## Test Credentials

| Email | Password | Role |
| :--- | :--- | :--- |
| `admin@riwiflow.dev` | `admin123` | Administrator |
| `coder@riwiflow.dev` | `coder123` | Developer |

## Project Structure

```text
riwiflow/
├── src/
│   ├── js/
│   │   ├── api.js      # REST API communication
│   │   ├── auth.js     # Session & localStorage management
│   │   ├── router.js   # SPA Routing & Auth Guards
│   │   └── app.js      # Entry point
│   ├── views/
│   │   ├── login.js    # Login view logic & template
│   │   └── dashboard.js # Kanban board logic & template
│   └── assets/         # Images and icons
├── index.html          # Main entry point & Tailwind config
├── db.json             # Mock database
└── package.json        # Dependencies and scripts
```

##  Security & Performance

-   **Vulnerability Free**: Redundant and vulnerable packages (like `json-serve`) have been removed to ensure a secure environment.
-   **Optimized Assets**: Modern CSS techniques and blur effects are used to maintain high performance without heavy assets.

---
Developed with ❤️ for professional teams.
