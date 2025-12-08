export interface Budget {
    _id: string;
    eventId: string;
    totalBudget: number;
    currency: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface BudgetCategory {
    _id: string;
    budgetId: string;
    name: string;
    allocatedAmount: number;
    spentAmount: number;
    color: string;
    icon: string;
}

export interface Expense {
    _id: string;
    eventId: string;
    categoryId: string;
    categoryName: string;
    description: string;
    vendor: string;
    amount: number;
    date: string;
    status: 'pending' | 'paid' | 'overdue';
    notes?: string;
}

// Combined interface for UI that includes related data
export interface BudgetWithDetails extends Budget {
    categories: BudgetCategory[];
    expenses: Expense[];
}
