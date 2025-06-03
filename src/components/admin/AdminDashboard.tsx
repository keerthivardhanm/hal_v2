"use client";

import { useEffect, useState } from "react";
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
import { Loader2, Inbox } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminDashboard() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "approval_requests"), orderBy("submittedAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requestsData: ApprovalRequest[] = [];
      querySnapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() } as ApprovalRequest);
      });
      setRequests(requestsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching requests: ", error);
      // TODO: Show toast error
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading approval requests...</p>
      </div>
    );
  }

  return (
    <Card className="m-4 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Approval Requests Dashboard</CardTitle>
        <CardDescription>View and manage all submitted approval requests.</CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Inbox className="h-16 w-16 mb-4" />
            <h3 className="text-xl font-semibold">No Requests Yet</h3>
            <p>New approval requests will appear here as they are submitted.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>A list of all approval requests.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden md:table-cell w-[100px]">Request ID</TableHead>
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
        )}
      </CardContent>
    </Card>
  );
}
