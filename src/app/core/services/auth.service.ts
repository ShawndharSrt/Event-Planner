import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { User } from '../models/user.model';

export interface RegisterPayload extends Partial<User> {
    password?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // State
    currentUser = signal<User | null>(null);
    isAuthenticated = signal<boolean>(false);

    constructor(private router: Router, private api: ApiService) {
        // Check local storage for existing session (mock persistence)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            this.currentUser.set(JSON.parse(storedUser));
            this.isAuthenticated.set(true);
        }
    }

    login(email: string, password: string): Observable<ApiResponse<User>> {
        return this.api.post<ApiResponse<User>>('/auth/login', { email, password }).pipe(
            tap(response => {
                const user = response.data;
                if (user) {
                    this.currentUser.set(user);
                    this.isAuthenticated.set(true);
                    localStorage.setItem('user', JSON.stringify(user));
                }
            })
        );
    }

    register(user: RegisterPayload): Observable<ApiResponse<User>> {
        return this.api.post<ApiResponse<User>>('/auth/register', user).pipe(
            tap(response => {
                const newUser = response.data;
                if (newUser) {
                    this.currentUser.set(newUser);
                    this.isAuthenticated.set(true);
                    localStorage.setItem('user', JSON.stringify(newUser));
                }
            })
        );
    }

    logout(): void {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
    }

    updateProfile(updatedUser: Partial<User>): Observable<ApiResponse<User>> {
        const currentUser = this.currentUser();
        if (!currentUser) {
            throw new Error('No user logged in');
        }

        return this.api.patch<ApiResponse<User>>(`/users/${currentUser._id}`, updatedUser).pipe(
            tap(response => {
                const user = response.data;
                if (user) {
                    this.currentUser.set(user);
                    localStorage.setItem('user', JSON.stringify(user));
                }
            })
        );
    }
}
