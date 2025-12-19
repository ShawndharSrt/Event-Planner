import { Component, Input, Output, EventEmitter, signal, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent } from '../../../shared/components/base-form/base-form.component';
import { BudgetService } from '../../../core/services/budget.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { BudgetCategory } from '../../../core/models/budget.model';

@Component({
    selector: 'app-category-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './category-form.component.html',
    styleUrl: './category-form.component.scss'
})
export class CategoryFormComponent extends BaseFormComponent implements OnChanges {
    @Input() budgetId!: string;
    @Input() eventId!: string;
    @Input() category: BudgetCategory | null = null;
    @Output() saved = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    budgetService = inject(BudgetService);
    snackbarService = inject(SnackbarService);

    isLoading = signal(false);

    // Preset color palette
    colorPalette = [
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Green', value: '#10b981' },
        { name: 'Purple', value: '#8b5cf6' },
        { name: 'Orange', value: '#f97316' },
        { name: 'Red', value: '#ef4444' },
        { name: 'Yellow', value: '#eab308' },
        { name: 'Pink', value: '#ec4899' },
        { name: 'Teal', value: '#14b8a6' }
    ];

    // Common Material Icons for categories
    iconOptions = [
        { name: 'Category', value: 'category' },
        { name: 'Restaurant', value: 'restaurant' },
        { name: 'Flight', value: 'flight' },
        { name: 'Hotel', value: 'hotel' },
        { name: 'Entertainment', value: 'local_activity' },
        { name: 'Shopping', value: 'shopping_bag' },
        { name: 'Transportation', value: 'directions_car' },
        { name: 'Medical', value: 'medical_services' },
        { name: 'Gift', value: 'card_giftcard' },
        { name: 'Photo', value: 'photo_camera' },
        { name: 'Music', value: 'music_note' },
        { name: 'Celebration', value: 'celebration' }
    ];

    getFormConfig(): Record<string, any> {
        return {
            name: [this.category?.name || '', [Validators.required, Validators.minLength(2)]],
            allocatedAmount: [this.category?.allocatedAmount || '', [Validators.required, Validators.min(0.01)]],
            color: [this.category?.color || '#3b82f6', Validators.required],
            icon: [this.category?.icon || 'category', Validators.required]
        };
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['category'] && this.category && this.form) {
            // Patch form with existing category values when editing
            this.form.patchValue({
                name: this.category.name,
                allocatedAmount: this.category.allocatedAmount,
                color: this.category.color,
                icon: this.category.icon
            });
        }
    }

    saveCategory() {
        if (!this.isFormValid()) {
            this.markAllAsTouched();
            this.snackbarService.show('Please fill in all required fields', 'error');
            return;
        }

        this.isLoading.set(true);
        const formValue = this.form.value;

        const categoryData = {
            name: formValue.name,
            allocatedAmount: parseFloat(formValue.allocatedAmount),
            color: formValue.color,
            icon: formValue.icon
        };

        if (this.category) {
            // Update existing category
            this.budgetService.updateCategory(this.budgetId, this.category._id, categoryData).subscribe({
                next: () => {
                    this.snackbarService.show('Category updated successfully', 'success');
                    this.isLoading.set(false);
                    this.saved.emit();
                },
                error: (err) => {
                    console.error('Failed to update category', err);
                    this.snackbarService.show('Failed to update category', 'error');
                    this.isLoading.set(false);
                }
            });
        } else {
            // Create new category or budget
            const budgetPayload = {
                eventId: this.eventId,
                currency: 'USD',
                categories: [categoryData]
            };

            this.budgetService.updateBudget(this.eventId, budgetPayload).subscribe({
                next: () => {
                    this.snackbarService.show('Category created successfully', 'success');
                    this.isLoading.set(false);
                    this.saved.emit();
                },
                error: (err) => {
                    console.error('Failed to create category', err);
                    this.snackbarService.show('Failed to create category', 'error');
                    this.isLoading.set(false);
                }
            });
        }
    }

    cancel() {
        this.cancelled.emit();
    }
}
