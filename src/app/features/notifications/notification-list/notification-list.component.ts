import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationCardComponent } from '../notification-card/notification-card.component';
import { Notification } from '../../../core/models/notification.model';

export interface NotificationListItem {
  isHeader: boolean;
  label?: string;
  badge?: string;
  data?: Notification;
}

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ScrollingModule,
    NotificationCardComponent
  ],
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent {
  private notificationService = inject(NotificationService);

  notifications = this.notificationService.notifications$;

  searchTerm = signal('');
  selectedCategory = signal('All');
  dateFilter = signal('All');
  statusFilter = signal('All'); // 'All', 'Read', 'Unread'

  totalCount = computed(() => this.notifications().length);
  unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

  tasksCount = computed(() => this.notifications().filter(n => n.message.toLowerCase().includes('task')).length);
  invitationsCount = computed(() => this.notifications().filter(n => n.message.toLowerCase().includes('invitation')).length);
  budgetCount = computed(() => this.notifications().filter(n => n.message.toLowerCase().includes('budget') || n.message.toLowerCase().includes('payment')).length);
  guestsCount = computed(() => this.notifications().filter(n => n.message.toLowerCase().includes('guest')).length);
  systemCount = computed(() => this.totalCount() - this.tasksCount() - this.invitationsCount() - this.budgetCount() - this.guestsCount());

  filteredNotifications = computed(() => {
    let filtered = this.notifications();

    const term = this.searchTerm().toLowerCase();
    if (term) {
      filtered = filtered.filter(n => n.message.toLowerCase().includes(term));
    }

    const category = this.selectedCategory();
    if (category === 'Tasks') filtered = filtered.filter(n => n.message.toLowerCase().includes('task'));
    else if (category === 'Invitations') filtered = filtered.filter(n => n.message.toLowerCase().includes('invitation'));
    else if (category === 'Budget') filtered = filtered.filter(n => n.message.toLowerCase().includes('budget') || n.message.toLowerCase().includes('payment'));
    else if (category === 'Guests') filtered = filtered.filter(n => n.message.toLowerCase().includes('guest'));
    else if (category === 'System') filtered = filtered.filter(n => !n.message.toLowerCase().includes('task') && !n.message.toLowerCase().includes('invitation') && !n.message.toLowerCase().includes('budget') && !n.message.toLowerCase().includes('payment') && !n.message.toLowerCase().includes('guest'));

    const status = this.statusFilter();
    if (status === 'Read') filtered = filtered.filter(n => n.read);
    else if (status === 'Unread') filtered = filtered.filter(n => !n.read);

    return filtered;
  });

  virtualScrollItems = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: { label: string, badge?: string, items: Notification[] }[] = [
      { label: 'Today', items: [] },
      { label: 'Yesterday', items: [] },
      { label: 'Earlier', items: [] }
    ];

    this.filteredNotifications().forEach(n => {
      const d = new Date(n.createdAt);
      if (d >= today) groups[0].items.push(n);
      else if (d >= yesterday && d < today) groups[1].items.push(n);
      else groups[2].items.push(n);
    });

    // Date Filter
    const dFilter = this.dateFilter();
    let displayGroups = groups;
    if (dFilter === 'Today') displayGroups = [groups[0]];
    else if (dFilter === 'This Week') {
      // approximate past 7 days logic could be added, dropping 'Earlier' for now
      // Or keep all just to simulate mock
    }

    const unreadToday = groups[0].items.filter(i => !i.read).length;
    if (unreadToday > 0) {
      groups[0].badge = `${unreadToday} New`;
    }

    const items: NotificationListItem[] = [];
    for (const group of displayGroups) {
      if (group.items.length > 0) {
        items.push({ isHeader: true, label: group.label, badge: group.badge });
        for (const item of group.items) {
          items.push({ isHeader: false, data: item });
        }
      }
    }
    return items;
  });

  markAsRead(id: string) {
    this.notificationService.markAsRead(id);
  }

  markAllRead() {
    this.notificationService.markAllAsRead();
  }

  setCategory(category: string) {
    this.selectedCategory.set(category);
  }

  setSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  setStatus(status: string) {
    this.statusFilter.set(status);
  }

  setDate(filter: string) {
    this.dateFilter.set(filter);
  }
}
