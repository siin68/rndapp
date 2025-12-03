"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Button, Card, CardContent } from "@/components/ui";

interface Hobby {
  id: string;
  name: string;
  emoji: string;
  icon?: string;
}

export default function HobbiesStep() {
  const t = useTranslations("onboarding.hobbies");
  const tCommon = useTranslations("onboarding");
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const { data: session } = useSession();

  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loadingHobbies, setLoadingHobbies] = useState(true);

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

  useEffect(() => {
    async function fetchHobbies() {
      try {
        const response = await fetch("/api/hobbies");
        const data = await response.json();

        if (data.success) {
          setHobbies(data.data || []);
        } else {
          console.error("Failed to fetch hobbies:", data.error);
          setHobbies([]);
        }
      } catch (error) {
        console.error("Error fetching hobbies:", error);
        setHobbies([]);
      } finally {
        setLoadingHobbies(false);
      }
    }

    fetchHobbies();
  }, []);

  if (checkingOnboarding || loadingHobbies) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-rose-200/20 rounded-full blur-[120px] -z-10 mix-blend-multiply animate-pulse" />
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse delay-700" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-10 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="h-2 w-12 rounded-full bg-gradient-to-r from-rose-500 to-purple-600"></div>
              <div className="h-2 w-12 rounded-full bg-gradient-to-r from-rose-500 to-purple-600"></div>
              <div className="h-2 w-12 rounded-full bg-gray-200 animate-pulse"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded-lg w-72 mx-auto animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-rose-100/50 border border-white/60 p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="group relative">
                  <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl animate-pulse border border-gray-200/60">
                    <div className="p-4 flex flex-col items-center justify-center h-full space-y-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
                      <div className="h-3 bg-gray-300 rounded w-16 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rose-500"></div>
                <span className="text-gray-500 font-medium">
                  Loading hobbies...
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            <div className="h-10 w-20 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
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
          {hobbies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hobbies available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {hobbies.map((hobby) => {
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
                    <div className="text-4xl mb-2">
                      {hobby.emoji || hobby.icon}
                    </div>
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
          )}
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
