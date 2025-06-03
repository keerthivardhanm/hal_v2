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
  id: string; // Firestore document ID

  // Form fields
  submitterName: string;
  submitterEmail: string; // Main contact email
  organisationName: string;
  submitterIdNo: string; 
  purpose: string;
  requestDate: Timestamp; 
  requestTime: string; // HH:MM format
  numberOfItems: number;
  finalSelectedGadgets: string[]; // Stores names of selected gadgets, e.g., ["Mobile", "Laptop", "Custom Gadget"]

  // System fields
  submittedAt: Timestamp;
  status: ApprovalStatus;
  approvals: Approval[];
  isRejected?: boolean;
  rejectionReason?: string;
  aiSuggestedContent?: string; 
}
