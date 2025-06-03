
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus2, Search, UserCog, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CTACardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function CTACard({ href, icon, title, description }: CTACardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transform-gpu overflow-hidden bg-card text-card-foreground shadow-lg transition-all duration-300 ease-in-out group-hover:scale-[1.03] group-hover:shadow-2xl dark:shadow-primary/10 dark:group-hover:shadow-primary/20">
        <CardHeader className="pb-4">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
            {icon}
          </div>
          <CardTitle className="font-headline text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4 text-base text-muted-foreground/80 group-hover:text-muted-foreground">
            {description}
          </CardDescription>
          <Button variant="link" className="p-0 text-primary transition-transform duration-300 group-hover:translate-x-1">
            Go to {title} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function HomePage() {
  return (
    <section className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl font-headline">
            Welcome to ApprovalFlow
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            Your streamlined solution for managing approval requests. Get started below.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
          <CTACard
            href="/submit"
            icon={<FilePlus2 className="h-6 w-6" />}
            title="New Request"
            description="Initiate a new approval process by filling out a straightforward form."
          />
          <CTACard
            href="/track"
            icon={<Search className="h-6 w-6" />}
            title="Track Request"
            description="Check the real-time status and history of your submitted requests."
          />
          <CTACard
            href="/admin/login"
            icon={<UserCog className="h-6 w-6" />}
            title="Admin Portal"
            description="Access the dashboard to manage, review, and process approval requests."
          />
        </div>
      </div>
    </section>
  );
}
