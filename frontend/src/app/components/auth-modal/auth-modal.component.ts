import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html'
})
export class AuthModalComponent {
  isLogin = true;
  isLoading = false;
  error = '';

  authForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public dialogRef: MatDialogRef<AuthModalComponent>
  ) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: [''],
      role: ['homeowner']
    });
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.error = '';
    if (this.isLogin) {
      this.authForm.get('name')?.clearValidators();
      this.authForm.get('role')?.clearValidators();
    } else {
      this.authForm.get('name')?.setValidators([Validators.required]);
      this.authForm.get('role')?.setValidators([Validators.required]);
    }
    this.authForm.get('name')?.updateValueAndValidity();
    this.authForm.get('role')?.updateValueAndValidity();
  }

  submit() {
    if (this.authForm.invalid) {
      this.error = 'Please fill all required fields';
      return;
    }

    this.isLoading = true;
    const { email, password, name, role } = this.authForm.value;

    const request = this.isLogin
      ? this.authService.login(email, password)
      : this.authService.register(email, password, name, role);

    request.subscribe({
      next: (response) => {
        this.isLoading = false;
        this.dialogRef.close(response);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Authentication failed';
      }
    });
  }
}
