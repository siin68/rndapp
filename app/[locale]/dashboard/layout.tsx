"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import React, { useState } from "react";
import Image from "next/image";
import {
  MenuIcon,
  XIcon,
  HomeIcon,
  GlobeIcon,
  HeartIcon,
  PlusIcon,
  CalendarIcon,
  MessageIcon,
  SettingsIcon,
} from "@/icons/icons";
import NotificationBell from "@/components/NotificationBell";

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const t = useTranslations("dashboard.nav");
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Derive locale if not passed (fallback parsing)
  const locale = params?.locale || (pathname ? pathname.split("/")[1] : "") || "en";

  const base = `/dashboard`;
  const navItems = [
    { name: t("home"), path: base, icon: HomeIcon, exact: true },
    { name: t("openInvites"), path: `${base}/open-invites`, icon: GlobeIcon },
    { name: t("hobbyMatch"), path: `${base}/hobby-match`, icon: HeartIcon },
    {
      name: t("createInvite"),
      path: `${base}/create-invite`,
      icon: PlusIcon,
      isSpecial: true,
    },
    { name: t("myEvents"), path: `${base}/my-events`, icon: CalendarIcon },
    { name: t("messages"), path: `${base}/messages`, icon: MessageIcon },
    { name: t("settings"), path: `${base}/settings`, icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MenuIcon className="w-6 h-6" />
            </button>

            <div
              className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
              onClick={() => router.push(base)}
            >
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 to-purple-600 rounded-xl rotate-6 opacity-80 blur-[2px]"></div>
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                  <Image src="/assets/images/pickle-match.webp" alt="Pickle Match Logo" fill className="object-cover" />
                </div>
              </div>
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-800 to-rose-700 tracking-tight hidden sm:block">
                Pickle Match
              </span>
            </div>

            <div className="hidden md:flex items-center">
              {/* Real-time Notification Bell */}
              <NotificationBell />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full ">
        {children}
      </main>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-80 bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 to-purple-600 rounded-xl rotate-6 opacity-80 blur-[2px]"></div>
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <Image src="/assets/images/pickle-match.webp" alt="Pickle Match Logo" fill className="object-cover" />
              </div>
            </div>
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-800 to-rose-700 tracking-tight">
              RND APP
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex flex-col p-4 gap-2">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.path || pathname === `/${locale}${item.path}`
              : (pathname?.startsWith(item.path) ||
                pathname?.startsWith(`/${locale}${item.path}`)) ?? false;

            return (
              <button
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-rose-50 to-purple-50 text-purple-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isActive ? "text-purple-600" : "text-gray-400"
                  }`}
                />
                <span className="font-semibold text-sm">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

    <div className="hidden md:flex items-center">
              {/* Real-time Notification Bell */}
              <NotificationBell />
            </div>
      </aside>

      <div className="hidden md:flex fixed bottom-6 left-0 right-0 z-50 justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto bg-white/90 backdrop-blur-2xl border border-white/40 shadow-2xl shadow-purple-900/10 rounded-[2rem] p-2 flex items-center gap-1 sm:gap-2 max-w-full overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.path || pathname === `/${locale}${item.path}`
              : (pathname?.startsWith(item.path) ||
                pathname?.startsWith(`/${locale}${item.path}`)) ?? false;

            if (item.isSpecial) {
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className="mx-1 group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-110 transition-all duration-300"
                >
                  <PlusIcon className="w-8 h-8" />
                  <span className="sr-only">{item.name}</span>
                </button>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`relative flex flex-col items-center justify-center w-16 h-14 sm:w-20 rounded-2xl transition-all duration-300 group ${
                  isActive
                    ? "text-purple-600"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
                }`}
              >
                {isActive && (
                  <div className="absolute bottom-1 w-8 h-1 bg-gradient-to-r from-rose-400 to-purple-500 rounded-full" />
                )}
                <item.icon
                  className={`w-6 h-6 mb-0.5 transition-transform duration-300 ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  }`}
                />
                <span
                  className={`text-[10px] font-bold leading-none transition-colors ${
                    isActive
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600"
                      : ""
                  }`}
                >
                  {item.name}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
