
"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase";
import type { ApprovalRequest } from "@/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RequestRow } from "./RequestRow";
import { Loader2, Inbox, FileCheck, FileX, History, FileWarning } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const RenderTable = ({ requests, caption }: { requests: ApprovalRequest[]; caption: string }) => {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <Inbox className="h-16 w-16 mb-4" />
        <h3 className="text-xl font-semibold">No Requests Here</h3>
        <p>There are currently no requests in this category.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableCaption>{caption}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden md:table-cell min-w-[150px] text-xs">Request ID</TableHead>
            <TableHead>Submitter</TableHead>
            <TableHead className="hidden sm:table-cell">Email</TableHead>
            <TableHead className="hidden lg:table-cell">Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <RequestRow key={request.id} request={request} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};


export function AdminDashboard() {
  const [allRequests, setAllRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "approval_requests"), orderBy("submittedAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requestsData: ApprovalRequest[] = [];
      querySnapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() } as ApprovalRequest);
      });
      setAllRequests(requestsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching requests: ", error);
      toast({
        variant: "destructive",
        title: "Failed to Fetch Requests",
        description: error.message || "An unexpected error occurred while fetching approval requests.",
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const newRequests = useMemo(() => allRequests.filter(req => req.status === "Pending"), [allRequests]);
  const approvedRequests = useMemo(() => allRequests.filter(req => 
    req.status === "Level 1 Approved" || 
    req.status === "Level 2 Approved" || 
    req.status === "Fully Approved"
  ), [allRequests]);
  const rejectedRequests = useMemo(() => allRequests.filter(req => req.status === "Rejected"), [allRequests]);

  const getTabCount = (count: number) => {
    return count > 0 ? <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">{count}</Badge> : null;
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading approval requests...</p>
      </div>
    );
  }

  return (
    <Card className="m-2 sm:m-4 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Approval Requests Dashboard</CardTitle>
        <CardDescription>View and manage all submitted approval requests, categorized by status.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4">
            <TabsTrigger value="new" className="flex items-center">
              <FileWarning className="mr-1 h-4 w-4" /> New Forms {getTabCount(newRequests.length)}
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center">
              <FileCheck className="mr-1 h-4 w-4" /> Approved {getTabCount(approvedRequests.length)}
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center">
              <FileX className="mr-1 h-4 w-4" /> Rejected {getTabCount(rejectedRequests.length)}
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center">
             <History className="mr-1 h-4 w-4" /> All Forms {getTabCount(allRequests.length)}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            <RenderTable requests={newRequests} caption="A list of new approval requests pending action." />
          </TabsContent>
          <TabsContent value="approved">
            <RenderTable requests={approvedRequests} caption="A list of all approved requests." />
          </TabsContent>
          <TabsContent value="rejected">
            <RenderTable requests={rejectedRequests} caption="A list of all rejected requests." />
          </TabsContent>
          <TabsContent value="all">
            <RenderTable requests={allRequests} caption="A comprehensive list of all approval requests." />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
