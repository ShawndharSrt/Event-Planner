import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { Task } from '../models/task.model';

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private api = inject(ApiService);

    getTasks(eventId: string): Observable<ApiResponse<Task[]>> {
        return this.api.get<ApiResponse<Task[]>>(`/tasks?eventId=${eventId}`);
    }

    addTask(task: Omit<Task, 'id'>): Observable<ApiResponse<Task>> {
        return this.api.post<ApiResponse<Task>>(`/tasks`, task);
    }

    updateTask(id: string, changes: Partial<Task>): Observable<ApiResponse<Task>> {
        return this.api.patch<ApiResponse<Task>>(`/tasks/${id}`, changes);
    }

    deleteTask(id: string): Observable<ApiResponse<void>> {
        return this.api.delete<ApiResponse<void>>(`/tasks/${id}`);
    }
}
