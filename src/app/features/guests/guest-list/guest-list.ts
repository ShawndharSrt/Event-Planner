import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GuestService } from '../../../core/services/guest.service';
import { Guest } from '../../../core/models/guest.model';
import { SnackbarService } from '../../../shared/services/snackbar.service';
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
  private refreshTrigger = new Subject<void>();

  guests = toSignal(
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

  editGuest(guest: Guest) {
    this.router.navigate(['/guests', guest._id, 'edit']);
  }

  deleteGuest(guest: Guest) {
    if (confirm(`Are you sure you want to delete ${guest.firstName} ${guest.lastName}?`)) {
      this.guestService.deleteGuest(guest._id).subscribe({
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
  }
}
