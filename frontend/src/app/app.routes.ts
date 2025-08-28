import { Routes } from '@angular/router';
import {DashboardComponent} from '../pages/dashboard/dashboard.component';
import {ToolsComponent} from '../pages/tools/tools.component';
import {AnalyticsComponent} from '../pages/analytics/analytics.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'tools', component: ToolsComponent},
  { path: 'analytics', component: AnalyticsComponent},
];
