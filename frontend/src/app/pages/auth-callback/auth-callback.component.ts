import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.scss'],
})
export class AuthCallbackComponent implements OnInit {
  statusMessage = 'Signing you in...';
  hasError = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const token = params.get('token');
      const role = params.get('role') || undefined;

      if (!token) {
        this.hasError = true;
        this.statusMessage = 'Social sign-in failed. Please try again.';
        return;
      }

      this.authService.setSession(token, role);
      this.redirectByRole(role);
    });
  }

  private redirectByRole(role?: string) {
    if (role === 'agent') {
      this.router.navigate(['/agent']);
      return;
    }
    if (role === 'agency_admin') {
      this.router.navigate(['/agency']);
      return;
    }
    if (role === 'system_admin') {
      this.router.navigate(['/admin']);
      return;
    }
    this.router.navigate(['/seller']);
  }
}
