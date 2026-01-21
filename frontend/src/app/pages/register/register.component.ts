import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  error = '';
  socialError = '';

  roles = [
    { value: 'homeowner', label: 'Homeowner (Submit leads)' },
    { value: 'agent', label: 'Real Estate Agent' },
    { value: 'agency_admin', label: 'Agency Admin' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['homeowner', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  register() {
    if (this.registerForm.invalid) {
      this.error = 'Please fill all required fields correctly';
      return;
    }

    this.isLoading = true;
    this.error = '';
    const { name, email, password, role } = this.registerForm.value;

    this.authService.register(email, password, name, role).subscribe({
      next: (response) => {
        this.isLoading = false;
        const userRole = response.role || role;
        if (userRole === 'agent') {
          this.router.navigate(['/agent']);
        } else if (userRole === 'agency_admin') {
          this.router.navigate(['/agency']);
        } else if (userRole === 'system_admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/sell']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  continueWithGoogle() {
    this.startSocialAuth(environment.googleAuthUrl, 'Google');
  }

  continueWithFacebook() {
    this.startSocialAuth(environment.facebookAuthUrl, 'Facebook');
  }

  private startSocialAuth(url: string, provider: string) {
    this.socialError = '';
    if (!url) {
      this.socialError = `${provider} sign-up is not configured yet.`;
      return;
    }
    window.location.href = url;
  }
}
