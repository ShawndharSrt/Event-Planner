import { Component, inject } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { BaseFormComponent } from '../../../shared/components/base-form/base-form.component';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Event } from '../../../core/models/event.model';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './event-form.html',
  styleUrl: './event-form.scss',
})
export class EventFormComponent extends BaseFormComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);
  private eventService = inject(EventService);
  private authService = inject(AuthService);

  isEditMode = false;
  eventId: string | null = null;

  override ngOnInit() {
    super.ngOnInit();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.eventId = id;
      this.loadEvent(id);
    }
  }

  getFormConfig(): Record<string, any> {
    return {
      title: ['', Validators.required],
      type: ['conference', Validators.required],
      status: ['planning', Validators.required],
      description: [''],
      startDate: ['', Validators.required],
      startTime: [''],
      endDate: [''],
      endTime: [''],
      location: ['', Validators.required]
    };
  }

  loadEvent(id: string) {
    this.eventService.getEvent(id).subscribe({
      next: (response: ApiResponse<Event>) => {
        if (response.data) {
          this.form.patchValue({
            title: response.data.title,
            type: response.data.type,
            status: response.data.status,
            description: response.data.description,
            startDate: response.data.startDate, // Assuming date format matches, might need formatting
            startTime: response.data.startTime,
            endDate: response.data.endDate,
            endTime: response.data.endTime,
            location: response.data.location
          });
        }
      },
      error: (error: any) => {
        console.error('Error loading event:', error);
        this.snackbar.show('Failed to load event details', 'error');
        this.router.navigate(['/events']);
      }
    });
  }

  saveEvent() {
    if (this.isFormValid()) {
      const eventData = {
        ...this.form.value,
        organizerId: "1234"
      };

      if (this.isEditMode && this.eventId) {
        this.eventService.updateEvent(this.eventId, eventData).subscribe({
          next: (response: any) => {
            this.snackbar.show('Event updated successfully', 'success');
            this.router.navigate(['/events']);
          },
          error: (error: any) => {
            this.snackbar.show('Failed to update event', 'error');
          }
        });
      } else {
        this.eventService.createEvent(eventData).subscribe({
          next: (response: any) => {
            this.snackbar.show('Event created successfully', 'success');
            this.router.navigate(['/events']);
          },
          error: (error: any) => {
            this.snackbar.show('Failed to create event', 'error');
          }
        });
      }
    } else {
      this.markAllAsTouched();
      this.snackbar.show('Please fill in all required fields', 'error');
    }
  }
}
