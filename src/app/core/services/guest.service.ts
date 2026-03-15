import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ApiResponse, Page } from '../models/api-response.model';
import { Guest, EventGuest } from '../models/guest.model';
import { Event } from '../models/event.model';

@Injectable({
    providedIn: 'root'
})
export class GuestService {
    private api = inject(ApiService);

    getGuests(eventId: string): Observable<ApiResponse<EventGuest[]>> {
        return forkJoin({
            eventRes: this.api.get<ApiResponse<Event>>(`/events/${eventId}`),
            guestsRes: this.api.get<ApiResponse<Guest[]>>('/guests')
        }).pipe(
            map(({ eventRes, guestsRes }) => {
                const event = eventRes.data;
                const allGuests = guestsRes.data;

                // Map embedded guests to full EventGuest objects
                const joinedGuests: EventGuest[] = (event.guests || []).map(eg => {
                    // Find the master guest record
                    // Handle both _id and guestId matching depending on what the API returns vs sample data
                    const masterGuest = allGuests.find(g => g._id === eg.guestId || g.guestId === eg.guestId);

                    // If we have master guest data, merge it. If not, rely on embedded data if possible (e.g. name)
                    // The user wants name to come from Guest firstName/lastName, which we did in sample-data
                    // But if we have the master guest, we should probably prefer its current fresh data?
                    // "value will be comes from Guest firstName and lastName" - implies derivation.
                    // But if it's stored in EventGuestList (as we just added), we can use it.

                    if (!masterGuest && !eg.name) return null;

                    const baseGuest = masterGuest || {
                        _id: eg.guestId,
                        guestId: eg.guestId,
                        firstName: eg.name ? eg.name.split(' ')[0] : 'Unknown',
                        lastName: eg.name ? eg.name.split(' ').slice(1).join(' ') : 'Guest',
                        email: '', // Missing if no master record
                    };

                    return {
                        ...baseGuest,
                        eventId: eventId,
                        name: eg.name || (masterGuest ? `${masterGuest.firstName} ${masterGuest.lastName}` : 'Unknown'), // Explicitly set name
                        status: eg.status,
                        group: eg.group,
                        dietary: eg.dietary,
                        notes: eg.notes
                    } as EventGuest;
                }).filter((g): g is EventGuest => g !== null);

                return {
                    success: true,
                    data: joinedGuests,
                    message: 'Guests retrieved successfully'
                };
            })
        );
    }

    getAllGuests(page: number = 0, size: number = 10): Observable<ApiResponse<Page<Guest>>> {
        return this.api.get<ApiResponse<Page<Guest>>>('/guests', { page, size });
    }

    addGuest(guest: Partial<EventGuest>): Observable<ApiResponse<EventGuest>> {
        return this.api.post<ApiResponse<EventGuest>>(`/events/${guest.eventId}/guests`, guest);
    }

    createGuest(guest: Partial<Guest>): Observable<ApiResponse<Guest>> {
        return this.api.post<ApiResponse<Guest>>('/guests', guest);
    }

    linkGuestsToEvent(eventId: string, guestIds: string[]): Observable<ApiResponse<void>> {
        return this.api.post<ApiResponse<void>>(`/events/${eventId}/guests`, { guestIds });
    }

    updateGuest(id: string, changes: Partial<EventGuest>): Observable<ApiResponse<EventGuest>> {
        if (changes.eventId) {
            return this.api.patch<ApiResponse<EventGuest>>(`/events/${changes.eventId}/guests/${id}`, changes);
        }
        return this.api.patch<ApiResponse<EventGuest>>(`/guests/${id}`, changes);
    }

    deleteGuest(id: string): Observable<ApiResponse<void>> {
        return this.api.delete<ApiResponse<void>>(`/guests/${id}`);
    }

    getGuestById(id: string): Observable<ApiResponse<EventGuest>> {
        return this.api.get<ApiResponse<EventGuest>>(`/guests/${id}`);
    }

    updateGuestsStatus(ids: string[], status: string): Observable<any> {
        const batchSize = 5;
        return new Observable(observer => {
            const chunks = [];
            for (let i = 0; i < ids.length; i += batchSize) {
                chunks.push(ids.slice(i, i + batchSize));
            }
            this.processChunks(chunks, status, observer);
        });
    }

    private processChunks(chunks: string[][], status: string, observer: any) {
        if (chunks.length === 0) {
            observer.next({ success: true });
            observer.complete();
            return;
        }

        const chunk = chunks.shift();
        if (!chunk) return;

        const tasks = chunk.map(id => this.updateGuest(id, { status: status as any }));

        forkJoin(tasks).subscribe({
            next: () => {
                this.processChunks(chunks, status, observer);
            },
            error: (err) => {
                observer.error(err);
            }
        });
    }
}
