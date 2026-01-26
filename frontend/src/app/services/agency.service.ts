import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Agency } from '../models/agency.model';

@Injectable({
  providedIn: 'root',
})
export class AgencyService {
  private apiUrl = `${environment.apiUrl}/api/agencies`;

  constructor(private http: HttpClient) {}

  getAgencies(): Observable<Agency[]> {
    return this.http.get<Agency[]>(this.apiUrl);
  }

  getAgencyById(id: number): Observable<Agency> {
    return this.http.get<Agency>(`${this.apiUrl}/${id}`);
  }

  getMyAgency(): Observable<Agency> {
    return this.http.get<Agency>(`${this.apiUrl}/me`);
  }

  updateAgency(id: number, payload: Partial<Agency>): Observable<Agency> {
    return this.http.patch<Agency>(`${this.apiUrl}/${id}`, payload);
  }

  uploadLogo(id: number, file: File): Observable<Agency> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Agency>(`${this.apiUrl}/${id}/logo`, formData);
  }

  /**
   * Lookup agencies by postcode
   */
  lookupByPostcode(postcode: string) {
    return this.http.get<any>(`${this.apiUrl}/lookup?postcode=${postcode}`);
  }
}
