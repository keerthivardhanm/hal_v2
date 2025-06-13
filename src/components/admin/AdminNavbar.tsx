
"use client";

import Link from "next/link";
import Image from "next/image";
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
        <Link href="/" className="mr-6 flex items-center space-x-2">
           <Image
            src="https://hal-india.co.in/assets/images/logo.png"
            alt="HAL India Logo - Home"
            width={180}
            height={56}
            className="h-10 w-auto object-contain bg-white p-1 rounded"
            priority
          />
          <span className="font-bold sm:inline-block font-headline text-xl">HAL-India Admin</span>
        </Link>
        <nav className="flex items-center space-x-1 text-sm font-medium">
          <Link
            href="/admin/dashboard"
            className="px-3 py-2 transition-colors duration-200 ease-in-out hover:bg-muted hover:text-primary text-foreground/70 flex items-center rounded-md"
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
          <Button variant="outline" onClick={handleSignOut} className="transition-colors duration-200 ease-in-out hover:bg-muted">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
