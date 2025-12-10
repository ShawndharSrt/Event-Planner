import { Component, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GuestService } from '../../../core/services/guest.service';
import { Guest } from '../../../core/models/guest.model';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog.service';
import { Subject } from 'rxjs';
import { switchMap, startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-guest-list',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './guest-list.html',
  styleUrl: './guest-list.scss',
})
export class GuestListComponent {
  private guestService = inject(GuestService);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);
  private confirmationDialog = inject(ConfirmationDialogService);
  private refreshTrigger = new Subject<void>();

  selectedGroup = signal<string>('all');

  private allGuests = toSignal(
    this.refreshTrigger.pipe(
      startWith(null),
      switchMap(() =>
        this.guestService.getAllGuests().pipe(
          map(response => response.data ?? [])
        )
      )
    ),
    { initialValue: [] as Guest[] }
  );

  guests = computed(() => {
    const group = this.selectedGroup();
    const guestList = this.allGuests();

    if (group === 'all') {
      return guestList;
    }

    return guestList.filter(guest => guest.group === group);
  });

  filterByGroup(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedGroup.set(select.value);
  }

  editGuest(guest: Guest) {
    const guestId = guest.id || guest._id || guest.guestId;
    this.router.navigate(['/guests', guestId, 'edit']);
  }

  deleteGuest(guest: Guest) {
    const guestName = `${guest.firstName} ${guest.lastName}`;

    this.confirmationDialog
      .confirm(
        `Are you sure you want to delete ${guestName}?`,
        'Delete Guest',
        'danger',
        'Delete',
        'Cancel'
      )
      .subscribe((confirmed) => {
        if (confirmed) {
          // Use id field from API response
          const guestId = guest.id || guest._id || guest.guestId;

          this.guestService.deleteGuest(guestId).subscribe({
            next: () => {
              this.snackbar.show('Guest deleted successfully', 'success');
              this.refreshTrigger.next();
            },
            error: (error) => {
              this.snackbar.show('Failed to delete guest', 'error');
              console.error('Error deleting guest:', error);
            }
          });
        }
      });
  }
}
