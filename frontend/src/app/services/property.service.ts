import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  properties = [
    { id: 1, title: 'Modern 3 Bedroom House', location: 'Sydney, NSW', price: 950000, image: 'sample-house.svg' },
    { id: 2, title: 'Cozy Apartment', location: 'Melbourne, VIC', price: 650000, image: 'sample-apartment.svg' },
    { id: 3, title: 'Luxury Villa', location: 'Gold Coast, QLD', price: 1500000, image: 'sample-villa.svg' },
    { id: 4, title: 'Urban Studio', location: 'Brisbane, QLD', price: 400000, image: 'sample-studio.svg' },
    { id: 5, title: 'Family House with Garden', location: 'Perth, WA', price: 850000, image: 'sample-garden-house.svg' },
    { id: 6, title: 'Beachfront Condo', location: 'Byron Bay, NSW', price: 1200000, image: 'sample-beach-condo.svg' },
  ];

  getProperties() {
    return this.properties;
  }

  getPropertyById(id: number) {
    return this.properties.find(p => p.id === id);
  }
}
