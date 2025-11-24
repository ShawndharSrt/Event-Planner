import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type EventTab = 'overview' | 'guests' | 'tasks' | 'budget';

@Component({
    selector: 'app-event-tabs',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './event-tabs.component.html',
    styleUrl: './event-tabs.component.scss'
})
export class EventTabsComponent {
    @Input() activeTab: EventTab = 'overview';
    @Input() guestCount: number = 0;
    @Input() taskCount: number = 0;
    @Output() tabChange = new EventEmitter<EventTab>();

    setTab(tab: EventTab) {
        this.tabChange.emit(tab);
    }
}
