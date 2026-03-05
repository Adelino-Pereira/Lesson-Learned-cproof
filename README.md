# Knowledge Database (Lessons Learned) — Standalone Prototype

Proof-of-concept prototype for the **Knowledge Database** module. Runs independently with zero infrastructure dependencies — no MSSQL, no Alfresco, no external services.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Angular 19 (standalone components) + Angular Material + ngx-charts |
| **Backend** | Node.js + Express |
| **Database** | SQLite (via better-sqlite3, zero-config) |
| **File Upload** | Multer → local `uploads/` directory |
| **Deployment** | Docker (multi-stage build) |

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

The database is created and seeded automatically on first startup (12 projects, 16 knowledge items, 6 types, 9 processes).

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
│   │   ├── database.js                  # SQLite schema (7 tables)
│   │   ├── seed.js                      # Seed data (auto-runs if empty)
│   │   ├── routes/
│   │   │   ├── index.js                 # Route aggregator
│   │   │   ├── knowledge.js             # /api/knowledge routes
│   │   │   ├── masters.js               # /api/master/* routes
│   │   │   └── projects.js              # /api/projects/* routes
│   │   └── controllers/
│   │       ├── KnowledgeController.js   # List, detail, create, update, delete, stats
│   │       ├── MasterController.js      # Types + processes
│   │       └── ProjectController.js     # Projects + documents used
│   ├── uploads/                         # File upload storage
│   └── data.db                          # SQLite database (auto-created)
│
└── frontend/
    └── src/app/
        ├── app.component.ts             # Material sidenav shell
        ├── app.routes.ts                # 5 lazy-loaded routes with permission guards
        ├── core/
        │   ├── models/
        │   │   └── knowledge.model.ts   # TypeScript interfaces
        │   └── services/
        │       ├── knowledge-api.service.ts   # Knowledge CRUD + stats + projects
        │       ├── master-data.service.ts     # Types + processes
        │       └── permission.service.ts      # Role-based access control
        └── features/
            ├── listing/                 # Table + search + filters + pagination + status badges
            ├── submit/                  # Reactive form + file upload
            ├── detail/                  # Dialog with view/edit mode + officialise
            ├── documents-used/          # Searchable project autocomplete + linked items
            └── stats/                   # Charts (type, process, plant) via ngx-charts
```

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| **Listing** | `/knowledge` | Table with title search, filters (type, process, project, customer, plant, dates). Status quick-filter buttons with counts (admin/validators). Sortable columns, pagination. Row click opens detail dialog. |
| **Submit** | `/knowledge/new` | Form with validation, dropdowns for type/process/project, date picker, file upload. Creates item with `PENDING` status. |
| **Detail** | Dialog | View/edit mode for all metadata. Process chips, attached files with download. Officialise action (transform or derive to Good-practice/Guide-line). Status validation (approve/reject) for authorized roles. |
| **Documents Used** | `/documents-used` | Searchable autocomplete for project selection (grouped by customer/OEM). Table of linked knowledge items. Add/remove documents dialog with filters. |
| **Statistics** | `/stats` | Charts: horizontal bar (by type), vertical bar (by process), donut (by plant). |

---

## Role-Based Access Control

| Role | Permissions |
|------|------------|
| **admin** | Full access: create, edit, delete, validate status, manage documents-used, view stats |
| **power-user** | Create, edit, delete, manage documents-used, view stats |
| **project-leader** | Create, edit, manage documents-used, view stats |
| **manager** | Create, validate status, view stats |
| **user** | Create, view approved items only |

Role is selected via the sidebar role switcher. Permission guards protect routes and UI elements.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/knowledge` | List items (filters: `title`, `type`, `process`, `project_id`, `owner`, `author`, `plant`, `date_from`, `date_to`, `visibility_status`) |
| `GET` | `/api/knowledge/:id` | Item detail with processes and files |
| `POST` | `/api/knowledge` | Create item (multipart form with file upload) |
| `PUT` | `/api/knowledge/:id` | Update item |
| `DELETE` | `/api/knowledge/:id` | Soft-delete item (sets `is_active = 0`) |
| `PATCH` | `/api/knowledge/:id/status` | Update visibility status (APPROVED / REJECTED) |
| `GET` | `/api/knowledge/stats` | Aggregated counts by type, process, plant |
| `GET` | `/api/master/types` | List active types |
| `GET` | `/api/master/processes` | List active processes |
| `GET` | `/api/projects` | List projects (supports `?search=` and `?customer=`) |
| `GET` | `/api/projects/customers` | List distinct customers |
| `GET` | `/api/projects/vehicles` | List distinct vehicles |
| `GET` | `/api/projects/:projectId/documents-used` | Knowledge items linked to a project |
| `GET` | `/api/projects/:projectId/items-with-usage` | All items with usage flag for a project |
| `POST` | `/api/projects/:projectId/documents-used` | Link a document to a project |
| `DELETE` | `/api/projects/:projectId/documents-used/:itemId` | Unlink a document from a project |

---

## Database Schema

Seven tables, auto-created on startup:

- **`master_type`** — 6 seeded types (Documentation, Recommendation, Guide-line, Good-practice, Lessons-learned, Alert)
- **`master_process`** — 9 seeded processes (Injection, Chrome, Paint, Welding, Castforming, Hotstamping, Film, Screen printing, Assembly)
- **`master_project`** — 12 seeded automotive projects with designation, name, description, customer (OEM), vehicle
- **`knowledge_item`** — Main entity with title, date, owner, author, type FK, project FK, plant, visibility_status (PENDING/APPROVED/REJECTED), derived_from_id
- **`knowledge_item_process`** — Many-to-many junction (item ↔ process)
- **`knowledge_item_file`** — File attachments (DOCUMENT or IMAGE)
- **`project_knowledge_item`** — Links items to projects (for Documents Used page)

