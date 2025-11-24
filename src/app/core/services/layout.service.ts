import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LayoutService {
    isOpen = signal(false);
    darkMode = signal(false);

    toggleSidebar() {
        this.isOpen.update(val => !val);
    }

    closeSidebar() {
        this.isOpen.set(false);
    }

    openSidebar() {
        this.isOpen.set(true);
    }

    toggleDarkMode() {
        this.darkMode.update(val => !val);
        if (this.darkMode()) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }
}
