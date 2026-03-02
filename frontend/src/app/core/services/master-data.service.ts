import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MasterType, MasterProcess } from '../models/knowledge.model';

@Injectable({ providedIn: 'root' })
export class MasterDataService {
  constructor(private http: HttpClient) {}

  getTypes(): Observable<MasterType[]> {
    return this.http.get<MasterType[]>('/api/master/types');
  }

  getProcesses(): Observable<MasterProcess[]> {
    return this.http.get<MasterProcess[]>('/api/master/processes');
  }
}
