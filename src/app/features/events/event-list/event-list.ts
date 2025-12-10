import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EventService } from '../../../core/services/event.service';
import { Event } from '../../../core/models/event.model';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [RouterLink, CommonModule, MatIconModule],
  templateUrl: './event-list.html',
  styleUrl: './event-list.scss',
})
export class EventListComponent {
  private eventService = inject(EventService);
  events = toSignal(
    this.eventService.getEvents().pipe(
      map(response => response.data ?? [])
    ),
    { initialValue: [] as Event[] }
  );

  getRSVPPercentage(event: Event): number {
    if (!event.stats) return 0;

    const { totalGuests, confirmed, pending, declined } = event.stats;
    const responded = confirmed + declined;

    if (totalGuests === 0) return 0;

    const percentage = (responded / totalGuests) * 100;
    return Math.round(percentage);
  }
}
