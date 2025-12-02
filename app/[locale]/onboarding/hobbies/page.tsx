"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Button, Card, CardContent } from "@/components/ui";
import { HOBBIES } from "@/constants/hobbies";

export default function HobbiesStep() {
  const t = useTranslations("onboarding.hobbies");
  const tCommon = useTranslations("onboarding");
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const { data: session } = useSession();

  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!session?.user) {
        setCheckingOnboarding(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/onboarding-status");
        const result = await response.json();

        if (result.success && !result.needsOnboarding) {
          router.push("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setCheckingOnboarding(false);
      }
    }

    checkOnboardingStatus();
  }, [session?.user, router]);

  useEffect(() => {
    if (checkingOnboarding) return;

    const savedHobbies = localStorage.getItem("onboarding-hobbies");
    if (savedHobbies) {
      setSelectedHobbies(JSON.parse(savedHobbies));
    }
  }, [checkingOnboarding]);

  if (checkingOnboarding) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
      </div>
    );
  }

  const toggleHobby = (hobbyId: string) => {
    if (selectedHobbies.includes(hobbyId)) {
      setSelectedHobbies(selectedHobbies.filter((id) => id !== hobbyId));
    } else {
      if (selectedHobbies.length < 8) {
        setSelectedHobbies([...selectedHobbies, hobbyId]);
      }
    }
  };

  const handleSubmit = () => {
    if (selectedHobbies.length >= 3) {
      localStorage.setItem(
        "onboarding-hobbies",
        JSON.stringify(selectedHobbies)
      );
      router.push(`/onboarding/locations`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <p className="text-sm font-medium text-primary-600">
          {tCommon("step", { current: 2, total: 3 })}
        </p>
        <h1 className="text-3xl font-extrabold mt-2 bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <p className="text-gray-600 mt-2">{t("subtitle")}</p>
        <p className="text-sm font-semibold text-primary-700 mt-3">
          {t("selected", { count: selectedHobbies.length })} / 3-8 hobbies
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {HOBBIES.map((hobby) => {
              const isSelected = selectedHobbies.includes(hobby.id);
              return (
                <button
                  key={hobby.id}
                  onClick={() => toggleHobby(hobby.id)}
                  className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                    isSelected
                      ? "border-primary-500 bg-gradient-to-br from-primary-50 to-accent-50 shadow-md"
                      : "border-gray-200 hover:border-primary-300 bg-white"
                  }`}
                >
                  <div className="text-4xl mb-2">{hobby.icon}</div>
                  <div
                    className={`text-sm font-semibold ${
                      isSelected ? "text-primary-700" : "text-gray-700"
                    }`}
                  >
                    {hobby.name}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          ← {tCommon("back")}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={selectedHobbies.length < 3 || selectedHobbies.length > 8}
        >
          {tCommon("next")} →
        </Button>
      </div>
    </div>
  );
}
