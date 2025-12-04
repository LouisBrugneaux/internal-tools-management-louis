import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolsService, Tool } from '../../hooks/tools.service';
import { Observable, catchError, of } from 'rxjs';
import {LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './tools.component.html',
  styleUrl: './tools.component.scss',
})
export class ToolsComponent implements OnInit {
  tools$!: Observable<Tool[]>;
  error = false;

  page = 1;
  limit = 10;

  constructor(private toolsService: ToolsService) {
  }

  ngOnInit(): void {
    this.loadTools();
  }

  loadTools(): void {
    this.tools$ = this.toolsService.getTools({page: this.page, limit: this.limit}).pipe(
      catchError(err => {
        console.error(err);
        this.error = true;
        return of([] as Tool[]);
      })
    );
  }

  nextPage(): void {
    this.page++;
    this.loadTools();
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadTools();
    }
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
