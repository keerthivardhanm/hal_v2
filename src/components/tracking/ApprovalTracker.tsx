"use client";

import type { ApprovalRequest } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Hourglass, Printer, User, Mail, FileText, CalendarDays, XCircle, ThumbsUp, Users } from "lucide-react";
import { format } from 'date-fns';

interface ApprovalTrackerProps {
  request: ApprovalRequest;
}

const StatusIcon = ({ status }: { status: ApprovalRequest["status"] }) => {
  switch (status) {
    case "Pending":
      return <Hourglass className="mr-2 h-5 w-5 text-yellow-500" />;
    case "Level 1 Approved":
    case "Level 2 Approved":
      return <ThumbsUp className="mr-2 h-5 w-5 text-blue-500" />;
    case "Fully Approved":
      return <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />;
    case "Rejected":
      return <XCircle className="mr-2 h-5 w-5 text-red-500" />;
    default:
      return <Hourglass className="mr-2 h-5 w-5 text-gray-500" />;
  }
};

const getStatusBadgeVariant = (status: ApprovalRequest["status"]) => {
  switch (status) {
    case "Pending": return "secondary";
    case "Level 1 Approved": 
    case "Level 2 Approved": return "default"; // Blueish
    case "Fully Approved": return "default"; // Use default (primary) for fully approved, or make an accent one
    case "Rejected": return "destructive";
    default: return "outline";
  }
};


export function ApprovalTracker({ request }: ApprovalTrackerProps) {
  const handlePrintPdf = () => {
    // In a real app, this would trigger PDF generation and printing.
    // For now, it's a placeholder.
    alert("PDF Print option functionality would be implemented here.");
    window.print();
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center">
          <StatusIcon status={request.status} /> Approval Status: {request.id}
        </CardTitle>
        <CardDescription>
          Submitted on: {request.submittedAt ? format(request.submittedAt.toDate(), 'PPPp') : 'N/A'}
        </CardDescription>
        <Badge variant={getStatusBadgeVariant(request.status)} className="w-fit text-sm px-3 py-1 mt-2">
          {request.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold font-headline">Submitter Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              <strong>Name:</strong> <span className="ml-1">{request.submitterName}</span>
            </div>
            <div className="flex items-center">
              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
              <strong>Email:</strong> <span className="ml-1">{request.submitterEmail}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-lg font-semibold font-headline flex items-center">
            <FileText className="mr-2 h-5 w-5 text-primary" /> Request Details
          </h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-secondary p-4 rounded-md">
            {request.requestDetails}
          </p>
        </div>
        
        {request.isRejected && request.rejectionReason && (
          <>
            <Separator />
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Request Rejected</AlertTitle>
              <AlertDescription>{request.rejectionReason}</AlertDescription>
            </Alert>
          </>
        )}

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold font-headline flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" /> Approval Log
          </h3>
          {request.approvals && request.approvals.length > 0 ? (
            <ul className="space-y-3">
              {request.approvals.map((approval, index) => (
                <li key={index} className="flex items-start p-3 bg-muted/50 rounded-md">
                  <ThumbsUp className="mr-3 h-5 w-5 text-green-500 mt-1 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">
                      Level {approval.level} Approved by: <span className="font-normal text-muted-foreground">{approval.adminEmail}</span>
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <CalendarDays className="mr-1 h-3 w-3" /> {format(approval.approvedAt.toDate(), 'PPPp')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No approvals recorded yet.</p>
          )}
        </div>

        {request.status === "Fully Approved" && (
          <>
            <Separator />
            <Alert variant="default" className="bg-accent/30 border-accent">
               <CheckCircle2 className="h-4 w-4 text-accent-foreground" />
              <AlertTitle className="text-accent-foreground font-headline">Congratulations! Your request is fully approved.</AlertTitle>
              <AlertDescription className="text-accent-foreground/80">
                An email with the approval letter has been sent to {request.submitterEmail}. 
                You can also print a copy of the approval document below.
              </AlertDescription>
            </Alert>
            <Button onClick={handlePrintPdf} className="w-full mt-4">
              <Printer className="mr-2 h-4 w-4" /> Print Approval PDF
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
