import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
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

  // Computed task progress
  taskProgressPercent = computed(() => {
    const s = this.stats();
    const total = s.completedTasks + s.pendingTasks;
    if (total === 0) return 0;
    return Math.round((s.completedTasks / total) * 100);
  });

  // SVG dash for donut (circumference = 2 * PI * 30 ≈ 188.5)
  taskProgressDash = computed(() => {
    return Math.round((this.taskProgressPercent() / 100) * 188.5);
  });

  // Guest breakdown (fallback: split evenly if no breakdown from API)
  pendingGuests = computed(() => {
    const total = this.stats().totalGuests;
    return Math.ceil(total / 2);
  });

  confirmedGuests = computed(() => {
    const total = this.stats().totalGuests;
    return Math.floor(total / 2);
  });

  constructor() {
    this.dashboardService
      .getStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const apiData = response.data;
          const mappedStats: DashboardStats = {
            upcomingEvents: apiData.totalEvents,
            totalGuests: apiData.totalGuests,
            pendingTasks: apiData.totalTasks - apiData.completedTasks,
            completedTasks: apiData.completedTasks
          };
          this.stats.set(mappedStats);
        },
        error: (error) => {
          console.error('DashboardComponent: Error getting stats:', error);
        }
      });

    this.dashboardService
      .getRecentEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const events = response.data ?? [];
          this.recentEvents.set(events);
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
          const tasks = response.data ?? [];
          this.tasks.set(tasks);
        },
        error: (error) => {
          console.error('DashboardComponent: Error getting tasks:', error);
        }
      });
  }

  /**
   * Format event title: makes the last word bold like in the screenshot
   * e.g. "Company Product Launch" → "Company <strong>Product Launch</strong>"
   */
  formatEventTitle(title: string): string {
    if (!title) return '';
    const words = title.split(' ');
    if (words.length <= 1) return `<strong>${title}</strong>`;
    const first = words.slice(0, words.length - 1).join(' ');
    const last = words[words.length - 1];
    return `${first} <strong>${last}</strong>`;
  }
}
