import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GuestService } from '../../../core/services/guest.service';
import { Guest } from '../../../core/models/guest.model';

@Component({
  selector: 'app-guest-list',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './guest-list.html',
  styleUrl: './guest-list.scss',
})
export class GuestListComponent {
  private guestService = inject(GuestService);
  guests = toSignal(this.guestService.getAllGuests(), { initialValue: [] as Guest[] });
}
