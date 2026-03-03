export interface MasterType {
  id: number;
  code: string;
  label: string;
  is_active: number;
}

export interface MasterProcess {
  id: number;
  code: string;
  label: string;
  is_active: number;
}

export interface KnowledgeItem {
  id: number;
  title: string;
  designation: string | null;
  date: string;
  owner: string;
  author: string;
  type_id: number;
  project: string | null;
  plant: string | null;
  document_link: string | null;
  visibility_status: 'PENDING' | 'VISIBLE' | 'NOT_VISIBLE';
  is_active: number;
  created_at: string;
  type_code?: string;
  type_label?: string;
  process_labels?: string;
  derived_from_id: number | null;
  derived_from_title?: string;
}

export interface KnowledgeItemWithUsage extends KnowledgeItem {
  is_used: number;
}

export interface KnowledgeItemDetail extends KnowledgeItem {
  processes: MasterProcess[];
  files: KnowledgeItemFile[];
}

export interface KnowledgeItemFile {
  id: number;
  knowledge_item_id: number;
  file_kind: 'DOCUMENT' | 'IMAGE';
  filename_original: string;
  storage_path: string;
  uploaded_at: string;
}

export interface StatBlock {
  label: string;
  count: number;
}

export interface StatsResponse {
  byType: StatBlock[];
  byProcess: StatBlock[];
  byPlant: StatBlock[];
}

export interface KnowledgeFilters {
  type?: number;
  process?: number;
  project?: string;
  owner?: string;
  author?: string;
  plant?: string;
  date_from?: string;
  date_to?: string;
  visibility_status?: string;
}
