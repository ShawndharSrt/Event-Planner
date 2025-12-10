import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { UserService, UserStats } from '../../core/services/user.service';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { BaseFormComponent } from '../../shared/components/base-form/base-form.component';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './profile.html',
    styleUrl: './profile.scss'
})
export class ProfileComponent extends BaseFormComponent implements OnInit {
    user = signal<User | null>(null);
    isEditing = signal<boolean>(false);
    isSaving = signal<boolean>(false);

    private userService = inject(UserService);
    private authService = inject(AuthService);
    private snackbarService = inject(SnackbarService);

    stats = toSignal(
        this.userService.getUserStats().pipe(map(response => response.data)),
        { initialValue: { eventsCreated: 0, tasksCompleted: 0, guestsManaged: 0 } as UserStats }
    );

    getFormConfig(): Record<string, any> {
        return {
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]]
        };
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.user.set(this.authService.currentUser());
        if (this.user()) {
            this.form.patchValue({
                name: this.user()?.name,
                email: this.user()?.email
            });
        }
    }

    toggleEdit(): void {
        if (this.isEditing()) {
            // Cancel edit
            this.isEditing.set(false);
            // Reset form
            if (this.user()) {
                this.form.patchValue({
                    name: this.user()?.name,
                    email: this.user()?.email
                });
            }
        } else {
            // Start edit
            this.isEditing.set(true);
        }
    }

    saveProfile(): void {
        if (this.isFormValid()) {
            this.isSaving.set(true);
            const updatedData = this.form.value;

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
        } else {
            this.markAllAsTouched();
        }
    }
}
