import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-for-agents',
  templateUrl: './for-agents.component.html',
  styleUrls: ['./for-agents.component.scss'],
})
export class ForAgentsComponent {
  constructor(private router: Router) {}

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
