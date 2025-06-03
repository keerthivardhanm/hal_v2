
"use client";

import type { ApprovalRequest } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Hourglass, Printer, User, Mail, FileText, CalendarDays, XCircle, ThumbsUp, Users, Building, Hash, Clock, List, Package } from "lucide-react";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { ApprovalLetter } from "@/components/print/ApprovalLetter";
import { useState, useEffect } from "react";

interface ApprovalTrackerProps {
  request: ApprovalRequest;
}

const StatusIcon = ({ status }: { status: ApprovalRequest["status"] }) => {
  switch (status) {
    case "Pending":
      return <Hourglass className="mr-2 h-5 w-5 text-yellow-500" />;
    case "Level 1 Approved":
      return <ThumbsUp className="mr-2 h-5 w-5 text-sky-500" />;
    case "Level 2 Approved":
      return <ThumbsUp className="mr-2 h-5 w-5 text-indigo-500" />;
    case "Fully Approved":
      return <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />;
    case "Rejected":
      return <XCircle className="mr-2 h-5 w-5 text-red-500" />;
    default:
      return <Hourglass className="mr-2 h-5 w-5 text-gray-500" />;
  }
};

const getStatusBadgeVariant = (status: ApprovalRequest["status"]): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "Pending": return "secondary";
    case "Level 1 Approved": 
    case "Level 2 Approved": 
    case "Fully Approved": return "default"; 
    case "Rejected": return "destructive";
    default: return "outline";
  }
};

const getStatusTextColor = (status: ApprovalRequest["status"]) => {
  switch (status) {
    case "Pending": return "text-yellow-600 dark:text-yellow-400";
    case "Level 1 Approved": return "text-sky-600 dark:text-sky-400";
    case "Level 2 Approved": return "text-indigo-600 dark:text-indigo-400";
    case "Fully Approved": return "text-green-600 dark:text-green-400";
    case "Rejected": return "text-red-600 dark:text-red-400"; 
    default: return "text-gray-600 dark:text-gray-400";
  }
};


export function ApprovalTracker({ request }: ApprovalTrackerProps) {
  const { toast } = useToast();
  const [isPrinting, setIsPrinting] = useState(false);

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
  
  if (isPrinting) {
    return (
      <div className="printable-area">
        <ApprovalLetter request={request} />
      </div>
    );
  }

  return (
    <div className="main-app-content"> 
      <Card className="w-full max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <StatusIcon status={request.status} /> Approval Status: {request.id.substring(0,8)}...
          </CardTitle>
          <CardDescription>
            Submitted on: {request.submittedAt ? format(request.submittedAt.toDate(), 'PPPp') : 'N/A'}
          </CardDescription>
          <Badge 
            variant={getStatusBadgeVariant(request.status)} 
            className={`w-fit text-sm px-3 py-1 mt-2 ${getStatusTextColor(request.status)} ${getStatusBadgeVariant(request.status) === 'default' ? '' : `border-${getStatusTextColor(request.status).split('-')[1]}-500`}`}
          >
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
              <div className="flex items-center">
                <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                <strong>Organisation:</strong> <span className="ml-1">{request.organisationName}</span>
              </div>
              <div className="flex items-center">
                <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                <strong>ID No:</strong> <span className="ml-1">{request.submitterIdNo}</span>
              </div>
            </div>
          </div>

          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold font-headline flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" /> Purpose of Request
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-secondary p-4 rounded-md">
              {request.purpose}
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-headline">Request Specifics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                <strong>Requested Date:</strong> <span className="ml-1">{request.requestDate ? format(request.requestDate.toDate(), 'PPP') : 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <strong>Requested Time:</strong> <span className="ml-1">{request.requestTime}</span>
              </div>
              <div className="flex items-center">
                <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                <strong>Number of Items:</strong> <span className="ml-1">{request.numberOfItems}</span>
              </div>
            </div>
          </div>

          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold font-headline flex items-center">
              <List className="mr-2 h-5 w-5 text-primary" /> Selected Gadgets
            </h3>
            {request.finalSelectedGadgets && request.finalSelectedGadgets.length > 0 ? (
              <ul className="list-disc list-inside pl-4 space-y-1 text-sm text-muted-foreground">
                {request.finalSelectedGadgets.map((gadget, index) => (
                  <li key={index}>{gadget}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No gadgets specified.</p>
            )}
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
                {request.approvals.sort((a,b) => a.level - b.level).map((approval) => ( 
                  <li key={approval.adminUid + approval.level} className="flex items-start p-3 bg-muted/50 rounded-md">
                    <ThumbsUp className="mr-3 h-5 w-5 text-green-500 mt-1 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">
                        Level {approval.level} Approved by: <span className="font-normal text-muted-foreground">{approval.adminEmail}</span>
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <CalendarDays className="mr-1 h-3 w-3" /> {approval.approvedAt ? format(approval.approvedAt.toDate(), 'PPPp') : 'Processing...'}
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
              <Button onClick={handleTriggerPrint} className="w-full mt-4">
                <Printer className="mr-2 h-4 w-4" /> Print Approval PDF
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
