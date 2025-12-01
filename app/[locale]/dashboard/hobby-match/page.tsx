"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
  Button,
} from "@/components/ui";
import { getHobbyById } from "@/lib/data";
import { useSession } from "next-auth/react";

export default function HobbyMatchPage() {
  const t = useTranslations("dashboard.hobbyMatch");
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const { data: session } = useSession();
  console.log("session: ", session);

  const [matchedUsers, setMatchedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      console.log("Fetching matches for user ID:", session?.user?.id);
      if (!session?.user?.id) return;

      try {
        const response = await fetch(
          `/api/users/matches?userId=${session?.user?.id}&limit=6`
        );
        const data = await response.json();

        if (data.success) {
          setMatchedUsers(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching hobby matches:", error);
        setMatchedUsers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [session?.user?.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <p className="text-sm text-gray-600 mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="hover:shadow-lg transition-shadow animate-pulse"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          : matchedUsers.map((user: any) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative">
                      <Avatar className="w-20 h-20">
                        <AvatarImage
                          src={user.image || ""}
                          alt={user.name || ""}
                        />
                        <AvatarFallback>
                          {user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <h3 className="text-lg font-bold mt-3 text-gray-800">
                      {user.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-2xl font-bold text-primary-600">
                        {user.matchScore || 0}
                      </div>
                      <div className="text-xs text-gray-500">Match Score</div>
                    </div>
                    <p className="text-gray-600 text-sm mt-3 line-clamp-2 px-2">
                      {user.bio || "No bio available"}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {user.sharedHobbies?.slice(0, 3).map((userHobby: any) => (
                        <span
                          key={userHobby.hobby.id}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700"
                        >
                          {userHobby.hobby.icon} {userHobby.hobby.name}
                        </span>
                      )) || []}
                      {(user.sharedHobbies?.length || 0) > 3 && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                          +{(user.sharedHobbies?.length || 0) - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-5 w-full">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push(`/profile/${user.id}`)}
                      >
                        👀 {t("viewProfile")}
                      </Button>
                      <Button className="flex-1">💌 {t("sendInvite")}</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {!loading && matchedUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No matches found
          </h3>
          <p className="text-gray-500">
            Try adding more hobbies or locations to find people with similar
            interests!
          </p>
        </div>
      )}
    </div>
  );
}
