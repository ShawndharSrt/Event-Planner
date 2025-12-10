import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationDialogService } from '../../services/confirmation-dialog.service';

@Component({
    selector: 'app-confirmation-dialog',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './confirmation-dialog.component.html',
    styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {
    confirmationService = inject(ConfirmationDialogService);

    @HostListener('document:keydown.escape')
    onEscapeKey() {
        this.cancel();
    }

    @HostListener('document:keydown.enter')
    onEnterKey() {
        // Only trigger if dialog is visible to avoid conflicts
        this.confirmationService.isVisible$.subscribe(isVisible => {
            if (isVisible) {
                this.confirm();
            }
        });
    }

    confirm() {
        this.confirmationService.confirmAction();
    }

    cancel() {
        this.confirmationService.cancelAction();
    }

    onBackdropClick() {
        this.cancel();
    }

    onDialogClick(event: Event) {
        // Prevent backdrop click when clicking inside dialog
        event.stopPropagation();
    }
}
