import { Injectable, signal } from '@angular/core';

export interface BudgetCategory {
    id: number;
    name: string;
    allocatedAmount: number;
    spentAmount: number;
    color: string;
    icon: string;
}

export interface Expense {
    id: number;
    eventId: number;
    categoryId: number;
    categoryName: string;
    description: string;
    vendor: string;
    amount: number;
    date: string;
    status: 'pending' | 'paid' | 'overdue';
    notes?: string;
}

export interface Budget {
    id: number;
    eventId: number;
    totalBudget: number;
    currency: string;
    categories: BudgetCategory[];
    expenses: Expense[];
}

@Injectable({
    providedIn: 'root'
})
export class BudgetService {
    private mockCategories: BudgetCategory[] = [
        { id: 1, name: 'Venue', allocatedAmount: 15000, spentAmount: 12000, color: '#6366f1', icon: 'location_on' },
        { id: 2, name: 'Catering', allocatedAmount: 25000, spentAmount: 22500, color: '#f59e0b', icon: 'restaurant' },
        { id: 3, name: 'Entertainment', allocatedAmount: 10000, spentAmount: 8500, color: '#8b5cf6', icon: 'music_note' },
        { id: 4, name: 'Decorations', allocatedAmount: 8000, spentAmount: 7200, color: '#ec4899', icon: 'cake' },
        { id: 5, name: 'Photography', allocatedAmount: 5000, spentAmount: 5000, color: '#10b981', icon: 'camera_alt' },
        { id: 6, name: 'Transportation', allocatedAmount: 3000, spentAmount: 1800, color: '#06b6d4', icon: 'directions_car' },
        { id: 7, name: 'Marketing', allocatedAmount: 4000, spentAmount: 3500, color: '#f43f5e', icon: 'campaign' },
        { id: 8, name: 'Miscellaneous', allocatedAmount: 5000, spentAmount: 2100, color: '#64748b', icon: 'more_horiz' }
    ];

    private mockExpenses: Expense[] = [
        {
            id: 1, eventId: 1, categoryId: 1, categoryName: 'Venue',
            description: 'Main Hall Booking', vendor: 'Grand Palace Hotel',
            amount: 12000, date: '2024-01-15', status: 'paid'
        },
        {
            id: 2, eventId: 1, categoryId: 2, categoryName: 'Catering',
            description: 'Dinner Service (200 pax)', vendor: 'Gourmet Catering Co.',
            amount: 15000, date: '2024-01-20', status: 'paid'
        },
        {
            id: 3, eventId: 1, categoryId: 2, categoryName: 'Catering',
            description: 'Welcome Drinks & Appetizers', vendor: 'Gourmet Catering Co.',
            amount: 7500, date: '2024-01-20', status: 'paid'
        },
        {
            id: 4, eventId: 1, categoryId: 3, categoryName: 'Entertainment',
            description: 'Live Band Performance', vendor: 'Melody Makers',
            amount: 5000, date: '2024-02-01', status: 'pending'
        },
        {
            id: 5, eventId: 1, categoryId: 3, categoryName: 'Entertainment',
            description: 'DJ Service', vendor: 'Beat Masters',
            amount: 3500, date: '2024-02-01', status: 'paid'
        },
        {
            id: 6, eventId: 1, categoryId: 4, categoryName: 'Decorations',
            description: 'Floral Arrangements', vendor: 'Blooms & Petals',
            amount: 4500, date: '2024-01-25', status: 'paid'
        },
        {
            id: 7, eventId: 1, categoryId: 4, categoryName: 'Decorations',
            description: 'Stage Design & Lighting', vendor: 'Event Decor Pro',
            amount: 2700, date: '2024-01-26', status: 'paid'
        },
        {
            id: 8, eventId: 1, categoryId: 5, categoryName: 'Photography',
            description: 'Event Photography Package', vendor: 'Capture Moments Studio',
            amount: 5000, date: '2024-02-05', status: 'paid'
        },
        {
            id: 9, eventId: 1, categoryId: 6, categoryName: 'Transportation',
            description: 'Guest Shuttle Service', vendor: 'City Transport',
            amount: 1800, date: '2024-02-01', status: 'pending'
        },
        {
            id: 10, eventId: 1, categoryId: 7, categoryName: 'Marketing',
            description: 'Digital Invitations Design', vendor: 'Creative Digital',
            amount: 2000, date: '2024-01-10', status: 'paid'
        },
        {
            id: 11, eventId: 1, categoryId: 7, categoryName: 'Marketing',
            description: 'Print Materials', vendor: 'PrintPro',
            amount: 1500, date: '2024-01-12', status: 'paid'
        },
        {
            id: 12, eventId: 1, categoryId: 8, categoryName: 'Miscellaneous',
            description: 'Event Insurance', vendor: 'SafeGuard Insurance',
            amount: 1200, date: '2024-01-08', status: 'paid'
        },
        {
            id: 13, eventId: 1, categoryId: 8, categoryName: 'Miscellaneous',
            description: 'Contingency Reserve', vendor: 'N/A',
            amount: 900, date: '2024-01-05', status: 'paid', notes: 'Emergency fund'
        }
    ];

    getBudgetByEventId(eventId: number): Budget {
        const eventExpenses = this.mockExpenses.filter(e => e.eventId === eventId);
        const totalSpent = eventExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        // Recalculate category spent amounts from expenses
        const categories = this.mockCategories.map(category => {
            const categoryExpenses = eventExpenses.filter(e => e.categoryId === category.id);
            const spentAmount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            return {
                ...category,
                spentAmount: spentAmount
            };
        });

        return {
            id: eventId,
            eventId: eventId,
            totalBudget: 75000,
            currency: 'USD',
            categories: categories,
            expenses: eventExpenses
        };
    }

    addExpense(expense: Omit<Expense, 'id'>): Expense {
        const newExpense: Expense = {
            ...expense,
            id: Math.max(...this.mockExpenses.map(e => e.id), 0) + 1
        };
        this.mockExpenses.push(newExpense);
        return newExpense;
    }

    updateExpense(id: number, updates: Partial<Expense>): Expense | null {
        const index = this.mockExpenses.findIndex(e => e.id === id);
        if (index !== -1) {
            // If categoryId is being updated, also update categoryName
            if (updates.categoryId && !updates.categoryName) {
                const category = this.mockCategories.find(c => c.id === updates.categoryId);
                if (category) {
                    updates.categoryName = category.name;
                }
            }
            this.mockExpenses[index] = { ...this.mockExpenses[index], ...updates };
            return this.mockExpenses[index];
        }
        return null;
    }

    deleteExpense(id: number): boolean {
        const index = this.mockExpenses.findIndex(e => e.id === id);
        if (index !== -1) {
            this.mockExpenses.splice(index, 1);
            return true;
        }
        return false;
    }

    getCategoryById(id: number): BudgetCategory | undefined {
        return this.mockCategories.find(c => c.id === id);
    }
}
