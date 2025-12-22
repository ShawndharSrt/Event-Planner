import { Component, inject, signal, computed, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuestService } from '../../../core/services/guest.service';
import { Guest } from '../../../core/models/guest.model';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog.service';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { Subject, of } from 'rxjs';
import { switchMap, startWith, map, catchError } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-guest-list',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, DataTableComponent, MatIconModule],
  templateUrl: './guest-list.html',
  styleUrl: './guest-list.scss',
})
export class GuestListComponent {
  private guestService = inject(GuestService);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);
  private confirmationDialog = inject(ConfirmationDialogService);
  private refreshTrigger = new Subject<void>();

  // State Signals
  viewMode = signal<'table' | 'card'>('table');
  searchQuery = signal('');
  selectedGroup = signal('all');
  selectedStatus = signal('all');
  currentPage = signal(1);
  pageSize = signal(10);
  selectedGuests = signal<Set<Guest>>(new Set());

  // Data Source
  private allGuestsResource = toSignal(
    this.refreshTrigger.pipe(
      startWith(null),
      switchMap(() =>
        this.guestService.getAllGuests().pipe(
          map(response => {
            return response.data ?? [];
          }),
          catchError(err => {
            console.error('Error fetching guests:', err);
            return of([]);
          })
        )
      )
    ),
    { initialValue: [] as Guest[] }
  );


  // Derived State
  filteredGuests = computed(() => {
    let guests = this.allGuestsResource();
    const search = this.searchQuery().toLowerCase();
    const group = this.selectedGroup();
    const status = this.selectedStatus();

    // 1. Filter by Search
    if (search) {
      guests = guests.filter(g =>
        (g.firstName?.toLowerCase().includes(search) ?? false) ||
        (g.lastName?.toLowerCase().includes(search) ?? false) ||
        (g.email?.toLowerCase().includes(search) ?? false)
      );
    }

    // 2. Filter by Group
    if (group !== 'all') {
      guests = guests.filter(g => g.group === group);
    }

    // 3. Filter by Status
    if (status !== 'all') {
      guests = guests.filter(g => g.status === status);
    }

    return guests;
  });

  paginatedCardGuests = computed(() => {
    const guests = this.filteredGuests();
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return guests.slice(start, end);
  });

  totalItems = computed(() => this.filteredGuests().length);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  // Table Configuration
  tableColumns: TableColumn[] = [
    { key: 'firstName', label: 'First Name', sortable: true },
    { key: 'lastName', label: 'Last Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', sortable: false },
    { key: 'group', label: 'Group', type: 'status', sortable: true },
    { key: 'actions', label: 'Actions', type: 'actions' }
  ];

  tableActions: TableAction[] = [
    { name: 'edit', icon: 'edit', class: 'icon-btn', title: 'Edit' },
    { name: 'delete', icon: 'delete', class: 'icon-btn danger', title: 'Delete' }
  ];

  // Debug Effect
  constructor() {
    effect(() => {
      this.filteredGuests();
      this.paginatedCardGuests();
    });

    // Reset selection when filters change
    effect(() => {
      this.filteredGuests(); // dependency
      this.selectedGuests.set(new Set());
      this.currentPage.set(1); // Reset page on filter change
    }, { allowSignalWrites: true });
  }

  // Methods
  toggleView(mode: 'table' | 'card') {
    this.viewMode.set(mode);
  }

  handleTableAction(event: { action: string, row: Guest }) {
    if (event.action === 'edit') {
      this.editGuest(event.row);
    } else if (event.action === 'delete') {
      this.deleteGuest(event.row);
    }
  }

  handleSelectionChange(selected: Guest[]) {
    this.selectedGuests.set(new Set(selected));
  }

  editGuest(guest: Guest) {
    const guestId = guest.id || guest._id || guest.guestId;
    this.router.navigate(['/guests', guestId, 'edit']);
  }

  deleteGuest(guest: Guest) {
    const guestName = `${guest.firstName} ${guest.lastName}`;
    this.confirmationDialog
      .confirm(`Delete ${guestName}?`, 'Delete Guest', 'danger', 'Delete')
      .subscribe((confirmed) => {
        if (confirmed) {
          const guestId = guest.id || guest._id || guest.guestId;
          this.guestService.deleteGuest(guestId).subscribe({
            next: () => {
              this.snackbar.show('Guest deleted', 'success');
              this.refreshTrigger.next();
            },
            error: () => this.snackbar.show('Failed to delete', 'error')
          });
        }
      });
  }

  deleteSelected() {
    const selected = Array.from(this.selectedGuests());
    if (selected.length === 0) return;

    this.confirmationDialog
      .confirm(`Delete ${selected.length} guests?`, 'Bulk Delete', 'danger', 'Delete All')
      .subscribe((confirmed) => {
        if (confirmed) {
          // In a real app, use a bulk delete API. Here we'll just loop (or assuming service support).
          // Service doesn't have bulk delete. We will do parallel requests (limit concurrency in real app).
          // For now, sequentially or forkJoin.
          const ids = selected.map(g => g.id || g._id || g.guestId);
          // Assuming we want to just refresh once. 
          // We don't have a bulk API. We'll proceed with simple loop for now as per requirements "Bulk actions with checkbox selection" - implicit need for implementation.

          // Note: Ideally request backend team for bulk endpoint.
          // Implementing client-side loop for prototype.

          let successCount = 0;
          let completed = 0;

          ids.forEach(id => {
            this.guestService.deleteGuest(id).subscribe({
              next: () => successCount++,
              error: (err) => console.error(err),
              complete: () => {
                completed++;
                if (completed === ids.length) {
                  this.snackbar.show(`Deleted ${successCount} guests`, 'success');
                  this.refreshTrigger.next();
                  this.selectedGuests.set(new Set());
                }
              }
            });
          });
        }
      });
  }

  Math = Math;

  // Card View Pagination Methods
  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }
}

