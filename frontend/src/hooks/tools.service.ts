import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {forkJoin, map, Observable} from 'rxjs';
import { environment } from '../environments/environment';

export type ToolStatus = 'active' | 'expiring' | 'unused' | 'unknown';

export interface Tool {
  id: number | string;
  name: string;
  department: string;
  users: number;
  monthlyCost: number;
  status: ToolStatus;
  category: string;
  description: string;
  updatedAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class ToolsService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTools(params: { page?: number; limit?: number } = {}): Observable<Tool[]> {
    let httpParams = new HttpParams()
      .set('_page', String(params.page ?? 1))
      .set('_limit', String(params.limit ?? 10))
      .set('_sort', 'updated_at')
      .set('_order', 'desc');

    return this.http.get<any[]>(`${this.base}/tools`, { params: httpParams }).pipe(
      map(rows => rows.map(row => ({
        id: row.id,
        name: row.name ?? 'Unknown',
        department: row.owner_department ?? null,
        category: row.category ?? null,
        description: row.description ?? '',
        users: row.active_users_count ?? row.users_count ?? 0,
        monthlyCost: row.monthly_cost ?? 0,
        status: (row.status ?? 'unknown') as ToolStatus,
        updatedAt: row.updated_at ?? row.last_updated ?? null
      } as Tool)))
    );
  }

}
