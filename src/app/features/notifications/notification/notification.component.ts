import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-notification',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './notification.component.html',
    styleUrl: './notification.component.scss'
})
export class NotificationComponent {
    notifications = [
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
            read: true,
            type: 'success'
        },
        {
            id: 4,
            title: 'System Update',
            message: 'System maintenance scheduled for tonight',
            time: '5 hours ago',
            read: true,
            type: 'error'
        }
    ];

    markAsRead(id: number) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
        }
    }

    clearAll() {
        this.notifications = [];
    }
}
