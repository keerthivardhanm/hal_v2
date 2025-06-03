
import type { ReactNode } from "react";
import { MainNavbar } from "@/components/layout/MainNavbar";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col main-app-content"> {/* Added main-app-content class */}
      <MainNavbar />
      <main className="flex-1">{children}</main>
      <footer className="py-6 md:px-8 md:py-0 bg-background border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} ApprovalFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
