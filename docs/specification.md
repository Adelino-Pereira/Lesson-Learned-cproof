# Knowledge Database Module — Specification

**Project:** Knowledge Database Module
**Sprint:** 1
**Goal:** Functional Prototype (Mockup + Core Flow)

---

## Table of Contents

- [1. Project Context](#1-project-context)
- [2. Scope of Sprint 1](#2-scope-of-sprint-1)
- [3. Functional Architecture](#3-functional-architecture)
- [4. Database Model](#4-database-model)
- [5. Backend Requirements](#5-backend-requirements)
- [6. Frontend Requirements](#6-frontend-requirements)
- [7. Status System](#7-status-system)
- [8. UI Standards](#8-ui-standards)
- [9. Seed Data Requirements](#9-seed-data-requirements)
- [10. Implementation Order](#10-implementation-order)
- [11. Definition of Done](#11-definition-of-done)
- [12. Future Extensions](#12-future-extensions)

---

## 1. Project Context

We are implementing a new module called **Knowledge Database (Lessons Learned)**.

The module must:

- Allow users to submit knowledge items
- Store items in a database
- List items
- Show item details
- Provide basic statistics
- Provide a read-only "Documents Used by Project" view

> **Note:** This is Sprint 1. Only a functional prototype is required. No advanced workflow or permission engine yet.

---

## 2. Scope of Sprint 1

### Must Be Implemented

- Database schema
- Backend CRUD (Create + Read)
- Frontend pages
- Navigation between pages
- Simple filtering
- Simple statistics (GROUP BY queries)
- Seed data

### Explicitly NOT Required

- Approval workflow logic
- Email notifications
- Complex role-based permissions
- Edit/Delete functionality
- Version history
- Audit trail

---

## 3. Functional Architecture

The module contains **5 pages**:

1. **Knowledge Listing** (Home)
2. **Submit New Item**
3. **Item Detail**
4. **Documents Used** (Read-only)
5. **Stats Page**

### Navigation Structure

```
Knowledge DB
│
├── Listing (default page)
│   └── Detail
│
├── Submit
│
├── Documents Used
│
└── Stats
```

---

## 4. Database Model

### 4.1 `knowledge_item`

| Field | Type | Required |
|-------|------|:--------:|
| `id` | PK | yes |
| `title` | string | yes |
| `designation` | string | no |
| `date` | date | yes |
| `owner` | string | yes |
| `author` | string | yes |
| `type_id` | FK | yes |
| `project` | string | yes |
| `plant` | string | yes |
| `visibility_status` | enum(`PENDING`, `VISIBLE`, `NOT_VISIBLE`) | yes |
| `is_active` | boolean | yes |
| `created_at` | datetime | yes |

### 4.2 `master_type`

| Field | Type |
|-------|------|
| `id` | PK |
| `code` | string |
| `label` | string |
| `is_active` | boolean |

**Seed minimum 5 types:**

1. Documentation
2. Recommendation
3. Guideline
4. Good Practice
5. Lessons Learned

### 4.3 `master_process`

| Field | Type |
|-------|------|
| `id` | PK |
| `code` | string |
| `label` | string |
| `is_active` | boolean |

**Seed minimum 5 processes:**

1. Injection
2. Chrome
3. Paint
4. Assembly
5. Quality

### 4.4 `knowledge_item_process` (Many-to-Many)

| Field |
|-------|
| `knowledge_item_id` |
| `process_id` |

### 4.5 `knowledge_item_file`

| Field | Type |
|-------|------|
| `id` | PK |
| `knowledge_item_id` | FK |
| `file_kind` | enum(`DOCUMENT`, `IMAGE`) |
| `filename_original` | string |
| `storage_path` | string |
| `uploaded_at` | datetime |

### 4.6 `project_knowledge_item`

| Field |
|-------|
| `project` |
| `knowledge_item_id` |
| `added_at` |

---

## 5. Backend Requirements

### 5.1 Endpoints

#### `GET /knowledge`

Returns list of knowledge items. Supports optional filters via query params:

| Query Param | Description |
|-------------|-------------|
| `type` | Filter by type |
| `process` | Filter by process |
| `project` | Filter by project |
| `owner` | Filter by owner |
| `author` | Filter by author |
| `plant` | Filter by plant |
| `date_from` | Filter from date |
| `date_to` | Filter to date |

#### `GET /knowledge/{id}`

Returns detail of a knowledge item.

#### `POST /knowledge`

Creates a new knowledge item. Must:

- Set `visibility_status = PENDING`
- Set `is_active = true`
- Save uploaded files metadata

#### `GET /projects/{project}/documents-used`

Returns knowledge items linked to a project.

#### `GET /knowledge/stats`

Returns:

- Count by type
- Count by process
- Count by plant

---

## 6. Frontend Requirements

### 6.1 Knowledge Listing Page

Must include:

- **Table** with columns:
  - ID
  - Type
  - Designation
  - Process
  - Owner
  - Project
  - Date
  - Status Badge
- Collapsible filters panel
- Button: **"+ Submit New Item"**
- Row click navigates to detail page

### 6.2 Submit Page

**Form fields:**

| Field | Notes |
|-------|-------|
| Title | required |
| Designation | |
| Date | required |
| Owner | required |
| Author | required |
| Type | dropdown |
| Project | |
| Plant | |
| Process | multi-select |
| Upload Document | |
| Upload Images | |

**On submit:**

1. Call `POST` endpoint
2. Redirect to Detail page
3. Show confirmation message

### 6.3 Detail Page

Display:

- All metadata
- Status badge
- List of attached files

> No edit or approval buttons in Sprint 1.

### 6.4 Documents Used Page

- Dropdown: Select project
- Table listing linked knowledge items
- Read-only

### 6.5 Stats Page

Display 3 aggregated blocks:

1. **Items by Type**
2. **Items by Process**
3. **Items by Plant**

Simple table or card layout. No charts required.

---

## 7. Status System

**Enum:** `visibility_status`

| Value | Description |
|-------|-------------|
| `PENDING` | Default on creation |
| `VISIBLE` | Item is visible |
| `NOT_VISIBLE` | Item is hidden |

> For Sprint 1: Only display status. No transitions required.

---

## 8. UI Standards

- Use **badges** for status
- Use **dropdowns** for master data
- Filters must not block page load
- Pagination optional (recommended if >20 records)

---

## 9. Seed Data Requirements

Seed the database with:

- >= 5 types
- >= 5 processes
- >= 10 knowledge items
- >= 2 projects
- At least 1 item with multiple processes
- At least 1 item with attachments

---

## 10. Implementation Order

Follow this order:

1. Create database schema
2. Create seed script
3. Implement backend models
4. Implement endpoints
5. Implement Listing page
6. Implement Submit page
7. Implement Detail page
8. Implement Documents Used page
9. Implement Stats page
10. Connect frontend to backend
11. Test happy path flow

---

## 11. Definition of Done

Sprint 1 is complete when:

- [ ] A user can submit a knowledge item
- [ ] A user can see it in the listing
- [ ] A user can open the detail page
- [ ] Stats page returns correct aggregation
- [ ] Documents Used page loads correctly
- [ ] Seed data loads successfully
- [ ] No runtime errors

---

## 12. Future Extensions (NOT to implement now)

- Approval workflow
- Notifications
- Role-based restrictions
- Editing capability
- Audit trail
- Project lifecycle integration
