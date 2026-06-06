import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {
  email = '';
  password = '';
  otp = '';
  newPassword = '';
  isLoading = false;
  errorMsg = '';
  step: 'login' | 'change-password' = 'login';

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    if (!this.email || !this.password) {
      this.errorMsg = 'Please enter your email and password.';
      return;
    }
    this.isLoading = true;
    this.errorMsg = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        if ('password_change_required' in res) {
          this.step = 'change-password';
          return;
        }
        this.navigateAfterLogin();
      },
      error: (e) => {
        this.isLoading = false;
        this.errorMsg = e.error?.message || 'Login failed. Please try again.';
      }
    });
  }

  completePasswordChange(): void {
    if (!this.otp || !this.newPassword) {
      this.errorMsg = 'Please enter the verification code and new password.';
      return;
    }
    this.isLoading = true;
    this.errorMsg = '';

    this.authService.completePasswordChange(this.email, this.otp, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.navigateAfterLogin();
      },
      error: (e) => {
        this.isLoading = false;
        this.errorMsg = e.error?.message || 'Failed to change password. Please try again.';
      }
    });
  }

  private navigateAfterLogin(): void {
    if (this.authService.isSuperAdmin() || this.authService.hasPermission('dashboard', 'view')) {
      this.router.navigate(['/inventory/dashboard']);
    } else {
      const perms = this.authService.getPermissions();
      const firstViewable = perms.find(p => p.can_view && p.module_name !== 'dashboard');
      if (firstViewable) {
        const routeMap: Record<string, string> = {
          'products': 'product', 'categories': 'category', 'warehouse': 'warehouse',
          'status': 'status', 'vendors': 'vendor', 'customers': 'customer',
          'stocks': 'stock', 'orders': 'order', 'delivery': 'delivery'
        };
        this.router.navigate([`/inventory/${routeMap[firstViewable.module_name] || 'dashboard'}`]);
      } else {
        this.router.navigate(['/inventory/dashboard']);
      }
    }
  }
}
