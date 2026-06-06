import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainHeaderComponent } from './template/main-header/main-header.component';
import { MainSidebarComponent } from './template/main-sidebar/main-sidebar.component';
import { MainWrapperComponent } from './template/main-wrapper/main-wrapper.component';
import { MainControlSidebarComponent } from './template/main-control-sidebar/main-control-sidebar.component';
import { MainFooterComponent } from './template/main-footer/main-footer.component';
import { AppLayoutComponent } from './components/app-layout/app-layout.component';
import { LoginLayoutComponent } from './components/login-layout/login-layout.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { RegisterComponent } from './components/register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ProductsComponent } from './components/products/products.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { WarehousesComponent } from './components/warehouses/warehouses.component';
import { StatusComponent } from './components/status/status.component';
import { VendorsComponent } from './components/vendors/vendors.component';
import { CustomersComponent } from './components/customers/customers.component';
import { StocksComponent } from './components/stocks/stocks.component';
import { OrdersComponent } from './components/orders/orders.component';
import { DeliveryComponent } from './components/delivery/delivery.component';
import { ToastComponent } from './components/toast/toast.component';
import { RolesComponent } from './components/roles/roles.component';
import { UsersManagementComponent } from './components/users-management/users-management.component';
import { authInterceptor } from './interceptors/auth.interceptor';

import { NgChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    AppComponent,
    MainHeaderComponent,
    MainSidebarComponent,
    MainWrapperComponent,
    MainControlSidebarComponent,
    MainFooterComponent,
    AppLayoutComponent,
    LoginLayoutComponent,
    LoginFormComponent,
    RegisterComponent,
    ProductsComponent,
    CategoriesComponent,
    WarehousesComponent,
    StatusComponent,
    VendorsComponent,
    CustomersComponent,
    StocksComponent,
    OrdersComponent,
    DeliveryComponent,
    ToastComponent,
    RolesComponent,
    UsersManagementComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    NgChartsModule,
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor]))
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
