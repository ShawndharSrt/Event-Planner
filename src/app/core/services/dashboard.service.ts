import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';

export interface DashboardStats {
    upcomingEvents: number;
    totalGuests: number;
    pendingTasks: number;
    completedTasks: number;
}

// API response structure
export interface DashboardOverviewResponse {
    totalEvents: number;
    totalGuests: number;
    totalTasks: number;
    completedTasks: number;
}

export interface RecentEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    status: 'active' | 'planning' | 'completed';
    month: string;
    day: string;
}

export interface DashboardTask {
    id: string;
    title: string;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    constructor(private api: ApiService) { }

    getStats(): Observable<ApiResponse<DashboardOverviewResponse>> {
        return this.api.get<ApiResponse<DashboardOverviewResponse>>('/dashboard/overview');
    }

    getRecentEvents(): Observable<ApiResponse<RecentEvent[]>> {
        return this.api.get<ApiResponse<RecentEvent[]>>('/dashboard/recent-events');
    }

    getTasks(): Observable<ApiResponse<DashboardTask[]>> {
        return this.api.get<ApiResponse<DashboardTask[]>>('/dashboard/tasks');
    }
}
