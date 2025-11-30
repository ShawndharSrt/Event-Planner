import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Guest } from '../models/guest.model';

@Injectable({
    providedIn: 'root'
})
export class GuestService {
    private guests: Guest[] = [
        { id: 1, eventId: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', group: 'vip', status: 'confirmed' },
        { id: 2, eventId: 1, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', group: 'speaker', status: 'confirmed' },
        { id: 3, eventId: 1, firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', group: 'attendee', status: 'pending' },
        { id: 4, eventId: 1, firstName: 'Alice', lastName: 'Brown', email: 'alice@example.com', group: 'sponsor', status: 'confirmed' },
        { id: 5, eventId: 1, firstName: 'Charlie', lastName: 'Davis', email: 'charlie@example.com', group: 'attendee', status: 'declined' },
        { id: 6, eventId: 1, firstName: 'Eva', lastName: 'Wilson', email: 'eva@example.com', group: 'vip', status: 'pending' },
        { id: 7, eventId: 1, firstName: 'Frank', lastName: 'Miller', email: 'frank@example.com', group: 'media', status: 'confirmed' },
        { id: 8, eventId: 1, firstName: 'Grace', lastName: 'Lee', email: 'grace@example.com', group: 'attendee', status: 'confirmed' },
        { id: 9, eventId: 1, firstName: 'Henry', lastName: 'Taylor', email: 'henry@example.com', group: 'speaker', status: 'pending' },
        { id: 10, eventId: 1, firstName: 'Ivy', lastName: 'Clark', email: 'ivy@example.com', group: 'attendee', status: 'confirmed' },
        { id: 11, eventId: 1, firstName: 'Jack', lastName: 'White', email: 'jack@example.com', group: 'sponsor', status: 'declined' },
        { id: 12, eventId: 1, firstName: 'Kelly', lastName: 'Green', email: 'kelly@example.com', group: 'vip', status: 'confirmed' }
    ];

    constructor(private api: ApiService) { }

    getGuests(eventId: number): Observable<Guest[]> {
        // return this.api.get<Guest[]>(`/events/${eventId}/guests`);
        const eventGuests = this.guests.filter(g => g.eventId === eventId);
        return of(eventGuests).pipe(delay(500));
    }

    getAllGuests(): Observable<Guest[]> {
        return of(this.guests).pipe(delay(500));
    }

    addGuest(guest: Omit<Guest, 'id'>): Observable<Guest> {
        // return this.api.post<Guest>(`/events/${guest.eventId}/guests`, guest);
        const newGuest = { ...guest, id: this.guests.length + 1 };
        this.guests.push(newGuest);
        return of(newGuest).pipe(delay(500));
    }

    updateGuest(id: number, changes: Partial<Guest>): Observable<Guest> {
        // return this.api.patch<Guest>(`/guests/${id}`, changes);
        const index = this.guests.findIndex(g => g.id === id);
        if (index !== -1) {
            this.guests[index] = { ...this.guests[index], ...changes };
            return of(this.guests[index]).pipe(delay(500));
        }
        throw new Error('Guest not found');
    }

    deleteGuest(id: number): Observable<void> {
        // return this.api.delete<void>(`/guests/${id}`);
        const index = this.guests.findIndex(g => g.id === id);
        if (index !== -1) {
            this.guests.splice(index, 1);
            return of(undefined).pipe(delay(500));
        }
        throw new Error('Guest not found');
    }

    getGuestById(id: number): Observable<Guest | undefined> {
        // return this.api.get<Guest>(`/guests/${id}`);
        const guest = this.guests.find(g => g.id === id);
        return of(guest).pipe(delay(500));
    }
}
