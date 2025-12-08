import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule, ReactiveFormsModule],
  templateUrl: './task-board.html',
  styleUrl: './task-board.scss',
})
export class TaskBoardComponent {
  private snackbar = inject(SnackbarService);
  private taskService = inject(TaskService);
  private fb = inject(FormBuilder);

  tasks = signal<Task[]>([]);
  showTaskForm = signal(false);
  taskForm: FormGroup;

  // Use writable signals for each column so CDK can mutate them
  todoTasks = signal<Task[]>([]);
  inProgressTasks = signal<Task[]>([]);
  doneTasks = signal<Task[]>([]);

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      assignee: ['Me', Validators.required],
      dueDate: ['', Validators.required],
      priority: ['medium', Validators.required]
    });

    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks('1').subscribe(response => {
      const tasks = response.data ?? [];
      this.tasks.set(tasks);
      this.updateColumnSignals();
    });
  }

  private updateColumnSignals() {
    this.todoTasks.set(this.tasks().filter(t => t.status === 'todo'));
    this.inProgressTasks.set(this.tasks().filter(t => t.status === 'in-progress'));
    this.doneTasks.set(this.tasks().filter(t => t.status === 'done'));
  }

  getTasksByStatus(status: 'todo' | 'in-progress' | 'done'): Task[] {
    return this.tasks().filter(t => t.status === status);
  }

  addTask() {
    this.taskForm.reset({
      title: '',
      description: '',
      assignee: 'Me',
      dueDate: '',
      priority: 'medium'
    });
    this.showTaskForm.set(true);
  }

  cancelTask() {
    this.showTaskForm.set(false);
  }

  saveTask() {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const newTask: any = {
        eventId: '1',
        ...formValue,
        status: 'todo'
      };

      this.taskService.addTask(newTask).subscribe(response => {
        const task = response.data;
        if (!task) {
          this.snackbar.show('Failed to add task', 'error');
          return;
        }
        this.tasks.update(tasks => [...tasks, task]);
        this.updateColumnSignals();
        this.snackbar.show('New task added', 'success');
        this.showTaskForm.set(false);
      });
    } else {
      this.taskForm.markAllAsTouched();
    }
  }

  moveTask(task: Task) {
    const nextStatusMap: Record<string, 'todo' | 'in-progress' | 'done'> = {
      'todo': 'in-progress',
      'in-progress': 'done',
      'done': 'todo'
    };

    const nextStatus = nextStatusMap[task.status];

    this.taskService.updateTask(task._id, { status: nextStatus }).subscribe(response => {
      const updatedTask = response.data;
      if (!updatedTask) {
        this.snackbar.show('Failed to update task status', 'error');
        return;
      }
      this.tasks.update(tasks => tasks.map(t =>
        t._id === updatedTask._id ? updatedTask : t
      ));
      this.updateColumnSignals();
      this.snackbar.show(`Task moved to ${nextStatus.replace('-', ' ')}`, 'info');
    });
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      // Moving within the same column - reorder tasks
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      // Update the signal to reflect the new order (create new array reference to trigger change detection)
      if (event.container.id === 'todo-column') {
        this.todoTasks.set([...event.container.data]);
      } else if (event.container.id === 'in-progress-column') {
        this.inProgressTasks.set([...event.container.data]);
      } else {
        this.doneTasks.set([...event.container.data]);
      }
    } else {
      // Moving between columns - update task status
      const task = event.previousContainer.data[event.previousIndex];
      const newStatus = this.getStatusFromContainerId(event.container.id);
      const oldStatus = task.status;

      // Transfer the item between arrays (CDK mutates the arrays in place)
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Immediately update both column signals with new array references to trigger change detection
      this.updateColumnSignalsFromEvent(event);

      // Update the main tasks signal with the new status
      this.tasks.update(tasks => {
        return tasks.map(t =>
          t._id === task._id ? { ...t, status: newStatus } : t
        );
      });

      // Update task status via service
      this.taskService.updateTask(task._id, { status: newStatus }).subscribe({
        next: (response) => {
          const updatedTask = response.data;
          if (!updatedTask) {
            this.snackbar.show('Failed to move task', 'error');
            return;
          }
          // Ensure the task is properly updated with server response
          this.tasks.update(tasks => tasks.map(t =>
            t._id === updatedTask._id ? updatedTask : t
          ));
          // Re-sync column signals in case server returned different data
          this.updateColumnSignals();
          this.snackbar.show(`Task moved to ${newStatus.replace('-', ' ')}`, 'info');
        },
        error: () => {
          // Revert on error - restore old status and re-sync columns
          this.tasks.update(tasks => tasks.map(t =>
            t._id === task._id ? { ...t, status: oldStatus } : t
          ));
          this.updateColumnSignals();
          this.snackbar.show('Failed to move task', 'error');
        }
      });
    }
  }

  private updateColumnSignalsFromEvent(event: CdkDragDrop<Task[]>) {
    // Update both the source and destination column signals after CDK has mutated the arrays
    if (event.previousContainer.id === 'todo-column') {
      this.todoTasks.set([...event.previousContainer.data]);
    } else if (event.previousContainer.id === 'in-progress-column') {
      this.inProgressTasks.set([...event.previousContainer.data]);
    } else if (event.previousContainer.id === 'done-column') {
      this.doneTasks.set([...event.previousContainer.data]);
    }

    if (event.container.id === 'todo-column') {
      this.todoTasks.set([...event.container.data]);
    } else if (event.container.id === 'in-progress-column') {
      this.inProgressTasks.set([...event.container.data]);
    } else if (event.container.id === 'done-column') {
      this.doneTasks.set([...event.container.data]);
    }
  }

  private getStatusFromContainerId(containerId: string): 'todo' | 'in-progress' | 'done' {
    if (containerId === 'todo-column') return 'todo';
    if (containerId === 'in-progress-column') return 'in-progress';
    return 'done';
  }
}