---

## Seed Data

Automatically inserted on first startup:

- 6 types, 9 processes, 12 projects
- 16 knowledge items across multiple projects (Stellantis, Renault, Volkswagen, BMW)
- Items with multiple processes linked
- Items with file attachment metadata
- Mix of `PENDING`, `APPROVED`, and `REJECTED` statuses

To reset: delete `backend/data.db` and restart.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start backend + frontend concurrently |
| `npm run install:all` | Install dependencies for root, backend, and frontend |
| `npm run backend:only` | Start backend only (port 3000) |

---

## Implemented Features

- Full CRUD (Create, Read, Update, Delete) with soft-delete
- Role-based permission system with 5 roles
- Visibility status workflow (PENDING → APPROVED / REJECTED)
- Officialise action (transform or create derived Good-practice / Guide-line)
- Searchable project autocomplete grouped by customer (OEM)
- Title search + multi-criteria filters on listing
- Status quick-filter buttons with document counts
- Statistics with charts (ngx-charts: bar, pie, donut)
- File upload (documents + images) with download
- Docker deployment support

---

## Future Integration into DCS

This module is designed to be integrated into the main **DCS project** (`DCS_proj`). Below is a summary of the key adaptation points.

### Technology Gap

| Aspect | Mockup | DCS Production |
|--------|--------|----------------|
| Angular | 19 (standalone components) | 10 (NgModules) |
| Backend | Express + plain SQL | Express + TypeORM (Repository pattern) |
| Database | SQLite (better-sqlite3) | Microsoft SQL Server |
| Auth | Local role switcher | JWT + role flags on User entity |
| File storage | Multer → local `uploads/` | Alfresco ECM |
| UI components | Angular Material | PrimeNG + AG Grid Enterprise + Vex layout |

### Data Model Mapping

| Mockup Entity | DCS Entity | Notes |
|---------------|------------|-------|
| `master_project` | `Program` → `Vehicle` → `Manufacturer` | Mockup flattens the hierarchy. In DCS, query Program JOIN Vehicle JOIN Manufacturer to get designation, name, customer, vehicle. |
| `master_type` | New table (`knowledge_type`) | No existing equivalent — create as a new parameter table in DCS. |
| `master_process` | New table (`knowledge_process`) | Same — create as a new parameter table. Add to Parametros management module. |
| `knowledge_item` | New table | Core entity. Replace `project_id` FK → `program_id` FK to DCS `Program`. Add `Createdby`/`Updatedby` as User FKs. Add `Disabledby`/`DisabledDate`/`Disable` pattern (DCS soft-delete convention). |
| `knowledge_item_process` | New junction table | Same M2M pattern used throughout DCS. |
| `knowledge_item_file` | Alfresco references | Replace local file storage with Alfresco node IDs. Use `AlfrescoApp` service for upload/download. |
| `project_knowledge_item` | New junction table | Links Program ↔ KnowledgeItem for "Documents Used" feature. |

### Backend Adaptation

1. **TypeORM entities**: Convert `CREATE TABLE` DDL into TypeORM `@Entity()` classes with `@Column`, `@ManyToOne`, `@OneToMany` decorators. Follow DCS naming conventions (PascalCase columns).
2. **Controllers**: Refactor from plain SQL to `getRepository(KnowledgeItem).find()` / `.save()` / `.createQueryBuilder()`. Follow the existing DCS controller pattern (one controller per entity).
3. **Routes**: Add route files under `src/routes/` and register in `routes/index.ts`. Protect with `checkJwt` and `checkRole` middleware.
4. **Auth**: Replace the mockup's `PermissionService` role switcher with JWT-based auth. Map permissions to DCS User role flags (`system_Administrator`, `projectmanager`, `engineering`, etc.).
5. **File upload**: Replace Multer local storage with Alfresco integration via `AlfrescoApp.ts`. Store Alfresco node IDs instead of local paths.

### Frontend Adaptation

1. **Module structure**: Convert standalone components to NgModule-based feature modules (Angular 10 pattern). Follow DCS convention: `*-form.component.ts`, `*-board.component.ts`, `*-detail.component.ts`.
2. **UI components**: Replace Angular Material components with PrimeNG equivalents (p-table, p-dropdown, p-dialog, etc.) and AG Grid for the listing table.
3. **Services**: Follow DCS naming convention (`knowledge_getform.service.ts`, `knowledge_formu.service.ts`). Use the existing `token-interceptor.service.ts` for JWT injection.
4. **Routing**: Add lazy-loaded routes under `app-routing.module.ts`. Use `CanActivateUser` guard with appropriate role checks.
5. **Project selection**: Replace `master_project` autocomplete with a cascading query on DCS's `Manufacturer` → `Vehicle` → `Program` hierarchy, or keep the flat autocomplete but source data from a JOIN across those three tables.
6. **Parameter management**: Add Type and Process master tables to the Parametros module (`src/app/pages/apps/Parametros/`) for CRUD management by administrators.

### Migration Steps (Suggested Order)

1. Create TypeORM entities and migration files for the new tables
2. Seed Type and Process master data via migration
3. Implement backend controllers and routes with JWT/role middleware
4. Build frontend feature module with PrimeNG/AG Grid components
5. Integrate Alfresco for file attachments
6. Add parameter management pages for Type and Process
7. Wire Program entity into project selection (replace `master_project`)
