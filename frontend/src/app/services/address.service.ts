import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AddressSuggestion {
  formatted: string;
  streetAddress: string;
  suburb: string;
  state: string;
  postcode: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private apiUrl = `${environment.apiUrl}/api/address`;

  constructor(private http: HttpClient) {}

  search(query: string): Observable<AddressSuggestion[]> {
    return this.http.get<AddressSuggestion[]>(`${this.apiUrl}/search`, {
      params: { q: query },
    });
  }
}
