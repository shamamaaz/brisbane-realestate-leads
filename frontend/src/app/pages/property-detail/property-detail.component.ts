import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-property-detail',
  templateUrl: './property-detail.component.html',
  styleUrls: ['./property-detail.component.scss']
})
export class PropertyDetailComponent implements OnInit {
  property: any;
  loading = true;
  notFound = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.property = this.propertyService.getPropertyById(id);
      
      if (this.property) {
        this.loading = false;
      } else {
        this.notFound = true;
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  contactAgent(): void {
    alert(`Contact form for ${this.property.title} - Coming soon!`);
  }

  scheduleViewing(): void {
    alert(`Schedule viewing for ${this.property.title} - Coming soon!`);
  }
}
