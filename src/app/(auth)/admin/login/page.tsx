
"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/admin/dashboard");
    }
  }, [user, loading, router]);

  if (loading || (!loading && user)) {
     return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-4">
      <Link href="/" className="mb-8">
        <Image
          src="https://hal-india.co.in/assets/images/logo.png"
          alt="HAL India Logo - Home"
          width={240} // Increased size for login page
          height={75}  // Adjusted height to maintain aspect ratio
          className="h-16 w-auto object-contain bg-white p-2 rounded-md shadow-sm" // Adjusted padding and shadow
          priority
        />
      </Link>
      <LoginForm />
    </div>
  );
}
