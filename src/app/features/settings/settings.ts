import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LayoutService } from '../../core/services/layout.service';
import { inject } from '@angular/core';
import { SnackbarService } from '../../shared/services/snackbar.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './settings.html',
    styleUrl: './settings.scss'
})
export class SettingsComponent {
    settingsForm: FormGroup;
    layoutService = inject(LayoutService);

    constructor(
        private fb: FormBuilder,
        private snackbarService: SnackbarService
    ) {
        this.settingsForm = this.fb.group({
            appName: ['Event Planner'],
            language: ['en'],
            darkMode: [this.layoutService.darkMode()],
            emailNotifications: [true],
            pushNotifications: [false]
        });

        this.settingsForm.get('darkMode')?.valueChanges.subscribe(() => {
            this.layoutService.toggleDarkMode();
        });
    }

    saveSettings(): void {
        console.log('Settings saved:', this.settingsForm.value);
        // In a real app, this would call a service to save settings
        this.snackbarService.show('Settings saved successfully!', 'success');
    }
}
