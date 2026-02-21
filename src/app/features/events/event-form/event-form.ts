import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { BaseFormComponent } from '../../../shared/components/base-form/base-form.component';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Event } from '../../../core/models/event.model';
import { switchMap, catchError, of } from 'rxjs';

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
  private cdr = inject(ChangeDetectorRef);

  isEditMode = false;
  eventId: string | null = null;

  coverImageFile: File | null = null;
  coverImagePreview: string | null = null;
  imageError: string | null = null;

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

          if (response.data.coverImage) {
            this.coverImagePreview = response.data.coverImage;
            this.cdr.detectChanges();
          }
        }
      },
      error: (error: any) => {
        console.error('Error loading event:', error);
        this.snackbar.show('Failed to load event details', 'error');
        this.router.navigate(['/events']);
      }
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.imageError = null;
      if (!file.type.startsWith('image/')) {
        this.imageError = 'Only image files are allowed.';
        this.coverImageFile = null;
        this.coverImagePreview = null;
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.imageError = 'File size must be less than 2MB.';
        this.coverImageFile = null;
        this.coverImagePreview = null;
        return;
      }

      this.coverImageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.coverImagePreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(event: any) {
    event.stopPropagation();
    this.coverImageFile = null;
    this.coverImagePreview = null;
    this.imageError = null;
  }

  saveEvent() {
    if (this.isFormValid()) {
      const eventData = {
        ...this.form.value,
        organizerId: "1234"
      };

      const eventRequest$ = this.isEditMode && this.eventId
        ? this.eventService.updateEvent(this.eventId, eventData)
        : this.eventService.createEvent(eventData);

      eventRequest$.pipe(
        switchMap((response: ApiResponse<Event>) => {
          const id = this.isEditMode ? this.eventId : response.data?.id?.toString();
          if (id && this.coverImageFile) {
            return this.eventService.uploadCover(id, this.coverImageFile).pipe(
              catchError((err) => {
                this.snackbar.show('Event saved, but failed to upload cover image.', 'error');
                return of(null);
              })
            );
          }
          return of(null);
        })
      ).subscribe({
        next: () => {
          this.snackbar.show(this.isEditMode ? 'Event updated successfully' : 'Event created successfully', 'success');
          this.router.navigate(['/events']);
        },
        error: (error: any) => {
          this.snackbar.show(this.isEditMode ? 'Failed to update event' : 'Failed to create event', 'error');
        }
      });
    } else {
      this.markAllAsTouched();
      this.snackbar.show('Please fill in all required fields', 'error');
    }
  }
}
