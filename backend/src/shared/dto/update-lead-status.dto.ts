export class UpdateLeadStatusDto {
  status: string;
  notes?: string;
  nextFollowUpDate?: Date;
  assignedAgentName?: string;
}
