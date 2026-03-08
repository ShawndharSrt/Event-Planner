import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { LayoutService } from '../../core/services/layout.service';
import { inject } from '@angular/core';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { BaseFormComponent } from '../../shared/components/base-form/base-form.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './settings.html',
    styleUrl: './settings.scss'
})
export class SettingsComponent extends BaseFormComponent implements OnInit {
    layoutService = inject(LayoutService);
    authService = inject(AuthService);
    private snackbarService = inject(SnackbarService);

    getFormConfig(): Record<string, any> {
        const user = this.authService.currentUser();
        return {
            firstName: [user?.firstName || '', Validators.required],
            lastName: [user?.lastName || '', Validators.required],
            email: [user?.email || '', [Validators.required, Validators.email]],
            currency: ['USD'],
            dateFormat: ['MM/DD/YYYY'],
            darkMode: [this.layoutService.darkMode()],
            emailNotifications: [true],
            pushNotifications: [false]
        };
    }

    override ngOnInit() {
        super.ngOnInit();
        this.form.get('darkMode')?.valueChanges.subscribe(() => {
            this.layoutService.toggleDarkMode();
        });
    }

    saveSettings(): void {
        if (this.form.invalid) {
            this.snackbarService.show('Please fix the errors in the form.', 'error');
            return;
        }

        const values = this.form.value;
        const profileUpdates = {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email
        };

        this.authService.updateProfile(profileUpdates).subscribe({
            next: () => {
                this.snackbarService.show('Settings saved successfully!', 'success');
            },
            error: (err) => {
                this.snackbarService.show('Failed to save settings. Please try again.', 'error');
                console.error('Save settings error:', err);
            }
        });
    }
}
