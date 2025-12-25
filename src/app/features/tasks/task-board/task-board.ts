import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog.service';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';
import { EventService } from '../../../core/services/event.service';
import { Event as AppEvent } from '../../../core/models/event.model';
import { BaseFormComponent } from '../../../shared/components/base-form/base-form.component';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule, ReactiveFormsModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './task-board.html',
  styleUrl: './task-board.scss',
})
export class TaskBoardComponent extends BaseFormComponent implements OnInit {
  private snackbar = inject(SnackbarService);
  private confirmationDialog = inject(ConfirmationDialogService);
  private taskService = inject(TaskService);
  private eventService = inject(EventService);

  tasks = signal<Task[]>([]);
  events = signal<AppEvent[]>([]);
  selectedEventId = signal<string>('');
  isDropdownOpen = signal(false);
  showTaskForm = signal(false);
  editingTask = signal<Task | null>(null);

  selectedEventName = computed(() => {
    const id = this.selectedEventId();
    if (!id) return 'Select Event';
    const match = this.events().find(e => e.id === id);
    return match ? match.title : 'Select Event';
  });

  // Use writable signals for each column so CDK can mutate them
  todoTasks = signal<Task[]>([]);
  inProgressTasks = signal<Task[]>([]);
  doneTasks = signal<Task[]>([]);

  getFormConfig(): Record<string, any> {
    return {
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      assignee: ['Me', Validators.required],
      dueDate: ['', Validators.required],
      priority: ['medium', Validators.required]
    };
  }

  override ngOnInit() {
    super.ngOnInit(); // Initialize form
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getEvents().subscribe(response => {
      const events = response.data ?? [];
      this.events.set(events);

      if (events.length > 0) {
        // Select first event by default if no event is selected
        if (!this.selectedEventId()) {
          const firstEvent = events[0];
          const id = firstEvent.id;
          if (id) {
            this.selectedEventId.set(id);
          } else {
            console.error('TaskBoard: First event has no _id or id property:', firstEvent);
          }
        }
        this.loadTasks();
      }
    });
  }

  toggleDropdown() {
    this.isDropdownOpen.update(v => !v);
  }

  selectEvent(eventIds: string) {
    this.isDropdownOpen.set(false);
    this.onEventChange(eventIds);
  }

  onEventChange(value: string) {
    // Handle case where value might be string "undefined" due to bad binding
    if (value && value !== 'undefined') {
      this.selectedEventId.set(value);
      this.loadTasks();
    } else {
      console.warn('TaskBoard: Invalid event ID selected:', value);
    }
  }

  loadTasks() {
    const eventId = this.selectedEventId();
    if (!eventId) return;

    this.taskService.getTasks(eventId).subscribe(response => {
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
    this.editingTask.set(null);
    this.form.reset({
      title: '',
      description: '',
      assignee: 'Me',
      dueDate: '',
      priority: 'medium'
    });
    this.showTaskForm.set(true);
  }

  editTask(task: Task) {
    this.editingTask.set(task);
    this.form.patchValue({
      title: task.title,
      description: task.description || '',
      assignee: task.assignee || 'Me',
      dueDate: task.dueDate || '',
      priority: task.priority
    });
    this.showTaskForm.set(true);
  }

  cancelTask() {
    this.editingTask.set(null);
    this.showTaskForm.set(false);
  }

  saveTask() {
    if (this.isFormValid()) {
      const formValue = this.form.value;
      const editingTask = this.editingTask();

      if (editingTask) {
        // Update existing task
        const updates: Partial<Task> = {
          id: editingTask.id,
          eventId: editingTask.eventId,
          title: formValue.title!,
          description: formValue.description || '',
          assignee: formValue.assignee || 'Me',
          dueDate: formValue.dueDate || '',
          priority: formValue.priority as 'high' | 'medium' | 'low',
          status: editingTask.status
        };

        this.taskService.updateTask(editingTask.id, updates).subscribe(response => {
          const updatedTask = response.data;
          if (!updatedTask) {
            this.snackbar.show('Failed to update task', 'error');
            return;
          }
          this.tasks.update(tasks => tasks.map(t =>
            t.id === updatedTask.id ? updatedTask : t
          ));
          this.updateColumnSignals();
          this.snackbar.show('Task updated successfully', 'success');
          this.editingTask.set(null);
          this.showTaskForm.set(false);
        });
      } else {
        // Create new task
        const newTask: any = {
          eventId: this.selectedEventId(),
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
      }
    } else {
      this.markAllAsTouched();
    }
  }

  deleteTask(task: Task) {
    this.confirmationDialog
      .confirm(
        `Are you sure you want to delete "${task.title}"?`,
        'Delete Task',
        'danger',
        'Delete',
        'Cancel'
      )
      .subscribe((confirmed) => {
        if (confirmed) {
          this.taskService.deleteTask(task.id).subscribe({
            next: () => {
              this.tasks.update(tasks => tasks.filter(t => t.id !== task.id));
              this.updateColumnSignals();
              this.snackbar.show('Task deleted successfully', 'success');
            },
            error: () => {
              this.snackbar.show('Failed to delete task', 'error');
            }
          });
        }
      });
  }

  moveTask(task: Task) {
    const nextStatusMap: Record<string, 'todo' | 'in-progress' | 'done'> = {
      'todo': 'in-progress',
      'in-progress': 'done',
      'done': 'todo'
    };

    const nextStatus = nextStatusMap[task.status];

    this.taskService.updateTask(task.id, { status: nextStatus }).subscribe(response => {
      const updatedTask = response.data;
      if (!updatedTask) {
        this.snackbar.show('Failed to update task status', 'error');
        return;
      }
      this.tasks.update(tasks => tasks.map(t =>
        t.id === updatedTask.id ? updatedTask : t
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
          t.id === task.id ? { ...t, status: newStatus } : t
        );
      });

      // Update task status via service
      this.taskService.updateTask(task.id, { status: newStatus }).subscribe({
        next: (response) => {
          const updatedTask = response.data;
          if (!updatedTask) {
            this.snackbar.show('Failed to move task', 'error');
            return;
          }
          // Ensure the task is properly updated with server response
          this.tasks.update(tasks => tasks.map(t =>
            t.id === updatedTask.id ? updatedTask : t
          ));
          // Re-sync column signals in case server returned different data
          this.updateColumnSignals();
          this.snackbar.show(`Task moved to ${newStatus.replace('-', ' ')}`, 'info');
        },
        error: () => {
          // Revert on error - restore old status and re-sync columns
          this.tasks.update(tasks => tasks.map(t =>
            t.id === task.id ? { ...t, status: oldStatus } : t
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
