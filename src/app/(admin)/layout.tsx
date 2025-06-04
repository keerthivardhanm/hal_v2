
"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login");
    }
    setCurrentYear(new Date().getFullYear());
  }, [user, loading, router]);

  if (loading || (!loading && !user)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col admin-app-content"> {/* Added admin-app-content class */}
      <AdminNavbar />
      <main className="flex-1 bg-muted/40">{children}</main>
       <footer className="py-6 md:px-8 md:py-0 bg-background border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            ApprovalFlow Admin Panel © {currentYear || "Loading year..."}
          </p>
        </div>
      </footer>
    </div>
  );
}
