import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
    selector: 'app-snackbar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './snackbar.component.html',
    styleUrl: './snackbar.component.scss'
})
export class SnackbarComponent {
    snackbarService = inject(SnackbarService);
}
