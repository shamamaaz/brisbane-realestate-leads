import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-seller-login',
  templateUrl: './seller-login.component.html',
  styleUrls: ['./seller-login.component.scss'],
})
export class SellerLoginComponent implements OnInit {
  statusMessage = 'Signing you in...';
  hasError = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const token = params.get('token');
      if (!token) {
        this.fail('Missing login token.');
        return;
      }

      this.authService.verifySellerMagicLink(token).subscribe({
        next: (response) => {
          if (!response?.accessToken) {
            this.fail('Invalid login token.');
            return;
          }
          this.authService.setSession(response.accessToken, response.role);
          this.router.navigate(['/seller']);
        },
        error: () => {
          this.fail('This login link is invalid or expired.');
        },
      });
    });
  }

  private fail(message: string) {
    this.hasError = true;
    this.statusMessage = message;
  }
}
