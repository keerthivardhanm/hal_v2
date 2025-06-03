
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
import { Textarea } from "@/components/ui/textarea"; // Keep for purpose if it's long
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, addDoc, serverTimestamp, Timestamp as FirestoreTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { ApprovalRequest } from "@/types";
import { useState, useEffect } from "react";
import { Loader2, Send, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format as formatDate } from "date-fns";

const GADGET_OPTIONS = [
  { id: "mobile", label: "Mobile" },
  { id: "laptop", label: "Laptop" },
  { id: "pendrive", label: "Pendrive" },
] as const;

const formSchema = z.object({
  submitterName: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100),
  submitterEmail: z.string().email({ message: "Invalid email address." }),
  organisationName: z.string().min(2, { message: "Organisation name must be at least 2 characters." }).max(100),
  submitterIdNo: z.string().min(1, { message: "ID cannot be empty." }).max(50),
  purpose: z.string().min(10, { message: "Purpose must be at least 10 characters." }).max(1000),
  requestDate: z.date({ required_error: "A date for the request is required." }),
  requestTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format. Use HH:MM." }),
  numberOfItems: z.coerce.number().int().min(1, { message: "Number of items must be at least 1." }),
  gadgets: z.object({
    mobile: z.boolean().optional(),
    laptop: z.boolean().optional(),
    pendrive: z.boolean().optional(),
    others: z.boolean().optional(),
  }).refine(value => value.mobile || value.laptop || value.pendrive || value.others, {
    message: "You must select at least one gadget type.",
    path: ["mobile"], // Path to show error under the first checkbox or a general field
  }),
  otherGadgetName: z.string().optional(),
}).refine(data => {
  if (data.gadgets.others && (!data.otherGadgetName || data.otherGadgetName.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Please specify the name if 'Others' gadget type is selected.",
  path: ["otherGadgetName"],
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
      organisationName: "",
      submitterIdNo: "",
      purpose: "",
      requestDate: new Date(),
      requestTime: "09:00",
      numberOfItems: 1,
      gadgets: { mobile: false, laptop: false, pendrive: false, others: false },
      otherGadgetName: "",
    },
  });

  const watchGadgets = form.watch("gadgets.others");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const finalSelectedGadgets: string[] = [];
    if (values.gadgets.mobile) finalSelectedGadgets.push("Mobile");
    if (values.gadgets.laptop) finalSelectedGadgets.push("Laptop");
    if (values.gadgets.pendrive) finalSelectedGadgets.push("Pendrive");
    if (values.gadgets.others && values.otherGadgetName) {
      finalSelectedGadgets.push(values.otherGadgetName.trim());
    }
    
    try {
      const newRequestData: Omit<ApprovalRequest, "id" | "submittedAt" | "status" | "approvals" | "requestDate"> & { submittedAt: any; requestDate: FirestoreTimestamp } = {
        submitterName: values.submitterName,
        submitterEmail: values.submitterEmail,
        organisationName: values.organisationName,
        submitterIdNo: values.submitterIdNo,
        purpose: values.purpose,
        requestDate: FirestoreTimestamp.fromDate(values.requestDate),
        requestTime: values.requestTime,
        numberOfItems: values.numberOfItems,
        finalSelectedGadgets: finalSelectedGadgets,
        submittedAt: serverTimestamp(),
        status: "Pending",
        approvals: [],
      };
      
      const docRef = await addDoc(collection(db, "approval_requests"), newRequestData);
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
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
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
              name="organisationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organisation Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="submitterIdNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Your ID (e.g., Employee ID, Student ID)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose of Request</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe the purpose of your request in detail..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="requestDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              formatDate(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setDate(new Date().getDate() -1)) // Disable past dates
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requestTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time (HH:MM)</FormLabel>
                    <FormControl>
                      <Input type="time" placeholder="09:00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="numberOfItems"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Items</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Choose Gadget(s)</FormLabel>
              <div className="space-y-2">
                {GADGET_OPTIONS.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name={`gadgets.${option.id}` as const}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {option.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
                <FormField
                  control={form.control}
                  name="gadgets.others"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Others
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <FormMessage>{form.formState.errors.gadgets?.message}</FormMessage> {/* For the refine error on the object */}
            </FormItem>

            {watchGadgets && (
              <FormField
                control={form.control}
                name="otherGadgetName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name of Other Gadget(s)</FormLabel>
                    <FormControl>
                      <Input placeholder="Specify other gadget(s)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
