import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, timer, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
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
    private router = inject(Router);
    private api = inject(ApiService);

    // State
    private _currentUser = signal<User | null>(null);
    private _isAuthenticated = signal<boolean>(false);

    readonly currentUser = this._currentUser.asReadonly();
    readonly isAuthenticated = this._isAuthenticated.asReadonly();

    private tokenTimer: Subscription | null = null;

    constructor() {
        this.performAutoLogin();
    }

    private performAutoLogin() {
        const token = this.getToken();
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            const expiry = this.getTokenExpirationDate(token);
            const now = new Date();

            if (expiry && expiry > now) {
                this._currentUser.set(JSON.parse(storedUser));
                this._isAuthenticated.set(true);
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


    forgotPassword(email: string): Observable<ApiResponse<string>> {
        return this.api.post<ApiResponse<string>>(`/auth/forgot-password?email=${encodeURIComponent(email)}`, null);
    }

    logout(): void {
        this._currentUser.set(null);
        this._isAuthenticated.set(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('expires_at');

        if (this.tokenTimer) {
            this.tokenTimer.unsubscribe();
            this.tokenTimer = null;
        }

        this.router.navigate(['/home']);
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

        this._currentUser.set(user);
        this._isAuthenticated.set(true);

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
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);

            if (payload && payload.exp) {
                let exp = payload.exp;
                // If exp > 100,000,000,000 (11 digits), it's in milliseconds — normalize to seconds
                if (exp > 100000000000) {
                    exp = Math.floor(exp / 1000);
                }
                return new Date(exp * 1000);
            }
            return null;
        } catch {
            return null;
        }
    }

    updateProfile(updatedUser: Partial<User>): Observable<ApiResponse<User>> {
        const currentUser = this._currentUser();
        if (!currentUser) {
            throw new Error('No user logged in');
        }

        return this.api.patch<ApiResponse<User>>(`/users/${currentUser._id}`, updatedUser).pipe(
            tap(response => {
                const user = response.data;
                if (user) {
                    this._currentUser.set(user);
                    localStorage.setItem('user', JSON.stringify(user));
                }
            })
        );
    }
}
