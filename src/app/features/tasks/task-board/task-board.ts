import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-board.html',
  styleUrl: './task-board.scss',
})
export class TaskBoardComponent {
  private snackbar = inject(SnackbarService);
  private taskService = inject(TaskService);

  // Using toSignal for reactive data fetching
  // We need a signal for the tasks list that we can also update manually (for add/move)
  // Since toSignal creates a ReadOnlySignal, we might need a different approach if we want to mutate it locally
  // without refetching. However, for now, let's stick to the previous approach but initialize it cleaner,
  // OR better: use a writable signal initialized with data.

  // Actually, toSignal is great for read-only streams. If we want to add/move tasks and see updates immediately
  // without re-fetching from backend (which is mock anyway), we need a WritableSignal.
  // So I will keep the WritableSignal pattern but maybe initialize it in a more "signal-y" way if possible.
  // But wait, the user asked to "Use signals". The previous implementation WAS using signals (tasks = signal([])).
  // The "toSignal" pattern is good for derived state from Observables.

  // Let's stick to the WritableSignal because we are doing optimistic updates (updating local state before/after API call).
  // toSignal is read-only.

  tasks = signal<Task[]>([]);

  constructor() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks(1).subscribe(tasks => {
      this.tasks.set(tasks);
    });
  }

  getTasksByStatus(status: 'todo' | 'in-progress' | 'done') {
    return this.tasks().filter(t => t.status === status);
  }

  addTask() {
    const newTask: any = {
      eventId: 1,
      title: 'New Task',
      description: 'Description of the new task',
      assignee: 'Me',
      dueDate: 'TBD',
      priority: 'medium',
      status: 'todo'
    };

    this.taskService.addTask(newTask).subscribe(task => {
      this.tasks.update(tasks => [...tasks, task]);
      this.snackbar.show('New task added', 'success');
    });
  }

  moveTask(task: Task) {
    const nextStatusMap: Record<string, 'todo' | 'in-progress' | 'done'> = {
      'todo': 'in-progress',
      'in-progress': 'done',
      'done': 'todo'
    };

    const nextStatus = nextStatusMap[task.status];

    this.taskService.updateTask(task.id, { status: nextStatus }).subscribe(updatedTask => {
      this.tasks.update(tasks => tasks.map(t =>
        t.id === updatedTask.id ? updatedTask : t
      ));
      this.snackbar.show(`Task moved to ${nextStatus.replace('-', ' ')}`, 'info');
    });
  }
}
