import { Component, inject, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { CommonModule } from '@angular/common';
import { GuestService } from '../../../core/services/guest.service';
import { BaseFormComponent } from '../../../shared/components/base-form/base-form.component';

@Component({
  selector: 'app-guest-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './guest-form.html',
  styleUrl: './guest-form.scss',
})
export class GuestFormComponent extends BaseFormComponent implements OnInit {
  private router = inject(Router);
  private snackbar = inject(SnackbarService);
  private guestService = inject(GuestService);
  private route = inject(ActivatedRoute);

  @Input() isModal = false;
  @Input() set eventId(value: string | null) {
    if (value && this.form) {
      this.form.patchValue({ eventId: value });
    }
    this._eventId = value;
  }

  private _eventId: string | null = null;

  @Output() saveSuccess = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  isEditMode = false;
  @Input() guestId: string | null = null;

  getFormConfig(): Record<string, any> {
    return {
      eventId: [this._eventId], // Hidden field for linking
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      group: ['none'],
      dietary: [''],
      notes: ['']
    };
  }

  override ngOnInit() {
    super.ngOnInit();

    // Check if we're in edit mode
    // Prioritize input guestId over route param for modals
    const id = this.guestId || this.route.snapshot.paramMap.get('id');

    // Only check route ID if NOT in modal mode to avoid picking up parent event ID
    if (!this.isModal && !this.guestId && id) {
      this.isEditMode = true;
      this.guestId = id;
      this.loadGuest(id);
    } else if (this.guestId) {
      // If explicitly provided via input (even in modal)
      this.isEditMode = true;
      this.loadGuest(this.guestId);
    }

    // Handle query params for eventId if not provided via input
    if (!this._eventId) {
      this.route.queryParams.subscribe(params => {
        if (params['eventId']) {
          this.form.patchValue({ eventId: params['eventId'] });
          this._eventId = params['eventId'];
        }
      });
    }
  }

  loadGuest(id: string) {
    this.guestService.getGuestById(id).subscribe({
      next: (response) => {
        const guest = response.data;
        if (guest) {
          this.form.patchValue({
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
        if (!this.isModal) {
          this.router.navigate(['/guests']);
        }
      }
    });
  }

  saveGuest() {
    if (this.isFormValid()) {
      const guestData = this.form.value;

      if (this.isEditMode && this.guestId) {
        // Update existing guest
        this.guestService.updateGuest(this.guestId, guestData).subscribe({
          next: () => {
            this.snackbar.show('Guest updated successfully', 'success');
            if (this.isModal) {
              this.saveSuccess.emit();
            } else {
              this.router.navigate(['/guests']);
            }
          },
          error: (error) => {
            this.snackbar.show('Failed to update guest', 'error');
            console.error('Error updating guest:', error);
          }
        });
      } else {
        // Create new guest
        if (this._eventId) {
          // If we have an event ID, we're adding a guest to an event
          this.guestService.addGuest(guestData).subscribe({
            next: () => {
              this.snackbar.show('Guest added to event successfully', 'success');
              if (this.isModal) {
                this.saveSuccess.emit();
              } else {
                this.router.navigate(['/guests']);
              }
            },
            error: (error) => {
              this.snackbar.show('Failed to add guest to event', 'error');
              console.error('Error adding guest to event:', error);
            }
          });
        } else {
          // If no event ID, we're creating a global guest
          this.guestService.createGuest(guestData).subscribe({
            next: () => {
              this.snackbar.show('Guest created successfully', 'success');
              if (this.isModal) {
                this.saveSuccess.emit();
              } else {
                this.router.navigate(['/guests']);
              }
            },
            error: (error) => {
              this.snackbar.show('Failed to create guest', 'error');
              console.error('Error creating guest:', error);
            }
          });
        }
      }
    } else {
      this.markAllAsTouched();
      this.snackbar.show('Please fill in all required fields', 'error');
    }
  }
  onCancel() {
    if (this.isModal) {
      this.cancel.emit();
    } else {
      this.router.navigate(['/guests']);
    }
  }
}
