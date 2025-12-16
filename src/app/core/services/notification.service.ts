import { Injectable, signal } from '@angular/core';
import { Notification } from '../models/notification.model';
import { tap } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notifications = signal<Notification[]>([]);
    readonly notifications$ = this.notifications.asReadonly();

    constructor(private api: ApiService) {
        this.loadNotifications();
    }

    loadNotifications() {
        this.api.get<ApiResponse<Notification[]>>('/notifications').pipe(
            tap(response => {
                if (response.success && response.data) {
                    this.updateNotifications(response.data);
                }
            })
        ).subscribe({
            error: (error) => {
                console.error('Failed to load notifications:', error);
                // Optionally set empty array or handle error state
                this.updateNotifications([]);
            }
        });
    }

    private updateNotifications(newNotifications: Notification[]) {
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
        this.api.patch<ApiResponse<Notification>>(`/notifications/${id}`, { read: true }).subscribe({
            error: (error) => {
                console.error('Failed to mark notification as read:', error);
                this.notifications.update(current =>
                    current.map(n => n._id === id ? { ...n, read: false } : n)
                );
            }
        });
    }

    markAllAsRead() {
        // Store previous state for potential rollback
        const previousNotifications = this.notifications();

        // Optimistically update the UI
        this.notifications.update(current =>
            current.map(n => ({ ...n, read: true }))
        );

        // Call backend API
        this.api.patch<ApiResponse<void>>('/notifications/mark-all-read', {}).subscribe({
            error: (error) => {
                console.error('Failed to mark all notifications as read:', error);
                // Revert on error
                this.notifications.set(previousNotifications);
            }
        });
    }

}
