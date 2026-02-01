import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  animations: [
    trigger('pageEnter', [
      transition(':enter', [
        query('.animate', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(150, [
            animate(
              '600ms ease-out',
              style({ opacity: 1, transform: 'translateY(0)' })
            ),
          ]),
        ]),
      ]),
    ]),
  ],
})
export class LandingComponent {
  constructor(private router: Router) {}

  handleLeadSubmitted(lead: any) {
    if (lead) {
      const stored = localStorage.getItem('submittedLeads');
      const leads = stored ? JSON.parse(stored) : [];
      leads.unshift(lead);
      localStorage.setItem('submittedLeads', JSON.stringify(leads));
    }
    this.router.navigate(['/thank-you']);
  }

  goToSell() {
    this.router.navigate(['/sell']);
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  goToForAgents() {
    this.router.navigate(['/for-agents']);
  }
}
