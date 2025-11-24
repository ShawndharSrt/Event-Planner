import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Event, EventStats, TeamMember, TimelineItem } from '../models/event.model';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    // Mock Data
    private events: Event[] = [
        {
            id: 1,
            title: 'Tech Conference 2025',
            type: 'conference',
            status: 'active',
            startDate: '2025-11-25',
            startTime: '09:00',
            endDate: '2025-11-27',
            endTime: '18:00',
            location: 'Moscone Center, San Francisco',
            description: 'The biggest tech conference of the year.'
        },
        {
            id: 2,
            title: 'Annual Company Retreat',
            type: 'meeting',
            status: 'planning',
            startDate: '2025-12-10',
            location: 'Lake Tahoe',
            description: 'Team building and strategy planning.'
        }
    ];

    constructor(private api: ApiService) { }

    getEvents(): Observable<Event[]> {
        // return this.api.get<Event[]>('/events');
        return of(this.events).pipe(delay(500));
    }

    getEvent(id: number): Observable<Event | undefined> {
        // return this.api.get<Event>(`/events/${id}`);
        const event = this.events.find(e => e.id === id);
        return of(event).pipe(delay(500));
    }

    createEvent(event: Omit<Event, 'id'>): Observable<Event> {
        // return this.api.post<Event>('/events', event);
        const newEvent = { ...event, id: this.events.length + 1 };
        this.events.push(newEvent);
        return of(newEvent).pipe(delay(500));
    }

    updateEvent(id: number, changes: Partial<Event>): Observable<Event> {
        // return this.api.patch<Event>(`/events/${id}`, changes);
        const index = this.events.findIndex(e => e.id === id);
        if (index !== -1) {
            this.events[index] = { ...this.events[index], ...changes };
            return of(this.events[index]).pipe(delay(500));
        }
        throw new Error('Event not found');
    }

    getEventStats(id: number): Observable<EventStats> {
        // Mock logic based on ID
        if (id === 1) {
            return of({ totalGuests: 1200, confirmed: 850, pending: 350, declined: 50 }).pipe(delay(500));
        }
        return of({ totalGuests: 350, confirmed: 150, pending: 180, declined: 20 }).pipe(delay(500));
    }

    getEventTimeline(id: number): Observable<TimelineItem[]> {
        if (id === 1) {
            return of([
                { time: '09:00 AM', title: 'Registration & Breakfast', location: 'Main Hall Lobby' },
                { time: '10:00 AM', title: 'Opening Keynote', location: 'Auditorium A' },
                { time: '12:00 PM', title: 'Lunch Break', location: 'Cafeteria' }
            ]).pipe(delay(500));
        }
        return of([
            { time: '07:00 PM', title: 'Welcome Drinks', location: 'Lobby' },
            { time: '08:00 PM', title: 'Dinner Served', location: 'Main Hall' }
        ]).pipe(delay(500));
    }

    getEventTeam(id: number): Observable<TeamMember[]> {
        return of([
            { name: 'John Doe', role: 'Lead Organizer', avatar: 'JD' },
            { name: 'Alice Smith', role: 'Coordinator', avatar: 'AS', isSecondary: true }
        ]).pipe(delay(500));
    }
}
