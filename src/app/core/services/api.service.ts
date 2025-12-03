import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/api';

  // TEMP: hard-coded JWT for dev
  private get token(): string | null {
    // Paste your token here for now:
    return 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI2OTJkNDhmMDQ0NzNjMjAxOWYzN2ViYTEiLCJlbWFpbCI6Im5ld0BleGFtcGxlMS5jb20iLCJyb2xlIjoiVVNFUiIsImV4cCI6MTc2NDkxMzc4M30.NMuXISJ0a-xc5avxEeqDFQ95h11FVIbPD4ICrDvHL6kRVrmXWvpPoqcAi6nQOK3jXczH1lZjATe2JMktjwKZrg';
  }

  constructor(private http: HttpClient) { }

  private get options() {
    let headers = new HttpHeaders();

    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return {
      withCredentials: true,
      headers
    };
  }

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, this.options);
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body, this.options);
  }

  patch<T>(path: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body, this.options);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`, this.options);
  }
}