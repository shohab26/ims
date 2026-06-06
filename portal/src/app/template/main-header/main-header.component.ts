import { Component } from '@angular/core';
import { AuthService, AuthUser } from '../../services/auth.service';

@Component({
  selector: 'app-main-header',
  templateUrl: './main-header.component.html',
  styleUrl: './main-header.component.css'
})
export class MainHeaderComponent {
  constructor(public authService: AuthService) {}

  get user(): AuthUser | null {
    return this.authService.getUser();
  }

  logout(): void {
    this.authService.logout();
  }

  formatRoleName(name: string): string {
    if (!name) return '';
    return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
