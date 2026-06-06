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
  isLoading = false;
  errorMsg = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    if (!this.email || !this.password) {
      this.errorMsg = 'Please enter your email and password.';
      return;
    }
    this.isLoading = true;
    this.errorMsg = '';

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        
        // Find default route based on permissions
        if (this.authService.isSuperAdmin() || this.authService.hasPermission('dashboard', 'view')) {
          this.router.navigate(['/inventory/dashboard']);
        } else {
          const perms = this.authService.getPermissions();
          const firstViewable = perms.find(p => p.can_view && p.module_name !== 'dashboard');
          if (firstViewable) {
            // Mapping from DB module names to frontend routes
            let routeMap: Record<string, string> = {
              'products': 'product',
              'categories': 'category',
              'warehouse': 'warehouse',
              'status': 'status',
              'vendors': 'vendor',
              'customers': 'customer',
              'stocks': 'stock',
              'orders': 'order',
              'delivery': 'delivery'
            };
            const route = routeMap[firstViewable.module_name] || 'dashboard';
            this.router.navigate([`/inventory/${route}`]);
          } else {
            this.router.navigate(['/inventory/dashboard']); // Let it get blocked
          }
        }
      },
      error: (e) => {
        this.isLoading = false;
        this.errorMsg = e.error?.message || 'Login failed. Please try again.';
      }
    });
  }
}
