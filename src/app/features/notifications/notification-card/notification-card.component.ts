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
    template: `
    <div class="glass-card" [ngClass]="['severity-' + notification.severity.toLowerCase(), notification.read ? 'read' : 'unread']">
      
      <!-- Left Accent Bar -->
      <div class="accent-bar"></div>

      <!-- Icon Area -->
      <div class="icon-wrapper">
        <mat-icon>{{ getIcon() }}</mat-icon>
      </div>

      <!-- Content -->
      <div class="content">
        <div class="header">
          <span class="title">{{ notification.code }}</span>
          <span class="time">{{ notification.createdAt | date:'short' }}</span>
        </div>
        <p class="message">{{ notification.message }}</p>
      </div>

      <!-- Actions -->
      <div class="actions">
        @if (!notification.read) {
            <button mat-icon-button (click)="onMarkCheck($event)" matTooltip="Mark as read">
            <mat-icon>check_circle_outline</mat-icon>
            </button>
        }
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      margin-bottom: 16px;
      perspective: 1000px;
      cursor: pointer;
    }

    .glass-card {
      position: relative;
      display: flex;
      align-items: center;
      padding: 16px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.7); /* Light mode glass */
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.4);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      transform-style: preserve-3d;
      overflow: hidden;

      &:hover {
        transform: translateY(-4px) translateZ(10px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        background: rgba(255, 255, 255, 0.85);
        border-color: rgba(255, 255, 255, 0.8);
        
        &::after {
            opacity: 1;
        }
      }

      &:active {
        transform: scale(0.98);
      }

      &.read {
        opacity: 0.85;
        background: rgba(240, 240, 240, 0.4);
        box-shadow: none;
        border: 1px solid rgba(0,0,0,0.05);
        
        &:hover {
           transform: translateY(-2px);
           background: rgba(240, 240, 240, 0.6);
        }
      }
    }

    /* Dark Mode Support via media query or clean css vars if available. 
       For now assuming system preference or global class. 
       Ideally, we use CSS variables from styles.scss */
    @media (prefers-color-scheme: dark) {
      .glass-card {
        background: rgba(30, 30, 30, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #e0e0e0;

        &:hover {
          background: rgba(40, 40, 40, 0.8);
        }
        
        &.read {
             background: rgba(20, 20, 20, 0.4);
        }
      }
    }

    .accent-bar {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      border-top-left-radius: 16px;
      border-bottom-left-radius: 16px;
    }

    .severity-info .accent-bar { background: #3b82f6; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5); }
    .severity-warning .accent-bar { background: #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.5); }
    .severity-critical .accent-bar { background: #ef4444; box-shadow: 0 0 15px rgba(239, 68, 68, 0.6); animation: pulse-red 2s infinite; }

    .icon-wrapper {
      margin-right: 16px;
      margin-left: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(0,0,0,0.05);

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }
    
    .severity-info .icon-wrapper { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
    .severity-warning .icon-wrapper { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
    .severity-critical .icon-wrapper { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

    .content {
      flex: 1;
    }

    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .title {
      font-weight: 600;
      font-size: 0.95rem;
      letter-spacing: 0.02em;
    }

    .time {
      font-size: 0.75rem;
      opacity: 0.6;
    }

    .message {
      font-size: 0.9rem;
      opacity: 0.8;
      margin: 0;
      line-height: 1.4;
    }

    .actions {
      margin-left: 12px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .glass-card:hover .actions {
      opacity: 1;
    }

    @keyframes pulse-red {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
      70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
  `],
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
        this.markRead.emit(this.notification._id);
    }
}
