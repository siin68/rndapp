"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function OnboardingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const { data: session } = useSession();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!session?.user) {
        router.push(`/onboarding/profile`);
        setChecking(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/onboarding-status");
        const result = await response.json();

        if (result.success && !result.needsOnboarding) {
          console.log("first");
          router.push("/dashboard");
        } else {
          router.push(`/onboarding/profile`);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        router.push(`/onboarding/profile`);
      } finally {
        setChecking(false);
      }
    }

    checkOnboardingStatus();
  }, [router, locale, session?.user]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking profile status...</p>
        </div>
      </div>
    );
  }

  return null;
}
