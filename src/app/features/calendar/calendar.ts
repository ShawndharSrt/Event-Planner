import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: any[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class CalendarComponent {
  currentDate = signal(new Date());
  currentView = signal<'month' | 'week' | 'day'>('month');

  // Computed values for display
  currentMonthName = computed(() => {
    return this.currentDate().toLocaleString('default', { month: 'long', year: 'numeric' });
  });

  calendarDays = computed(() => {
    return this.generateCalendarDays(this.currentDate());
  });

  setView(view: 'month' | 'week' | 'day') {
    this.currentView.set(view);
  }

  nextMonth() {
    const date = new Date(this.currentDate());
    date.setMonth(date.getMonth() + 1);
    this.currentDate.set(date);
  }

  prevMonth() {
    const date = new Date(this.currentDate());
    date.setMonth(date.getMonth() - 1);
    this.currentDate.set(date);
  }

  today() {
    this.currentDate.set(new Date());
  }

  private generateCalendarDays(date: Date): CalendarDay[] {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const days: CalendarDay[] = [];

    // Previous month days
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: this.isSameDate(d, new Date()),
        events: []
      });
    }

    // Current month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: this.isSameDate(d, new Date()),
        events: this.getMockEvents(d)
      });
    }

    // Next month days to fill grid (6 rows * 7 cols = 42)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: this.isSameDate(d, new Date()),
        events: []
      });
    }

    return days;
  }

  private isSameDate(d1: Date, d2: Date): boolean {
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  }

  private getMockEvents(date: Date): any[] {
    // Simple mock logic for demo
    if (date.getDate() === 20 && date.getMonth() === 10) { // Nov 20
      return [{ title: 'Task Due', type: 'warning' }];
    }
    if (date.getDate() === 25 && date.getMonth() === 10) { // Nov 25
      return [
        { title: 'Tech Conf', type: 'primary' },
        { title: 'Dinner', type: 'secondary' }
      ];
    }
    return [];
  }
}
