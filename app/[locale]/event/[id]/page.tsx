"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
} from "@/components/ui";
import { getHobbyById, getLocationById } from "@/lib/data";
import { useSession } from "next-auth/react";

interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date | string;
  hobbyId: string;
  locationId: string;
  hostId: string;
  maxParticipants: number;
  status: string;
  host?: any;
  hobby?: any;
  location?: any;
  participants?: any[];
  _count?: { participants: number };
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const t = useTranslations("event");
  const { data: session } = useSession();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/${params.id}`);
        console.log("response: ", response);
        const data = await response.json();

        if (data.success) {
          setEvent(data.data);
        } else {
          setError(data.error || "Event not found");
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-500">{error || "Event not found"}</p>
          <Button onClick={() => router.push(`/dashboard`)} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const hobby = getHobbyById(event.hobbyId) || event.hobby;
  const location = getLocationById(event.locationId) || event.location;
  const host = event.host;
  const participantCount =
    event._count?.participants || event.participants?.length || 0;
  const isFull = participantCount >= event.maxParticipants;
  const spotsLeft = event.maxParticipants - participantCount;
  const isParticipant = event.participants?.some(
    (p: any) => p.userId === session?.user?.id
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6"
        >
          ← Back
        </Button>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-extrabold text-gray-800">
                {event.title}
              </h1>
              <Badge
                variant={event.status === "OPEN" ? "default" : "secondary"}
              >
                {event.status === "OPEN" ? "Open" : event.status}
              </Badge>
            </div>
            <p className="text-gray-600 mb-6">{event.description}</p>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  {t("host")}
                </h3>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={host?.image || ""}
                      alt={host?.name || ""}
                    />
                    <AvatarFallback>
                      {host?.name?.charAt(0) || "H"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {host?.name || "Event Host"}
                    </div>
                    {host?.id && (
                      <button
                        onClick={() =>
                          router.push(`/${locale}/profile/${host.id}`)
                        }
                        className="text-sm text-primary-600 hover:underline"
                      >
                        View profile
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  {t("hobby")}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{hobby?.icon}</span>
                  <span className="font-semibold text-gray-800">
                    {hobby?.name}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  {t("location")}
                </h3>
                <div className="font-semibold text-gray-800">
                  {location?.name}
                </div>
                <div className="text-sm text-gray-600">
                  {location?.city?.name || location?.city}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  {t("when")}
                </h3>
                <div className="font-semibold text-gray-800">
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(event.date).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Participants ({participantCount}/{event.maxParticipants})
            </h3>
            <div className="flex flex-wrap gap-3 mb-4">
              {event.participants?.map((participant: any) => (
                <div
                  key={participant.id || participant.userId}
                  onClick={() =>
                    router.push(
                      `/${locale}/profile/${
                        participant.user?.id || participant.userId
                      }`
                    )
                  }
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={participant.user?.image || participant.image || ""}
                      alt={participant.user?.name || participant.name || ""}
                    />
                    <AvatarFallback>
                      {(
                        participant.user?.name ||
                        participant.name ||
                        "U"
                      ).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">
                    {participant.user?.name || participant.name || "Unknown"}
                  </span>
                </div>
              )) || []}
            </div>
            {spotsLeft > 0 && (
              <p className="text-sm text-gray-500">
                {spotsLeft} spot{spotsLeft > 1 ? "s" : ""} available
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            disabled={isFull || event.status !== "OPEN" || isParticipant}
            className="flex-1"
            onClick={() => {
              if (session?.user?.id) {
                alert("Join functionality will be implemented");
              } else {
                router.push(`/${locale}/login`);
              }
            }}
          >
            {isParticipant
              ? "Already Joined"
              : isFull
              ? "Event Full"
              : "Join Event"}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/${locale}/chat/${event.id}`)}
            disabled={!isParticipant}
          >
            Chat
          </Button>
        </div>
      </div>
    </div>
  );
}
