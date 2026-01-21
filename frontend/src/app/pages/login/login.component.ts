import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  login() {
    if (this.loginForm.invalid) {
      this.error = 'Please fill all required fields';
      return;
    }

    this.isLoading = true;
    this.error = '';
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.isLoading = false;
        const role = response.role || this.authService.getRole();
        if (role === 'agent') {
          this.router.navigate(['/agent']);
        } else if (role === 'agency_admin') {
          this.router.navigate(['/agency']);
        } else if (role === 'system_admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/sell']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }
}
