import { Component, OnInit } from '@angular/core';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  properties: any[] = [];

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    this.properties = this.propertyService.getProperties();
  }
}
