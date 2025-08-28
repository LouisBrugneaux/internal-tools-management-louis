import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {forkJoin, map, Observable} from 'rxjs';
import { environment } from '../environments/environment';

export type ToolStatus = 'active' | 'expiring' | 'unused' | string;

export interface Tool {
  id: number | string;
  name: string;
  department: string;
  users: number;
  monthlyCost: number;
  status: ToolStatus;
}

/** Interfaces KPI */
export interface DashboardKpis {
  budget: {
    current_month_total: number;
    monthly_limit: number;
    budget_change: string;
  };
  tools: {
    count: number;
    tools_change: string;
  };
  departments: {
    count: number;
    departments_change: string;
  };
  costPerUser: {
    cost_per_user: number;
    cost_per_user_change: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ToolsService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Recent tools */
  getRecentTools(limit = 10): Observable<Tool[]> {
    const params = new HttpParams()
      .set('_limit', String(limit))
      .set('_sort', 'updated_at')
      .set('_order', 'desc');

    return this.http.get<any[]>(`${this.base}/tools`, { params }).pipe(
      map(rows => rows.map(row => ({
        id: row.id,
        name: row.name ?? 'Unknown',
        department: row.category ?? '—',
        users: row.active_users_count ?? 0,
        monthlyCost: row.monthly_cost ?? 0,
        status: row.status ?? 'active'
      })))
    );
  }

  /** KPIs pour les 4 cards du dashboard */
  getKpis(): Observable<DashboardKpis> {
    return forkJoin({
      tools: this.http.get<any[]>(`${this.base}/tools`),
      departments: this.http.get<any[]>(`${this.base}/departments`),
      analytics: this.http.get<any>(`${this.base}/analytics`)
    }).pipe(
      map(({ tools, departments, analytics }) => {
        const budget_overview = analytics?.budget_overview ?? {};
        const kpi_trends = analytics?.kpi_trends ?? {};
        const cost_analytics = analytics?.cost_analytics ?? {};

        return {
          budget: {
            current_month_total: budget_overview.current_month_total ?? 0,
            monthly_limit: budget_overview.monthly_limit ?? 0,
            budget_change: kpi_trends.budget_change ?? ''
          },
          tools: {
            count: tools?.length ?? 0,
            tools_change: kpi_trends.tools_change ?? ''
          },
          departments: {
            count: departments?.length ?? 0,
            departments_change: kpi_trends.departments_change ?? ''
          },
          costPerUser: {
            cost_per_user: cost_analytics.cost_per_user ?? 0,
            cost_per_user_change: kpi_trends.cost_per_user_change ?? ''
          }
        } as DashboardKpis;
      })
    );
  }
}
