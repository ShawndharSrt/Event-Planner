import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  private destroyRef = inject(DestroyRef);

  stats = signal<DashboardStats>({ upcomingEvents: 0, totalGuests: 0, pendingTasks: 0, completedTasks: 0 });
  recentEvents = signal<RecentEvent[]>([]);
  tasks = signal<DashboardTask[]>([]);

  constructor() {
    this.dashboardService
      .getStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          console.log('DashboardComponent: Raw stats response:', response);
          const apiData = response.data;
          const mappedStats: DashboardStats = {
            upcomingEvents: apiData.totalEvents,
            totalGuests: apiData.totalGuests,
            pendingTasks: apiData.totalTasks,
            completedTasks: 0
          };
          console.log('DashboardComponent: Mapped stats data:', mappedStats);
          this.stats.set(mappedStats);
        },
        error: (error) => {
          console.error('DashboardComponent: Error getting stats:', error);
          console.error('Error status:', error?.status);
          console.error('Error message:', error?.message);
          console.error('Error body:', error?.error);
        }
      });

    this.dashboardService
      .getRecentEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          console.log('DashboardComponent: Raw recent events response:', response);
          const events = response.data ?? [];
          this.recentEvents.set(events);
          console.log('DashboardComponent: Parsed recent events:', events);
        },
        error: (error) => {
          console.error('DashboardComponent: Error getting recent events:', error);
        }
      });

    this.dashboardService
      .getTasks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          console.log('DashboardComponent: Raw tasks response:', response);
          const tasks = response.data ?? [];
          this.tasks.set(tasks);
          console.log('DashboardComponent: Parsed tasks:', tasks);
        },
        error: (error) => {
          console.error('DashboardComponent: Error getting tasks:', error);
        }
      });

    // Log API response when stats are received
    effect(() => {
      const statsValue = this.stats();
      console.log('Dashboard Stats Signal Value:', statsValue);
    });

    // Log recent events when received
    effect(() => {
      const eventsValue = this.recentEvents();
      console.log('Recent Events API Response:', eventsValue);
    });

    // Log tasks when received
    effect(() => {
      const tasksValue = this.tasks();
      console.log('Tasks API Response:', tasksValue);
    });
  }
}
