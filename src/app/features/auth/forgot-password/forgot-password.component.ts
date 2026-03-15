import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { finalize } from 'rxjs/operators';
import { BaseFormComponent } from '../../../shared/components/base-form/base-form.component';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent extends BaseFormComponent {
    private authService = inject(AuthService);
    private snackbarService = inject(SnackbarService);

    isLoading = false;
    isSubmitted = false;

    getFormConfig(): Record<string, any> {
        return {
            email: ['', [Validators.required, Validators.email]]
        };
    }

    onSubmit(): void {
        if (this.isFormValid()) {
            this.isLoading = true;
            const { email } = this.form.value;

            this.authService.forgotPassword(email)
                .pipe(finalize(() => this.isLoading = false))
                .subscribe({
                    next: (response) => {
                        if (response.success) {
                            this.isSubmitted = true;
                        } else {
                            this.snackbarService.show(response.message || 'Something went wrong', 'error');
                        }
                    },
                    error: () => {
                        this.snackbarService.show('Failed to send reset link', 'error');
                    }
                });
        } else {
            this.markAllAsTouched();
        }
    }
}
