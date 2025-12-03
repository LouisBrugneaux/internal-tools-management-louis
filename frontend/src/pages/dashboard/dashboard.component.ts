import { Component, OnInit } from '@angular/core';
import {catchError, Observable, of, tap} from 'rxjs';
import {DashboardKpis, Tool, ToolsService} from '../../hooks/tools.service';
import { LucideAngularModule } from 'lucide-angular';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  tools$!: Observable<Tool[]>;
  kpis$!: Observable<DashboardKpis>;

  error = false;

  kpisEmpty = false;

  constructor(private toolsService: ToolsService) {}

  ngOnInit(): void {
    this.tools$ = this.toolsService.getRecentTools().pipe(
      catchError(err => {
        console.error(err);
        this.error = true;
        return of([] as Tool[]);
      })
    );
    this.kpis$ = this.toolsService.getKpis().pipe(
      tap(k => {
        this.kpisEmpty = this.isKpisEmpty(k);
      }),
      catchError(err => {
        console.error(err);
        this.error = true;
        this.kpisEmpty = true;
        return of({
          budget: { current_month_total: 0, monthly_limit: 0, budget_change: '' },
          tools: { count: 0, tools_change: '' },
          departments: { count: 0, departments_change: '' },
          costPerUser: { cost_per_user: 0, cost_per_user_change: '' }
        });
      })
    );
  }

  euro(n: number | null | undefined): string {
    return Number(n || 0).toLocaleString('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    });
  }

  getDepartmentIcon(dept: string): string {
    switch (dept?.toLowerCase()) {
      case 'engineering': return 'zap';
      case 'communication': return 'message-circle';
      case 'design': return 'palette';
      case 'operations': return 'workflow';
      case 'sales & marketing': return 'briefcase';
      case 'productivity': return 'chart-line';
      case 'project management': return 'ruler';
      case 'development': return 'computer';
      case 'security': return 'lock';
      case 'analytics': return 'chart-pie';
      case 'hr': return 'users';
      case 'finance': return 'landmark';
      default: return 'app-window';
    }
  }

  private isKpisEmpty(k: DashboardKpis): boolean {
    if (!k)
      return true;

    return (
      (k.budget.current_month_total ?? 0) === 0 &&
      (k.budget.monthly_limit ?? 0) === 0 &&
      (k.tools.count ?? 0) === 0 &&
      (k.departments.count ?? 0) === 0 &&
      (k.costPerUser.cost_per_user ?? 0) === 0
    );
  }

}
