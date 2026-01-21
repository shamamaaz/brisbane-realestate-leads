import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Register a new user
   */
  register(email: string, password: string, name: string, role: string = 'homeowner'): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/register`, { email, password, name, role })
      .pipe(
        tap((response) => {
          if (response.accessToken) {
            this.setToken(response.accessToken);
            this.tokenSubject.next(response.accessToken);
            if (response.role) {
              this.setRole(response.role);
            }
          }
        })
      );
  }

  /**
   * Login user
   */
  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((response) => {
          if (response.accessToken) {
            this.setToken(response.accessToken);
            this.tokenSubject.next(response.accessToken);
            if (response.role) {
              this.setRole(response.role);
            }
          }
        })
      );
  }

  /**
   * Get current user
   */
  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }

  /**
   * Logout
   */
  logout(): void {
    this.removeToken();
    this.removeRole();
    this.tokenSubject.next(null);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('role');
    }
    return null;
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  /**
   * Store token
   */
  private setToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  private setRole(role: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('role', role);
    }
  }

  /**
   * Remove token
   */
  private removeToken(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }

  private removeRole(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('role');
    }
  }
}
