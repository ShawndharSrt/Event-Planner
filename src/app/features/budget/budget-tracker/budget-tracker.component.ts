import { Component, Input, signal, computed, inject, ChangeDetectorRef, ViewChild, TemplateRef, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BudgetService } from '../../../core/services/budget.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { BudgetWithDetails, BudgetCategory, Expense } from '../../../core/models/budget.model';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { DataTableComponent, TableColumn, TableAction, TableConfig } from '../../../shared/components/data-table/data-table.component';
import { BaseFormComponent } from '../../../shared/components/base-form/base-form.component';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-budget-tracker',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, DataTableComponent, CategoryFormComponent],
    templateUrl: './budget-tracker.component.html',
    styleUrl: './budget-tracker.component.scss'
})
export class BudgetTrackerComponent extends BaseFormComponent implements AfterViewInit, OnInit {
    @Input() eventId!: string;

    budgetService = inject(BudgetService);
    expenseService = inject(ExpenseService);
    snackbarService = inject(SnackbarService);
    confirmationService = inject(ConfirmationDialogService);
    cdr = inject(ChangeDetectorRef);

    // Budget and expense data
    budget = signal<BudgetWithDetails>(this.getEmptyBudget());
    expenses = signal<Expense[]>([]);

    // UI state
    selectedCategory = signal<string | null>(null);
    selectedStatus = signal<string | null>(null);
    showExpenseForm = signal(false);
    editingExpense = signal<Expense | null>(null);
    isLoadingExpenses = signal(false);
    isLoadingBudget = signal(false);

    // Category management state
    showCategoryForm = signal(false);
    editingCategory = signal<BudgetCategory | null>(null);

    // Initial form config for BaseFormComponent
    getFormConfig(): Record<string, any> {
        return {
            categoryId: ['', Validators.required],
            description: ['', [Validators.required, Validators.minLength(3)]],
            vendor: ['', Validators.required],
            amount: ['', [Validators.required, Validators.min(0.01)]],
            date: [new Date().toISOString().split('T')[0], Validators.required],
            status: ['pending', Validators.required],
            notes: ['']
        };
    }

    override ngOnInit() {
        super.ngOnInit(); // Initialize form

        // Initialize table columns early (before data loads)
        this.tableColumns = [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'categoryName', label: 'Category', type: 'text' },
            { key: 'description', label: 'Description', type: 'text' },
            { key: 'vendor', label: 'Vendor', type: 'text' },
            { key: 'amount', label: 'Amount', type: 'currency', format: (val) => this.formatCurrency(val) },
            { key: 'status', label: 'Status', type: 'status' },
            { key: 'actions', label: 'Actions', type: 'actions' }
        ];

