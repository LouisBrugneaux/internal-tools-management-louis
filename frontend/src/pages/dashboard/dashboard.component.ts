import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
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
  loading = true;

  constructor(private toolsService: ToolsService) {}

  ngOnInit(): void {
    this.tools$ = this.toolsService.getRecentTools();
    this.kpis$ = this.toolsService.getKpis();
    // petit délai visuel de chargement
    this.tools$.subscribe({ complete: () => (this.loading = false) });
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

}
