import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss'],
})
export class SellComponent {
  constructor(private router: Router) {}

  handleLeadSubmitted() {
    this.router.navigate(['/sell/thank-you']);
  }
}
