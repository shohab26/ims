import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  // Get the required module name from route data
  const requiredModule = route.data['module'] as string;

  if (!requiredModule) {
    return true; // No specific module required for this route
  }

  if (authService.hasPermission(requiredModule, 'view')) {
    return true;
  }

  // If we reach here, the user lacks permission
  toast.show(`Access Denied: You do not have permission to view ${requiredModule}.`, 'error');
  
  // Try to redirect to a safe page (first available module)
  const perms = authService.getPermissions();
  const firstViewable = perms.find(p => p.can_view && p.module_name !== requiredModule);
  if (firstViewable) {
    let routeMap: Record<string, string> = {
      'dashboard': 'dashboard',
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
    const route = routeMap[firstViewable.module_name];
    if (route) {
        return router.parseUrl(`/inventory/${route}`);
    }
  }

  return false;
};
