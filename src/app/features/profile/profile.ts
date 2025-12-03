import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, User } from '../../core/services/auth.service';
import { UserService, UserStats } from '../../core/services/user.service';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './profile.html',
    styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
    user = signal<User | null>(null);
    isEditing = signal<boolean>(false);
    isSaving = signal<boolean>(false);

    private userService = inject(UserService);
    stats = toSignal(
        this.userService.getUserStats().pipe(map(response => response.data)),
        { initialValue: { eventsCreated: 0, tasksCompleted: 0, guestsManaged: 0 } as UserStats }
    );

    profileForm: FormGroup;

    constructor(
        private authService: AuthService,
        private fb: FormBuilder,
        private snackbarService: SnackbarService
    ) {
        this.profileForm = this.fb.group({
            fullName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            bio: ['']
        });
    }

    ngOnInit(): void {
        this.user.set(this.authService.currentUser());
        if (this.user()) {
            this.profileForm.patchValue({
                fullName: this.user()?.fullName,
                email: this.user()?.email,
                bio: this.user()?.bio
            });
        }
    }

    toggleEdit(): void {
        if (this.isEditing()) {
            // Cancel edit
            this.isEditing.set(false);
            // Reset form
            if (this.user()) {
                this.profileForm.patchValue({
                    fullName: this.user()?.fullName,
                    email: this.user()?.email,
                    bio: this.user()?.bio
                });
            }
        } else {
            // Start edit
            this.isEditing.set(true);
        }
    }

    saveProfile(): void {
        if (this.profileForm.invalid) {
            return;
        }

        this.isSaving.set(true);
        const updatedData = this.profileForm.value;

        this.authService.updateProfile(updatedData).subscribe({
            next: (response) => {
                const updatedUser = response.data;
                if (!updatedUser) {
                    this.snackbarService.show('Failed to update profile', 'error');
                    this.isSaving.set(false);
                    return;
                }
                this.user.set(updatedUser);
                this.isEditing.set(false);
                this.isSaving.set(false);
                this.snackbarService.show('Profile updated successfully', 'success');
            },
            error: () => {
                this.isSaving.set(false);
                this.snackbarService.show('Failed to update profile', 'error');
            }
        });
    }
}
