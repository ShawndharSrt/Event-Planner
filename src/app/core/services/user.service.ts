import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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

    private currentUser: UserProfile = {
        id: 1,
        username: 'johndoe',
        email: 'john.doe@example.com',
        fullName: 'John Doe',
        role: 'admin',
        bio: 'Event planning enthusiast with 5 years of experience.',
        avatarUrl: ''
    };

    getUser(): Observable<UserProfile> {
        return of(this.currentUser).pipe(delay(500));
    }

    updateUser(changes: Partial<UserProfile>): Observable<UserProfile> {
        this.currentUser = { ...this.currentUser, ...changes };
        return of(this.currentUser).pipe(delay(500));
    }

    getUserStats(): Observable<UserStats> {
        return of({
            eventsCreated: 12,
            tasksCompleted: 48,
            guestsManaged: 156
        }).pipe(delay(500));
    }
}
