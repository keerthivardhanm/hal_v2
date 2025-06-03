"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";
import type { ApprovalRequest } from "@/types";
import { ApprovalTracker } from "@/components/tracking/ApprovalTracker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Frown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TrackRequestByIdPage() {
  const params = useParams();
  const id = params.id as string;
  const [request, setRequest] = useState<ApprovalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    const docRef = doc(db, "approval_requests", id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setRequest({ id: docSnap.id, ...docSnap.data() } as ApprovalRequest);
        setError(null);
      } else {
        setError("Request not found. Please check the ID and try again.");
        setRequest(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching request:", err);
      setError("Failed to fetch request details. Please try again later.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading request details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 flex flex-col items-center justify-center text-center">
        <Frown className="h-16 w-16 text-destructive mb-4" />
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild variant="link" className="mt-4">
          <Link href="/track">Try another ID</Link>
        </Button>
      </div>
    );
  }

  if (!request) {
     return ( // Should ideally not be reached if error handling is correct
      <div className="container mx-auto py-12 px-4 md:px-6 flex flex-col items-center justify-center text-center">
        <Frown className="h-16 w-16 text-destructive mb-4" />
        <p className="text-xl">Request not found.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/track">Try another ID</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <ApprovalTracker request={request} />
    </div>
  );
}
