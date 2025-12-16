import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-notifications-list',
    standalone: true,
    imports: [CommonModule, DatePipe],
    templateUrl: './notifications-list.component.html',
    styleUrl: './notifications-list.component.scss'
})
export class NotificationsListComponent {
    private notificationService = inject(NotificationService);
    router = inject(Router);

    notifications = this.notificationService.notifications$;

    unreadCount = computed(() =>
        this.notifications().filter(n => !n.read).length
    );

    markAsRead(id: string, event: MouseEvent) {
        event.stopPropagation();
        this.notificationService.markAsRead(id);
    }

    markAllAsRead() {
        this.notificationService.markAllAsRead();
    }
}
