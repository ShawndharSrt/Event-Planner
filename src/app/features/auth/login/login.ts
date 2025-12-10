import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
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
    private router = inject(Router);

    isLoading = false;
    errorMessage = '';

    getFormConfig(): Record<string, any> {
        return {
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]]
        };
    }

    onSubmit(): void {
        if (this.isFormValid()) {
            this.isLoading = true;
            this.errorMessage = '';

            const { email, password } = this.form.value;

            this.authService.login(email, password).subscribe({
                next: (response) => {
                    this.isLoading = false;
                    if (response.success && response.data) {
                        this.router.navigate(['/dashboard']);
                    } else {
                        this.errorMessage = response.message || 'Invalid email or password';
                    }
                },
                error: () => {
                    this.isLoading = false;
                    this.errorMessage = 'An error occurred. Please try again.';
                }
            });
        } else {
            this.markAllAsTouched();
        }
    }
}
