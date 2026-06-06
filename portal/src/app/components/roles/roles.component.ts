import { Component, OnInit } from '@angular/core';
import { AdminService, Role, PermissionAdmin } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  isLoading = false;

  // Modal state
  showModal = false;
  isEditMode = false;
  selectedId: number | null = null;

  form: Partial<Role> = { role_name: '', description: '' };
  errorMsg = '';

  // Permissions Modal state
  showPermsModal = false;
  permissions: PermissionAdmin[] = [];
  selectedRoleForPerms: Role | null = null;
  isSavingPerms = false;

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit(): void { this.loadRoles(); }

  loadRoles(): void {
    this.isLoading = true;
    this.adminService.getAllRoles().subscribe({
      next: data => { this.roles = data; this.isLoading = false; },
      error: () => { this.isLoading = false; this.toast.show('Failed to load roles.', 'error'); }
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedId = null;
    this.form = { role_name: '', description: '' };
    this.errorMsg = '';
    this.showModal = true;
  }

  openEditModal(role: Role): void {
    this.isEditMode = true;
    this.selectedId = role.id;
    this.form = { role_name: role.role_name, description: role.description };
    this.errorMsg = '';
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  save(): void {
    if (!this.form.role_name?.trim()) {
      this.errorMsg = 'Role name is required.';
      return;
    }
    if (this.isEditMode && this.selectedId) {
      this.adminService.updateRole(this.selectedId, this.form).subscribe({
        next: () => { this.toast.show('Role updated successfully.', 'success'); this.closeModal(); this.loadRoles(); },
        error: (e) => { this.errorMsg = e.error?.message || 'Failed to update role.'; }
      });
    } else {
      this.adminService.createRole(this.form).subscribe({
        next: () => { this.toast.show('Role created successfully.', 'success'); this.closeModal(); this.loadRoles(); },
        error: (e) => { this.errorMsg = e.error?.message || 'Failed to create role.'; }
      });
    }
  }

  delete(role: Role): void {
    if (role.role_name === 'super_admin') {
      this.toast.show('Cannot delete the super_admin role.', 'error'); return;
    }
    if (!confirm(`Delete role "${role.role_name}"? Users with this role will lose their assignment.`)) return;
    this.adminService.deleteRole(role.id).subscribe({
      next: () => { this.toast.show('Role deleted.', 'success'); this.loadRoles(); },
      error: (e) => { this.toast.show(e.error?.message || 'Failed to delete role.', 'error'); }
    });
  }

  formatRoleName(name: string): string {
    return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  // ── Permissions Management ─────────────────────────────────────
  openPermissionsModal(role: Role): void {
    if (role.role_name === 'super_admin') {
      this.toast.show('Super Admin automatically has full permissions.', 'warning');
      return;
    }
    this.selectedRoleForPerms = role;
    this.showPermsModal = true;
    this.permissions = [];
    this.isLoading = true;

    this.adminService.getRolePermissions(role.id).subscribe({
      next: data => {
        this.permissions = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toast.show('Failed to load permissions.', 'error');
        this.closePermsModal();
      }
    });
  }

  closePermsModal(): void {
    this.showPermsModal = false;
    this.selectedRoleForPerms = null;
    this.permissions = [];
  }

  savePermissions(): void {
    if (!this.selectedRoleForPerms) return;
    this.isSavingPerms = true;

    this.adminService.updateRolePermissions(this.selectedRoleForPerms.id, this.permissions).subscribe({
      next: () => {
        this.isSavingPerms = false;
        this.toast.show('Permissions updated successfully.', 'success');
        this.closePermsModal();
      },
      error: () => {
        this.isSavingPerms = false;
        this.toast.show('Failed to update permissions.', 'error');
      }
    });
  }

  toggleAll(action: 'can_view' | 'can_create' | 'can_update' | 'can_delete', event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.permissions.forEach(p => p[action] = checked);
  }
}
