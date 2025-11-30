import { Component, signal, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventTabsComponent, EventTab } from '../components/event-tabs/event-tabs.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { BudgetTrackerComponent } from '../../../features/budget/budget-tracker/budget-tracker.component';
import { GuestService } from '../../../core/services/guest.service';
import { Guest } from '../../../core/models/guest.model';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';

import { EventService } from '../../../core/services/event.service';
import { Event, TimelineItem, TeamMember, EventStats } from '../../../core/models/event.model';
import { switchMap } from 'rxjs/operators';

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
    switchMap(params => [Number(params.get('id'))])
  ));

  // Fetch event details based on ID
  event = toSignal(
    this.privateroute.paramMap.pipe(
      switchMap(params => this.eventService.getEvent(Number(params.get('id'))))
    )
  );

  // Fetch guests and tasks based on dynamic ID
  guestData = toSignal(
    this.privateroute.paramMap.pipe(
      switchMap(params => this.guestService.getGuests(Number(params.get('id'))))
    ),
    { initialValue: [] as Guest[] }
  );

  taskData = toSignal(
    this.privateroute.paramMap.pipe(
      switchMap(params => this.taskService.getTasks(Number(params.get('id'))))
    ),
    { initialValue: [] as Task[] }
  );

  timeline = toSignal(
    this.privateroute.paramMap.pipe(
      switchMap(params => this.eventService.getEventTimeline(Number(params.get('id'))))
    ),
    { initialValue: [] as TimelineItem[] }
  );

  team = toSignal(
    this.privateroute.paramMap.pipe(
      switchMap(params => this.eventService.getEventTeam(Number(params.get('id'))))
    ),
    { initialValue: [] as TeamMember[] }
  );

  stats = toSignal(
    this.privateroute.paramMap.pipe(
      switchMap(params => this.eventService.getEventStats(Number(params.get('id'))))
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
}
