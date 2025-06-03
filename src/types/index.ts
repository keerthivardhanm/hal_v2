import type { Timestamp } from "firebase/firestore";

export interface Approval {
  adminUid: string;
  adminEmail: string;
  approvedAt: Timestamp;
  level: number;
}

export type ApprovalStatus = 
  | "Pending"
  | "Level 1 Approved"
  | "Level 2 Approved"
  | "Fully Approved"
  | "Rejected";

export interface ApprovalRequest {
  id: string;
  submitterName: string;
  submitterEmail: string;
  requestDetails: string;
  submittedAt: Timestamp;
  status: ApprovalStatus;
  approvals: Approval[];
  isRejected?: boolean;
  rejectionReason?: string;
  aiSuggestedContent?: string; // Optional, if admins want to save a suggestion
}
