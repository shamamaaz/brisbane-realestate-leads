import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isLoggedIn = false;
  role: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.authService.token$.subscribe(token => {
      this.isLoggedIn = !!token;
      this.role = this.authService.getRole();
    });
    this.role = this.authService.getRole();
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/auth/register']);
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.role = null;
    this.router.navigate(['/']);
  }
}
