import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Lead } from '../models/lead.model';

@Injectable({
  providedIn: 'root',
})
export class LeadService {
  private apiUrl = `${environment.apiUrl}/api/leads`;

  constructor(private http: HttpClient) {}

  createLead(lead: Lead): Observable<Lead> {
    return this.http.post<Lead>(this.apiUrl, lead);
  }

  getLeads(): Observable<Lead[]> {
    return this.http.get<Lead[]>(this.apiUrl);
  }

  getMyLeads(): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${this.apiUrl}/mine`);
  }

  getLeadById(id: number): Observable<Lead> {
    return this.http.get<Lead>(`${this.apiUrl}/${id}`);
  }

  updateLead(id: number, lead: Lead): Observable<Lead> {
    return this.http.put<Lead>(`${this.apiUrl}/${id}`, lead);
  }

  /**
   * Update lead status with notes and follow-up details
   */
  updateLeadStatus(id: number, statusUpdate: any): Observable<Lead> {
    return this.http.post<Lead>(`${this.apiUrl}/${id}/status`, statusUpdate);
  }

  assignLead(id: number, agentId: number, agentName?: string): Observable<Lead> {
    return this.http.post<Lead>(`${this.apiUrl}/${id}/assign`, { agentId, agentName });
  }

  /**
   * Add a note/comment to a lead
   */
  addNoteToLead(id: number, note: string): Observable<Lead> {
    return this.http.post<Lead>(`${this.apiUrl}/${id}/notes`, { note });
  }

  /**
   * Get call history for a lead
   */
  getCallHistory(id: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${id}/call-history`);
  }

  /**
   * Schedule a follow-up for a lead
   */
  scheduleFollowUp(
    id: number,
    followUpDate: Date,
    notes: string,
  ): Observable<Lead> {
    return this.http.post<Lead>(`${this.apiUrl}/${id}/schedule-followup`, {
      followUpDate,
      notes,
    });
  }

  deleteLead(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadLeadsCsv(file: File): Observable<{
    successCount: number;
    errorCount: number;
    errors: Array<{ row: number; message: string }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{
      successCount: number;
      errorCount: number;
      errors: Array<{ row: number; message: string }>;
    }>(`${this.apiUrl}/bulk`, formData);
  }
}
