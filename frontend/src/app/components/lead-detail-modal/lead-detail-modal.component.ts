import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LeadService } from '../../services/lead.service';

@Component({
  selector: 'app-lead-detail-modal',
  templateUrl: './lead-detail-modal.component.html',
  styleUrls: ['./lead-detail-modal.component.scss']
})
export class LeadDetailModalComponent {
  lead: any;
  noteForm: FormGroup;
  callHistory: string[] = [];
  isAddingNote = false;
  isUpdatingStatus = false;

  constructor(
    public dialogRef: MatDialogRef<LeadDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private leadService: LeadService
  ) {
    this.lead = data.lead;
    this.noteForm = this.fb.group({
      note: ['', Validators.required]
    });
    this.loadCallHistory();
  }

  loadCallHistory() {
    this.leadService.getCallHistory(this.lead.id).subscribe({
      next: (history) => {
        this.callHistory = history;
      },
      error: (err) => {
        console.error('Error loading call history:', err);
      }
    });
  }

  addNote() {
    if (this.noteForm.invalid) return;

    this.isAddingNote = true;
    this.leadService.addNoteToLead(this.lead.id, this.noteForm.value.note).subscribe({
      next: (updatedLead) => {
        this.lead = updatedLead;
        this.callHistory.push(`[${new Date().toISOString()}] ${this.noteForm.value.note}`);
        this.noteForm.reset();
        this.isAddingNote = false;
      },
      error: (err) => {
        console.error('Error adding note:', err);
        this.isAddingNote = false;
      }
    });
  }

  updateStatus(newStatus: string) {
    if (!newStatus) return;

    this.isUpdatingStatus = true;
    const statusUpdate = {
      status: newStatus,
      notes: `Status updated to ${newStatus}`,
      lastContactedDate: new Date()
    };

    this.leadService.updateLeadStatus(this.lead.id, statusUpdate).subscribe({
      next: (updatedLead) => {
        this.lead = updatedLead;
        this.isUpdatingStatus = false;
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.isUpdatingStatus = false;
      }
    });
  }

  close() {
    this.dialogRef.close(this.lead);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'New': '#e74c3c',
      'Contacted': '#f39c12',
      'Scheduled': '#3498db',
      'Closed': '#27ae60'
    };
    return colors[status] || '#95a5a6';
  }
}
