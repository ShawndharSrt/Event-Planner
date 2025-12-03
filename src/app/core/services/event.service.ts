import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { Event, EventStats, TeamMember, TimelineItem } from '../models/event.model';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    // Mock Data
    // private events: Event[] = [
    //     {
    //         id: 1,
    //         title: 'Tech Conference 2025',
    //         type: 'conference',
    //         status: 'active',
    //         startDate: '2025-11-25',
    //         startTime: '09:00',
    //         endDate: '2025-11-27',
    //         endTime: '18:00',
    //         location: 'Moscone Center, San Francisco',
    //         description: 'The biggest tech conference of the year.'
    //     },
    //     {
    //         id: 2,
    //         title: 'Annual Company Retreat',
    //         type: 'meeting',
    //         status: 'planning',
    //         startDate: '2025-12-10',
    //         location: 'Lake Tahoe',
    //         description: 'Team building and strategy planning.'
    //     }
    // ];

    constructor(private api: ApiService) { }

    getEvents(): Observable<ApiResponse<Event[]>> {
        return this.api.get<ApiResponse<Event[]>>('/events');
    }

    getEvent(id: number): Observable<ApiResponse<Event>> {
        return this.api.get<ApiResponse<Event>>(`/events/${id}`);
    }

    createEvent(event: Omit<Event, 'id'>): Observable<ApiResponse<Event>> {
        return this.api.post<ApiResponse<Event>>('/events', event);
    }

    updateEvent(id: number, changes: Partial<Event>): Observable<ApiResponse<Event>> {
        return this.api.patch<ApiResponse<Event>>(`/events/${id}`, changes);
    }

    getEventStats(id: number): Observable<ApiResponse<EventStats>> {
        return this.api.get<ApiResponse<EventStats>>(`/events/${id}/stats`);
    }

    getEventTimeline(id: number): Observable<ApiResponse<TimelineItem[]>> {
        return this.api.get<ApiResponse<TimelineItem[]>>(`/events/${id}/timeline`);
    }

    getEventTeam(id: number): Observable<ApiResponse<TeamMember[]>> {
        return this.api.get<ApiResponse<TeamMember[]>>(`/events/${id}/team`);
    }
}
