"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { ApprovalRequest } from "@/types";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";

const formSchema = z.object({
  submitterName: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100),
  submitterEmail: z.string().email({ message: "Invalid email address." }),
  requestDetails: z.string().min(10, { message: "Details must be at least 10 characters." }).max(1000),
});

export function SubmissionForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      submitterName: "",
      submitterEmail: "",
      requestDetails: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const newRequest: Omit<ApprovalRequest, "id" | "submittedAt" | "status" | "approvals"> & { submittedAt: any } = {
        ...values,
        submittedAt: serverTimestamp(),
        status: "Pending",
        approvals: [],
      };
      
      const docRef = await addDoc(collection(db, "approval_requests"), newRequest);
      toast({
        title: "Request Submitted Successfully!",
        description: `Your request ID is ${docRef.id}. You will be redirected to track it.`,
      });
      router.push(`/track/${docRef.id}`);
    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center">
          <Send className="mr-2 h-6 w-6 text-primary" /> Submit New Approval Request
        </CardTitle>
        <CardDescription>Fill out the form below to submit your request for approval.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="submitterName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormDescription>Your full name as it should appear on documents.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="submitterEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormDescription>We will send status updates and the final approval to this email.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requestDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe your request in detail..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Provide all necessary information for the approvers.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Submit Request
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
