import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';

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
    // private mockCategories: BudgetCategory[] = [
    //     { id: 1, name: 'Venue', allocatedAmount: 15000, spentAmount: 12000, color: '#6366f1', icon: 'location_on' },
    //     { id: 2, name: 'Catering', allocatedAmount: 25000, spentAmount: 22500, color: '#f59e0b', icon: 'restaurant' },
    //     { id: 3, name: 'Entertainment', allocatedAmount: 10000, spentAmount: 8500, color: '#8b5cf6', icon: 'music_note' },
    //     { id: 4, name: 'Decorations', allocatedAmount: 8000, spentAmount: 7200, color: '#ec4899', icon: 'cake' },
    //     { id: 5, name: 'Photography', allocatedAmount: 5000, spentAmount: 5000, color: '#10b981', icon: 'camera_alt' },
    //     { id: 6, name: 'Transportation', allocatedAmount: 3000, spentAmount: 1800, color: '#06b6d4', icon: 'directions_car' },
    //     { id: 7, name: 'Marketing', allocatedAmount: 4000, spentAmount: 3500, color: '#f43f5e', icon: 'campaign' },
    //     { id: 8, name: 'Miscellaneous', allocatedAmount: 5000, spentAmount: 2100, color: '#64748b', icon: 'more_horiz' }
    // ];

    // private mockExpenses: Expense[] = [
    //     {
    //         id: 1, eventId: 1, categoryId: 1, categoryName: 'Venue',
    //         description: 'Main Hall Booking', vendor: 'Grand Palace Hotel',
    //         amount: 12000, date: '2024-01-15', status: 'paid'
    //     },
    //     // ... (other mock expenses)
    // ];

    constructor(private api: ApiService) { }

    getBudgetByEventId(eventId: number): Observable<ApiResponse<Budget>> {
        return this.api.get<ApiResponse<Budget>>(`/events/${eventId}/budget`);
    }

    addExpense(expense: Omit<Expense, 'id'>): Observable<ApiResponse<Expense>> {
        return this.api.post<ApiResponse<Expense>>(`/events/${expense.eventId}/expenses`, expense);
    }

    updateExpense(id: number, updates: Partial<Expense>): Observable<ApiResponse<Expense>> {
        return this.api.patch<ApiResponse<Expense>>(`/expenses/${id}`, updates);
    }

    deleteExpense(id: number): Observable<ApiResponse<void>> {
        return this.api.delete<ApiResponse<void>>(`/expenses/${id}`);
    }

    getCategoryById(id: number): Observable<ApiResponse<BudgetCategory>> {
        return this.api.get<ApiResponse<BudgetCategory>>(`/budget-categories/${id}`);
    }
}
