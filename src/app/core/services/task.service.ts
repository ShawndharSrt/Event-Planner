import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Task } from '../models/task.model';

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private tasks: Task[] = [
        { id: 1, eventId: 1, title: 'Book Venue', description: 'Finalize contract with Moscone Center', assignee: 'JD', dueDate: 'Nov 20', priority: 'high', status: 'todo' },
        { id: 2, eventId: 1, title: 'Catering Menu', description: 'Select lunch options for Day 1', assignee: 'AS', dueDate: 'Nov 25', priority: 'medium', status: 'todo' },
        { id: 3, eventId: 1, title: 'Swag Bags', description: 'Order t-shirts and stickers', assignee: 'MJ', dueDate: 'Dec 01', priority: 'low', status: 'todo' },
        { id: 4, eventId: 1, title: 'Speaker Invites', description: 'Send formal invitations to keynote speakers', assignee: 'JD', dueDate: 'Nov 22', priority: 'high', status: 'in-progress' },
        { id: 5, eventId: 1, title: 'Website Update', description: 'Publish agenda on the event website', assignee: 'AS', dueDate: 'Nov 23', priority: 'medium', status: 'in-progress' },
        { id: 6, eventId: 1, title: 'Initial Budget', description: 'Approve Q4 event budget', assignee: 'JD', dueDate: 'Done', priority: 'medium', status: 'done' },
    ];

    constructor(private api: ApiService) { }

    getTasks(eventId: number): Observable<Task[]> {
        // return this.api.get<Task[]>(`/events/${eventId}/tasks`);
        const eventTasks = this.tasks.filter(t => t.eventId === eventId);
        return of(eventTasks).pipe(delay(500));
    }

    addTask(task: Omit<Task, 'id'>): Observable<Task> {
        // return this.api.post<Task>(`/events/${task.eventId}/tasks`, task);
        const newTask = { ...task, id: this.tasks.length + 1 };
        this.tasks.push(newTask);
        return of(newTask).pipe(delay(500));
    }

    updateTask(id: number, changes: Partial<Task>): Observable<Task> {
        // return this.api.patch<Task>(`/tasks/${id}`, changes);
        const index = this.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            this.tasks[index] = { ...this.tasks[index], ...changes };
            return of(this.tasks[index]).pipe(delay(500));
        }
        throw new Error('Task not found');
    }
}
