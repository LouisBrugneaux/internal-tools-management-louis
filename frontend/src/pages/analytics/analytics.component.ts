import {Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CostAnalyticsData, AnalyticsService, ToolAdoptionMetric, CostOptimizationAlert} from '../../hooks/analytics.service';
import { LucideAngularModule } from 'lucide-angular';
import { catchError, Observable, of, tap } from 'rxjs';

import {Chart, ChartConfiguration, registerables} from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  selectedTab: 'cost' | 'usage' | 'insights' = 'cost';

  analytics$!: Observable<CostAnalyticsData | null>;
  usage$!: Observable<ToolAdoptionMetric[]>;
  alerts$!: Observable<CostOptimizationAlert[]>;

  error = false;

  // Données cost analytics stockées localement
  stats: CostAnalyticsData | null = null;

  // True lorsque les charts sont déjà créés
  private chartsInitialized = false;

  // Références aux canvases Chart.js
  @ViewChild('monthlyChart') monthlyChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('deptChart') deptChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('toolsChart') toolsChartRef!: ElementRef<HTMLCanvasElement>;

  // Instances Chart.js (à détruire quand on change d’onglet)
  private monthlyChart?: Chart;
  private deptChart?: Chart;
  private toolsChart?: Chart;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadCostAnalytics();

    this.usage$ = this.analyticsService.getUsageAnalytics().pipe(
      catchError(err => {
        console.error('Usage analytics error', err);
        return of([] as ToolAdoptionMetric[]);
      })
    );

    this.alerts$ = this.analyticsService.getCostOptimizationAlerts().pipe(
      catchError(err => {
        console.error('Cost alerts error', err);
        return of([] as CostOptimizationAlert[]);
      })
    );
  }

  ngAfterViewInit(): void {
    this.tryUpdateCharts();
  }

  // On attend que les canvas existent
  ngAfterViewChecked(): void {
    if (this.selectedTab === 'cost' && this.stats && !this.chartsInitialized) {
      // On vérifie que les canvas sont dans le DOM
      if (this.monthlyChartRef?.nativeElement && this.deptChartRef?.nativeElement && this.toolsChartRef?.nativeElement) {
        this.tryUpdateCharts();
        this.chartsInitialized = true;
      }
    }
  }


  ngOnDestroy(): void {
    this.destroyCharts();
  }

  loadCostAnalytics(): void {
    this.error = false;

    this.analytics$ = this.analyticsService.getCostAnalytics().pipe(
      tap(data => {
        this.stats = data;

        setTimeout(() => {
          this.tryUpdateCharts();
        }, 1);
      }),
      catchError(err => {
        console.error(err);
        this.error = true;
        return of(null);
      })
    );
  }

  private destroyCharts(): void {
    this.monthlyChart?.destroy();
    this.deptChart?.destroy();
    this.toolsChart?.destroy();

    this.monthlyChart = undefined;
    this.deptChart = undefined;
    this.toolsChart = undefined;
  }

  // Gestion du changement de sous-onglet
  selectTab(tab: 'cost' | 'usage' | 'insights'): void {

    if (this.selectedTab === 'cost' && tab !== 'cost') {
      this.destroyCharts();
    }

    this.selectedTab = tab;

    if (tab === 'cost') {
      this.chartsInitialized = false;
    }
  }

  // Création ou update des charts de l'onglet Cost
  private tryUpdateCharts(): void {

    if (this.selectedTab !== 'cost')
      return;
    if (!this.stats)
      return;
    if (!this.monthlyChartRef || !this.deptChartRef || !this.toolsChartRef)
      return;

    this.createOrUpdateMonthlyChart();
    this.createOrUpdateDeptChart();
    this.createOrUpdateToolsChart();
  }

  // Charts de l'onglet Cost
  private createOrUpdateMonthlyChart(): void {
    if (!this.stats?.monthlySpend?.length) return;

    const labels = this.stats.monthlySpend.map(m => m.month);
    const data = this.stats.monthlySpend.map(m => m.amount);

    const canvas = this.monthlyChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#34d399');
    gradient.addColorStop(1, 'rgba(5, 150, 105, 0)');

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Monthly spend',
            data,
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            borderColor: '#3b82f6',
            backgroundColor: gradient,
            pointRadius: 3,
            pointHoverRadius: 4,
            pointBackgroundColor: '#3b82f6',
            pointBorderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(148, 163, 184, 0.15)'
            }
          },
          y: {
            grid: {
              color: 'rgba(148, 163, 184, 0.12)'
            }
          }
        }
      }
    };

    if (this.monthlyChart) {
      this.monthlyChart.data = config.data;
      this.monthlyChart.options = config.options!;
      this.monthlyChart.update();
    } else {
      this.monthlyChart = new Chart(canvas, config);
    }
  }

  private createOrUpdateDeptChart(): void {
    if (!this.stats?.departmentCosts?.length) return;

    const labels = this.stats.departmentCosts.map(d => d.department);
    const data = this.stats.departmentCosts.map(d => d.amount);

    const colors: string[] = [];
    for (let i = 0; i < this.stats?.departmentCosts?.length; i++) {
      const hue = (i * (360 / this.stats?.departmentCosts?.length)) % 360;
      colors.push(`hsl(${hue}, 75%, 55%)`);
    }

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            label: 'Department spend',
            data,
            backgroundColor: colors,
            borderColor: 'transparent',
            hoverOffset: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            position: 'bottom',
          }
        }
      }
    };

    if (this.deptChart) {
      this.deptChart.data = config.data;
      this.deptChart.options = config.options!;
      this.deptChart.update();
    } else {
      this.deptChart = new Chart(this.deptChartRef.nativeElement, config);
    }
  }


  private createOrUpdateToolsChart(): void {
    if (!this.stats?.topExpensiveTools?.length) return;

    const labels = this.stats.topExpensiveTools.map(t => t.name);
    const data = this.stats.topExpensiveTools.map(t => t.amount);

    const canvas = this.toolsChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#fbbf24');
    gradient.addColorStop(1, '#f97316');

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Tool cost',
            data,
            backgroundColor: gradient,
            borderRadius: 8,
            borderSkipped: false
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(148, 163, 184, 0.12)'
            }
          },
          y: {
            grid: { display: false },
          }
        }
      }
    };

    if (this.toolsChart) {
      this.toolsChart.data = config.data;
      this.toolsChart.options = config.options!;
      this.toolsChart.update();
    } else {
      this.toolsChart = new Chart(canvas, config);
    }
  }

  // Helpers
  budgetProgressPercent(data: CostAnalyticsData | null): number {
    if (!data || !data.budgetLimit) return 0;
    return Math.min(100, Math.round((data.currentSpend / data.budgetLimit) * 100));
  }

  euro(n: number | null | undefined): string {
    return Number(n || 0).toLocaleString('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    });
  }
}
