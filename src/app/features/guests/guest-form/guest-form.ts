import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { CommonModule } from '@angular/common';
import { GuestService } from '../../../core/services/guest.service';

@Component({
  selector: 'app-guest-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './guest-form.html',
  styleUrl: './guest-form.scss',
})
export class GuestFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);
  private guestService = inject(GuestService);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  guestId: number | null = null;

  guestForm: FormGroup = this.fb.group({
    eventId: [null], // Hidden field for linking
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    group: ['none'],
    dietary: [''],
    notes: ['']
  });

  ngOnInit() {
    // Check if we're in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.guestId = +id;
      this.loadGuest(+id);
    }

    // Handle query params for eventId
    this.route.queryParams.subscribe(params => {
      if (params['eventId']) {
        this.guestForm.patchValue({ eventId: params['eventId'] });
      }
    });
  }

  loadGuest(id: number) {
    this.guestService.getGuestById(id).subscribe({
      next: (guest) => {
        if (guest) {
          this.guestForm.patchValue({
            eventId: guest.eventId,
            firstName: guest.firstName,
            lastName: guest.lastName,
            email: guest.email,
            phone: guest.phone || '',
            group: guest.group || 'none',
            dietary: guest.dietary || '',
            notes: guest.notes || ''
          });
        }
      },
      error: (error) => {
        this.snackbar.show('Failed to load guest', 'error');
        console.error('Error loading guest:', error);
        this.router.navigate(['/guests']);
      }
    });
  }

  saveGuest() {
    if (this.guestForm.valid) {
      const guestData = this.guestForm.value;
      
      if (this.isEditMode && this.guestId) {
        // Update existing guest
        this.guestService.updateGuest(this.guestId, guestData).subscribe({
          next: () => {
            this.snackbar.show('Guest updated successfully', 'success');
            this.router.navigate(['/guests']);
          },
          error: (error) => {
            this.snackbar.show('Failed to update guest', 'error');
            console.error('Error updating guest:', error);
          }
        });
      } else {
        // Create new guest
        this.guestService.addGuest(guestData).subscribe({
          next: () => {
            this.snackbar.show('Guest added successfully', 'success');
            this.router.navigate(['/guests']);
          },
          error: (error) => {
            this.snackbar.show('Failed to add guest', 'error');
            console.error('Error adding guest:', error);
          }
        });
      }
    } else {
      this.guestForm.markAllAsTouched();
      this.snackbar.show('Please fill in all required fields', 'error');
    }
  }
}
