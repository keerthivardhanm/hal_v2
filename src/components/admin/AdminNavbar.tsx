"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/config/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard } from "lucide-react";

export function AdminNavbar() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/admin/login");
    } catch (error) {
      console.error("Error signing out: ", error);
      // Optionally show a toast message for sign out error
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/admin/dashboard" className="mr-6 flex items-center space-x-2">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6 text-primary"><rect width="256" height="256" fill="none"></rect><path d="M208,80H168a8,8,0,0,0-8,8v80a8,8,0,0,0,8,8h40a8,8,0,0,0,8-8V88A8,8,0,0,0,208,80ZM48,80H88a8,8,0,0,1,8,8v80a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V88A8,8,0,0,1,48,80ZM160,96V88H48v8Zm48,0V88H104v8Zm0,16H104v8h96Zm-48,0H48v8h56Zm48,16H104v8h96Zm-48,0H48v8h56Zm48,16H104v8h96Zm-48,0H48v8h56Zm40,32H168V88h.8L152,128l-16.8-40H160V72a16,16,0,0,0-16-16H48A16,16,0,0,0,32,72v96a16,16,0,0,0,16,16h72a16,16,0,0,0,13.1-6.8l12.8-20.1,12.8,20.1A16,16,0,0,0,168,184h40a16,16,0,0,0,16-16V88A16,16,0,0,0,208,72H160" fill="currentColor"></path></svg>
          <span className="font-bold sm:inline-block font-headline text-xl">ApprovalFlow - Admin</span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/admin/dashboard"
            className="transition-colors duration-200 ease-in-out hover:text-primary text-foreground/70 flex items-center"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Welcome, {user.email}
            </span>
          )}
          <Button variant="outline" onClick={handleSignOut} className="transition-colors duration-200 ease-in-out">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
