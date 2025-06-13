
"use client";

import Link from "next/link";
import Image from "next/image";
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
    // { href: "/", label: "Home" }, // Removed Home link
    { href: "/submit", label: "New Request", icon: <Send className="mr-2 h-4 w-4" /> },
    { href: "/track", label: "Track Request", icon: <Search className="mr-2 h-4 w-4" /> },
  ];

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
          <span className="font-bold sm:inline-block font-headline text-xl">HAL-India</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 transition-colors duration-200 ease-in-out hover:bg-muted hover:text-primary text-foreground/70 rounded-md text-sm font-medium"
            >
              {link.icon ? <span className="flex items-center">{link.icon}{link.label}</span> : link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <>
              <Button variant="ghost" onClick={() => router.push("/admin/dashboard")} className="transition-colors duration-200 ease-in-out hover:text-primary hover:bg-muted">Admin Dashboard</Button>
              <Button variant="outline" onClick={handleSignOut} className="transition-colors duration-200 ease-in-out">Sign Out</Button>
            </>
          ) : (
            <Button asChild className="transition-colors duration-200 ease-in-out">
              <Link href="/admin/login">
                <UserCircle className="mr-2 h-4 w-4" /> Admin Login
              </Link>
            </Button>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden transition-colors duration-200 ease-in-out">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link href="/" className="mb-4 flex items-center">
                 <Image
                    src="https://hal-india.co.in/assets/images/logo.png"
                    alt="HAL India Logo - Home"
                    width={180}
                    height={56}
                    className="h-10 w-auto object-contain bg-white p-1 rounded mr-2"
                    priority
                  />
                <span className="font-bold font-headline">HAL-India</span>
              </Link>
              <div className="flex flex-col space-y-2">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-2 transition-colors duration-200 ease-in-out hover:bg-muted hover:text-primary text-foreground/80 flex items-center rounded-md"
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
