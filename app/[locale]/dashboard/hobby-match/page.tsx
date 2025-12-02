"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button, Badge } from "@/components/ui";
import { useSession } from "next-auth/react";
import { getHobbyById } from "@/lib/data";
import { HOBBIES } from "@/constants/hobbies";

// Icons
const FilterIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const XIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
const HeartIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z" />
  </svg>
);
const InfoIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);
const RefreshIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);
const LocationIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// Types
interface MatchUser {
  id: string;
  name: string;
  image?: string;
  bio?: string;
  sharedHobbies: Array<{
    hobby: { id: string; name: string; emoji: string };
  }>;
  sharedLocations: Array<{
    location: { id: string; name: string };
  }>;
  matchScore: number;
  lastActive?: Date;
}

export default function HobbyMatchPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // --- STATE ---
  const [users, setUsers] = useState<MatchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState({ min: 18, max: 50 });
  const [maxDistance, setMaxDistance] = useState(50);

  // Fetch matched users from API
  useEffect(() => {
    async function fetchMatches() {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/users/matches?userId=${session.user.id}&limit=20`
        );
        const data = await response.json();

        if (data.success) {
          setUsers(data.data || []);
        } else {
          console.error("Failed to fetch matches:", data.error);
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [session?.user?.id]);

  // Filter users based on selected criteria (client-side filtering for now)
  const filteredUsers = users.filter((user) => {
    // Hobby filter (if any hobbies selected, user must have matching hobbies)
    if (selectedHobbies.length > 0) {
      const userHobbyIds = user.sharedHobbies.map((h) => h.hobby.id);
      const hasMatchingHobby = selectedHobbies.some((hobbyId) =>
        userHobbyIds.includes(hobbyId)
      );
      if (!hasMatchingHobby) {
        return false;
      }
    }

    return true;
  });

  const matchedUsers = filteredUsers;
  const currentUser = matchedUsers[currentIndex];
  const nextUser = matchedUsers[currentIndex + 1];

  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [flyAway, setFlyAway] = useState<"left" | "right" | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  // --- CALCULATIONS ---
  const xDelta = currentPos.x - startPos.x;
  const rotate = xDelta * 0.05;
  const opacityNope = Math.min(Math.max(-xDelta / 100, 0), 1);
  const opacityLike = Math.min(Math.max(xDelta / 100, 0), 1);

  // Reset when index changes
  useEffect(() => {
    setFlyAway(null);
    setIsDragging(false);
    setStartPos({ x: 0, y: 0 });
    setCurrentPos({ x: 0, y: 0 });
  }, [currentIndex]);

  // --- HANDLERS ---
  const handleStart = (clientX: number, clientY: number) => {
    if (flyAway) return;
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
    setCurrentPos({ x: clientX, y: clientY });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setCurrentPos({ x: clientX, y: clientY });
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 120;
    if (xDelta > threshold) {
      triggerSwipe("right");
    } else if (xDelta < -threshold) {
      triggerSwipe("left");
    } else {
      setCurrentPos(startPos);
    }
  };

  const triggerSwipe = (direction: "left" | "right") => {
    setFlyAway(direction);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 300);
  };

  // Mouse Events
  const onMouseDown = (e: React.MouseEvent) =>
    handleStart(e.clientX, e.clientY);
  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX, e.clientY);
  const onMouseUp = () => handleEnd();
  const onMouseLeave = () => {
    if (isDragging) handleEnd();
  };

  // Touch Events
  const onTouchStart = (e: React.TouchEvent) =>
    handleStart(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) =>
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchEnd = () => handleEnd();

  // Button handlers
  const toggleHobby = (hobbyId: string) => {
    setSelectedHobbies((prev) =>
      prev.includes(hobbyId)
        ? prev.filter((id) => id !== hobbyId)
        : [...prev, hobbyId]
    );
  };

  const clearFilters = () => {
    setSelectedHobbies([]);
    setAgeRange({ min: 18, max: 50 });
    setMaxDistance(50);
    setCurrentIndex(0); // Reset to first card when filters cleared
  };

  const applyFilters = () => {
    setCurrentIndex(0); // Reset to first card when filters applied
    setShowFilters(false);
  };

  const resetDeck = () => {
    setCurrentIndex(0);
  };

  const onBtnSwipe = (direction: "left" | "right") => {
    if (currentIndex < filteredUsers.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const activeFiltersCount =
    selectedHobbies.length +
    (ageRange.min !== 18 || ageRange.max !== 50 ? 1 : 0) +
    (maxDistance !== 50 ? 1 : 0);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-3 py-2 sm:py-4 relative overflow-hidden select-none">
      {/* Decorative Background */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-gradient-to-r from-rose-200/20 to-purple-200/20 rounded-full blur-[100px] -z-20 animate-pulse" />

      {/* Header */}
      <div className="text-center mb-3 sm:mb-6 relative z-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span className="text-rose-500">Discover</span> Matches
          </h1>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="relative p-2.5 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 group"
          >
            <FilterIcon className="w-5 h-5 text-gray-600 group-hover:text-rose-500 transition-colors" />
            {activeFiltersCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                {activeFiltersCount}
              </div>
            )}
          </button>
        </div>
        <p className="text-gray-500 text-[11px] sm:text-xs md:text-sm font-medium">
          Swipe right to like, left to pass
        </p>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />

          {/* Filter Modal */}
          <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <XIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Age Range */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Age Range: {ageRange.min} - {ageRange.max}
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Min Age: {ageRange.min}
                    </label>
                    <input
                      type="range"
                      min="18"
                      max="50"
                      value={ageRange.min}
                      onChange={(e) =>
                        setAgeRange((prev) => ({
                          ...prev,
                          min: parseInt(e.target.value),
                        }))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Max Age: {ageRange.max}
                    </label>
                    <input
                      type="range"
                      min="18"
                      max="50"
                      value={ageRange.max}
                      onChange={(e) =>
                        setAgeRange((prev) => ({
                          ...prev,
                          max: parseInt(e.target.value),
                        }))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Distance */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Maximum Distance: {maxDistance} km
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 km</span>
                  <span>100 km</span>
                </div>
              </div>

              {/* Hobbies */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Hobbies ({selectedHobbies.length} selected)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {HOBBIES.map((hobby) => (
                    <button
                      key={hobby.id}
                      onClick={() => toggleHobby(hobby.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                        selectedHobbies.includes(hobby.id)
                          ? "bg-gradient-to-r from-rose-50 to-purple-50 border-purple-500 text-purple-700"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-lg">{hobby.icon}</span>
                      <span className="text-xs font-semibold truncate">
                        {hobby.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}

      {/* Card Area - Responsive sizing */}
      <div className="relative w-full max-w-[310px] sm:max-w-[340px] md:max-w-[360px] h-[480px] sm:h-[520px] md:h-[580px]">
        {loading ? (
          /* Loading State */
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8 bg-white/60 backdrop-blur-xl rounded-[1.75rem] sm:rounded-[2rem] md:rounded-[2.5rem] border-2 border-dashed border-gray-300 shadow-xl animate-pulse">
            <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 md:mb-6">
              🔍
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-black text-gray-800 mb-2">
              Finding matches...
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-5 sm:mb-6 md:mb-8 max-w-[160px] sm:max-w-[180px] md:max-w-[200px]">
              Looking for people with your interests!
            </p>
          </div>
        ) : (
          <>
            {/* Next Card (Background Placeholder) */}
            {nextUser && (
              <div className="absolute inset-0 top-3 sm:top-4 scale-95 opacity-50 bg-white rounded-[1.75rem] sm:rounded-[2rem] border border-gray-200 shadow-xl overflow-hidden pointer-events-none">
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400">
                  {nextUser.image ? (
                    <img
                      src={nextUser.image}
                      className="w-full h-full object-cover grayscale"
                      alt={nextUser.name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl text-white">
                      {nextUser.name?.charAt(0) || "?"}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Current Card (Draggable) */}
            {currentUser ? (
              <div
                ref={cardRef}
                className={`
              absolute inset-0 bg-white rounded-[1.75rem] sm:rounded-[2rem] shadow-2xl overflow-hidden border border-white/50 cursor-grab active:cursor-grabbing
              ${
                flyAway === "right"
                  ? "translate-x-[200%] rotate-12 opacity-0 transition-all duration-500 ease-out"
                  : ""
              }
              ${
                flyAway === "left"
                  ? "-translate-x-[200%] -rotate-12 opacity-0 transition-all duration-500 ease-out"
                  : ""
              }
              ${
                !isDragging && !flyAway
                  ? "transition-transform duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                  : ""
              }
            `}
                style={{
                  transform: !flyAway
                    ? `translate(${xDelta}px, ${
                        currentPos.y - startPos.y
                      }px) rotate(${rotate}deg)`
                    : undefined,
                  boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
                }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {/* Image */}
                <div className="absolute inset-0 bg-gray-200 pointer-events-none">
                  {currentUser.image ? (
                    <>
                      <img
                        src={currentUser.image}
                        alt={currentUser.name}
                        className="w-full h-full object-cover pointer-events-none"
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
                    </>
                  ) : (
                    <>
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        <div className="text-8xl font-black text-white/80">
                          {currentUser.name?.charAt(0) || "?"}
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                    </>
                  )}
                </div>

                {/* STAMPS (Visual Feedback) - Responsive */}
                <div
                  className="absolute top-5 sm:top-6 md:top-8 left-3 sm:left-4 md:left-8 border-[3px] sm:border-4 md:border-[6px] border-green-400 text-green-400 rounded-lg px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 font-black text-xl sm:text-2xl md:text-4xl tracking-widest uppercase rotate-[-15deg] pointer-events-none z-20"
                  style={{ opacity: opacityLike }}
                >
                  LIKE
                </div>
                <div
                  className="absolute top-5 sm:top-6 md:top-8 right-3 sm:right-4 md:right-8 border-[3px] sm:border-4 md:border-[6px] border-red-500 text-red-500 rounded-lg px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 font-black text-xl sm:text-2xl md:text-4xl tracking-widest uppercase rotate-[15deg] pointer-events-none z-20"
                  style={{ opacity: opacityNope }}
                >
                  NOPE
                </div>

                {/* Content Overlay - Responsive */}
                <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 md:p-6 text-white pointer-events-none z-10">
                  <div className="flex items-end justify-between mb-1.5 sm:mb-2 md:mb-3">
                    <div>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-none drop-shadow-md">
                        {currentUser.name}
                      </h2>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 md:mt-2 text-[11px] sm:text-xs md:text-sm font-semibold opacity-90">
                        <LocationIcon className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4" />
                        <span>5 km away</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm md:text-base text-gray-100 line-clamp-2 md:line-clamp-3 mb-2 sm:mb-3 md:mb-4 font-medium leading-relaxed drop-shadow-sm">
                    {currentUser.bio}
                  </p>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {currentUser.sharedHobbies.slice(0, 3).map((hobbyRel) => {
                      const hobby = hobbyRel.hobby;
                      return (
                        <span
                          key={hobby.id}
                          className="bg-white/20 backdrop-blur-md px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] md:text-xs font-bold shadow-sm border border-white/20"
                        >
                          {hobby.emoji} {hobby.name}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Info Button - Responsive */}
                <button
                  className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors cursor-pointer pointer-events-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/profile/${currentUser.id}`);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <InfoIcon className="w-5 sm:w-6 h-5 sm:h-6" />
                </button>
              </div>
            ) : (
              /* Empty State - Responsive */
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8 bg-white/60 backdrop-blur-xl rounded-[1.75rem] sm:rounded-[2rem] md:rounded-[2.5rem] border-2 border-dashed border-gray-300 shadow-xl">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 md:mb-6 animate-bounce">
                  🙈
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-gray-800 mb-2">
                  No more profiles!
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-5 sm:mb-6 md:mb-8 max-w-[160px] sm:max-w-[180px] md:max-w-[200px]">
                  You've seen everyone nearby. Check back later.
                </p>
                <Button
                  onClick={resetDeck}
                  className="rounded-full h-10 sm:h-12 md:h-14 px-5 sm:px-6 md:px-8 bg-gray-900 text-white font-bold shadow-lg hover:scale-105 transition-transform text-xs sm:text-sm md:text-base"
                >
                  <RefreshIcon className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5 mr-2" />
                  Start Over
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Buttons - Responsive sizing */}
      {currentUser && (
        <div className="flex items-center gap-3 sm:gap-4 md:gap-6 mt-3 sm:mt-4 md:mt-6 z-20">
          <button
            onClick={() => onBtnSwipe("left")}
            className="w-[56px] sm:w-[60px] md:w-[72px] h-[56px] sm:h-[60px] md:h-[72px] rounded-full bg-white text-rose-500 shadow-xl shadow-rose-100/50 border border-gray-100 hover:scale-110 hover:bg-rose-50 transition-all duration-200 flex items-center justify-center group"
          >
            <XIcon className="w-6 sm:w-7 md:w-9 h-6 sm:h-7 md:h-9 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={() => onBtnSwipe("right")}
            className="w-[56px] sm:w-[60px] md:w-[72px] h-[56px] sm:h-[60px] md:h-[72px] rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 text-white shadow-xl shadow-purple-300/50 border-4 border-white hover:scale-110 hover:rotate-3 transition-all duration-200 flex items-center justify-center group"
          >
            <HeartIcon className="w-6 sm:w-7 md:w-9 h-6 sm:h-7 md:h-9 fill-current group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
