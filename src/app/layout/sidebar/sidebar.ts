import { Component, inject, HostBinding } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LayoutService } from '../../core/services/layout.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  layoutService = inject(LayoutService);
  authService = inject(AuthService);

  get userInitials(): string {
    const user = this.authService.currentUser();
    // Debug log to see user object
    console.log('Sidebar user:', user);

    if (!user) return 'GU'; // Guest/Unknown

    // Check for name first
    if (user.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return user.name.slice(0, 2).toUpperCase();
    }

    // Fallback to first/last name
    if (user.firstName || user.lastName) {
      const first = user.firstName ? user.firstName[0] : '';
      const last = user.lastName ? user.lastName[0] : '';
      if (first && last) return (first + last).toUpperCase();
      return (first || last).toUpperCase();
    }

    // Fallback to email
    if (user.email) {
      const emailName = user.email.split('@')[0];
      const parts = emailName.split(/[._-]/); // Split by common separators
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return emailName.slice(0, 2).toUpperCase();
    }

    return 'GU';
  }

  get userName(): string {
    const user = this.authService.currentUser();
    if (!user) return 'Guest';

    if (user.name) return user.name;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName || user.lastName) return user.firstName || user.lastName!;

    // Fallback to email
    if (user.email) {
      return user.email.split('@')[0];
    }

    return 'User';
  }

  closeSidebar() {
    this.layoutService.closeSidebar();
  }
}
