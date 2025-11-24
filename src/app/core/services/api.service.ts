import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = '/api';

    constructor(private http: HttpClient) { }

    // Mock implementation for now
    get<T>(path: string): Observable<T> {
        // return this.http.get<T>(`${this.baseUrl}${path}`);
        return of({} as T).pipe(delay(500)); // Simulate network delay
    }

    post<T>(path: string, body: any): Observable<T> {
        // return this.http.post<T>(`${this.baseUrl}${path}`, body);
        return of(body as T).pipe(delay(500));
    }

    patch<T>(path: string, body: any): Observable<T> {
        // return this.http.patch<T>(`${this.baseUrl}${path}`, body);
        return of(body as T).pipe(delay(500));
    }

    delete(path: string): Observable<void> {
        // return this.http.delete<void>(`${this.baseUrl}${path}`);
        return of(void 0).pipe(delay(500));
    }
}
