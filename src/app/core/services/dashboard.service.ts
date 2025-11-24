import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface DashboardStats {
    upcomingEvents: number;
    totalGuests: number;
    pendingTasks: number;
    completedTasks: number;
}

export interface RecentEvent {
    id: number;
    title: string;
    date: string;
    time: string;
    location: string;
    status: 'active' | 'planning' | 'completed';
    month: string;
    day: string;
}

export interface DashboardTask {
    id: number;
    title: string;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    getStats(): Observable<DashboardStats> {
        return of({
            upcomingEvents: 12,
            totalGuests: 145,
            pendingTasks: 8,
            completedTasks: 24
        }).pipe(delay(500));
    }

    getRecentEvents(): Observable<RecentEvent[]> {
        return of([
            {
                id: 1,
                title: 'Tech Conference 2025',
                date: 'Nov 25, 2025',
                time: '09:00 AM',
                location: 'San Francisco, CA',
                status: 'active',
                month: 'NOV',
                day: '25'
            },
            {
                id: 2,
                title: 'Holiday Gala',
                date: 'Dec 10, 2025',
                time: '07:00 PM',
                location: 'New York, NY',
                status: 'planning',
                month: 'DEC',
                day: '10'
            }
        ] as RecentEvent[]).pipe(delay(500));
    }

    getTasks(): Observable<DashboardTask[]> {
        return of([
            { id: 1, title: 'Confirm catering menu', priority: 'high', completed: false },
            { id: 2, title: 'Send invitations', priority: 'medium', completed: false },
            { id: 3, title: 'Book venue', priority: 'low', completed: true }
        ] as DashboardTask[]).pipe(delay(500));
    }
}
