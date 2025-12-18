import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationCardComponent } from '../notification-card/notification-card.component';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, NotificationCardComponent],
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent {
  private notificationService = inject(NotificationService);

  notifications = this.notificationService.notifications$;

  unreadCount = computed(() =>
    this.notifications().filter(n => !n.read).length
  );

  markAsRead(id: string) {
    this.notificationService.markAsRead(id);
  }

  markAllRead() {
    this.notificationService.markAllAsRead();
  }
}
