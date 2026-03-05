/**
 * knowledge-api.service.ts — Central HTTP service for the Knowledge Database API.
 * Handles all CRUD operations for knowledge items, statistics, project listing,
 * and the documents-used link/unlink operations.
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  KnowledgeItem,
  KnowledgeItemDetail,
  KnowledgeItemWithUsage,
  KnowledgeFilters,
  StatsResponse,
  MasterProject,
} from '../models/knowledge.model';

@Injectable({ providedIn: 'root' })
export class KnowledgeApiService {
  private baseUrl = '/api/knowledge';

  constructor(private http: HttpClient) {}

  /** Fetches all items with optional query filters (title, type, process, status, etc.) */
  getAll(filters?: KnowledgeFilters): Observable<KnowledgeItem[]> {
    let params = new HttpParams();
    if (filters) {
      // Convert non-empty filter values to query parameters
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      }
    }
    return this.http.get<KnowledgeItem[]>(this.baseUrl, { params });
  }

  /** Fetches a single item with its processes and file attachments */
  getById(id: number): Observable<KnowledgeItemDetail> {
    return this.http.get<KnowledgeItemDetail>(`${this.baseUrl}/${id}`);
  }

  /** Creates a new item via multipart FormData (supports file uploads) */
  create(formData: FormData): Observable<KnowledgeItem> {
    return this.http.post<KnowledgeItem>(this.baseUrl, formData);
  }

  /** Creates a new item via JSON body (used by officialise "create new" action) */
  createJson(body: Record<string, any>): Observable<KnowledgeItem> {
    return this.http.post<KnowledgeItem>(this.baseUrl, body);
  }

  /** Updates an existing item's metadata and process links */
  update(id: number, body: Record<string, any>): Observable<KnowledgeItemDetail> {
    return this.http.put<KnowledgeItemDetail>(`${this.baseUrl}/${id}`, body);
  }

  /** Soft-deletes an item (sets is_active = 0 on the backend) */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  /** Updates the visibility status (APPROVED/REJECTED) — used by validators */
  updateStatus(id: number, visibility_status: 'APPROVED' | 'REJECTED'): Observable<KnowledgeItem> {
    return this.http.patch<KnowledgeItem>(`${this.baseUrl}/${id}/status`, { visibility_status });
  }

  /** Fetches aggregated statistics (by type, process, plant) for the charts dashboard */
  getStats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.baseUrl}/stats`);
  }

  // --- Documents Used (project ↔ item links) ---

  /** Gets knowledge items linked to a specific project */
  getDocumentsUsed(projectId: number): Observable<KnowledgeItem[]> {
    return this.http.get<KnowledgeItem[]>(`/api/projects/${projectId}/documents-used`);
  }

  /** Gets all items with an is_used flag for the Add Document dialog toggles */
  getItemsWithUsage(projectId: number): Observable<KnowledgeItemWithUsage[]> {
    return this.http.get<KnowledgeItemWithUsage[]>(`/api/projects/${projectId}/items-with-usage`);
  }

  /** Links a knowledge item to a project */
  linkDocumentToProject(projectId: number, itemId: number): Observable<any> {
    return this.http.post(`/api/projects/${projectId}/documents-used`, { knowledge_item_id: itemId });
  }

  /** Unlinks a knowledge item from a project */
  unlinkDocumentFromProject(projectId: number, itemId: number): Observable<any> {
    return this.http.delete(`/api/projects/${projectId}/documents-used/${itemId}`);
  }

  /** Fetches all active projects (used in dropdowns and autocomplete) */
  getProjects(): Observable<MasterProject[]> {
    return this.http.get<MasterProject[]>('/api/projects');
  }
}
