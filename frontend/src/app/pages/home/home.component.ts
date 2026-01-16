import { Component, OnInit } from '@angular/core';
import { Lead } from '../../models/lead.model';
import { LeadService } from '../../services/lead.service';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  allProperties: any[] = [];
  properties: any[] = [];

  constructor(
    private propertyService: PropertyService,
    private leadService: LeadService
  ) {}

  ngOnInit(): void {
    this.allProperties = this.propertyService.getProperties();
    this.properties = [...this.allProperties];
  }

  onSearch(filter: { location: string; type: string }) {
    this.properties = this.allProperties.filter(p => {
      const matchesLocation = filter.location
        ? p.location.toLowerCase().includes(filter.location.toLowerCase())
        : true;
      const matchesType = filter.type ? p.type === filter.type : true;
      return matchesLocation && matchesType;
    });
  }

  onLeadSubmit(lead: Lead) {
    console.log('Lead submitted from home component:', lead);
    // The lead has already been submitted to the API via LeadService
    // This method is called after successful submission
  }
}
