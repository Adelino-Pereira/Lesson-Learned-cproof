# Knowledge Database (Lessons Learned) — Standalone Prototype

Proof-of-concept prototype for the **Knowledge Database** module. Runs independently with zero infrastructure dependencies — no MSSQL, no Alfresco, no external services.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Angular 19 (standalone components) + Angular Material |
| **Backend** | Node.js + Express |
| **Database** | SQLite (via better-sqlite3, zero-config) |
| **File Upload** | Multer → local `uploads/` directory |

---

## Quick Start

```bash
# 1. Install all dependencies (root + backend + frontend)
npm run install:all

# 2. Start both backend and frontend
npm start
```

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000/api

The database is created and seeded automatically on first startup (12 knowledge items, 5 types, 5 processes, 2 projects).

---

## Project Structure

```
Lesson_Learned_Mockup/
├── package.json                         # Root orchestrator (concurrently)
├── specification.md                     # Full specification document
│
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── index.js                     # Express app entry (port 3000)
│   │   ├── database.js                  # SQLite schema (6 tables)
│   │   ├── seed.js                      # Seed data (auto-runs if empty)
│   │   ├── routes/
│   │   │   ├── index.js                 # Route aggregator
│   │   │   ├── knowledge.js             # /api/knowledge routes
│   │   │   ├── masters.js               # /api/master/* routes
│   │   │   └── projects.js              # /api/projects/* routes
│   │   └── controllers/
│   │       ├── KnowledgeController.js   # List, detail, create, stats
│   │       ├── MasterController.js      # Types + processes
│   │       └── ProjectController.js     # Documents used by project
│   ├── uploads/                         # File upload storage
│   └── data.db                          # SQLite database (auto-created)
│
└── frontend/
    └── src/app/
        ├── app.component.ts             # Material sidenav shell
        ├── app.routes.ts                # 5 lazy-loaded routes
        ├── core/
        │   ├── models/
        │   │   └── knowledge.model.ts   # TypeScript interfaces
        │   └── services/
        │       ├── knowledge-api.service.ts   # Knowledge CRUD + stats
        │       └── master-data.service.ts     # Types + processes
        └── features/
            ├── listing/                 # Table + collapsible filters + pagination
            ├── submit/                  # Reactive form + file upload
            ├── detail/                  # Read-only card view
            ├── documents-used/          # Project dropdown + linked items table
            └── stats/                   # 3 aggregation cards (type, process, plant)
```

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| **Listing** | `/knowledge` | Table with ID, Type, Designation, Process, Owner, Project, Date, Status. Collapsible filters. Row click → detail. |
| **Submit** | `/knowledge/new` | Form with validation, dropdowns for type/process, date picker, file upload. Creates item with `PENDING` status. |
| **Detail** | `/knowledge/:id` | Read-only view of all metadata, process chips, attached files with download links. |
| **Documents Used** | `/documents-used` | Select project from dropdown → table of linked knowledge items. |
| **Statistics** | `/stats` | Three cards: items by type, by process, by plant. |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/knowledge` | List items (supports filters: `type`, `process`, `project`, `owner`, `author`, `plant`, `date_from`, `date_to`) |
| `GET` | `/api/knowledge/:id` | Item detail with processes and files |
| `POST` | `/api/knowledge` | Create item (multipart form with file upload) |
| `GET` | `/api/knowledge/stats` | Aggregated counts by type, process, plant |
| `GET` | `/api/master/types` | List active types |
| `GET` | `/api/master/processes` | List active processes |
| `GET` | `/api/projects` | List distinct projects |
| `GET` | `/api/projects/:project/documents-used` | Knowledge items linked to a project |

---

## Database Schema

Six tables, auto-created on startup:

- **`master_type`** — 5 seeded types (Documentation, Recommendation, Guideline, Good Practice, Lessons Learned)
- **`master_process`** — 5 seeded processes (Injection, Chrome, Paint, Assembly, Quality)
- **`knowledge_item`** — Main entity with title, date, owner, author, type FK, project, plant, visibility_status
- **`knowledge_item_process`** — Many-to-many junction (item ↔ process)
- **`knowledge_item_file`** — File attachments (DOCUMENT or IMAGE)
- **`project_knowledge_item`** — Links items to projects (for Documents Used page)

---

## Seed Data

Automatically inserted on first startup:

- 5 types, 5 processes
- 12 knowledge items across 2 projects (`PRJ-ALPHA`, `PRJ-BETA`)
- Items with multiple processes linked
- Items with file attachment metadata
- Mix of `PENDING`, `VISIBLE`, and `NOT_VISIBLE` statuses

To reset: delete `backend/data.db` and restart.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start backend + frontend concurrently |
| `npm run install:all` | Install dependencies for root, backend, and frontend |
| `npm run backend:only` | Start backend only (port 3000) |

---

## Sprint 1 Scope

### Implemented

- Database schema with all 6 tables
- Backend CRUD (Create + Read) with parameterized queries
- 5 frontend pages with Material UI
- Navigation with sidenav
- Collapsible filters on listing page
- File upload (documents + images)
- Statistics with GROUP BY aggregations
- Seed data

### Not In Scope (Future Sprints)

- Approval workflow
- Email notifications
- Role-based permissions
- Edit / Delete functionality
- Version history
- Audit trail
