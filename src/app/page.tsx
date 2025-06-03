
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, FileText, Users, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <>
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                  Streamline Your Approval Process with ApprovalFlow
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Submit requests, track approvals in real-time, and get AI-powered document suggestions. Secure, efficient, and user-friendly.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/submit">Submit a New Request</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/track">Track Your Request</Link>
                </Button>
              </div>
            </div>
            <Image
              src="https://placehold.co/600x400.png"
              alt="Approval Workflow"
              data-ai-hint="workflow diagram"
              width={600}
              height={400}
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
            />
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Everything You Need for Smooth Approvals</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                ApprovalFlow offers a comprehensive suite of tools to manage your approval workflows effortlessly.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="font-headline">Easy Submission</CardTitle>
                <CardDescription>User-friendly forms for quick and accurate request submissions.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CheckCircle className="h-10 w-10 text-accent mb-2" />
                <CardTitle className="font-headline">Real-time Tracking</CardTitle>
                <CardDescription>Monitor the status of your submissions with live updates and approval logs.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="font-headline">Admin Dashboard</CardTitle>
                <CardDescription>Centralized panel for admins to manage requests and provide approvals.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <ShieldCheck className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="font-headline">Secure Authentication</CardTitle>
                <CardDescription>Robust admin authentication to ensure data security and authorized access.</CardDescription>
              </CardHeader>
            </Card>
             <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary mb-2 lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                <CardTitle className="font-headline">AI Document Helper</CardTitle>
                <CardDescription>Get intelligent content suggestions for generated documents based on form data.</CardDescription>
              </CardHeader>
            </Card>
             <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-accent mb-2 lucide lucide-mail-check"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="m16 19 2 2 4-4"/></svg>
                <CardTitle className="font-headline">Automated Notifications</CardTitle>
                <CardDescription>Email notifications upon full approval, keeping users informed.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
