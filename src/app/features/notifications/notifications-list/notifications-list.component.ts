import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'info' | 'warning' | 'success' | 'error';
}

@Component({
    selector: 'app-notifications-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './notifications-list.component.html',
    styleUrl: './notifications-list.component.scss'
})
export class NotificationsListComponent {
    router = inject(Router);

    notifications = signal<Notification[]>([
        {
            id: 1,
            title: 'New Event Request',
            message: 'John Doe requested a new event "Summer Party"',
            time: '10 min ago',
            read: false,
            type: 'info'
        },
        {
            id: 2,
            title: 'Task Deadline',
            message: 'Catering arrangement task is due tomorrow',
            time: '1 hour ago',
            read: false,
            type: 'warning'
        },
        {
            id: 3,
            title: 'Guest List Updated',
            message: 'Sarah Smith added 5 new guests',
            time: '2 hours ago',
            read: false,
            type: 'success'
        },
        {
            id: 4,
            title: 'System Update',
            message: 'System maintenance scheduled for tonight',
            time: '5 hours ago',
            read: true,
            type: 'error'
        },
        {
            id: 5,
            title: 'Budget Alert',
            message: 'Event "Corporate Gala" has exceeded 80% of budget',
            time: '1 day ago',
            read: true,
            type: 'warning'
        },
        {
            id: 6,
            title: 'New Guest RSVP',
            message: 'Michael Johnson confirmed attendance for "Tech Conference 2024"',
            time: '1 day ago',
            read: true,
            type: 'success'
        },
        {
            id: 7,
            title: 'Task Completed',
            message: 'Venue booking for "Annual Meeting" has been completed',
            time: '2 days ago',
            read: true,
            type: 'success'
        },
        {
            id: 8,
            title: 'Payment Due',
            message: 'Photography package payment is due in 3 days',
            time: '2 days ago',
            read: true,
            type: 'warning'
        }
    ]);

    unreadCount = signal(this.notifications().filter(n => !n.read).length);

    markAsRead(id: number) {
        this.notifications.update(notifs => {
            const notification = notifs.find(n => n.id === id);
            if (notification && !notification.read) {
                notification.read = true;
                this.unreadCount.update(count => count - 1);
            }
            return [...notifs];
        });
    }

    markAllAsRead() {
        this.notifications.update(notifs => {
            notifs.forEach(n => n.read = true);
            this.unreadCount.set(0);
            return [...notifs];
        });
    }

    deleteNotification(id: number) {
        this.notifications.update(notifs => {
            const notification = notifs.find(n => n.id === id);
            if (notification && !notification.read) {
                this.unreadCount.update(count => count - 1);
            }
            return notifs.filter(n => n.id !== id);
        });
    }

    clearAll() {
        this.notifications.set([]);
        this.unreadCount.set(0);
    }
}
