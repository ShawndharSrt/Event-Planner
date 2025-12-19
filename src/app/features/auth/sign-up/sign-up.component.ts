import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { finalize } from 'rxjs/operators';
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
    private snackbarService = inject(SnackbarService);
    private router = inject(Router);

    isLoading = false;

    getFormConfig(): Record<string, any> {
        return {
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
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

            const { firstName, lastName, email, password } = this.form.value;

            this.authService.register({ firstName, lastName, email, password } as any)
                .pipe(finalize(() => this.isLoading = false))
                .subscribe({
                    next: (response) => {
                        if (response.success && response.data) {
                            this.router.navigateByUrl('/dashboard');
                        } else {
                            this.snackbarService.show(response.message || 'Registration failed. Please try again.', 'error');
                        }
                    },
                    error: () => {
                        this.snackbarService.show('An error occurred. Please try again.', 'error');
                    }
                });
        } else {
            this.markAllAsTouched();
        }
    }
}
