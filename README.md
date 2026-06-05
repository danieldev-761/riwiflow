# Riwiflow

Riwiflow is a high-performance, minimalist Kanban-style project management application built with vanilla JavaScript and modern web standards. It delivers a polished Material Design aesthetic, role-based views, custom modal interactions, and a responsive SPA shell.

## Features

- **Polished Kanban Board**: Interactive board with columns (To Do, In Progress, In Review, Done) and live task counts.
- **Role-Based Access**: Admin and Coder roles with specific permissions for creating, editing, and deleting tasks.
- **Secure Authentication**: Session persistence via `localStorage` and client-side route protection.
- **Custom UI Modals**: No native `alert`/`confirm`; all interaction flows use UI-driven dialogs.
- **Live Search**: Instant filter behavior for tasks and team members.
- **Responsive Layout**: Modern UI built with Tailwind CSS classes and reusable components.
- **SPA Routing**: Smooth view switching via client-side routing without full page reloads.
- **Role-Based Routing Security**: Enhanced Auth Guards to prevent unauthorized access to administrative routes (e.g., `/team`).
- **Dynamic Page Titles**: Context-aware browser tab titles based on the current application route.
- **Optimized Data Fetching**: Efficient API interactions using `_expand` relationships to reduce network round-trips.
- **Enhanced Data Integrity**: Client-side validation for unique email addresses and intelligent deletion safety for users with active tasks.

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS.
- **Build Tool**: Vite.
- **Mock Backend**: JSON Server.
- **Fonts & Icons**: Google Inter and Material Symbols.

## Repository Layout

This repository contains the live SPA inside the nested `riwiflow/` folder plus static design references at the root.

```text
riwiflow/
├── board.html              # Static Kanban page reference
├── login.html              # Static login page reference
├── README.md               # Project documentation
└── riwiflow/
    ├── db.json             # Mock JSON Server database
    ├── index.html          # SPA entry point
    ├── package.json        # Vite and json-server scripts
    ├── src/
    │   ├── js/
    │   │   ├── api.js
    │   │   ├── auth.js
    │   │   ├── layout.js
    │   │   ├── router.js
    │   │   └── app.js
    │   └── views/
    │       ├── dashboard.js
    │       ├── login.js
    │       └── teams.js
    ├── public/
    └── vite.config.js
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (recommended v22+)
- npm

### Install Dependencies

```bash
cd riwiflow/riwiflow
npm install
```

### Run the App

Open two terminals from `riwiflow/riwiflow`:

1. Start the mock API:

```bash
npx json-server db.json
```

2. Start the frontend server:

```bash
npm run dev
```

Open the app at the local address shown by Vite (typically `http://localhost:5173`).

## Test Users

| Email | Password | Role |
| --- | --- | --- |
| `admin@riwiflow.dev` | `admin123` | Admin |
| `coder@riwiflow.dev` | `coder123` | Coder |

## Notes

- The root-level `board.html` and `login.html` are static design references and are not the SPA entry points.
- The SPA lives in the nested `riwiflow/` folder; all runtime code is under `riwiflow/src/`.
- Use the shared layout helpers in `src/js/layout.js` for UI shell behavior and search binding.

## Authors

- Daniel Echeverría
- Jose Arevalo