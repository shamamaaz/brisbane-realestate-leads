import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SellerService {
  private apiUrl = `${environment.apiUrl}/api/leads`;

  constructor(private http: HttpClient) {}

  /**
   * Submit property appraisal request
   */
  requestAppraisal(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  /**
   * Get lead by ID
   */
  getLeadById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}
