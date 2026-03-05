/**
 * master-data.service.ts — Fetches reference/master data (types and processes).
 * Used to populate dropdowns in the submit form, detail dialog, and listing filters.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MasterType, MasterProcess } from '../models/knowledge.model';

@Injectable({ providedIn: 'root' })
export class MasterDataService {
  constructor(private http: HttpClient) {}

  /** Returns all active knowledge item types */
  getTypes(): Observable<MasterType[]> {
    return this.http.get<MasterType[]>('/api/master/types');
  }

  /** Returns all active manufacturing processes */
  getProcesses(): Observable<MasterProcess[]> {
    return this.http.get<MasterProcess[]>('/api/master/processes');
  }
}
