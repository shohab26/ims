import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {
  userId = '';
  password = '';

  constructor(private router: Router) {}

  login() {
    if (this.userId && this.password) {
      this.router.navigate(['/inventory/dashboard']);
    }
  }
}
