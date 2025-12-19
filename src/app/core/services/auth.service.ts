import { Injectable, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, timer, Subscription, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { User } from '../models/user.model';

export interface RegisterPayload extends Partial<User> {
    firstName?: string;
    lastName?: string;
    password?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // State
    currentUser = signal<User | null>(null);
    isAuthenticated = signal<boolean>(false);

    private tokenTimer: Subscription | null = null;

    constructor(private router: Router, private api: ApiService) {
        this.performAutoLogin();
    }

    private performAutoLogin() {
        const token = this.getToken();
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            const expiry = this.getTokenExpirationDate(token);
            const now = new Date();

            if (expiry && expiry > now) {
                this.currentUser.set(JSON.parse(storedUser));
                this.isAuthenticated.set(true);
                this.autoLogout(expiry.getTime() - now.getTime());
            } else {
                this.logout();
            }
        }
    }

    login(email: string, password: string): Observable<ApiResponse<AuthResponse>> {
        return this.api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password }).pipe(
            tap(response => {
                if (response.success && response.data) {
                    this.setSession(response.data);
                }
            })
        );
    }

    register(user: RegisterPayload): Observable<ApiResponse<AuthResponse>> {
        return this.api.post<ApiResponse<AuthResponse>>('/auth/signup', user).pipe(
            tap(response => {
                if (response.success && response.data) {
                    this.setSession(response.data);
                }
            })
        );
    }

    logout(): void {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('expires_at');

        if (this.tokenTimer) {
            this.tokenTimer.unsubscribe();
            this.tokenTimer = null;
        }

        this.router.navigate(['/login']);
    }

    // Helper methods
    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isLoggedIn(): boolean {
        const token = this.getToken();
        if (!token) return false;

        const expiry = this.getTokenExpirationDate(token);
        const isExpired = expiry ? expiry <= new Date() : true;

        return !isExpired;
    }

    private setSession(authResult: AuthResponse): void {
        const { user, token } = authResult;

        this.currentUser.set(user);
        this.isAuthenticated.set(true);

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Calculate expiration from token
        const expiry = this.getTokenExpirationDate(token);
        if (expiry) {
            const now = new Date();
            const expiresIn = expiry.getTime() - now.getTime();
            this.autoLogout(expiresIn);
            localStorage.setItem('expires_at', expiry.toISOString());
        }
    }

    private autoLogout(expirationDuration: number): void {
        if (this.tokenTimer) {
            this.tokenTimer.unsubscribe();
        }

        this.tokenTimer = timer(expirationDuration).subscribe(() => {
            this.logout();
        });
    }

    private getTokenExpirationDate(token: string): Date | null {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload && payload.exp) {
                return new Date(payload.exp * 1000);
            }
            return null;
        } catch {
            return null;
        }
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
