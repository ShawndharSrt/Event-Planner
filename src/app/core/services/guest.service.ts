import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { Guest } from '../models/guest.model';

@Injectable({
    providedIn: 'root'
})
export class GuestService {
    // private guests: Guest[] = [
    //     { id: 1, eventId: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', group: 'vip', status: 'confirmed' },
    //     { id: 2, eventId: 1, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', group: 'speaker', status: 'confirmed' },
    //     { id: 3, eventId: 1, firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', group: 'attendee', status: 'pending' },
    //     { id: 4, eventId: 1, firstName: 'Alice', lastName: 'Brown', email: 'alice@example.com', group: 'sponsor', status: 'confirmed' },
    //     { id: 5, eventId: 1, firstName: 'Charlie', lastName: 'Davis', email: 'charlie@example.com', group: 'attendee', status: 'declined' },
    //     { id: 6, eventId: 1, firstName: 'Eva', lastName: 'Wilson', email: 'eva@example.com', group: 'vip', status: 'pending' },
    //     { id: 7, eventId: 1, firstName: 'Frank', lastName: 'Miller', email: 'frank@example.com', group: 'media', status: 'confirmed' },
    //     { id: 8, eventId: 1, firstName: 'Grace', lastName: 'Lee', email: 'grace@example.com', group: 'attendee', status: 'confirmed' },
    //     { id: 9, eventId: 1, firstName: 'Henry', lastName: 'Taylor', email: 'henry@example.com', group: 'speaker', status: 'pending' },
    //     { id: 10, eventId: 1, firstName: 'Ivy', lastName: 'Clark', email: 'ivy@example.com', group: 'attendee', status: 'confirmed' },
    //     { id: 11, eventId: 1, firstName: 'Jack', lastName: 'White', email: 'jack@example.com', group: 'sponsor', status: 'declined' },
    //     { id: 12, eventId: 1, firstName: 'Kelly', lastName: 'Green', email: 'kelly@example.com', group: 'vip', status: 'confirmed' }
    // ];

    constructor(private api: ApiService) { }

    getGuests(eventId: number): Observable<ApiResponse<Guest[]>> {
        return this.api.get<ApiResponse<Guest[]>>(`/events/${eventId}/guests`);
    }

    getAllGuests(): Observable<ApiResponse<Guest[]>> {
        return this.api.get<ApiResponse<Guest[]>>('/guests');
    }

    addGuest(guest: Omit<Guest, 'id'>): Observable<ApiResponse<Guest>> {
        return this.api.post<ApiResponse<Guest>>(`/events/${guest.eventId}/guests`, guest);
    }

    updateGuest(id: number, changes: Partial<Guest>): Observable<ApiResponse<Guest>> {
        return this.api.patch<ApiResponse<Guest>>(`/guests/${id}`, changes);
    }

    deleteGuest(id: number): Observable<ApiResponse<void>> {
        return this.api.delete<ApiResponse<void>>(`/guests/${id}`);
    }

    getGuestById(id: number): Observable<ApiResponse<Guest>> {
        return this.api.get<ApiResponse<Guest>>(`/guests/${id}`);
    }
}
