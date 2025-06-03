"use client";

import type { ApprovalRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ThumbsUp, ThumbsDown, Eye, Sparkles, CheckCircle2, Hourglass, XCircle, CalendarDays, User, Mail, FileText } from "lucide-react";
import { format } from "date-fns";
import { useState, type ReactNode } from "react";
import { doc, updateDoc, arrayUnion, serverTimestamp, getDoc } from "firebase/firestore";
import { db, auth } from "@/config/firebase";
import { useToast } from "@/hooks/use-toast";
import { suggestDocumentContent, type SuggestDocumentContentInput } from "@/ai/flows/suggest-document-content"; // AI Flow
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RequestRowProps {
  request: ApprovalRequest;
}

const StatusInfo = ({ status }: { status: ApprovalRequest["status"] }) => {
  let icon: ReactNode;
  let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "default";
  let textColor = "";

  switch (status) {
    case "Pending":
      icon = <Hourglass className="h-4 w-4" />;
      badgeVariant = "secondary";
      textColor = "text-yellow-600 dark:text-yellow-400";
      break;
    case "Level 1 Approved":
    case "Level 2 Approved":
      icon = <ThumbsUp className="h-4 w-4" />;
      badgeVariant = "default"; // Using primary color for in-progress
      textColor = "text-primary";
      break;
    case "Fully Approved":
      icon = <CheckCircle2 className="h-4 w-4" />;
      badgeVariant = "default"; // Using accent for success, defined in globals.css as subtle green
      textColor = "text-green-600 dark:text-green-400"; // Overriding for better visibility if accent is too light
      break;
    case "Rejected":
      icon = <XCircle className="h-4 w-4" />;
      badgeVariant = "destructive";
      textColor = "text-destructive";
      break;
    default:
      icon = <Hourglass className="h-4 w-4" />;
      badgeVariant = "outline";
      textColor = "text-muted-foreground";
  }
  return (
    <Badge variant={badgeVariant} className={`flex items-center gap-1 ${textColor}`}>
      {icon}
      {status}
    </Badge>
  );
};


