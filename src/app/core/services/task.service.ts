import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { Task } from '../models/task.model';

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    // private tasks: Task[] = [
    //     { id: 1, eventId: 1, title: 'Book Venue', description: 'Finalize contract with Moscone Center', assignee: 'JD', dueDate: 'Nov 20', priority: 'high', status: 'todo' },
    //     { id: 2, eventId: 1, title: 'Catering Menu', description: 'Select lunch options for Day 1', assignee: 'AS', dueDate: 'Nov 25', priority: 'medium', status: 'todo' },
    //     { id: 3, eventId: 1, title: 'Swag Bags', description: 'Order t-shirts and stickers', assignee: 'MJ', dueDate: 'Dec 01', priority: 'low', status: 'todo' },
    //     { id: 4, eventId: 1, title: 'Speaker Invites', description: 'Send formal invitations to keynote speakers', assignee: 'JD', dueDate: 'Nov 22', priority: 'high', status: 'in-progress' },
    //     { id: 5, eventId: 1, title: 'Website Update', description: 'Publish agenda on the event website', assignee: 'AS', dueDate: 'Nov 23', priority: 'medium', status: 'in-progress' },
    //     { id: 6, eventId: 1, title: 'Initial Budget', description: 'Approve Q4 event budget', assignee: 'JD', dueDate: 'Done', priority: 'medium', status: 'done' },
    // ];

    constructor(private api: ApiService) { }

    getTasks(eventId: string): Observable<ApiResponse<Task[]>> {
        return this.api.get<ApiResponse<Task[]>>(`/tasks?eventId=${eventId}`);
    }

    addTask(task: Omit<Task, '_id'>): Observable<ApiResponse<Task>> {
        return this.api.post<ApiResponse<Task>>(`/tasks`, task);
    }

    updateTask(id: string, changes: Partial<Task>): Observable<ApiResponse<Task>> {
        return this.api.patch<ApiResponse<Task>>(`/tasks/${id}`, changes);
    }

    deleteTask(id: string): Observable<ApiResponse<void>> {
        return this.api.delete<ApiResponse<void>>(`/tasks/${id}`);
    }
}
