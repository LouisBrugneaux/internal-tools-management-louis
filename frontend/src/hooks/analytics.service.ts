import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface MonthlySpend {
    month: string;
    amount: number;
}

export interface DepartmentCost {
    department: string;
    amount: number;
}

export interface ToolCost {
    name: string;
    amount: number;
}

export interface CostAnalyticsData {
    monthlySpend: MonthlySpend[];
    departmentCosts: DepartmentCost[];
    topExpensiveTools: ToolCost[];
    budgetLimit: number;
    currentSpend: number;
}

export interface ToolAdoptionMetric {
    name: string;
    department: string;
    adoptionRate: number;
    trend: number;
}

export interface CostOptimizationAlert {
    name: string;
    monthlyCost: number;
    type: 'critical' | 'warning';
    reason: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
    private base = environment.apiUrl;

    constructor(private http: HttpClient) {}

    getCostAnalytics(): Observable<CostAnalyticsData> {
        return forkJoin({
            analytics: this.http.get<any>(`${this.base}/analytics`),
            tools: this.http.get<any[]>(`${this.base}/tools`)
        }).pipe(
            map(({ analytics, tools }) => {
                const budget_overview = analytics?.budget_overview ?? {};

                // Monthly Spend Evolution
                const currentTotal = Number(budget_overview.current_month_total ?? 0);
                const previousTotal = Number(budget_overview.previous_month_total ?? 0);

                const monthlySpend: MonthlySpend[] = [
                    { month: 'Previous month', amount: previousTotal },
                    { month: 'Current month', amount: currentTotal }
                ];

                // Department Cost Breakdown
                const deptMap: { [key: string]: number } = {};

                // Ajouter les coûts des tools
                for (let i = 0; i < tools.length; i++) {
                    const t = tools[i];
                    const dep = t.owner_department ?? 'Unknown';
                    const cost = Number(t.monthly_cost ?? 0);

                    if (!deptMap[dep]) {
                        deptMap[dep] = 0;
                    }

                    deptMap[dep] += cost;
                }

                // Convertir en array
                const departmentCosts: DepartmentCost[] = [];
                for (const dep in deptMap) {
                    departmentCosts.push({
                        department: dep,
                        amount: deptMap[dep]
                    });
                }

                // Top Expensive Tools
                const toolsCosts: ToolCost[] = [];

                for (let i = 0; i < tools.length; i++) {
                    const t = tools[i];

                    toolsCosts.push({
                        name: t.name ?? 'Unknown',
                        amount: Number(t.monthly_cost ?? 0)
                    });
                }

                // Trier + garder les 5 plus chers
                toolsCosts.sort((toolA, toolB) => toolB.amount - toolA.amount);

                const topExpensiveTools = toolsCosts.slice(0, 5);


                // Budget Progress
                const budgetLimit = Number(budget_overview.monthly_limit ?? 0);
                const currentSpend = currentTotal;

                return {
                    monthlySpend,
                    departmentCosts,
                    topExpensiveTools,
                    budgetLimit,
                    currentSpend,
                } as CostAnalyticsData;
            })
        );
    }

    getUsageAnalytics(): Observable<ToolAdoptionMetric[]> {
        return forkJoin({
            tools: this.http.get<any[]>(`${this.base}/tools`),
            analytics: this.http.get<any>(`${this.base}/analytics`),
            userTools: this.http.get<any[]>(`${this.base}/user_tools`)
        }).pipe(
            map(({ tools, analytics, userTools }) => {

                // Nombre total d’utilisateurs actifs
                const activeUsersTotal = Number(
                    analytics?.cost_analytics?.active_users ?? 1
                );

                // Grouper les user_tools par tool_id
                const usageMap: any = {};

                for (const ut of userTools) {
                    const toolId = ut.tool_id;
                    const userId = ut.user_id;

                    if (!usageMap[toolId]) {
                        usageMap[toolId] = [];
                    }

                    // ajouter seulement si pas déjà présent
                    if (!usageMap[toolId].includes(userId)) {
                        usageMap[toolId].push(userId);
                    }
                }

                // Construire la liste des métriques
                const metrics: ToolAdoptionMetric[] = tools.map(t => {
                    const toolId = t.id;
                    const usersUsingTool = usageMap[toolId]?.length ?? 0;

                    const adoptionRate = Math.round(
                        (usersUsingTool / activeUsersTotal) * 100
                    );

                    // Trend basé sur le coût
                    const monthly = Number(t.monthly_cost ?? 0);
                    const previous = Number(t.previous_month_cost ?? monthly);
                    const trend = previous ? Math.round(((monthly - previous) / previous) * 100) : 0;

                    return {
                        name: t.name ?? 'Unknown',
                        department: t.owner_department ?? 'Unknown',
                        adoptionRate,
                        trend
                    } as ToolAdoptionMetric;
                });

                // Trier du + adopté au - adopté
                metrics.sort((toolA, toolB) => toolB.adoptionRate - toolA.adoptionRate);

                return metrics;
            })
        );
    }

    getCostOptimizationAlerts(): Observable<CostOptimizationAlert[]> {
        return this.http.get<any[]>(`${this.base}/tools`).pipe(
            map(tools => {

                const alerts: CostOptimizationAlert[] = [];

                for (const t of tools) {
                    const name = t.name ?? 'Unknown';
                    const monthly = Number(t.monthly_cost ?? 0);
                    const previous = Number(t.previous_month_cost ?? monthly);

                    // Variation du coût
                    const trend = previous ? Math.round(((monthly - previous) / previous) * 100) : 0;

                    // On ignore les petits coûts (<200)
                    if (monthly < 200)
                        continue;

                    // Déterminer type + raison
                    let type: 'critical' | 'warning' = 'warning';
                    let reason = '';

                    if (monthly >= 1500) {
                        type = 'critical';
                        reason = 'High monthly spend detected; consider reviewing plan or usage.';
                    } else {
                        reason = 'Above-average cost compared to similar tools.';
                    }


                    if (trend > 10) {
                        reason += ' Cost is increasing month-over-month.';
                    } else if (trend < -10) {
                        reason += ' Cost is significantly decreasing month-over-month.';
                    }

                    alerts.push({
                        name,
                        monthlyCost: monthly,
                        type,
                        reason
                    });
                }

                // Tri final
                return alerts.sort((costA, costB) => costB.monthlyCost - costA.monthlyCost);
            })
        );
    }
}
