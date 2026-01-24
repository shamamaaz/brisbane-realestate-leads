import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Agency } from '../../models/agency.model';
import { AuthService } from '../../services/auth.service';
import { AgencyService } from '../../services/agency.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  error = '';
  socialError = '';
  agencies: Agency[] = [];
  isLoadingAgencies = false;

  roles = [
    { value: 'agency_admin', label: 'Agency' },
    { value: 'agent', label: 'Agent' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private agencyService: AgencyService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['agency_admin', [Validators.required]],
      agencyName: [''],
      agencyId: [''],
      primaryColor: ['#1f6b6f'],
      secondaryColor: ['#fffaf3'],
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadAgencies();
    this.registerForm.get('role')?.valueChanges.subscribe((role) => {
      this.updateRoleValidators(role);
    });
    this.updateRoleValidators(this.registerForm.get('role')?.value);
  }

  private loadAgencies() {
    this.isLoadingAgencies = true;
    this.agencyService.getAgencies().subscribe({
      next: (agencies) => {
        this.agencies = agencies || [];
        this.isLoadingAgencies = false;
      },
      error: () => {
        this.isLoadingAgencies = false;
      },
    });
  }

  private updateRoleValidators(role: string) {
    const agencyNameControl = this.registerForm.get('agencyName');
    const agencyIdControl = this.registerForm.get('agencyId');

    if (role === 'agency_admin') {
      agencyNameControl?.setValidators([Validators.required, Validators.minLength(2)]);
      agencyIdControl?.clearValidators();
      agencyIdControl?.setValue('');
    } else {
      agencyIdControl?.setValidators([Validators.required]);
      agencyNameControl?.clearValidators();
      agencyNameControl?.setValue('');
    }

    agencyNameControl?.updateValueAndValidity();
    agencyIdControl?.updateValueAndValidity();
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
    const { name, email, password, role, agencyId, agencyName, primaryColor, secondaryColor } = this.registerForm.value;

    this.authService.register(email, password, name, role, {
      agencyId: agencyId ? Number(agencyId) : undefined,
      agencyName,
      primaryColor,
      secondaryColor,
    }).subscribe({
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
          this.router.navigate(['/seller']);
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
