import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    fullName: string;
    role: string;
    bio?: string;
    avatarUrl?: string;
}

export interface UserStats {
    eventsCreated: number;
    tasksCompleted: number;
    guestsManaged: number;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {

    // private currentUser: UserProfile = {
    //     id: 1,
    //     username: 'johndoe',
    //     email: 'john.doe@example.com',
    //     fullName: 'John Doe',
    //     role: 'admin',
    //     bio: 'Event planning enthusiast with 5 years of experience.',
    //     avatarUrl: ''
    // };

    constructor(private api: ApiService) { }

    getUser(): Observable<ApiResponse<UserProfile>> {
        return this.api.get<ApiResponse<UserProfile>>('/users/me');
    }

    updateUser(changes: Partial<UserProfile>): Observable<ApiResponse<UserProfile>> {
        return this.api.patch<ApiResponse<UserProfile>>('/users/me', changes);
    }

    getUserStats(): Observable<ApiResponse<UserStats>> {
        return this.api.get<ApiResponse<UserStats>>('/users/me/stats');
    }
}
