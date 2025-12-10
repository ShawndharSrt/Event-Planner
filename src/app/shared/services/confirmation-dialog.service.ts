import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ConfirmationDialogData {
    message: string;
    title?: string;
    type?: 'warning' | 'danger' | 'info';
    confirmText?: string;
    cancelText?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ConfirmationDialogService {
    private dialogSubject = new Subject<boolean>();
    private visibilitySubject = new Subject<boolean>();

    dialogData: ConfirmationDialogData = {
        message: '',
        title: 'Confirm Action',
        type: 'warning',
        confirmText: 'Confirm',
        cancelText: 'Cancel'
    };

    isVisible$ = this.visibilitySubject.asObservable();

    /**
     * Show a confirmation dialog
     * @param message The message to display
     * @param title Optional title (default: 'Confirm Action')
     * @param type Optional type: 'warning' | 'danger' | 'info' (default: 'warning')
     * @param confirmText Optional confirm button text (default: 'Confirm')
     * @param cancelText Optional cancel button text (default: 'Cancel')
     * @returns Observable<boolean> - true if confirmed, false if cancelled
     */
    confirm(
        message: string,
        title?: string,
        type: 'warning' | 'danger' | 'info' = 'warning',
        confirmText?: string,
        cancelText?: string
    ): Observable<boolean> {
        this.dialogData = {
            message,
            title: title || 'Confirm Action',
            type,
            confirmText: confirmText || 'Confirm',
            cancelText: cancelText || 'Cancel'
        };

        this.visibilitySubject.next(true);

        return new Observable(observer => {
            const subscription = this.dialogSubject.subscribe(result => {
                observer.next(result);
                observer.complete();
                this.visibilitySubject.next(false);
            });

            return () => subscription.unsubscribe();
        });
    }

    /**
     * Confirm the action (called by the component)
     */
    confirmAction() {
        this.dialogSubject.next(true);
    }

    /**
     * Cancel the action (called by the component)
     */
    cancelAction() {
        this.dialogSubject.next(false);
    }
}
