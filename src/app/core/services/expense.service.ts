import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { Expense, ExpenseFilter } from '../models/budget.model';

@Injectable({
    providedIn: 'root'
})
export class ExpenseService {
    constructor(private api: ApiService) { }

    /**
     * Get expenses for an event
     * Backend endpoint: GET /api/budget/{eventId}/expenses
     */
    getExpenses(eventId: string, filter?: Partial<ExpenseFilter>): Observable<ApiResponse<Expense[]>> {
        let url = `/budget/${eventId}/expenses`;

        // Add query parameters if filters are provided
        if (filter) {
            const params = new URLSearchParams();
            if (filter.categoryId) params.append('category', filter.categoryId);
            if (filter.status) params.append('status', filter.status);
            if (filter.sortBy) params.append('sortBy', filter.sortBy);
            if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);

            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }

        return this.api.get<ApiResponse<Expense[]>>(url);
    }

    /**
     * Create a new expense
     * Backend endpoint: POST /api/budget/{eventId}/expenses
     */
    createExpense(eventId: string, expense: Omit<Expense, '_id'>): Observable<ApiResponse<Expense>> {
        return this.api.post<ApiResponse<Expense>>(`/budget/${eventId}/expenses`, expense);
    }

    /**
     * Update an existing expense
     * Backend endpoint: PATCH /api/budget/expenses/{id}
     */
    updateExpense(id: string, updates: Partial<Expense>): Observable<ApiResponse<Expense>> {
        return this.api.patch<ApiResponse<Expense>>(`/budget/expenses/${id}`, updates);
    }

    /**
     * Delete an expense
     * Backend endpoint: DELETE /api/budget/expenses/{id}
     */
    deleteExpense(id: string): Observable<ApiResponse<void>> {
        return this.api.delete<ApiResponse<void>>(`/budget/expenses/${id}`);
    }
}
