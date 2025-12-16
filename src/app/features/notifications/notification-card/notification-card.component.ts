import { Component, EventEmitter, Input, Output, HostBinding, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './notification-card.component.html',
  styleUrl: './notification-card.component.scss',
  animations: [
    trigger('cardEntry', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.96)' }),
        animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ])
  ]
})
export class NotificationCardComponent {
  @Input({ required: true }) notification!: Notification;
  @Output() markRead = new EventEmitter<string>();

  @HostBinding('@cardEntry') entryAnimation = true;

  getIcon(): string {
    switch (this.notification.severity) {
      case 'INFO': return 'info';
      case 'WARNING': return 'warning_amber';
      case 'CRITICAL': return 'error_outline';
      default: return 'notifications';
    }
  }

  onMarkCheck(event: MouseEvent) {
    event.stopPropagation();
    this.markRead.emit(this.notification.id);
  }
}
