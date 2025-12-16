import { Component, inject, HostListener, ElementRef, ViewChild, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LayoutService } from '../../core/services/layout.service';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from '../../features/notifications/notification/notification.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, NotificationComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  layoutService = inject(LayoutService);
  private notificationService = inject(NotificationService);

  showNotifications = false;
  @ViewChild('notificationButton', { read: ElementRef }) notificationButton?: ElementRef;
  @ViewChild('notificationDropdown', { read: ElementRef }) notificationDropdown?: ElementRef;

  // Computed signal for unread notification count
  unreadCount = computed(() =>
    this.notificationService.notifications$().filter(n => !n.read).length
  );

  toggleSidebar() {
    this.layoutService.toggleSidebar();
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.showNotifications) {
      return;
    }

    const target = event.target as HTMLElement;

    // Get elements - use ViewChild if available, otherwise query DOM directly
    const notificationButton = this.notificationButton?.nativeElement ||
      document.querySelector('[data-notification-button]');
    const notificationDropdown = this.notificationDropdown?.nativeElement ||
      document.querySelector('.notification-dropdown');

    // Check if click is outside both the notification button and dropdown
    const clickedInsideButton = notificationButton?.contains(target) ?? false;
    const clickedInsideDropdown = notificationDropdown?.contains(target) ?? false;

    if (!clickedInsideButton && !clickedInsideDropdown) {
      this.showNotifications = false;
    }
  }
}
