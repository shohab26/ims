import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  role_name: string;
  role_id: number;
}

export interface Permission {
  module_name: string;
  can_view: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  permissions: Permission[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:3001';
  private TOKEN_KEY = 'inv_token';
  private USER_KEY = 'inv_user';
  private PERMS_KEY = 'inv_perms';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
        localStorage.setItem(this.PERMS_KEY, JSON.stringify(res.permissions));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.PERMS_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): AuthUser | null {
    const u = localStorage.getItem(this.USER_KEY);
    return u ? JSON.parse(u) : null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      // Decode payload (middle part of JWT)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  isSuperAdmin(): boolean {
    const user = this.getUser();
    return user?.role_name === 'super_admin';
  }

  getPermissions(): Permission[] {
    const p = localStorage.getItem(this.PERMS_KEY);
    return p ? JSON.parse(p) : [];
  }

  hasPermission(moduleName: string, action: 'view' | 'create' | 'update' | 'delete'): boolean {
    if (this.isSuperAdmin()) return true;

    const perms = this.getPermissions();
    const modPerm = perms.find(p => p.module_name === moduleName || p.module_name === 'all');
    
    if (!modPerm) return false;

    switch (action) {
      case 'view': return modPerm.can_view;
      case 'create': return modPerm.can_create;
      case 'update': return modPerm.can_update;
      case 'delete': return modPerm.can_delete;
      default: return false;
    }
  }
}
