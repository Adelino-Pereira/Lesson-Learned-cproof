/**
 * knowledge.model.ts — TypeScript interfaces for all domain entities.
 * Maps to the backend SQLite schema and API response shapes.
 */

/** Knowledge item type (e.g. Documentation, Lessons-learned, Guide-line) */
export interface MasterType {
  id: number;
  code: string;
  label: string;
  is_active: number;
}

/** Manufacturing process (e.g. Injection, Chrome, Paint) */
export interface MasterProcess {
  id: number;
  code: string;
  label: string;
  is_active: number;
}

/** Automotive project with customer (OEM) and vehicle info */
export interface MasterProject {
  id: number;
  designation: string;
  name: string;
  description: string | null;
  customer: string;
  vehicle: string;
  is_active: number;
}

/** Main knowledge item entity — matches the knowledge_item table + joined fields */
export interface KnowledgeItem {
  id: number;
  title: string;
  designation: string | null;
  date: string;
  owner: string;                                       // Customer/contact name
  author: string;                                      // Person who authored the item
  type_id: number;
  project_id: number | null;
  plant: string | null;
  document_link: string | null;
  visibility_status: 'PENDING' | 'APPROVED' | 'REJECTED';  // Validation workflow state
  is_active: number;
  created_at: string;
  // Joined fields from related tables (populated by backend queries)
  type_code?: string;
  type_label?: string;
  process_labels?: string;                             // Comma-separated process names
  derived_from_id: number | null;                      // Self-referencing FK for officialised items
  derived_from_title?: string;
  project_designation?: string;
  project_name?: string;
  project_customer?: string;
  project_vehicle?: string;
}

/** Extended item with usage flag — used in the Add Document dialog toggle list */
export interface KnowledgeItemWithUsage extends KnowledgeItem {
  is_used: number;  // 1 if linked to the selected project, 0 otherwise
}

/** Full item detail including linked processes and file attachments */
export interface KnowledgeItemDetail extends KnowledgeItem {
  processes: MasterProcess[];
  files: KnowledgeItemFile[];
}

/** File attachment metadata for a knowledge item */
export interface KnowledgeItemFile {
  id: number;
  knowledge_item_id: number;
  file_kind: 'DOCUMENT' | 'IMAGE';
  filename_original: string;
  storage_path: string;
  uploaded_at: string;
}

/** Single data point for statistics charts (label + count pair) */
export interface StatBlock {
  label: string;
  count: number;
}

/** Statistics API response — aggregated counts for dashboard charts */
export interface StatsResponse {
  byType: StatBlock[];
  byProcess: StatBlock[];
  byPlant: StatBlock[];
}

/** Query parameters for filtering the knowledge item list */
export interface KnowledgeFilters {
  title?: string;
  type?: number;
  process?: number;
  project_id?: number;
  owner?: string;
  author?: string;
  plant?: string;
  date_from?: string;
  date_to?: string;
  visibility_status?: string;
}
