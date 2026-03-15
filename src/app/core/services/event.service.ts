import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { Event, EventStats, TimelineItem, BudgetSummary } from '../models/event.model';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private api = inject(ApiService);

    getEvents(): Observable<ApiResponse<Event[]>> {
        return this.api.get<ApiResponse<Event[]>>('/events');
    }

    getEvent(id: string): Observable<ApiResponse<Event>> {
        return this.api.get<ApiResponse<Event>>(`/events/${id}`);
    }

    createEvent(event: Omit<Event, 'id'>): Observable<ApiResponse<Event>> {
        return this.api.post<ApiResponse<Event>>('/events', event);
    }

    updateEvent(id: string, changes: Partial<Event>): Observable<ApiResponse<Event>> {
        return this.api.patch<ApiResponse<Event>>(`/events/${id}`, changes);
    }

    getEventStats(id: string): Observable<ApiResponse<EventStats>> {
        return this.api.get<ApiResponse<EventStats>>(`/events/${id}/stats`);
    }

    getEventTimeline(id: string): Observable<ApiResponse<TimelineItem[]>> {
        return this.api.get<ApiResponse<TimelineItem[]>>(`/events/${id}/timeline`);
    }


    getEventBudgetSummary(id: string): Observable<ApiResponse<BudgetSummary>> {
        return this.api.get<ApiResponse<BudgetSummary>>(`/events/${id}/budget/summary`);
    }

    uploadGuests(eventId: string, file: File): Observable<ApiResponse<any>> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('eventId', eventId);
        return this.api.post<ApiResponse<any>>('/events/upload-guests', formData);
    }

    uploadCover(eventId: string, file: File): Observable<ApiResponse<any>> {
        const formData = new FormData();
        formData.append('file', file);
        return this.api.post<ApiResponse<any>>(`/events/${eventId}/upload-cover`, formData);
    }

    removeGuestFromEvents(eventId: string, guestId: string): Observable<ApiResponse<Event>> {
        return this.api.delete<ApiResponse<Event>>(`/events/${eventId}/guests/${guestId}`);
    }

}
