import { Component, Input, signal, computed, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BudgetService } from '../../../core/services/budget.service';
import { BudgetWithDetails, BudgetCategory, Expense } from '../../../core/models/budget.model';

import { SnackbarService } from '../../../shared/services/snackbar.service';

@Component({
    selector: 'app-budget-tracker',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './budget-tracker.component.html',
    styleUrl: './budget-tracker.component.scss'
})
export class BudgetTrackerComponent {
    @Input() eventId!: string;

    budgetService = inject(BudgetService);
    snackbarService = inject(SnackbarService);
    cdr = inject(ChangeDetectorRef);
    fb = inject(FormBuilder);

    budget = signal<BudgetWithDetails | null>(null);
    selectedCategory = signal<string | null>(null);
    selectedStatus = signal<string | null>(null);
    showExpenseForm = signal(false);
    editingExpense = signal<Expense | null>(null);

    expenseForm!: FormGroup;



    ngOnInit() {
        this.initExpenseForm();
        if (this.eventId) {
            this.loadBudget();
        }
    }

    initExpenseForm() {
        this.expenseForm = this.fb.group({
            categoryId: ['', Validators.required],
            description: ['', [Validators.required, Validators.minLength(3)]],
            vendor: ['', Validators.required],
            amount: ['', [Validators.required, Validators.min(0.01)]],
            date: [new Date().toISOString().split('T')[0], Validators.required],
            status: ['pending', Validators.required],
            notes: ['']
        });
    }

    loadBudget() {
        if (this.eventId) {
            this.budgetService.getBudgetByEventId(this.eventId).subscribe({
                next: (response) => {
                    this.budget.set(response.data ?? null);
                    this.cdr.markForCheck();
                },
                error: (err) => console.error('Failed to load budget', err)
            });
        }
    }

    totalSpent = computed(() => {
        const expenses = this.budget()?.expenses || [];
        return expenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);
    });

    totalRemaining = computed(() => {
        const total = this.budget()?.totalBudget || 0;
        return total - this.totalSpent();
    });

    budgetPercentage = computed(() => {
        const total = this.budget()?.totalBudget || 1;
        return Math.round((this.totalSpent() / total) * 100);
    });

    filteredExpenses = computed(() => {
        let expenses = this.budget()?.expenses || [];
        const categories = this.budget()?.categories || [];

        // Ensure categoryName is populated
        expenses = expenses.map((expense: Expense) => {
            if (!expense.categoryName) {
                const category = categories.find((c: BudgetCategory) => c._id === expense.categoryId);
                return {
                    ...expense,
                    categoryName: category?.name || 'Unknown'
                };
            }
            return expense;
        });

        if (this.selectedCategory()) {
            expenses = expenses.filter((e: Expense) => e.categoryId === this.selectedCategory());
        }

        if (this.selectedStatus()) {
            expenses = expenses.filter((e: Expense) => e.status === this.selectedStatus());
        }

        return expenses.sort((a: Expense, b: Expense) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    getCategorySpentPercentage(category: BudgetCategory): number {
        if (category.allocatedAmount === 0) return 0;
        return Math.round((category.spentAmount / category.allocatedAmount) * 100);
    }

    clearFilters() {
        this.selectedCategory.set(null);
        this.selectedStatus.set(null);
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.budget()?.currency || 'USD'
        }).format(amount);
    }

    formatDate(dateValue: string): string {
        try {
            // Try to parse the date
            const date = new Date(dateValue);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return dateValue; // Return original string if invalid
            }

            // Format as locale date
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateValue; // Return original string on error
        }
    }

    getStatusClass(status: string): string {
        const statusMap: Record<string, string> = {
            'paid': 'success',
            'pending': 'warning',
            'overdue': 'danger'
        };
        return statusMap[status] || '';
    }

    openAddExpenseForm() {
        this.editingExpense.set(null);
        this.expenseForm.reset({
            categoryId: '',
            description: '',
            vendor: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            status: 'pending',
            notes: ''
        });
        this.showExpenseForm.set(true);
    }

    openEditExpenseForm(expense: Expense) {
        this.editingExpense.set(expense);
        this.expenseForm.patchValue({
            categoryId: expense.categoryId,
            description: expense.description,
            vendor: expense.vendor,
            amount: expense.amount,
            date: expense.date,
            status: expense.status,
            notes: expense.notes || ''
        });
        this.showExpenseForm.set(true);
    }

    cancelExpenseForm() {
        this.showExpenseForm.set(false);
        this.editingExpense.set(null);
        this.expenseForm.reset();
    }

    saveExpense() {
        if (this.expenseForm.valid) {
            const formValue = this.expenseForm.value;
            const category = this.budget()?.categories.find((c: BudgetCategory) => c._id === formValue.categoryId);

            if (this.editingExpense()) {
                // Update existing expense
                this.budgetService.updateExpense(this.editingExpense()!._id, {
                    categoryId: formValue.categoryId,
                    categoryName: category?.name || '',
                    description: formValue.description,
                    vendor: formValue.vendor,
                    amount: parseFloat(formValue.amount),
                    date: formValue.date,
                    status: formValue.status,
                    notes: formValue.notes || undefined
                }).subscribe({
                    next: (response) => {
                        if (response.data) {
                            this.snackbarService.show('Expense updated successfully', 'success');
                            this.loadBudget();
                            this.cancelExpenseForm();
                        }
                    },
                    error: () => this.snackbarService.show('Failed to update expense', 'error')
                });
            } else {
                // Create new expense
                this.budgetService.addExpense({
                    eventId: this.eventId,
                    categoryId: formValue.categoryId,
                    categoryName: category?.name || '',
                    description: formValue.description,
                    vendor: formValue.vendor,
                    amount: parseFloat(formValue.amount),
                    date: formValue.date,
                    status: formValue.status,
                    notes: formValue.notes || undefined
                }).subscribe({
                    next: (response) => {
                        if (response.data) {
                            this.snackbarService.show('Expense added successfully', 'success');
                            this.loadBudget();
                            this.cancelExpenseForm();
                        }
                    },
                    error: () => this.snackbarService.show('Failed to add expense', 'error')
                });
            }
        } else {
            this.snackbarService.show('Please fill in all required fields', 'error');
        }
    }

    deleteExpense(expense: Expense) {
        if (confirm(`Are you sure you want to delete this expense: ${expense.description}?`)) {
            this.budgetService.deleteExpense(expense._id).subscribe({
                next: () => {
                    this.snackbarService.show('Expense deleted successfully', 'success');
                    this.loadBudget();
                },
                error: () => this.snackbarService.show('Failed to delete expense', 'error')
            });
        }
    }

    getCategoryName(categoryId: string): string {
        return this.budget()?.categories.find((c: BudgetCategory) => c._id === categoryId)?.name || '';
    }
}
