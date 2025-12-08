import { Component, signal, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventTabsComponent, EventTab } from '../components/event-tabs/event-tabs.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { BudgetTrackerComponent } from '../../../features/budget/budget-tracker/budget-tracker.component';
import { GuestService } from '../../../core/services/guest.service';
import { EventGuest } from '../../../core/models/guest.model';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';

import { EventService } from '../../../core/services/event.service';
import { Event, TimelineItem, EventStats } from '../../../core/models/event.model';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, EventTabsComponent, DataTableComponent, BudgetTrackerComponent],
  templateUrl: './event-details.html',
  styleUrl: './event-details.scss',
})
export class EventDetailsComponent {
  private guestService = inject(GuestService);
  private taskService = inject(TaskService);
  private eventService = inject(EventService);
  privateroute = inject(ActivatedRoute);

  activeTab = signal<EventTab>('overview');

  // Get event ID from route
  eventId = toSignal(this.privateroute.paramMap.pipe(
    switchMap(params => [params.get('id') || ''])
  ));

  // Fetch event details based on ID
  event = toSignal(
    this.privateroute.paramMap.pipe(
      switchMap(params =>
        this.eventService
          .getEvent(params.get('id') || '')
          .pipe(map(response => response.data))
      )
    )
  );

  // Fetch guests and tasks based on dynamic ID
  guestData = toSignal(
    this.privateroute.paramMap.pipe(
      switchMap(params =>
        this.guestService
          .getGuests(params.get('id') || '')
          .pipe(map(response => response.data ?? []))
      )
    ),
    { initialValue: [] as EventGuest[] }
  );

  taskData = toSignal(
    this.privateroute.paramMap.pipe(
      switchMap(params =>
        this.taskService
          .getTasks(params.get('id') || '')
          .pipe(map(response => response.data ?? []))
      )
    ),
    { initialValue: [] as Task[] }
  );

  timeline = toSignal(
    this.privateroute.paramMap.pipe(
      switchMap(params =>
        this.eventService
          .getEventTimeline(params.get('id') || '')
          .pipe(map(response => response.data ?? []))
      )
    ),
    { initialValue: [] as TimelineItem[] }
  );



  stats = toSignal(
    this.privateroute.paramMap.pipe(
      switchMap(params =>
        this.eventService
          .getEventStats(params.get('id') || '')
          .pipe(map(response => response.data))
      )
    )
  );

  budgetSummary = toSignal(
    this.privateroute.paramMap.pipe(
      switchMap(params =>
        this.eventService
          .getEventBudgetSummary(params.get('id') || '')
          .pipe(map(response => response.data))
      )
    )
  );

  guestColumns: TableColumn[] = [
    { key: 'firstName', label: 'First Name', type: 'text' },
    { key: 'lastName', label: 'Last Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'group', label: 'Group', type: 'text' },
    { key: 'status', label: 'Status', type: 'status' }
  ];

  onTabChange(tab: EventTab) {
    this.activeTab.set(tab);
  }

  getBudgetPercentage(): number {
    const planned = this.budgetSummary()?.planned || 0;
    const actual = this.budgetSummary()?.actual || 0;

    if (planned === 0) return 0;

    const percentage = (actual / planned) * 100;
    return Math.min(Math.round(percentage), 100);
  }

  getVariance(): number {
    const planned = this.budgetSummary()?.planned || 0;
    const actual = this.budgetSummary()?.actual || 0;

    return planned - actual;
  }

  isOverBudget(): boolean {
    return this.getVariance() < 0;
  }

  getBudgetStatus(): string {
    const variance = this.getVariance();
    const planned = this.budgetSummary()?.planned || 0;

    if (planned === 0) return 'unknown';

    const percentageRemaining = (variance / planned) * 100;

    if (variance < 0) return 'over-budget';
    if (percentageRemaining < 10) return 'warning';
    return 'on-track';
  }

  getBudgetStatusText(): string {
    const status = this.getBudgetStatus();

    switch (status) {
      case 'over-budget':
        return 'Over Budget';
      case 'warning':
        return 'Nearly Spent';
      case 'on-track':
        return 'On Track';
      default:
        return 'Unknown';
    }
  }
}