        if (this.eventId) {
            this.loadBudgetAndExpenses();
        }
    }

    /**
     * Load both budget and expense data
     * Backend provides totalSpent and spentAmount in budget response
     */
    loadBudgetAndExpenses() {
        this.isLoadingBudget.set(true);
        this.isLoadingExpenses.set(true);

        forkJoin({
            budget: this.budgetService.getBudgetByEventId(this.eventId),
            expenses: this.expenseService.getExpenses(this.eventId)
        }).subscribe({
            next: ({ budget, expenses }) => {
                this.budget.set(budget.data || this.getEmptyBudget());
                this.expenses.set(expenses.data || []);
                this.isLoadingBudget.set(false);
                this.isLoadingExpenses.set(false);
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to load budget or expenses', err);
                this.budget.set(this.getEmptyBudget());
                this.expenses.set([]);
                this.isLoadingBudget.set(false);
                this.isLoadingExpenses.set(false);
            }
        });
    }

    /**
     * Reload budget to get updated spend amounts
     */
    refreshBudget() {
        this.budgetService.getBudgetByEventId(this.eventId).subscribe({
            next: (response) => {
                this.budget.set(response.data || this.getEmptyBudget());
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to refresh budget', err);
            }
        });
    }

    /**
     * Load expenses with optional filtering
     */
    loadExpenses() {
        this.isLoadingExpenses.set(true);

        const filter = {
            categoryId: this.selectedCategory() || undefined,
            status: this.selectedStatus() as 'pending' | 'paid' | 'overdue' | undefined,
            sortBy: 'date' as const,
            sortOrder: 'desc' as const
        };

        this.expenseService.getExpenses(this.eventId, filter).subscribe({
            next: (response) => {
                this.expenses.set(response.data || []);
                this.isLoadingExpenses.set(false);
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to load expenses', err);
                this.expenses.set([]);
                this.isLoadingExpenses.set(false);
            }
        });
    }

    /**
     * Refresh both budget (for updated spend) and expenses after changes
     */
    refreshAfterExpenseChange() {
        this.loadBudgetAndExpenses();
    }

    private getEmptyBudget(): BudgetWithDetails {
        return {
            _id: '',
            eventId: this.eventId || '',
            totalBudget: 0,
            totalSpent: 0,
            currency: 'USD',
            categories: []
        };
    }

    /**
     * Get total spent from budget response (calculated by backend)
     */
    totalSpent = computed(() => {
        return this.budget()?.totalSpent || 0;
    });

    totalRemaining = computed(() => {
        const total = this.budget()?.totalBudget || 0;
        return total - this.totalSpent();
    });

    budgetPercentage = computed(() => {
        const total = this.budget()?.totalBudget || 1;
        return Math.round((this.totalSpent() / total) * 100);
    });

    /**
     * Get filtered expenses with category names mapped
     */
    filteredExpenses = computed(() => {
        const expenses = this.expenses() || [];
        const categories = this.budget()?.categories || [];

        // Map expenses to include categoryName
        const mapped = expenses.map(expense => ({
            ...expense,
            categoryName: this.getCategoryName(expense.categoryId)
        }));

        return mapped;
    });

    /**
     * Calculate percentage spent for a category
     * Uses spentAmount from backend-calculated budget response
     */
    getCategorySpentPercentage(categoryId: string): number {
        const category = this.budget()?.categories.find((c: BudgetCategory) => c._id === categoryId);
        if (!category || category.allocatedAmount === 0) return 0;
        return Math.round((category.spentAmount / category.allocatedAmount) * 100);
    }

    /**
     * Get spent amount for category (from backend)
     */
    getCategorySpent(categoryId: string): number {
        const category = this.budget()?.categories.find((c: BudgetCategory) => c._id === categoryId);
        return category?.spentAmount || 0;
    }

    clearFilters() {
        this.selectedCategory.set(null);
        this.selectedStatus.set(null);
        this.loadExpenses();
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.budget()?.currency || 'USD'
        }).format(amount);
    }

    formatDate(dateValue: string): string {
        try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) {
                return dateValue;
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateValue;
        }
    }

    parseDate(dateString: any): Date | null {
        if (!dateString) return null;
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
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
        this.form.reset({
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
        this.form.patchValue({
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
        this.form.reset();
    }

    saveExpense() {
        if (this.isFormValid()) {
            const formValue = this.form.value;

            const editingExpense = this.editingExpense();
            if (editingExpense) {
                const expenseId = editingExpense._id || (editingExpense as any).id;

                if (!expenseId) {
                    this.snackbarService.show('Error: Cannot update expense without an ID', 'error');
                    return;
                }

                // Update existing expense
                this.expenseService.updateExpense(expenseId, {
                    categoryId: formValue.categoryId,
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
                            this.refreshAfterExpenseChange();
                            this.cancelExpenseForm();
                        }
                    },
                    error: () => this.snackbarService.show('Failed to update expense', 'error')
                });
            } else {
                // Create new expense (no categoryName - backend handles it)
                this.expenseService.createExpense(this.eventId, {
                    eventId: this.eventId,
                    categoryId: formValue.categoryId,
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
                            this.refreshAfterExpenseChange();
                            this.cancelExpenseForm();
                        }
                    },
                    error: () => this.snackbarService.show('Failed to add expense', 'error')
                });
            }
        } else {
            this.markAllAsTouched();
            this.snackbarService.show('Please fill in all required fields', 'error');
        }
    }

    deleteExpense(expense: Expense) {
        const expenseId = expense._id || (expense as any).id;

        if (!expenseId) {
            console.error('Expense ID is missing', expense);
            this.snackbarService.show('Error: Cannot delete expense without an ID', 'error');
            return;
        }

        this.confirmationService.confirm(
            `Are you sure you want to delete this expense: ${expense.description}?`,
            'Delete Expense',
            'danger',
            'Delete',
            'Cancel'
        ).subscribe((confirmed) => {
            if (confirmed) {
                this.expenseService.deleteExpense(expenseId).subscribe({
                    next: () => {
                        this.snackbarService.show('Expense deleted successfully', 'success');
                        this.refreshAfterExpenseChange();
                    },
                    error: () => this.snackbarService.show('Failed to delete expense', 'error')
                });
            }
        });
    }

    @ViewChild('dateTemplate', { static: true }) dateTemplate!: TemplateRef<any>;

    // Table Configuration
    tableConfig: TableConfig = {
        showPagination: true,
        showActions: true,
        pageSizeOptions: [5, 10, 20]
    };

    tableColumns: TableColumn[] = [];

    ngAfterViewInit() {
        // Initialize columns after view init to ensure template is available
        this.tableColumns = [
            { key: 'date', label: 'Date', type: 'template', template: this.dateTemplate },
            { key: 'categoryName', label: 'Category', type: 'text' },
            { key: 'description', label: 'Description', type: 'text' },
            { key: 'vendor', label: 'Vendor', type: 'text' },
            { key: 'amount', label: 'Amount', type: 'currency', format: (val) => this.formatCurrency(val) },
            { key: 'status', label: 'Status', type: 'status' },
            { key: 'actions', label: 'Actions', type: 'actions' }
        ];
        this.cdr.detectChanges();
    }

    tableActions: TableAction[] = [
        { name: 'edit', label: 'Edit', icon: 'edit' },
        { name: 'delete', label: 'Delete', icon: 'delete', class: 'danger' }
    ];

    handleTableAction(event: { action: string, row: any }) {
        if (event.action === 'edit') {
            this.openEditExpenseForm(event.row);
        } else if (event.action === 'delete') {
            this.deleteExpense(event.row);
        }
    }

    isEditingBudget = signal(false);

    toggleEditBudget() {
        this.isEditingBudget.set(!this.isEditingBudget());
    }

    saveTotalBudget(amountString: string) {
        const amount = parseFloat(amountString);
        if (isNaN(amount) || amount < 0) {
            this.snackbarService.show('Please enter a valid amount', 'error');
            return;
        }

        const budgetId = this.budget()?._id;

        if (budgetId) {
            // Update existing budget
            this.budgetService.updateBudget(this.eventId, { totalBudget: amount }).subscribe({
                next: (response) => {
                    if (response.data) {
                        this.snackbarService.show('Budget updated successfully', 'success');
                        this.loadBudgetAndExpenses();
                        this.isEditingBudget.set(false);
                    }
                },
                error: () => this.snackbarService.show('Failed to update budget', 'error')
            });
        } else {
            // Create new budget
            this.budgetService.createBudget({
                eventId: this.eventId,
                totalBudget: amount,
                currency: 'USD'
            }).subscribe({
                next: (response) => {
                    if (response.data) {
                        this.snackbarService.show('Budget created successfully', 'success');
                        this.loadBudgetAndExpenses();
                        this.isEditingBudget.set(false);
                    }
                },
                error: () => this.snackbarService.show('Failed to create budget', 'error')
            });
        }
    }

    getCategoryName(categoryId: string): string {
        return this.budget()?.categories.find((c: BudgetCategory) => c._id === categoryId)?.name || '';
    }

    // Category Management Methods
    openAddCategoryForm() {
        this.editingCategory.set(null);
        this.showCategoryForm.set(true);
    }

    openEditCategoryForm(category: BudgetCategory) {
        this.editingCategory.set(category);
        this.showCategoryForm.set(true);
    }

    closeCategoryForm() {
        this.showCategoryForm.set(false);
        this.editingCategory.set(null);
    }

    handleCategorySaved() {
        this.closeCategoryForm();
        this.loadBudgetAndExpenses();
    }

    deleteCategory(category: BudgetCategory) {
        // Check if category has expenses
        const hasExpenses = category.spentAmount > 0;
        const message = hasExpenses
            ? `Category "${category.name}" has expenses (${this.formatCurrency(category.spentAmount)} spent). Are you sure you want to delete it?`
            : `Are you sure you want to delete category "${category.name}"?`;

        this.confirmationService.confirm(
            message,
            'Delete Category',
            'danger',
            'Delete',
            'Cancel'
        ).subscribe((confirmed) => {
            if (confirmed) {
                this.budgetService.deleteCategory(this.budget()._id, category._id).subscribe({
                    next: () => {
                        this.snackbarService.show('Category deleted successfully', 'success');
                        this.loadBudgetAndExpenses();
                    },
                    error: () => this.snackbarService.show('Failed to delete category', 'error')
                });
            }
        });
    }

    // Check if categories exist
    hasCategories = computed(() => {
        return this.budget().categories.length > 0;
    });
}
