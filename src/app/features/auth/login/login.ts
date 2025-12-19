import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { finalize } from 'rxjs/operators';
import { BaseFormComponent } from '../../../shared/components/base-form/base-form.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.scss'
})
export class LoginComponent extends BaseFormComponent {
    private authService = inject(AuthService);
    private snackbarService = inject(SnackbarService);
    private router = inject(Router);

    isLoading = false;

    /**
     * Define the form controls and validators for the login form.
     */
    getFormConfig(): Record<string, any> {
        return {
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]]
        };
    }

    /**
     * Handle form submission.
     * Calls the AuthService to authenticate the user and redirects to dashboard on success.
     */
    onSubmit(): void {
        if (this.isFormValid()) {
            this.isLoading = true;

            const { email, password } = this.form.value;

            // Call login API
            this.authService.login(email, password)
                .pipe(finalize(() => this.isLoading = false))
                .subscribe({
                    next: (response) => {
                        // Check if response contains data (user/token)
                        if (response.success && response.data) {
                            this.router.navigate(['/dashboard']);
                        } else {
                            this.snackbarService.show('Invalid email or password', 'error');
                        }
                    },
                    error: () => {
                        this.snackbarService.show('Invalid email or password', 'error');
                    }
                });
        } else {
            // Mark all fields as touched to show validation errors
            this.markAllAsTouched();
        }
    }
}
