export interface Budget {
    _id: string;
    eventId: string;
    totalBudget: number;
    currency: string;
    categories?: Partial<BudgetCategory>[];
    createdAt?: string;
    updatedAt?: string;
}

export interface BudgetCategory {
    _id: string;
    name: string;
    allocatedAmount: number;
    spentAmount: number; // Calculated by backend from expenses
    color: string;
    icon: string;
}

export interface Expense {
    _id: string;
    eventId: string;
    categoryId: string;
    description: string;
    vendor: string;
    amount: number;
    date: string;
    status: 'pending' | 'paid' | 'overdue';
    notes?: string;
}

// BudgetSummary response from backend includes categories with calculated spentAmount
export interface BudgetWithDetails extends Budget {
    categories: BudgetCategory[];
    totalSpent: number; // Calculated by backend
}

// Pagination interfaces for expense list (if backend supports it)
export interface PaginatedExpenses {
    expenses: Expense[];
    total?: number;
    page?: number;
    limit?: number;
}

export interface ExpenseFilter {
    eventId: string;
    categoryId?: string;
    status?: 'pending' | 'paid' | 'overdue';
    page?: number;
    limit?: number;
    sortBy?: 'date' | 'amount';
    sortOrder?: 'asc' | 'desc';
}

// DTOs for category operations
export interface CreateCategoryDto {
    name: string;
    allocatedAmount: number;
    color: string;
    icon: string;
}

export interface UpdateCategoryDto {
    name?: string;
    allocatedAmount?: number;
    color?: string;
    icon?: string;
}
