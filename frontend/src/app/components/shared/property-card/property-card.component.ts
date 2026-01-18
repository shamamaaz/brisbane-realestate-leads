import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-property-card',
  templateUrl: './property-card.component.html',
  styleUrls: ['./property-card.component.scss']
})
export class PropertyCardComponent {
  @Input() property: any;

  getPropertyImage(propertyId: any): string {
    // Using picsum.photos for placeholder images
    const imageId = (propertyId % 10) + 1;
    return `https://picsum.photos/400/300?random=${imageId}`;
  }
}
