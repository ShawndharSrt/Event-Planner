import { Component, signal, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventTabsComponent, EventTab } from '../components/event-tabs/event-tabs.component';
import { DataTableComponent, TableColumn, TableConfig } from '../../../shared/components/data-table/data-table.component';
import { BudgetTrackerComponent } from '../../../features/budget/budget-tracker/budget-tracker.component';
import { GuestService } from '../../../core/services/guest.service';
import { Guest, EventGuest } from '../../../core/models/guest.model';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog.service';


import { EventService } from '../../../core/services/event.service';
import { Event, TimelineItem, EventStats, EventGuestList } from '../../../core/models/event.model';
import { switchMap, map } from 'rxjs/operators';
import { BehaviorSubject, combineLatest } from 'rxjs';

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
  private snackbar = inject(SnackbarService);
  private confirmationService = inject(ConfirmationDialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);


  isLinkGuestModalOpen = signal(false);
  commonGuests = signal<Guest[]>([]);
  selectedGuestIds = signal<Set<string>>(new Set());
  private refreshGuests$ = new BehaviorSubject<void>(undefined);

  activeTab = toSignal(
    this.route.queryParamMap.pipe(
      map(params => (params.get('tab') as EventTab) || 'overview')
    ),
    { initialValue: 'overview' as EventTab }
  );

  // Get event ID from route
  eventId = toSignal(this.route.paramMap.pipe(
    switchMap(params => [params.get('id') || ''])
  ));

  // Fetch event details based on ID and refresh trigger
  event = toSignal(
    combineLatest([
      this.route.paramMap,
      this.refreshGuests$
    ]).pipe(
      switchMap(([params]) =>
        this.eventService
          .getEvent(params.get('id') || '')
          .pipe(map(response => response.data))
      )
    )
  );

  // Guests are now derived from the event object
  guestData = computed(() => {
    const evt = this.event();
    return evt?.guests || [];
  });

  taskData = toSignal(
    this.route.paramMap.pipe(
      switchMap(params =>
        this.taskService
          .getTasks(params.get('id') || '')
          .pipe(map(response => response.data ?? []))
      )
    ),
    { initialValue: [] as Task[] }
  );

  timeline = toSignal(
    this.route.paramMap.pipe(
      switchMap(params =>
        this.eventService
          .getEventTimeline(params.get('id') || '')
          .pipe(map(response => response.data ?? []))
      )
    ),
    { initialValue: [] as TimelineItem[] }
  );

  stats = toSignal(
    combineLatest([
      this.route.paramMap,
      this.refreshGuests$
    ]).pipe(
      switchMap(([params]) =>
        this.eventService
          .getEventStats(params.get('id') || '')
          .pipe(map(response => response.data))
      )
    )
  );

  budgetSummary = toSignal(
    this.route.paramMap.pipe(
      switchMap(params =>
        this.eventService
          .getEventBudgetSummary(params.get('id') || '')
          .pipe(map(response => response.data))
      )
    )
  );

  guestColumns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'group', label: 'Group', type: 'text' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'actions', label: 'Actions', type: 'actions' }
  ];

  guestActions = [
    { name: 'delete', icon: 'delete', class: 'danger', title: 'Remove guest from event' }
  ];

  guestTableConfig: TableConfig = {
    showPagination: true,
    showActions: true,
    pageSizeOptions: [5, 10]
  };

  onTabChange(tab: EventTab) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
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



  openLinkGuestModal() {
    this.selectedGuestIds.set(new Set());
    this.guestService.getAllGuests().subscribe({
      next: (response) => {
        const allGuests = response.data || [];
        const currentGuests = this.guestData() || [];
        // Map current guests to simple IDs to check existence
        const currentGuestIds = new Set(currentGuests.map(g => g.guestId));

        const availableGuests = allGuests.filter(g => !currentGuestIds.has(g._id || g.guestId || g.id || ''));

        this.commonGuests.set(availableGuests);
        this.isLinkGuestModalOpen.set(true);
      },
      error: (err) => {
        console.error('Failed to fetch common guests', err);
        this.snackbar.show('Failed to fetch guests', 'error');
      }
    });
  }

  closeLinkGuestModal() {
    this.isLinkGuestModalOpen.set(false);
  }

  toggleGuestSelection(guestId: string) {
    const currentSelection = new Set(this.selectedGuestIds());
    if (currentSelection.has(guestId)) {
      currentSelection.delete(guestId);
    } else {
      currentSelection.add(guestId);
    }
    this.selectedGuestIds.set(currentSelection);
  }

  linkGuestColumns: TableColumn[] = [
    { key: 'firstName', label: 'First Name', type: 'text' },
    { key: 'lastName', label: 'Last Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' }
  ];

  updateGuestSelection(selectedGuests: Guest[]) {
    const ids = selectedGuests
      .map(g => g._id || g.guestId || g.id)
      .filter((id): id is string => !!id);
    this.selectedGuestIds.set(new Set(ids));
  }

  linkSelectedGuests() {
    const selectedIds = Array.from(this.selectedGuestIds());
    if (selectedIds.length === 0) return;

    this.guestService.linkGuestsToEvent(this.eventId() || '', selectedIds).subscribe({
      next: () => {
        this.snackbar.show('Guests linked successfully', 'success');
        this.refreshGuests$.next();
        this.closeLinkGuestModal();
      },
      error: (err) => {
        console.error('Failed to link guests', err);
        this.snackbar.show('Failed to link guests', 'error');
      }
    });
  }

  handleGuestAction(event: { action: string, row: any }) {
    if (event.action === 'delete') {
      this.deleteGuestFromEvent(event.row);
    }
  }

  deleteGuestFromEvent(guest: any) {
    const guestName = guest.name || 'this guest';
    this.confirmationService.confirm(
      `Are you sure you want to remove ${guestName} from this event?`,
      'Remove Guest',
      'danger',
      'Remove',
      'Cancel'
    ).subscribe((confirmed) => {
      if (confirmed) {
        // Use guestId from EventGuestList object
        const guestId = guest.guestId;

        if (!guestId) {
          this.snackbar.show('Invalid guest ID', 'error');
          console.error('Guest object missing guestId:', guest);
          return;
        }

        this.guestService.deleteGuest(guestId).subscribe({
          next: () => {
            this.snackbar.show('Guest removed from event successfully', 'success');
            this.refreshGuests$.next();
          },
          error: (err) => {
            console.error('Failed to remove guest from event', err);
            this.snackbar.show('Failed to remove guest from event', 'error');
          }
        });
      }
    });
  }
}
