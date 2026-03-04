import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  KnowledgeItem,
  KnowledgeItemDetail,
  KnowledgeItemWithUsage,
  KnowledgeFilters,
  StatsResponse,
} from '../models/knowledge.model';

@Injectable({ providedIn: 'root' })
export class KnowledgeApiService {
  private baseUrl = '/api/knowledge';

  constructor(private http: HttpClient) {}

  getAll(filters?: KnowledgeFilters): Observable<KnowledgeItem[]> {
    let params = new HttpParams();
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      }
    }
    return this.http.get<KnowledgeItem[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<KnowledgeItemDetail> {
    return this.http.get<KnowledgeItemDetail>(`${this.baseUrl}/${id}`);
  }

  create(formData: FormData): Observable<KnowledgeItem> {
    return this.http.post<KnowledgeItem>(this.baseUrl, formData);
  }

  createJson(body: Record<string, any>): Observable<KnowledgeItem> {
    return this.http.post<KnowledgeItem>(this.baseUrl, body);
  }

  update(id: number, body: Record<string, any>): Observable<KnowledgeItemDetail> {
    return this.http.put<KnowledgeItemDetail>(`${this.baseUrl}/${id}`, body);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: number, visibility_status: 'APPROVED' | 'REJECTED'): Observable<KnowledgeItem> {
    return this.http.patch<KnowledgeItem>(`${this.baseUrl}/${id}/status`, { visibility_status });
  }

  getStats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.baseUrl}/stats`);
  }

  getDocumentsUsed(project: string): Observable<KnowledgeItem[]> {
    return this.http.get<KnowledgeItem[]>(`/api/projects/${encodeURIComponent(project)}/documents-used`);
  }

  getItemsWithUsage(project: string): Observable<KnowledgeItemWithUsage[]> {
    return this.http.get<KnowledgeItemWithUsage[]>(`/api/projects/${encodeURIComponent(project)}/items-with-usage`);
  }

  linkDocumentToProject(project: string, itemId: number): Observable<any> {
    return this.http.post(`/api/projects/${encodeURIComponent(project)}/documents-used`, { knowledge_item_id: itemId });
  }

  unlinkDocumentFromProject(project: string, itemId: number): Observable<any> {
    return this.http.delete(`/api/projects/${encodeURIComponent(project)}/documents-used/${itemId}`);
  }

  getProjects(): Observable<string[]> {
    return this.http.get<string[]>('/api/projects');
  }
}
