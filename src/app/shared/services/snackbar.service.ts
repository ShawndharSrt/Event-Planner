import { Injectable, signal } from '@angular/core';

export type SnackbarType = 'success' | 'error' | 'info';

export interface SnackbarState {
    message: string;
    type: SnackbarType;
    isVisible: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class SnackbarService {
    snackbarState = signal<SnackbarState>({
        message: '',
        type: 'info',
        isVisible: false
    });

    show(message: string, type: SnackbarType = 'info', duration: number = 3000): void {
        this.snackbarState.set({
            message,
            type,
            isVisible: true
        });

        setTimeout(() => {
            this.hide();
        }, duration);
    }

    hide(): void {
        this.snackbarState.update(state => ({
            ...state,
            isVisible: false
        }));
    }
}
