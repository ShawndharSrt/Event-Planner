import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './event-form.html',
  styleUrl: './event-form.scss',
})
export class EventFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);

  eventForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    type: ['conference', Validators.required],
    status: ['planning', Validators.required],
    description: [''],
    startDate: ['', Validators.required],
    startTime: [''],
    endDate: [''],
    endTime: [''],
    location: ['', Validators.required]
  });

  saveEvent() {
    if (this.eventForm.valid) {
      console.log('Event Saved:', this.eventForm.value);
      this.snackbar.show('Event created successfully', 'success');
      this.router.navigate(['/events']);
    } else {
      this.eventForm.markAllAsTouched();
      this.snackbar.show('Please fill in all required fields', 'error');
    }
  }
}
