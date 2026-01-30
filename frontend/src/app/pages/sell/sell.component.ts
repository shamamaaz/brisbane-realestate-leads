import { Component, OnInit } from '@angular/core';
import { AgencyService } from '../../services/agency.service';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss'],
})
export class SellComponent implements OnInit {
  submittedLeads: any[] = [];
  suggestedAgencies: any[] = [];
  isLookingUpAgencies = false;
  showThankYou = false;

  constructor(private agencyService: AgencyService) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('submittedLeads');
    this.submittedLeads = stored ? JSON.parse(stored) : [];
    this.showThankYou = localStorage.getItem('leadSubmissionComplete') === 'true';
    if (this.submittedLeads.length > 0) {
      this.lookupAgenciesFromLead(this.submittedLeads[0]);
    }
  }

  setLeadFromLanding(lead: any) {
    if (!lead) {
      return;
    }

    this.submittedLeads = [lead, ...this.submittedLeads];
    localStorage.setItem('submittedLeads', JSON.stringify(this.submittedLeads));
    this.lookupAgenciesFromLead(lead);
    this.showThankYou = true;
  }

  private lookupAgenciesFromLead(lead: any) {
    const address = lead.propertyAddress || '';
    const postcodeMatch = address.match(/\b\d{4}\b/);
    if (!postcodeMatch) {
      this.suggestedAgencies = [];
      return;
    }

    this.isLookingUpAgencies = true;
    this.agencyService.lookupByPostcode(postcodeMatch[0]).subscribe({
      next: (res) => {
        this.suggestedAgencies = res.agencies || [];
        this.isLookingUpAgencies = false;
      },
      error: () => {
        this.suggestedAgencies = [];
        this.isLookingUpAgencies = false;
      },
    });
  }
}
