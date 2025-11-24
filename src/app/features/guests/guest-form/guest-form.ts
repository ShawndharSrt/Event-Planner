import { Component, inject } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guest-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './guest-form.html',
  styleUrl: './guest-form.scss',
})
export class GuestFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);

  private route = inject(ActivatedRoute);

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

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['eventId']) {
        this.guestForm.patchValue({ eventId: params['eventId'] });
      }
    });
  }

  saveGuest() {
    if (this.guestForm.valid) {
      console.log('Guest Saved:', this.guestForm.value);
      this.snackbar.show('Guest added successfully', 'success');
      this.router.navigate(['/guests']);
    } else {
      this.guestForm.markAllAsTouched();
      this.snackbar.show('Please fill in all required fields', 'error');
    }
  }
}
