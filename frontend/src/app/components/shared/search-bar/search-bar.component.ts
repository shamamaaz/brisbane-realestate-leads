import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  searchLocation: string = '';
  propertyType: string = '';

  @Output() searchEvent = new EventEmitter<{ location: string; type: string }>();

  onSearch() {
    this.searchEvent.emit({
      location: this.searchLocation,
      type: this.propertyType
    });
  }

  onClear(): void {
    this.searchLocation = '';
    this.propertyType = '';
    this.searchEvent.emit({ location: '', type: '' });
  }
}
