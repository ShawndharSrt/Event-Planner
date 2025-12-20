import { Component, signal, computed, effect, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CalendarService } from './calendar.service';
import { CalendarDay, CalendarItem, CalendarView, EventDropdownItem } from './calendar.models';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class CalendarComponent {
  private calendarService = inject(CalendarService);
  private router = inject(Router);

  currentDate = signal(new Date());
  currentView = signal<CalendarView>('month');
  selectedEventId = signal<string | null>(null);

  calendarItems = signal<CalendarItem[]>([]);
  dropdownOptions = signal<EventDropdownItem[]>([]);

  // Computed values for display
  currentMonthName = computed(() => {
    return this.currentDate().toLocaleString('default', { month: 'long', year: 'numeric' });
  });

  calendarDays = computed(() => {
    return this.generateCalendarDays(this.currentDate(), this.calendarItems());
  });

  constructor() {
    this.loadDropdownOptions();

    // Auto-reload data when dependencies change
    effect(() => {
      this.loadCalendarData(
        this.currentView(),
        this.currentDate(),
        this.selectedEventId()
      );
    });
  }

  loadDropdownOptions() {
    this.calendarService.getEventsDropdown().subscribe(options => {
      console.log('Dropdown Options Loaded:', options);
      this.dropdownOptions.set(options);
    });
  }

  loadCalendarData(view: CalendarView, date: Date, eventId: string | null) {
    const { start, end } = this.getDateRange(view, date);

    // Format dates as ISO string/YYYY-MM-DD for API
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    console.log(`Loading Calendar: View=${view}, Start=${startStr}, End=${endStr}, Event=${eventId}`);

    this.calendarService.getCalendarItems(view, startStr, endStr, eventId ?? undefined)
      .subscribe(items => {
        console.log('Calendar Items Loaded:', items);
        this.calendarItems.set(items);
      });
  }

  getDateRange(view: CalendarView, date: Date): { start: Date, end: Date } {
    const year = date.getFullYear();
    const month = date.getMonth();

    if (view === 'month') {
      // Get full grid range (includes prev/next month buffer)
      const firstDay = new Date(year, month, 1);
      const startDay = firstDay.getDay(); // 0-6
      const start = new Date(year, month, 1 - startDay);

      // We always show 6 rows of 7 days = 42 days
      const end = new Date(start);
      end.setDate(start.getDate() + 42);

      return { start, end };
    }

    if (view === 'week') {
      const day = date.getDay();
      const start = new Date(date);
      start.setDate(date.getDate() - day);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      return { start, end };
    }

    // Day view
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(date.getDate() + 1);
    return { start, end };
  }

  setView(view: CalendarView) {
    this.currentView.set(view);
  }

  next() {
    this.navigate(1);
  }

  prev() {
    this.navigate(-1);
  }

  navigate(direction: number) {
    const date = new Date(this.currentDate());
    const view = this.currentView();

    if (view === 'month') {
      date.setMonth(date.getMonth() + direction);
    } else if (view === 'week') {
      date.setDate(date.getDate() + (direction * 7));
    } else {
      date.setDate(date.getDate() + direction);
    }

    this.currentDate.set(date);
  }

  today() {
    this.currentDate.set(new Date());
  }

  onEventFilterChange(event: any) {
    // Value handled by signal binding or manually setting signal if standard select
    // If using MatSelect, we might bind directly to signal if using ngModel, or handle selectionChange
  }

  onItemClick(item: CalendarItem) {
    if (item.type === 'task' && item.eventId) {
      this.router.navigate(['/events', item.eventId, 'tasks']);
    }
    // Logic for clicking an event itself could go here
  }

  private generateCalendarDays(date: Date, items: CalendarItem[]): CalendarDay[] {
    const view = this.currentView();
    const { start } = this.getDateRange(view, date);

    const days: CalendarDay[] = [];
    const today = new Date();

    let dayCount = 0;
    if (view === 'month') dayCount = 42;
    else if (view === 'week') dayCount = 7;
    else dayCount = 1;

    for (let i = 0; i < dayCount; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dTime = d.getTime();

      const dayItems = items.filter(item => {
        const itemStart = new Date(item.startDate).setHours(0, 0, 0, 0);
        const itemEnd = item.endDate ? new Date(item.endDate).setHours(0, 0, 0, 0) : itemStart;

        // Check if current day `d` is within [itemStart, itemEnd]
        const currentDayTime = d.setHours(0, 0, 0, 0);
        return currentDayTime >= itemStart && currentDayTime <= itemEnd;
      });

      days.push({
        date: d,
        isCurrentMonth: d.getMonth() === date.getMonth(),
        isToday: this.isSameDate(d, today),
        items: dayItems
      });
    }

    return days;
  }

  private isSameDate(d1: Date, d2: Date): boolean {
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  }
}
