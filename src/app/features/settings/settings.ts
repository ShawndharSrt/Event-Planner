import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LayoutService } from '../../core/services/layout.service';
import { inject } from '@angular/core';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { BaseFormComponent } from '../../shared/components/base-form/base-form.component';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './settings.html',
    styleUrl: './settings.scss'
})
export class SettingsComponent extends BaseFormComponent implements OnInit {
    layoutService = inject(LayoutService);
    private snackbarService = inject(SnackbarService);

    getFormConfig(): Record<string, any> {
        return {
            appName: ['Event Planner'],
            language: ['en'],
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
        console.log('Settings saved:', this.form.value);
        // In a real app, this would call a service to save settings
        this.snackbarService.show('Settings saved successfully!', 'success');
    }
}
