import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { Budget, BudgetWithDetails, BudgetCategory, Expense } from '../models/budget.model';

@Injectable({
    providedIn: 'root'
})
export class BudgetService {
    constructor(private api: ApiService) { }

    getBudgetByEventId(eventId: string): Observable<ApiResponse<BudgetWithDetails>> {
        return this.api.get<ApiResponse<BudgetWithDetails>>(`/budget/${eventId}`);
    }

    addExpense(expense: Omit<Expense, '_id'>): Observable<ApiResponse<Expense>> {
        return this.api.post<ApiResponse<Expense>>(`/budget/${expense.eventId}/expenses`, expense);
    }

    updateExpense(id: string, updates: Partial<Expense>): Observable<ApiResponse<Expense>> {
        return this.api.patch<ApiResponse<Expense>>(`/budget/${id}`, updates);
    }

    deleteExpense(id: string): Observable<ApiResponse<void>> {
        return this.api.delete<ApiResponse<void>>(`/budget/${id}`);
    }

    getCategoryById(id: string): Observable<ApiResponse<BudgetCategory>> {
        return this.api.get<ApiResponse<BudgetCategory>>(`/budget/budget-categories/${id}`);
    }

    createBudget(budget: Partial<Budget>): Observable<ApiResponse<Budget>> {
        return this.api.post<ApiResponse<Budget>>('/budget', budget);
    }

    updateBudget(id: string, budget: Partial<Budget>): Observable<ApiResponse<Budget>> {
        return this.api.patch<ApiResponse<Budget>>(`/budget/${id}`, budget);
    }
}
