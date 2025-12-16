import { Injectable, signal } from '@angular/core';
import { Notification } from '../models/notification.model';
import { delay, of, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    // Signal to hold the current list of notifications
    private notifications = signal<Notification[]>([]);
    readonly notifications$ = this.notifications.asReadonly();

    constructor() {
        this.loadNotifications();
    }

    loadNotifications() {
        // Mock data for now as per requirements to not hardcode in UI but service should provider
        // In a real app, this would be an API call.
        const mockNotifications: Notification[] = [
            {
                _id: '1',
                userId: 'u1',
                code: 'EVT_REQ',
                severity: 'INFO',
                triggerType: 'ONLINE',
                message: 'New Event Request from John Doe',
                read: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 min ago
            },
            {
                _id: '2',
                userId: 'u1',
                code: 'TASK_DUE',
                severity: 'WARNING',
                triggerType: 'OFFLINE',
                message: 'Catering arrangement task is due tomorrow',
                read: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
            },
            {
                _id: '3',
                userId: 'u1',
                code: 'SYS_ERR',
                severity: 'CRITICAL',
                triggerType: 'ONLINE',
                message: 'Database connection unstable',
                read: false,
                createdAt: new Date(Date.now() - 1000 * 30).toISOString(), // 30 sec ago
            },
            {
                _id: '4',
                userId: 'u1',
                code: 'PAY_DUE',
                severity: 'WARNING',
                triggerType: 'OFFLINE',
                message: 'Payment for Venue is pending',
                read: true,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            }
        ];

        // Simulate API delay
        of(mockNotifications).pipe(
            delay(500),
            tap(data => this.updateNotifications(data))
        ).subscribe();
    }

    private updateNotifications(newNotifications: Notification[]) {
        // Merge or set notifications
        // Apply sorting rules:
        // 1. CRITICAL -> WARNING -> INFO
        // 2. CreatedAt (Latest first)

        const sorted = [...newNotifications].sort((a, b) => {
            const severityOrder = { 'CRITICAL': 0, 'WARNING': 1, 'INFO': 2 };

            const scoreA = severityOrder[a.severity] ?? 99;
            const scoreB = severityOrder[b.severity] ?? 99;

            if (scoreA !== scoreB) {
                return scoreA - scoreB;
            }

            // If same severity, sort by createdAt desc
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        this.notifications.set(sorted);
    }

    markAsRead(id: string) {
        this.notifications.update(current =>
            current.map(n => n._id === id ? { ...n, read: true } : n)
        );
        // Call backend API here
    }

    markAllAsRead() {
        this.notifications.update(current =>
            current.map(n => ({ ...n, read: true }))
        );
        // Call backend API here
    }
}
