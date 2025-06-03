
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
import { ThumbsUp, ThumbsDown, Eye, CheckCircle2, Hourglass, XCircle, CalendarDays, User, Mail, FileText, Loader2, Building, Hash, Clock, List, Package, Printer } from "lucide-react";
import { format } from "date-fns";
import { useState, type ReactNode, useEffect } from "react";
import { doc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore"; 
import { db, auth } from "@/config/firebase";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ApprovalLetter } from "@/components/print/ApprovalLetter";

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
      icon = <ThumbsUp className="h-4 w-4" />;
      badgeVariant = "outline";
      textColor = "text-sky-600 dark:text-sky-400";
      break;
    case "Level 2 Approved":
      icon = <ThumbsUp className="h-4 w-4" />;
      badgeVariant = "outline";
      textColor = "text-indigo-600 dark:text-indigo-400";
      break;
    case "Fully Approved":
      icon = <CheckCircle2 className="h-4 w-4" />;
      badgeVariant = "default";
      textColor = "text-green-600 dark:text-green-400";
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
    <Badge variant={badgeVariant} className={`flex items-center gap-1 ${textColor} border-${badgeVariant === "outline" ? textColor.split('-')[1] + '-500' : 'transparent'}`}>
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
  const [isPrinting, setIsPrinting] = useState(false);

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (isPrinting) {
      const timer = setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 100);
      return () => {
        clearTimeout(timer);
      }
    }
  }, [isPrinting]);

  const handleTriggerPrint = () => {
     if (request.status === "Fully Approved") {
      setIsPrinting(true);
    } else {
      toast({
        variant: "destructive",
        title: "Cannot Print",
        description: "The approval letter can only be printed once the request is fully approved.",
      });
    }
  };


  const handleApprove = async () => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to approve." });
      return;
    }
    if (request.approvals.find(appr => appr.adminUid === currentUser.uid)) {
      toast({ variant: "destructive", title: "Already Approved", description: "You have already approved this request at some level." });
      return;
    }
    if (request.status === "Fully Approved" || request.status === "Rejected" || request.approvals.length >= 3) {
        toast({ variant: "destructive", title: "Action Not Allowed", description: "This request is already finalized, rejected, or has maximum approvals." });
        return;
    }

    setIsSubmitting(true);
    try {
      const requestRef = doc(db, "approval_requests", request.id);
      const newApprovalLevel = request.approvals.length + 1;
      const newApproval = {
        adminUid: currentUser.uid,
        adminEmail: currentUser.email || "N/A",
        approvedAt: Timestamp.now(), // Using client-side timestamp
        level: newApprovalLevel,
      };

      let newStatus: ApprovalRequest["status"] = request.status;
      if (newApprovalLevel === 1) newStatus = "Level 1 Approved";
      else if (newApprovalLevel === 2) newStatus = "Level 2 Approved";
      else if (newApprovalLevel >= 3) newStatus = "Fully Approved";


      await updateDoc(requestRef, {
        approvals: arrayUnion(newApproval),
        status: newStatus,
      });

      toast({ title: "Request Approved", description: `Level ${newApproval.level} approval successful.` });
    } catch (error: any) {
      console.error("Approval error:", error);
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
      });
      toast({ title: "Request Rejected", description: "The request has been marked as rejected." });
      setIsRejectDialogOpen(false);
      setRejectionReason("");
    } catch (error: any) {
      console.error("Rejection error:", error);
      toast({ variant: "destructive", title: "Rejection Failed", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canApprove = request.status !== "Fully Approved" && request.status !== "Rejected" && !request.approvals.find(appr => appr.adminUid === currentUser?.uid) && request.approvals.length < 3;
  const canReject = request.status !== "Fully Approved" && request.status !== "Rejected";

  if (isPrinting) {
    return (
      <div className="printable-area">
        <ApprovalLetter request={request} />
      </div>
    );
  }

  return (
    <TableRow>
      <TableCell className="font-medium hidden md:table-cell">{request.id.substring(0, 8)}...</TableCell>
      <TableCell>{request.submitterName}</TableCell>
      <TableCell className="hidden sm:table-cell">{request.submitterEmail}</TableCell>
      <TableCell className="hidden lg:table-cell">{request.submittedAt && request.submittedAt.toDate ? format(request.submittedAt.toDate(), "PP") : 'N/A'}</TableCell>
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
            <div className="grid gap-4 py-4 text-sm max-h-[70vh] overflow-y-auto pr-2">
                <div className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Name:</strong> <span className="ml-1">{request.submitterName}</span></div>
                <div className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Email:</strong> <span className="ml-1">{request.submitterEmail}</span></div>
                <div className="flex items-center"><Building className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Organisation:</strong> <span className="ml-1">{request.organisationName}</span></div>
                <div className="flex items-center"><Hash className="mr-2 h-4 w-4 text-muted-foreground" /><strong>ID No:</strong> <span className="ml-1">{request.submitterIdNo}</span></div>
                <Separator />
                <div className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Requested Date:</strong> <span className="ml-1">{request.requestDate && request.requestDate.toDate ? format(request.requestDate.toDate(), 'PPP') : 'N/A'}</span></div>
                <div className="flex items-center"><Clock className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Requested Time:</strong> <span className="ml-1">{request.requestTime}</span></div>
                <div className="flex items-center"><Package className="mr-2 h-4 w-4 text-muted-foreground" /><strong>No. of Items:</strong> <span className="ml-1">{request.numberOfItems}</span></div>
                <Separator />
                <div className="flex items-start"><List className="mr-2 h-4 w-4 text-muted-foreground mt-1" /><strong>Selected Gadgets:</strong></div>
                <ul className="ml-6 list-disc space-y-1">
                    {request.finalSelectedGadgets.map(gadget => <li key={gadget}>{gadget}</li>)}
                </ul>
                <Separator />
                <div className="flex items-start"><FileText className="mr-2 h-4 w-4 text-muted-foreground mt-1" /><strong>Purpose:</strong></div>
                <p className="ml-6 p-2 bg-muted/50 rounded-md whitespace-pre-wrap">{request.purpose}</p>
                 <Separator />
                <div className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Submitted At:</strong> <span className="ml-1">{request.submittedAt && request.submittedAt.toDate ? format(request.submittedAt.toDate(), 'PPPp') : 'N/A'}</span></div>

                {request.isRejected && request.rejectionReason && (
                    <>
                    <Separator />
                    <Alert variant="destructive" className="mt-2">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription><strong>Rejection Reason:</strong> {request.rejectionReason}</AlertDescription>
                    </Alert>
                    </>
                )}
                <Separator />
                <h4 className="font-semibold">Approval Log:</h4>
                {request.approvals.length > 0 ? (
                    <ul className="space-y-2 ml-2">
                    {request.approvals.sort((a,b) => a.level - b.level).map(appr => (
                        <li key={appr.adminUid + appr.level} className="text-xs">
                            <Badge variant="secondary" className="mr-1">Lvl {appr.level}</Badge> Approved by {appr.adminEmail} on {appr.approvedAt && appr.approvedAt.toDate ? format(appr.approvedAt.toDate(), 'PPp') : 'Processing...'}
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

        {canApprove && (
            <Button variant="ghost" size="icon" title="Approve" onClick={handleApprove} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-green-500" /> : <ThumbsUp className="h-4 w-4 text-green-500" />}
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
         {request.status === "Fully Approved" && (
            <Button variant="outline" size="icon" title="Print PDF" onClick={handleTriggerPrint} className="ml-1">
                <Printer className="h-4 w-4" />
            </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
