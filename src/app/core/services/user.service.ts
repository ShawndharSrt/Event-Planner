import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { User } from '../models/user.model';

export interface UserStats {
    eventsCreated: number;
    tasksCompleted: number;
    guestsManaged: number;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(private api: ApiService) { }

    getUser(): Observable<ApiResponse<User>> {
        return this.api.get<ApiResponse<User>>('/users/me');
    }

    updateUser(changes: Partial<User>): Observable<ApiResponse<User>> {
        return this.api.patch<ApiResponse<User>>('/users/me', changes);
    }

    getUserStats(): Observable<ApiResponse<UserStats>> {
        return this.api.get<ApiResponse<UserStats>>('/users/me/stats');
    }
}
