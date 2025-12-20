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
        console.log(`Auto-logout scheduled in ${expirationDuration} ms`);
        if (this.tokenTimer) {
            this.tokenTimer.unsubscribe();
        }

        this.tokenTimer = timer(expirationDuration).subscribe(() => {
            console.log('Auto-logout timer triggered. Logging out...');
            this.logout();
        });
    }

    private getTokenExpirationDate(token: string): Date | null {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);

            if (payload && payload.exp) {
                let exp = payload.exp;
                // Check if exp is in milliseconds (common backend error)
                // If exp is > 100,000,000,000 (11 digits), it's likely ms (current timestamps are ~1.7 trillion in ms, ~1.7 billion in s)
                if (exp > 100000000000) {
                    console.warn('WARNING: JWT "exp" claim appears to be in milliseconds. It should be in seconds. Treating as ms.');
                    exp = Math.floor(exp / 1000);
                }

                const expiry = new Date(exp * 1000);
                const now = new Date();
                console.log('Token Expiry:', expiry, 'Current Time:', now);
                console.log('Time until expiry:', (expiry.getTime() - now.getTime()) / 1000, 'seconds');
                return expiry;
            }
            return null;
        } catch (error) {
            console.error('Error decoding token:', error);
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