export function RequestRow({ request }: RequestRowProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);

  const currentUser = auth.currentUser;

  const handleApprove = async () => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to approve." });
      return;
    }
    if (request.approvals.find(appr => appr.adminUid === currentUser.uid)) {
      toast({ variant: "destructive", title: "Already Approved", description: "You have already approved this request." });
      return;
    }
    if (request.status === "Fully Approved" || request.status === "Rejected") {
        toast({ variant: "destructive", title: "Action Not Allowed", description: "This request is already finalized or rejected." });
        return;
    }

    setIsSubmitting(true);
    try {
      const requestRef = doc(db, "approval_requests", request.id);
      const newApproval = {
        adminUid: currentUser.uid,
        adminEmail: currentUser.email || "N/A",
        approvedAt: serverTimestamp(),
        level: request.approvals.length + 1,
      };

      let newStatus: ApprovalRequest["status"] = request.status;
      if (newApproval.level === 1) newStatus = "Level 1 Approved";
      else if (newApproval.level === 2) newStatus = "Level 2 Approved";
      else if (newApproval.level >= 3) newStatus = "Fully Approved";
      // In a real scenario, for level 3, you'd trigger the email.

      await updateDoc(requestRef, {
        approvals: arrayUnion(newApproval),
        status: newStatus,
      });

      toast({ title: "Request Approved", description: `Level ${newApproval.level} approval successful.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Approval Failed", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to reject." });
      return;
    }
     if (request.status === "Fully Approved" || request.status === "Rejected") {
        toast({ variant: "destructive", title: "Action Not Allowed", description: "This request is already finalized or rejected." });
        return;
    }
    if (!rejectionReason.trim()) {
        toast({ variant: "destructive", title: "Validation Error", description: "Rejection reason cannot be empty." });
        return;
    }
    setIsSubmitting(true);
    try {
      const requestRef = doc(db, "approval_requests", request.id);
      await updateDoc(requestRef, {
        status: "Rejected",
        isRejected: true,
        rejectionReason: rejectionReason,
        // Optionally, clear approvals if company policy dictates
        // approvals: [] 
      });
      toast({ title: "Request Rejected", description: "The request has been marked as rejected." });
      setIsRejectDialogOpen(false);
      setRejectionReason("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Rejection Failed", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiSuggest = async () => {
    setIsAiLoading(true);
    setAiSuggestion(null); // Clear previous suggestion
    try {
      // Fetch latest request data to ensure formData is up-to-date for AI
      const requestRef = doc(db, "approval_requests", request.id);
      const docSnap = await getDoc(requestRef);
      if (!docSnap.exists()) {
        toast({ variant: "destructive", title: "Error", description: "Request data not found." });
        setIsAiLoading(false);
        return;
      }
      const currentRequestData = docSnap.data() as ApprovalRequest;

      const formDataForAI: SuggestDocumentContentInput['formData'] = {
        submitterName: currentRequestData.submitterName,
        submitterEmail: currentRequestData.submitterEmail,
        requestDetails: currentRequestData.requestDetails,
        // Add any other relevant fields from your form that the AI should consider
      };

      const result = await suggestDocumentContent({ formData: formDataForAI });
      setAiSuggestion(result.documentContentSuggestion);
      setIsAiDialogOpen(true); // Open dialog once suggestion is ready
    } catch (error: any) {
      console.error("AI Suggestion Error:", error);
      toast({ variant: "destructive", title: "AI Suggestion Failed", description: error.message || "Could not generate suggestion." });
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const canApprove = request.status !== "Fully Approved" && request.status !== "Rejected" && !request.approvals.find(appr => appr.adminUid === currentUser?.uid) && request.approvals.length < 3;
  const canReject = request.status !== "Fully Approved" && request.status !== "Rejected";


  return (
    <TableRow>
      <TableCell className="font-medium hidden md:table-cell">{request.id.substring(0, 8)}...</TableCell>
      <TableCell>{request.submitterName}</TableCell>
      <TableCell className="hidden sm:table-cell">{request.submitterEmail}</TableCell>
      <TableCell className="hidden lg:table-cell">{format(request.submittedAt.toDate(), "PP")}</TableCell>
      <TableCell>
        <StatusInfo status={request.status} />
      </TableCell>
      <TableCell className="text-right space-x-1">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" title="View Details">
              <Eye className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-headline">Request Details: {request.id.substring(0,8)}...</DialogTitle>
              <DialogDescription>
                Full details of the approval request.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 text-sm">
                <div className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Name:</strong> <span className="ml-1">{request.submitterName}</span></div>
                <div className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Email:</strong> <span className="ml-1">{request.submitterEmail}</span></div>
                <div className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Submitted:</strong> <span className="ml-1">{format(request.submittedAt.toDate(), 'PPPp')}</span></div>
                <Separator />
                <div className="flex items-start"><FileText className="mr-2 h-4 w-4 text-muted-foreground mt-1" /><strong>Details:</strong></div>
                <p className="ml-6 p-2 bg-muted/50 rounded-md whitespace-pre-wrap">{request.requestDetails}</p>
                {request.isRejected && request.rejectionReason && (
                    <Alert variant="destructive" className="mt-2">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription><strong>Rejection Reason:</strong> {request.rejectionReason}</AlertDescription>
                    </Alert>
                )}
                <Separator />
                <h4 className="font-semibold">Approval Log:</h4>
                {request.approvals.length > 0 ? (
                    <ul className="space-y-2 ml-2">
                    {request.approvals.map(appr => (
                        <li key={appr.adminUid} className="text-xs">
                            <Badge variant="secondary" className="mr-1">Lvl {appr.level}</Badge> Approved by {appr.adminEmail} on {format(appr.approvedAt.toDate(), 'PPp')}
                        </li>
                    ))}
                    </ul>
                ) : (<p className="text-xs text-muted-foreground ml-2">No approvals yet.</p>)}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="ghost" size="icon" title="AI Suggest Content" onClick={handleAiSuggest} disabled={isAiLoading}>
          {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        </Button>
        
        <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-headline flex items-center"><Sparkles className="h-5 w-5 mr-2 text-primary" />AI Document Suggestion</DialogTitle>
                    <DialogDescription>
                        Here's an AI-generated suggestion based on the request details. Use this as inspiration.
                    </DialogDescription>
                </DialogHeader>
                {aiSuggestion ? (
                    <Textarea readOnly value={aiSuggestion} rows={10} className="my-4" />
                ) : (
                    <p className="my-4 text-muted-foreground">No suggestion available or still loading...</p>
                )}
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setIsAiDialogOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


        {canApprove && (
            <Button variant="ghost" size="icon" title="Approve" onClick={handleApprove} disabled={isSubmitting}>
              <ThumbsUp className="h-4 w-4 text-green-500" />
            </Button>
        )}

        {canReject && (
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Reject">
                <ThumbsDown className="h-4 w-4 text-red-500" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                <DialogTitle className="font-headline">Reject Request</DialogTitle>
                <DialogDescription>
                    Please provide a reason for rejecting this request. This will be visible to the submitter.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rejectionReason" className="text-right col-span-1">
                    Reason
                    </Label>
                    <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="col-span-3"
                    placeholder="Detailed reason for rejection..."
                    />
                </div>
                </div>
                <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                <Button type="submit" variant="destructive" onClick={handleReject} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Confirm Rejection
                </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        )}
      </TableCell>
    </TableRow>
  );
}
