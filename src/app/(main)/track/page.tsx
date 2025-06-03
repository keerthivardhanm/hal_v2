"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function TrackRequestPage() {
  const [requestId, setRequestId] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestId.trim()) {
      router.push(`/track/${requestId.trim()}`);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 flex justify-center">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
             <Search className="mr-2 h-6 w-6 text-primary" /> Track Your Approval Request
          </CardTitle>
          <CardDescription>Enter your request ID below to see its current status and approval history.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="requestId" className="block text-sm font-medium text-foreground mb-1">
                Request ID
              </label>
              <Input
                id="requestId"
                type="text"
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
                placeholder="Enter your request ID"
                required
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full">
              <Search className="mr-2 h-4 w-4" /> Track Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
