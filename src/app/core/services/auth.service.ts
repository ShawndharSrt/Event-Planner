import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, delay, tap } from 'rxjs';

export interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: 'admin' | 'user';
    avatarUrl?: string;
    bio?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // Mock user data
    private readonly MOCK_USER: User = {
        id: '1',
        username: 'admin',
        email: 'admin@eventplanner.com',
        fullName: 'Admin User',
        role: 'admin',
        avatarUrl: 'assets/avatars/default-avatar.png', // Placeholder
        bio: 'Senior Event Planner with 10+ years of experience in corporate and wedding events.'
    };

    // State
    currentUser = signal<User | null>(null);
    isAuthenticated = signal<boolean>(false);

    constructor(private router: Router) {
        // Check local storage for existing session (mock persistence)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            this.currentUser.set(JSON.parse(storedUser));
            this.isAuthenticated.set(true);
        }
    }

    login(username: string, password: string): Observable<boolean> {
        // Mock login logic
        // For demo purposes, accept any username/password if username is 'admin'
        const isValid = username === 'admin' && password === 'password'; // Hardcoded for demo

        return of(isValid).pipe(
            delay(1000), // Simulate network delay
            tap(success => {
                if (success) {
                    this.currentUser.set(this.MOCK_USER);
                    this.isAuthenticated.set(true);
                    localStorage.setItem('user', JSON.stringify(this.MOCK_USER));
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

    updateProfile(updatedUser: Partial<User>): Observable<User> {
        const currentUser = this.currentUser();
        if (!currentUser) {
            throw new Error('No user logged in');
        }

        const newUser = { ...currentUser, ...updatedUser };

        return of(newUser).pipe(
            delay(800),
            tap(user => {
                this.currentUser.set(user);
                localStorage.setItem('user', JSON.stringify(user));
            })
        );
    }
}
