'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import React, { useState } from 'react';

// Icons
const MenuIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);
const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const HomeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const GlobeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
);
const HeartIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);
const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);
const MessageIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);
const SettingsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
const LogOutIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
);

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const t = useTranslations('dashboard.nav');
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Derive locale if not passed (fallback parsing)
  const locale = params?.locale || pathname.split('/')[1] || 'en';

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = `/${locale}/login`;
  };

  const base = `/dashboard`;
  const navItems = [
    { name: t('home'), path: base, icon: HomeIcon, exact: true },
    { name: t('openInvites'), path: `${base}/open-invites`, icon: GlobeIcon },
    { name: t('hobbyMatch'), path: `${base}/hobby-match`, icon: HeartIcon },
    { name: t('createInvite'), path: `${base}/create-invite`, icon: PlusIcon, isSpecial: true },
    { name: t('myEvents'), path: `${base}/my-events`, icon: CalendarIcon },
    { name: t('messages'), path: `${base}/messages`, icon: MessageIcon },
    { name: t('settings'), path: `${base}/settings`, icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 flex flex-col font-sans">
      {/* Top Bar - Glassmorphism */}
      <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MenuIcon className="w-6 h-6" />
            </button>

            {/* Logo Area */}
            <div className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105" onClick={() => router.push(base)}>
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 to-purple-600 rounded-xl rotate-6 opacity-80 blur-[2px]"></div>
                <div className="relative w-full h-full bg-gradient-to-tr from-rose-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                  <span className="drop-shadow-md">✨</span>
                </div>
              </div>
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-800 to-rose-700 tracking-tight hidden sm:block">
                RND APP
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-6 md:pb-28 pt-6">
        {children}
      </main>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-80 bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 to-purple-600 rounded-xl rotate-6 opacity-80 blur-[2px]"></div>
              <div className="relative w-full h-full bg-gradient-to-tr from-rose-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                <span className="drop-shadow-md">✨</span>
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

        {/* Sidebar Navigation */}
        <nav className="flex flex-col p-4 gap-2">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.path || pathname === `/${locale}${item.path}`
              : pathname.startsWith(item.path) || pathname.startsWith(`/${locale}${item.path}`);

            return (
              <button
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-50 to-purple-50 text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} />
                <span className="font-semibold text-sm">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={() => {
              handleLogout();
              setIsSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all duration-200"
          >
            <LogOutIcon className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Desktop Bottom Navigation - Hidden on Mobile */}
      <div className="hidden md:flex fixed bottom-6 left-0 right-0 z-50 justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto bg-white/90 backdrop-blur-2xl border border-white/40 shadow-2xl shadow-purple-900/10 rounded-[2rem] p-2 flex items-center gap-1 sm:gap-2 max-w-full overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            // Check active state
            // If exact is true, path must match exactly.
            // Otherwise, check if pathname starts with item.path
            // AND ensure we don't match sub-paths incorrectly (e.g. /dashboard matches /dashboard/settings if not careful)
            const isActive = item.exact 
              ? pathname === item.path || pathname === `/${locale}${item.path}`
              : pathname.startsWith(item.path) || pathname.startsWith(`/${locale}${item.path}`);

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
                    ? 'text-purple-600'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                }`}
              >
                {isActive && (
                  <div className="absolute bottom-1 w-8 h-1 bg-gradient-to-r from-rose-400 to-purple-500 rounded-full" />
                )}
                <item.icon className={`w-6 h-6 mb-0.5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className={`text-[10px] font-bold leading-none transition-colors ${isActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600' : ''}`}>
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
