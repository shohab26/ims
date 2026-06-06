import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Role {
  id: number;
  role_name: string;
  description?: string;
  created_at?: string;
}

export interface PermissionAdmin {
  module_id: number;
  module_name: string;
  display_name: string;
  can_view: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export interface UserAdmin {
  id: number;
  full_name: string;
  email: string;
  role_id: number;
  role_name?: string;
  is_active: boolean;
  created_at?: string;
  password?: string; // only used on create/update forms
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private baseUrl = 'http://localhost:3001';

  constructor(private http: HttpClient) {}

  // ── Roles ─────────────────────────────────────────
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}/admin/roles`);
  }
  getRoleById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/admin/roles/${id}`);
  }
  createRole(r: Partial<Role>): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/roles`, r);
  }
  updateRole(id: number, r: Partial<Role>): Observable<any> {
    return this.http.patch(`${this.baseUrl}/admin/roles/update/${id}`, r);
  }
  deleteRole(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/roles/${id}`);
  }

  getRolePermissions(roleId: number): Observable<PermissionAdmin[]> {
    return this.http.get<PermissionAdmin[]>(`${this.baseUrl}/admin/roles/${roleId}/permissions`);
  }

  updateRolePermissions(roleId: number, permissions: PermissionAdmin[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/roles/${roleId}/permissions`, { permissions });
  }

  // ── Users ─────────────────────────────────────────
  getAllUsers(): Observable<UserAdmin[]> {
    return this.http.get<UserAdmin[]>(`${this.baseUrl}/admin/users`);
  }
  getUserById(id: number): Observable<UserAdmin> {
    return this.http.get<UserAdmin>(`${this.baseUrl}/admin/users/${id}`);
  }
  createUser(u: Partial<UserAdmin>): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/users`, u);
  }
  updateUser(id: number, u: Partial<UserAdmin>): Observable<any> {
    return this.http.patch(`${this.baseUrl}/admin/users/update/${id}`, u);
  }
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/users/${id}`);
  }
}
