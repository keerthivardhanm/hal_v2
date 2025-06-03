"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Send, Search, UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/config/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export function MainNavbar() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/submit", label: "New Request", icon: <Send className="mr-2 h-4 w-4" /> },
    { href: "/track", label: "Track Request", icon: <Search className="mr-2 h-4 w-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6 text-primary"><rect width="256" height="256" fill="none"></rect><path d="M M208,80H168a8,8,0,0,0-8,8v80a8,8,0,0,0,8,8h40a8,8,0,0,0,8-8V88A8,8,0,0,0,208,80ZM48,80H88a8,8,0,0,1,8,8v80a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V88A8,8,0,0,1,48,80ZM160,96V88H48v8Zm48,0V88H104v8Zm0,16H104v8h96Zm-48,0H48v8h56Zm48,16H104v8h96Zm-48,0H48v8h56Zm48,16H104v8h96Zm-48,0H48v8h56Zm40,32H168V88h.8L152,128l-16.8-40H160V72a16,16,0,0,0-16-16H48A16,16,0,0,0,32,72v96a16,16,0,0,0,16,16h72a16,16,0,0,0,13.1-6.8l12.8-20.1,12.8,20.1A16,16,0,0,0,168,184h40a16,16,0,0,0,16-16V88A16,16,0,0,0,208,72H160" fill="currentColor"></path></svg>
          <span className="font-bold sm:inline-block font-headline text-xl">ApprovalFlow</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {link.icon ? <span className="flex items-center">{link.icon}{link.label}</span> : link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <>
              <Button variant="ghost" onClick={() => router.push("/admin/dashboard")}>Admin Dashboard</Button>
              <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/admin/login">
                <UserCircle className="mr-2 h-4 w-4" /> Admin Login
              </Link>
            </Button>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link href="/" className="mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="mr-2 h-6 w-6 text-primary"><rect width="256" height="256" fill="none"></rect><path d="M208,80H168a8,8,0,0,0-8,8v80a8,8,0,0,0,8,8h40a8,8,0,0,0,8-8V88A8,8,0,0,0,208,80ZM48,80H88a8,8,0,0,1,8,8v80a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V88A8,8,0,0,1,48,80ZM160,96V88H48v8Zm48,0V88H104v8Zm0,16H104v8h96Zm-48,0H48v8h56Zm48,16H104v8h96Zm-48,0H48v8h56Zm48,16H104v8h96Zm-48,0H48v8h56Zm40,32H168V88h.8L152,128l-16.8-40H160V72a16,16,0,0,0-16-16H48A16,16,0,0,0,32,72v96a16,16,0,0,0,16,16h72a16,16,0,0,0,13.1-6.8l12.8-20.1,12.8,20.1A16,16,0,0,0,168,184h40a16,16,0,0,0,16-16V88A16,16,0,0,0,208,72H160" fill="currentColor"></path></svg>
                <span className="font-bold font-headline">ApprovalFlow</span>
              </Link>
              <div className="flex flex-col space-y-3">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition-colors hover:text-foreground text-foreground/80 flex items-center"
                  >
                    {link.icon} {link.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
