
"use client";

import type { ApprovalRequest } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { CheckCircle2, Hourglass, Printer, User, Mail, FileText, CalendarDays, XCircle, ThumbsUp, Users, Building, Hash, Clock, List, Package, Copy, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { ApprovalLetter } from "@/components/print/ApprovalLetter";
import { useState, useRef } from "react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const [showLetterPreviewDialog, setShowLetterPreviewDialog] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const printableContentRef = useRef<HTMLDivElement>(null);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(request.id);
      toast({
        title: "Request ID Copied!",
        description: "The ID has been copied to your clipboard.",
      });
    } catch (err) {
      console.error("Failed to copy ID: ", err);
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Could not copy the ID to clipboard. Make sure you are on HTTPS or localhost.",
      });
    }
  };

  const handleDownloadPdf = async () => {
    if (!printableContentRef.current) {
      toast({ variant: 'destructive', title: 'Error', description: 'Preview content not found. Cannot generate PDF.' });
      return;
    }
    setIsDownloadingPdf(true);
    try {
      const canvas = await html2canvas(printableContentRef.current, {
        scale: 2,
        scrollY: -window.scrollY,
        backgroundColor: "#fff",
        useCORS: true, 
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [794, 1123] // A4 size in pixels at 96 DPI for width, and a common A4 height
      });
      // Calculate the aspect ratio of the canvas
      const canvasAspectRatio = canvas.width / canvas.height;
      // A4 page dimensions in px (assuming 96 DPI for pdf unit 'px')
      const pageWidth = 794; 
      const pageHeight = 1123; 
      const pageAspectRatio = pageWidth / pageHeight;

      let pdfCanvasWidth = canvas.width;
      let pdfCanvasHeight = canvas.height;

      // Adjust canvas size to fit within A4 dimensions while maintaining aspect ratio
      if (canvasAspectRatio > pageAspectRatio) { // Canvas is wider than page
        pdfCanvasWidth = pageWidth;
        pdfCanvasHeight = pageWidth / canvasAspectRatio;
      } else { // Canvas is taller than page (or same aspect ratio)
        pdfCanvasHeight = pageHeight;
        pdfCanvasWidth = pageHeight * canvasAspectRatio;
      }
      
      // Center the image on the PDF page if it's smaller than the page
      const xOffset = (pageWidth - pdfCanvasWidth) / 2;
      const yOffset = (pageHeight - pdfCanvasHeight) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, pdfCanvasWidth, pdfCanvasHeight);
      pdf.save(`ApprovalLetter-${request.id.substring(0,8)}.pdf`);
      toast({ title: 'PDF Downloaded', description: 'Approval letter has been downloaded successfully.' });
    } catch (error: any) {
      console.error("PDF Generation Error (Tracker):", error);
      toast({
        variant: "destructive",
        title: "PDF Generation Failed",
        description: error.message || "An unexpected error occurred while generating the PDF.",
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };
  

  return (
    <div className="main-app-content"> 
      <Card className="w-full max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-headline flex items-center">
              <StatusIcon status={request.status} /> Approval Status
            </CardTitle>
            <Badge 
              variant={getStatusBadgeVariant(request.status)} 
              className={`text-sm px-3 py-1 ${getStatusTextColor(request.status)} ${getStatusBadgeVariant(request.status) === 'default' ? '' : `border-${getStatusTextColor(request.status).split('-')[1]}-500`}`}
            >
              {request.status}
            </Badge>
          </div>
          <CardDescription>
            Submitted on: {request.submittedAt ? format(request.submittedAt.toDate(), 'PPPp') : 'N/A'}
          </CardDescription>
          <div className="flex items-center space-x-2 pt-2">
            <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded break-all">
              ID: {request.id}
            </span>
            <Button variant="outline" size="icon" onClick={handleCopyId} title="Copy Request ID">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
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
                  You can print a copy of the approval document below.
                </AlertDescription>
              </Alert>
                <Dialog open={showLetterPreviewDialog} onOpenChange={setShowLetterPreviewDialog}>
                  <DialogTrigger asChild>
                     <Button className="w-full mt-4" onClick={() => setShowLetterPreviewDialog(true)}>
                        <Printer className="mr-2 h-4 w-4" /> Preview & Print Approval PDF
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl p-0">
                    <DialogHeader className="p-6 pb-0">
                      <DialogTitle className="font-headline">Approval Letter Preview</DialogTitle>
                      <DialogDescription>
                        Review the letter below. Click "Download PDF" to print or save.
                      </DialogDescription>
                    </DialogHeader>
                    <div ref={printableContentRef} className="printable-area p-6 max-h-[70vh] overflow-y-auto">
                      <ApprovalLetter request={request} />
                    </div>
                    <DialogFooter className="p-6 pt-0">
                      <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                      </DialogClose>
                      <Button onClick={handleDownloadPdf} disabled={isDownloadingPdf}>
                        {isDownloadingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                        Download PDF
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
