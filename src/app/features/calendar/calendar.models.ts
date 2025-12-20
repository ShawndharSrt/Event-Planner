export type CalendarView = 'month' | 'week' | 'day';

export interface EventDropdownItem {
    id: string;
    name: string;
}

export interface CalendarItem {
    id: string;
    title: string;
    startDate: string; // ISO date string
    endDate?: string;  // ISO date string
    type: 'event' | 'task';
    color?: string;    // CSS color or class name
    status?: string;   // For tasks
    eventId?: string;  // To link back to parent event
}

export interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    items: CalendarItem[];
}
