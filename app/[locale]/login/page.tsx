'use client';

import { useTranslations } from 'next-intl';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui';
import { GoogleIcon, HeartFilledIcon } from '@/icons/icons';

const HeartIcon = HeartFilledIcon;

export default function LoginPage() {
  const t = useTranslations('login');

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: `/onboarding` });
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-rose-200/40 to-pink-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-gradient-to-tr from-indigo-200/40 to-purple-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse delay-1000" />
      <div className="fixed top-[20%] left-[20%] w-[400px] h-[400px] bg-amber-100/40 rounded-full blur-[100px] mix-blend-multiply" />

      <div className="relative z-10 w-full max-w-md">
        
        <div className="absolute -top-12 -left-8 animate-bounce delay-700 hidden md:block">
           <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/50 flex items-center gap-2 transform -rotate-12">
             <span className="text-2xl">🎉</span>
             <div className="flex flex-col">
               <span className="text-xs font-bold text-gray-500 uppercase">Events</span>
               <span className="text-sm font-black text-gray-800">500+ Weekly</span>
             </div>
           </div>
        </div>

        <div className="absolute -bottom-8 -right-4 animate-bounce delay-300 hidden md:block">
           <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/50 flex items-center gap-2 transform rotate-6">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => <div key={i} className={`w-6 h-6 rounded-full border-2 border-white bg-gray-200 bg-[url('https://i.pravatar.cc/100?img=${i+10}')] bg-cover`} />)}
             </div>
             <div className="flex flex-col">
               <span className="text-xs font-bold text-gray-500 uppercase">Community</span>
               <span className="text-sm font-black text-gray-800">10k+ Members</span>
             </div>
           </div>
        </div>

        <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 shadow-2xl shadow-indigo-100/50 p-8 md:p-10 text-center">
          <div className="mb-8 flex flex-col items-center">
             <div className="w-24 h-24 bg-gradient-to-tr from-rose-500 to-purple-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-rose-200 mb-6 group cursor-pointer hover:scale-105 transition-transform duration-300">
                <HeartIcon className="w-12 h-12 text-white drop-shadow-md animate-pulse" />
             </div>
             <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
               {t('title')}
             </h1>
             <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-[280px] mx-auto">
               {t('subtitle')}
             </p>
          </div>

          <div className="space-y-6">
            <Button
              size="lg"
              onClick={handleGoogleLogin}
              className="w-full h-16 rounded-2xl bg-white hover:bg-gray-50 text-gray-700 font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all border border-gray-100 flex items-center justify-center gap-4 group"
            >
              <GoogleIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span>{t('googleLogin')}</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300/50"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-gray-400">
                <span className="bg-transparent px-4 backdrop-blur-sm">Secure Entry</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 font-medium px-4 leading-relaxed">
              By continuing, you agree to our Terms of Service & Privacy Policy. 
              We promise to keep your vibes safe. ✌️
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
           <p className="text-sm font-semibold text-gray-400">
             Match. Meet. Memories.
           </p>
        </div>

      </div>
    </div>
  );
}