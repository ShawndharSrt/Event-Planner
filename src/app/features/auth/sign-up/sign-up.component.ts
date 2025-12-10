import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BaseFormComponent } from '../../../shared/components/base-form/base-form.component';

@Component({
    selector: 'app-sign-up',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './sign-up.component.html',
    styleUrl: './sign-up.component.scss'
})
export class SignUpComponent extends BaseFormComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    isLoading = false;
    errorMessage = '';

    getFormConfig(): Record<string, any> {
        return {
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        };
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.form.addValidators(this.passwordMatchValidator);
    }

    passwordMatchValidator(g: AbstractControl) {
        return g.get('password')?.value === g.get('confirmPassword')?.value
            ? null : { mismatch: true };
    }

    onSubmit(): void {
        if (this.isFormValid()) {
            this.isLoading = true;
            this.errorMessage = '';

            const { name, email, password } = this.form.value;

            this.authService.register({ name, email, password } as any).subscribe({
                next: (response) => {
                    this.isLoading = false;
                    if (response.success && response.data) {
                        this.router.navigateByUrl('/dashboard');
                    } else {
                        this.errorMessage = response.message || 'Registration failed. Please try again.';
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
