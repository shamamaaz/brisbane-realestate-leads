import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-seller-access',
  templateUrl: './seller-access.component.html',
  styleUrls: ['./seller-access.component.scss'],
})
export class SellerAccessComponent {
  email = '';
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AuthService) {}

  requestLink() {
    if (!this.email) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;

    this.authService.requestSellerMagicLink(this.email).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Check your email for your private login link.';
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Unable to send link. Please try again.';
      },
    });
  }
}
