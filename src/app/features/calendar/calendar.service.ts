import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { CalendarItem, EventDropdownItem, CalendarView } from './calendar.models';
import { ApiResponse } from '../../core/models/api-response.model';

@Injectable({
    providedIn: 'root'
})
export class CalendarService {

    constructor(private api: ApiService) { }

    getEventsDropdown(): Observable<EventDropdownItem[]> {
        return this.api.get<ApiResponse<EventDropdownItem[]>>('/events/dropdown')
            .pipe(map(response => response.data));
    }

    getCalendarItems(
        viewType: CalendarView,
        startDate: string,
        endDate: string,
        eventId?: string
    ): Observable<CalendarItem[]> {
        let params = `?viewType=${viewType}&startDate=${startDate}&endDate=${endDate}`;
        if (eventId) {
            params += `&eventId=${eventId}`;
        }
        return this.api.get<ApiResponse<{ events: CalendarItem[], tasks: CalendarItem[] }>>(`/calendar${params}`)
            .pipe(map(response => {
                const { events, tasks } = response.data;
                // Merge events and tasks into a single array
                return [...(events || []), ...(tasks || [])];
            }));
    }
}
