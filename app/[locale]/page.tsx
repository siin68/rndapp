'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui';
import { SparklesIcon, HeartFilledIcon, MapIcon, MessageSquareIcon, CheckIcon } from '@/icons/icons';

// Rename for consistency
const SparkleIcon = SparklesIcon;
const HeartIcon = HeartFilledIcon;
const ChatIcon = MessageSquareIcon;

export default function LandingPage() {
  const t = useTranslations('landing');

  // Decorative tags for the hero animation
  const tags = ['Coffee ☕', 'Hiking 🌲', 'Gaming 🎮', 'Art 🎨', 'Music 🎵', 'Yoga 🧘‍♀️', 'Tech 💻', 'Foodie 🍔'];

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden selection:bg-rose-200 selection:text-rose-900 font-sans">
      
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-200/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-rose-200/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse delay-1000" />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-amber-100/40 rounded-full blur-[80px] mix-blend-multiply" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 pb-2">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm rounded-full px-6 py-3 flex justify-between items-center transition-all hover:bg-white/90 hover:shadow-md">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <HeartIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                RND
              </span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
              <a href="#features" className="hover:text-rose-500 transition-colors">Features</a>
              <a href="#stories" className="hover:text-rose-500 transition-colors">Stories</a>
              <a href="#safety" className="hover:text-rose-500 transition-colors">Safety</a>
            </nav>

            <Link href="/login">
              <Button className="rounded-full bg-gray-900 text-white hover:bg-gray-800 px-6 font-bold shadow-lg shadow-gray-200/50 transition-all hover:scale-105 active:scale-95">
                {t('login')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 md:pt-48 md:pb-32 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          <div className="text-center lg:text-left space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold uppercase tracking-wider mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <SparkleIcon className="w-3 h-3" />
              <span>The #1 Vibe-Based Dating App</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
              Match on <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 animate-gradient-x">
                Energy,
              </span> Not Just Looks.
            </h1>
            
            <p className="text-xl text-gray-500 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t('subtitle')} Stop swiping on faces. Start connecting with real people who love what you love.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link href="/login">
                <Button size="lg" className="h-14 px-8 rounded-full text-lg bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 shadow-xl shadow-rose-200 hover:shadow-rose-300 transition-all hover:-translate-y-1">
                  {t('cta')}
                </Button>
              </Link>
              <Button variant="ghost" className="h-14 px-8 rounded-full text-lg font-semibold text-gray-600 hover:bg-gray-100/50">
                How it works
              </Button>
            </div>

            <div className="pt-8 flex items-center justify-center lg:justify-start gap-4 text-sm font-semibold text-gray-400">
              <div className="flex -space-x-3">
                 {[1,2,3,4].map((i) => (
                   <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
                   </div>
                 ))}
              </div>
              <p>Join 10,000+ early adopters</p>
            </div>
          </div>

          <div className="relative h-[500px] w-full hidden lg:block perspective-1000">
             <div className="absolute inset-x-10 top-20 bottom-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[3rem] transform rotate-y-12 rotate-z-2 shadow-2xl border border-white/50 backdrop-blur-sm"></div>
             
             <div className="absolute top-10 left-0 w-64 p-4 bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 animate-float">
                <div className="aspect-[4/5] rounded-2xl bg-gray-100 mb-4 overflow-hidden relative">
                   <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400" alt="Profile" className="object-cover w-full h-full" />
                   <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
                      <h3 className="font-bold text-lg">Sarah, 24</h3>
                      <p className="text-xs opacity-90">📍 2km away</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <div className="flex-1 py-2 bg-rose-100 rounded-xl flex items-center justify-center text-rose-500">
                     <HeartIcon className="w-6 h-6" />
                   </div>
                   <div className="flex-1 py-2 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                   </div>
                </div>
             </div>

             <div className="absolute top-40 right-10 w-56 p-4 bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 animate-float delay-700 z-20">
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <ChatIcon className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-gray-400">New Message</p>
                      <p className="text-sm font-bold text-gray-800">Coffee this weekend? ☕</p>
                   </div>
                </div>
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                   <div className="h-full w-2/3 bg-purple-500 rounded-full"></div>
                </div>
             </div>

             {tags.slice(0, 5).map((tag, i) => (
               <div 
                 key={tag}
                 className="absolute bg-white shadow-lg shadow-purple-100/50 px-4 py-2 rounded-full text-sm font-bold text-gray-700 animate-bounce"
                 style={{ 
                   top: `${Math.random() * 80 + 10}%`, 
                   left: `${Math.random() * 80 + 10}%`, 
                   animationDelay: `${i * 0.5}s`,
                   zIndex: 1
                 }}
               >
                 {tag}
               </div>
             ))}
          </div>
        </div>
      </main>

      <div className="py-8 bg-gray-900 overflow-hidden transform -rotate-1 origin-left scale-110">
        <div className="flex items-center gap-8 animate-infinite-scroll min-w-full">
           {[...tags, ...tags, ...tags].map((tag, i) => (
             <span key={i} className="text-2xl font-black text-gray-700 whitespace-nowrap px-4 uppercase tracking-tighter hover:text-white transition-colors cursor-default">
               {tag}
             </span>
           ))}
        </div>
      </div>

      <section id="features" className="py-24 px-4 bg-gray-50/50">
         <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-4">
               <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
                 Why RND is <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600">Different</span>
               </h2>
               <p className="text-lg text-gray-500">
                 Weve redesigned dating from the ground up to focus on what actually matters: shared experiences.
               </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
               <div className="group bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 hover:shadow-2xl hover:shadow-rose-100/50 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-[2.5rem] -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
                  <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500 mb-6 relative z-10 group-hover:rotate-12 transition-transform">
                     <SparkleIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 relative z-10">{t('features.hobby')}</h3>
                  <p className="text-gray-500 leading-relaxed relative z-10">
                    {t('features.hobbyDesc')} Find your running partner, your gaming squad, or your art gallery date instantly.
                  </p>
               </div>
               <div className="group bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 hover:shadow-2xl hover:shadow-purple-100/50 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-[2.5rem] -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6 relative z-10 group-hover:rotate-12 transition-transform">
                     <MapIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 relative z-10">{t('features.location')}</h3>
                  <p className="text-gray-500 leading-relaxed relative z-10">
                    {t('features.locationDesc')} Discover events happening right now in your neighborhood. Real life, real time.
                  </p>
               </div>
               <div className="group bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[2.5rem] -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 relative z-10 group-hover:rotate-12 transition-transform">
                     <ChatIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 relative z-10">{t('features.chat')}</h3>
                  <p className="text-gray-500 leading-relaxed relative z-10">
                    {t('features.chatDesc')} Break the ice easily with shared context. No more awkward Hey messages.
                  </p>
               </div>
            </div>
         </div>
      </section>
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto bg-gray-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px] pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-600/30 rounded-full blur-[100px] pointer-events-none"></div>
           
           <div className="relative z-10 space-y-8">
             <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
               Ready to find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-purple-400">Person?</span>
             </h2>
             <p className="text-xl text-gray-400 max-w-2xl mx-auto">
               Join thousands of others who are done with swiping and ready for doing. 
               Your next adventure starts here.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
               <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto h-16 px-10 rounded-full text-xl font-bold bg-white text-gray-900 hover:bg-gray-100">
                    Get Started Free
                  </Button>
               </Link>
             </div>
             <p className="text-sm text-gray-500 pt-4">No credit card required • Cancel anytime</p>
           </div>
        </div>
      </section>
      <footer className="border-t border-gray-100 bg-white py-12 px-4">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                 <HeartIcon className="w-4 h-4 text-white" />
               </div>
               <span className="font-bold text-gray-900">RND APP</span>
            </div>
            <div className="text-sm text-gray-500">
               © {new Date().getFullYear()} Date RND App. Crafted with 💖 and code.
            </div>
            <div className="flex gap-6">
               <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.56v14.88c0 2.52-2.04 4.56-4.56 4.56H4.56C2.04 24 0 21.96 0 19.44V4.56C0 2.04 2.04 0 4.56 0h14.88C21.96 0 24 2.04 24 4.56z"/></svg></a>
               <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.25-1.69 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.25-.15-4.77-1.69-4.92-4.92-.06-1.27-.07-1.65-.07-4.85 0-3.2.01-3.58.07-4.85.15-3.25 1.69-4.77 4.92-4.92 1.27-.06 1.65-.07 4.85-.07z"/></svg></a>
            </div>
         </div>
      </footer>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes infinite-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 20s linear infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}