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
  template: `
    <div class="notification-page">
      <!-- Sticky Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="title-group">
            <h1>Notifications</h1>
            @if (unreadCount() > 0) {
              <span class="badge">{{ unreadCount() }} New</span>
            }
          </div>
          
          <button mat-stroked-button color="primary" (click)="markAllRead()" [disabled]="unreadCount() === 0">
            <mat-icon>done_all</mat-icon>
            Mark all read
          </button>
        </div>
      </header>

      <!-- Scrollable List -->
      <div class="list-container">
        @if (notifications().length === 0) {
          <div class="empty-state">
            <mat-icon>notifications_off</mat-icon>
            <p>No notifications yet</p>
          </div>
        } @else {
          <div class="cards-wrapper">
            @for (notification of notifications(); track notification._id) {
              <app-notification-card 
                [notification]="notification"
                (markRead)="markAsRead($event)">
              </app-notification-card>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      overflow: hidden;
      background: #f8f9fc; /* Light mode bg fallback */
    }

    /* Dark mode background override if supported by global styles, 
       otherwise relying on parent container or media query */
    @media (prefers-color-scheme: dark) {
      :host {
        background: #121212;
      }
    }

    .notification-page {
      display: flex;
      flex-direction: column;
      height: 100%;
      max-width: 600px; /* Constrain width for better readability on large screens */
      margin: 0 auto;
      padding: 0 16px;
    }

    .page-header {
      padding: 24px 0 16px;
      position: sticky;
      top: 0;
      z-index: 10;
      background: transparent; /* Let gradients shine through if we had them */
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      /* Glassmorphism for header if scrolling under? 
         For now keeping it clean/transparent or solid if needed. 
         Let's make it slightly blurred for effect */
      backdrop-filter: blur(8px);
      border-radius: 12px;
      padding: 8px 12px;
    }

    .title-group {
      display: flex;
      align-items: center;
      gap: 12px;

      h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        font-family: 'Outfit', sans-serif;
      }
    }

    .badge {
      background: #3b82f6;
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
      animation: bounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .list-container {
      flex: 1;
      overflow-y: auto;
      padding-bottom: 32px;
      padding-top: 8px;
      
      /* Hide scrollbar for cleaner look */
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }
    }

    .cards-wrapper {
        /* Perspective is CRITICAL for 3D effects of children */
        perspective: 1000px;
        perspective-origin: 50% 0;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      opacity: 0.5;
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
      }
      
      p {
        font-size: 1.1rem;
      }
    }

    @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
  `]
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
