import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { Budget, BudgetWithDetails, BudgetCategory, CreateCategoryDto, UpdateCategoryDto } from '../models/budget.model';

@Injectable({
    providedIn: 'root'
})
export class BudgetService {
    constructor(private api: ApiService) { }

    /**
     * Transform API response to match UI model
     * API returns: categoryId, categoryName, id
     * UI expects: _id, name
     */
    private transformBudgetResponse(apiData: any): BudgetWithDetails {
        return {
            _id: apiData.id || apiData._id,
            eventId: apiData.eventId,
            totalBudget: apiData.totalBudget,
            totalSpent: apiData.totalSpent,
            currency: apiData.currency,
            categories: (apiData.categories || []).map((cat: any) => ({
                _id: cat.categoryId || cat._id,
                name: cat.categoryName || cat.name,
                allocatedAmount: cat.allocatedAmount,
                spentAmount: cat.spentAmount,
                color: cat.color,
                icon: cat.icon
            })),
            createdAt: apiData.createdAt,
            updatedAt: apiData.updatedAt
        };
    }

    getBudgetByEventId(eventId: string): Observable<ApiResponse<BudgetWithDetails>> {
        return this.api.get<ApiResponse<any>>(`/budget/${eventId}`).pipe(
            map(response => ({
                ...response,
                data: response.data ? this.transformBudgetResponse(response.data) : response.data
            }))
        );
    }

    createBudget(budget: Partial<Budget>): Observable<ApiResponse<Budget>> {
        return this.api.post<ApiResponse<Budget>>('/budget', budget);
    }

    updateBudget(eventId: string, budget: Partial<Budget>): Observable<ApiResponse<Budget>> {
        return this.api.patch<ApiResponse<Budget>>(`/budget/${eventId}`, budget);
    }

    /**
     * Create a new category for a budget
     * POST /api/budget/{budgetId}/categories
     */
    createCategory(budgetId: string, category: CreateCategoryDto): Observable<ApiResponse<BudgetCategory>> {
        return this.api.post<ApiResponse<BudgetCategory>>(`/budget/${budgetId}/categories`, category);
    }

    /**
     * Update an existing category
     * PATCH /api/budget/{budgetId}/categories/{categoryId}
     */
    updateCategory(budgetId: string, categoryId: string, updates: UpdateCategoryDto): Observable<ApiResponse<BudgetCategory>> {
        return this.api.patch<ApiResponse<BudgetCategory>>(`/budget/${budgetId}/categories/${categoryId}`, updates);
    }

    /**
     * Delete a category
     * DELETE /api/budget/{budgetId}/categories/{categoryId}
     */
    deleteCategory(budgetId: string, categoryId: string): Observable<ApiResponse<void>> {
        return this.api.delete<ApiResponse<void>>(`/budget/${budgetId}/categories/${categoryId}`);
    }
}
