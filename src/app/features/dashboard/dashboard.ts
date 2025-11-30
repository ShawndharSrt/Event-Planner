import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats, RecentEvent, DashboardTask } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  private dashboardService: DashboardService = inject(DashboardService);

  stats = toSignal(this.dashboardService.getStats(), {
    initialValue: { upcomingEvents: 0, totalGuests: 0, pendingTasks: 0, completedTasks: 0 }
  });
  recentEvents = toSignal(this.dashboardService.getRecentEvents(), { initialValue: [] as RecentEvent[] });
  tasks = toSignal(this.dashboardService.getTasks(), { initialValue: [] as DashboardTask[] });
}
