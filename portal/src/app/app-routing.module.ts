import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './components/app-layout/app-layout.component';
import { LoginLayoutComponent } from './components/login-layout/login-layout.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { RegisterComponent } from './components/register/register.component';
import { MainWrapperComponent } from './template/main-wrapper/main-wrapper.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { WarehousesComponent } from './components/warehouses/warehouses.component';
import { ProductsComponent } from './components/products/products.component';
import { StatusComponent } from './components/status/status.component';
import { VendorsComponent } from './components/vendors/vendors.component';
import { CustomersComponent } from './components/customers/customers.component';
import { StocksComponent } from './components/stocks/stocks.component';
import { OrdersComponent } from './components/orders/orders.component';
import { DeliveryComponent } from './components/delivery/delivery.component';
import { ReturnsComponent } from './components/returns/returns.component';
import { StockTransfersComponent } from './components/stock-transfers/stock-transfers.component';
import { ReportsComponent } from './components/reports/reports.component';
import { RolesComponent } from './components/roles/roles.component';
import { UsersManagementComponent } from './components/users-management/users-management.component';
import { InvoicesComponent } from './components/invoices/invoices.component';
import { ActivityLogsComponent } from './components/activity-logs/activity-logs.component';
import { AiAssistantComponent } from './components/ai-assistant/ai-assistant.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { permissionGuard } from './guards/permission.guard';

const routes: Routes = [
  {
    path: 'inventory',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',  component: MainWrapperComponent, canActivate: [permissionGuard], data: { module: 'dashboard' } },
      { path: 'category',   component: CategoriesComponent, canActivate: [permissionGuard], data: { module: 'categories' } },
      { path: 'warehouse',  component: WarehousesComponent, canActivate: [permissionGuard], data: { module: 'warehouse' } },
      { path: 'status',     component: StatusComponent, canActivate: [permissionGuard], data: { module: 'status' } },
      { path: 'vendor',     component: VendorsComponent, canActivate: [permissionGuard], data: { module: 'vendors' } },
      { path: 'customer',   component: CustomersComponent, canActivate: [permissionGuard], data: { module: 'customers' } },
      { path: 'product',    component: ProductsComponent, canActivate: [permissionGuard], data: { module: 'products' } },
      { path: 'stock',      component: StocksComponent, canActivate: [permissionGuard], data: { module: 'stocks' } },
      { path: 'stock-transfers', component: StockTransfersComponent, canActivate: [permissionGuard], data: { module: 'stock_transfers' } },
      { path: 'order',      component: OrdersComponent, canActivate: [permissionGuard], data: { module: 'orders' } },
      { path: 'delivery',   component: DeliveryComponent, canActivate: [permissionGuard], data: { module: 'delivery' } },
      { path: 'returns',    component: ReturnsComponent, canActivate: [permissionGuard], data: { module: 'returns' } },
      { path: 'invoice',    component: InvoicesComponent, canActivate: [permissionGuard], data: { module: 'invoices' } },
      { path: 'reports',    component: ReportsComponent, canActivate: [permissionGuard], data: { module: 'reports' } },
      { path: 'assistant',  component: AiAssistantComponent },
      // Admin-only routes
      { path: 'roles',        component: RolesComponent,           canActivate: [roleGuard] },
      { path: 'users',        component: UsersManagementComponent, canActivate: [roleGuard] },
      { path: 'audit-logs',   component: ActivityLogsComponent,    canActivate: [roleGuard] },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },
  {
    path: 'login',
    component: LoginLayoutComponent,
    children: [
      { path: '', component: LoginFormComponent },
      { path: 'register', component: RegisterComponent },
    ]
  },
  { path: '**', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
