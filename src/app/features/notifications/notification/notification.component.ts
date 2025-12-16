import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-notification',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './notification.component.html',
    styleUrl: './notification.component.scss'
})
export class NotificationComponent {
    private notificationService = inject(NotificationService);

    // Show only first 5 in dropdown usually, but requirements didn't say. 
    // Let's just show standard list properly sorted.
    notifications = this.notificationService.notifications$;

    markAsRead(id: string, event: MouseEvent) {
        event.stopPropagation();
        this.notificationService.markAsRead(id);
    }

    markAllAsRead() {
        this.notificationService.markAllAsRead();
    }
}

