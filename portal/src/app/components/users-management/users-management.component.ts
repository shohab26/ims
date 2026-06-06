import { Component, OnInit } from '@angular/core';
import { AdminService, Role, UserAdmin } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-users-management',
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.css'
})
export class UsersManagementComponent implements OnInit {
  users: UserAdmin[] = [];
  roles: Role[] = [];
  isLoading = false;

  // Modal state
  showModal = false;
  isEditMode = false;
  selectedId: number | null = null;

  form: Partial<UserAdmin> & { password?: string; confirm_password?: string } = {
    full_name: '', email: '', password: '', confirm_password: '', role_id: undefined, is_active: true
  };
  errorMsg = '';

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.adminService.getAllUsers().subscribe({
      next: data => { this.users = data; this.isLoading = false; },
      error: () => { this.isLoading = false; this.toast.show('Failed to load users.', 'error'); }
    });
  }

  loadRoles(): void {
    this.adminService.getAllRoles().subscribe({
      next: data => { this.roles = data; },
      error: () => {}
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedId = null;
    this.form = { full_name: '', email: '', password: '', confirm_password: '', role_id: undefined, is_active: true };
    this.errorMsg = '';
    this.showModal = true;
  }

  openEditModal(user: UserAdmin): void {
    this.isEditMode = true;
    this.selectedId = user.id;
    this.form = { full_name: user.full_name, email: user.email, role_id: user.role_id, is_active: user.is_active, password: '', confirm_password: '' };
    this.errorMsg = '';
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  save(): void {
    if (!this.form.full_name?.trim() || !this.form.email?.trim() || !this.form.role_id) {
      this.errorMsg = 'Full name, email, and role are required.'; return;
    }
    if (!this.isEditMode && !this.form.password) {
      this.errorMsg = 'Password is required for new users.'; return;
    }
    if (this.form.password && this.form.password !== this.form.confirm_password) {
      this.errorMsg = 'Passwords do not match.'; return;
    }

    const payload: any = {
      full_name: this.form.full_name,
      email: this.form.email,
      role_id: this.form.role_id,
      is_active: this.form.is_active
    };
    if (this.form.password) payload.password = this.form.password;

    if (this.isEditMode && this.selectedId) {
      this.adminService.updateUser(this.selectedId, payload).subscribe({
        next: () => { this.toast.show('User updated successfully.', 'success'); this.closeModal(); this.loadUsers(); },
        error: (e) => { this.errorMsg = e.error?.message || 'Failed to update user.'; }
      });
    } else {
      this.adminService.createUser(payload).subscribe({
        next: () => { this.toast.show('User created successfully.', 'success'); this.closeModal(); this.loadUsers(); },
        error: (e) => { this.errorMsg = e.error?.message || 'Failed to create user.'; }
      });
    }
  }

  delete(user: UserAdmin): void {
    if (!confirm(`Delete user "${user.full_name}"? This cannot be undone.`)) return;
    this.adminService.deleteUser(user.id).subscribe({
      next: () => { this.toast.show('User deleted.', 'success'); this.loadUsers(); },
      error: (e) => { this.toast.show(e.error?.message || 'Failed to delete user.', 'error'); }
    });
  }

  toggleActive(user: UserAdmin): void {
    this.adminService.updateUser(user.id, { ...user, is_active: !user.is_active }).subscribe({
      next: () => { this.toast.show(`User ${!user.is_active ? 'activated' : 'deactivated'}.`, 'success'); this.loadUsers(); },
      error: () => { this.toast.show('Failed to update user status.', 'error'); }
    });
  }

  formatRoleName(name: string): string {
    return (name || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
