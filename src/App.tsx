import React, { useState, useEffect } from 'react';
import { auth } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { fetchUserProgress, cleanupLargeProgressFields } from '@/services/firebaseService';
import { 
  Routes, 
  Route, 
  useLocation, 
  useNavigate, 
  Link,
  Navigate
} from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  MessageSquare, 
  ShieldCheck, 
  Gamepad2,
  LogOut,
  User as UserIcon,
  Newspaper,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

// Pages
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import VotingSimulator from '@/pages/VotingSimulator';
import QuizEngine from '@/pages/QuizEngine';
import ChatAssistant from '@/pages/ChatAssistant';
import ConstituencyLookup from '@/pages/ConstituencyLookup';
import ProfileManager from '@/pages/ProfileManager';
import VoterRegistration from '@/pages/VoterRegistration';
import DocumentCenter from '@/pages/DocumentCenter';
import NewsFeed from '@/pages/NewsFeed';
import NewsDetail from '@/pages/NewsDetail';

import { useSettings } from '@/context/SettingsContext';
import { Language } from '@/i18n/translations';

import ECILogo from '@/components/ECILogo';

export default function App() {
  const { language, setLanguage, fontSize, setFontSize, t } = useSettings();
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    const path = location.pathname.substring(1);
    if (!path || path === '') return 'dashboard';
    if (path.startsWith('news')) return 'news';
    return path;
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await cleanupLargeProgressFields(u.uid);
        
        let data = await fetchUserProgress(u.uid);
        
        // Ensure email and provider are stored
        const updatePayload: any = {};
        if (!data?.email) updatePayload.email = u.email;
        if (!data?.displayName && u.displayName) updatePayload.displayName = u.displayName;
        if (!data?.authProvider) updatePayload.authProvider = u.providerData[0]?.providerId || 'password';
        
        if (Object.keys(updatePayload).length > 0) {
          import('@/services/firebaseService').then(({ updateUserProgress }) => {
            updateUserProgress(u.uid, updatePayload);
          });
          data = { ...data, ...updatePayload };
        }

        setProfileData(data);
      } else {
        setProfileData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => auth.signOut();

  const changeFontSize = (delta: number) => {
    // Round to 1 decimal place to avoid float issues
    setFontSize(Math.round((Math.min(1.5, Math.max(0.7, fontSize + delta))) * 10) / 10);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-[1rem]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-navy border-t-saffron rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'registration', label: t('registration'), icon: UserIcon },
    { id: 'documents', label: t('documents'), icon: ShieldCheck },
    { id: 'simulation', label: t('simulator'), icon: Gamepad2 },
    { id: 'constituency', label: t('booth'), icon: MapPin },
    { id: 'news', label: t('news'), icon: Newspaper },
    { id: 'chat', label: t('chat'), icon: MessageSquare },
  ];

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'te', label: 'తెలుగు' },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col font-sans">
      {/* Top Banner Bar - Indian Govt Style */}
      <div className="bg-[#f8f9fa] text-slate-600 border-b border-slate-200">
        <div className="gov-container flex justify-between items-center py-1.5 px-4 md:px-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-2.5 flex flex-col">
                <div className="h-full bg-[#FF9933]" />
                <div className="h-full bg-white shadow-sm" />
                <div className="h-full bg-[#138808]" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tight text-navy whitespace-nowrap">Government of India</span>
            </div>
            <span className="hidden md:inline text-[10px] font-medium uppercase tracking-tight text-slate-400 border-l border-slate-200 pl-4 whitespace-nowrap">
              Election Commission of India Pilot
            </span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
             <div className="flex items-center gap-1.5 border-r border-slate-200 pr-2 sm:pr-4 md:pr-6">
                <button 
                  onClick={() => changeFontSize(-0.1)} 
                  className={cn(
                    "flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-sm border border-slate-300 text-[10px] font-black uppercase transition-all hover:border-navy hover:text-navy",
                    fontSize < 0.9 ? "bg-slate-100 text-slate-400 border-slate-200" : "bg-white text-slate-600"
                  )}
                  title={t('decreaseFont')}
                >
                  A-
                </button>
                <button 
                  onClick={() => setFontSize(1)} 
                  className={cn(
                    "flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-sm border border-slate-300 text-[10px] font-black uppercase transition-all hover:border-navy hover:text-navy",
                    fontSize === 1 ? "bg-slate-100 text-slate-400 border-slate-200" : "bg-white text-slate-600"
                  )}
                  title={t('resetFont')}
                >
                  A
                </button>
                <button 
                  onClick={() => changeFontSize(0.1)} 
                  className={cn(
                    "flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-sm border border-slate-300 text-[10px] font-black uppercase transition-all hover:border-navy hover:text-navy",
                    fontSize > 1.2 ? "bg-slate-100 text-slate-400 border-slate-200" : "bg-white text-slate-600"
                  )}
                  title={t('increaseFont')}
                >
                  A+
                </button>
             </div>
             
             <div className="relative">
               <button 
                 onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight text-slate-600 hover:text-navy transition-colors bg-white border border-slate-300 px-3 py-1.5 rounded-sm"
               >
                 <span>{languages.find(l => l.code === language)?.label}</span>
                 <ChevronDown className="w-3 h-3 opacity-60" />
               </button>
               
               <AnimatePresence>
                 {langDropdownOpen && (
                   <motion.div 
                     initial={{ opacity: 0, y: 5 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 5 }}
                     className="absolute right-0 mt-1 w-32 bg-white text-navy shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] z-[70] border border-slate-200 rounded-sm overflow-hidden"
                   >
                     {languages.map((lang) => (
                       <button
                         key={lang.code}
                         onClick={() => {
                           setLanguage(lang.code as Language);
                           setLangDropdownOpen(false);
                         }}
                         className={cn(
                           "w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0",
                           language === lang.code ? "bg-[#f0f4ff] border-l-2 border-l-navy text-navy" : "text-slate-600"
                         )}
                       >
                         {lang.label}
                       </button>
                     ))}
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
         <div className="gov-container h-[88px] px-4 md:px-8 flex items-center justify-between">
            {/* Branding */}
            <Link to="/" className="flex items-center gap-3 md:gap-4 group shrink-0">
               <div className="bg-white p-1 md:p-1.5 rounded-sm shadow-sm border border-slate-100 group-hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)] group-hover:border-slate-200 transition-all flex items-center justify-center">
                  <ECILogo size={44} className="md:w-[52px] md:h-[52px]" />
               </div>
               <div className="flex flex-col">
                  <span className="text-xl md:text-[22px] font-black text-navy uppercase tracking-tight leading-none">Election AI</span>
                  <span className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] md:tracking-[0.2em] mt-1">Official Digital Portal</span>
               </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center h-full mx-6 flex-1 justify-center gap-1 xl:gap-2">
               {navItems.map((item) => (
                 <Link 
                   key={item.id}
                   to={`/${item.id}`}
                   className={cn(
                     "px-3 xl:px-4 h-full flex flex-col justify-center gap-1.5 text-[11px] font-bold uppercase tracking-tight transition-all relative border-b-4",
                     activeTab === item.id 
                       ? "text-navy border-b-saffron bg-[#f8faff]" 
                       : "text-slate-500 hover:text-navy hover:bg-slate-50 border-b-transparent"
                   )}
                 >
                   <item.icon className={cn("w-4 h-4 mx-auto transition-colors", activeTab === item.id ? "text-saffron" : "text-slate-400 group-hover:text-slate-600")} />
                   <span>{item.label}</span>
                 </Link>
               ))}
            </nav>

            {/* User Profile / Session Status */}
            <div className="flex items-center gap-4 md:gap-6 shrink-0">
               <div className="hidden sm:flex items-center gap-3">
                  <div className="text-right flex flex-col justify-center">
                     <div className="flex items-center gap-1.5 justify-end">
                       <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                       <p className="text-[11px] font-black text-navy uppercase truncate max-w-[150px] leading-none">
                         {profileData?.displayName || user.displayName || 'Voter User'}
                       </p>
                     </div>
                     <p className="text-[9px] text-[#FF9933] font-bold uppercase tracking-widest mt-1">
                       Session Secure
                     </p>
                  </div>
                  <Link to="/profile" className="w-10 h-10 border border-slate-200 rounded-sm overflow-hidden p-[2px] bg-white hover:border-navy transition-colors shrink-0 flex items-center justify-center group relative">
                     {user.photoURL ? (
                       <img src={user.photoURL} alt={user.displayName || 'Profile'} referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-[1px]" />
                     ) : (
                       <div className="w-full h-full bg-[#f0f4ff] rounded-[1px] flex items-center justify-center group-hover:bg-navy transition-colors">
                         <UserIcon className="w-5 h-5 text-navy group-hover:text-white transition-colors" />
                       </div>
                     )}
                     <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                       <ShieldCheck className="w-2.5 h-2.5 text-green-600" />
                     </div>
                  </Link>
               </div>

               <div className="flex items-center gap-2 border-l border-slate-200 pl-4 md:pl-6">
                 <button 
                  onClick={handleLogout}
                  className="hidden md:flex items-center justify-center w-9 h-9 rounded-sm text-slate-400 border border-transparent hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-all font-bold group"
                  title={t('logout')}
                 >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                 </button>
                 <button 
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden flex items-center justify-center w-10 h-10 rounded-sm bg-slate-50 text-navy border border-slate-200 hover:bg-slate-100 transition-colors"
                 >
                    <Menu className="w-5 h-5" />
                 </button>
               </div>
            </div>
         </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
         <div className="gov-container py-10">
            <AnimatePresence mode="wait">
               <motion.div
                 key={location.pathname}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.15 }}
               >
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard user={user} />} />
                    <Route path="/simulation" element={<VotingSimulator />} />
                    <Route path="/quiz" element={<QuizEngine />} />
                    <Route path="/chat" element={<ChatAssistant />} />
                    <Route path="/constituency" element={<ConstituencyLookup />} />
                    <Route path="/news" element={<NewsFeed />} />
                    <Route path="/news/:id" element={<NewsDetail />} />
                    <Route path="/profile" element={<ProfileManager user={user} />} />
                    <Route path="/registration" element={<VoterRegistration user={user} />} />
                    <Route path="/documents" element={<DocumentCenter user={user} />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
               </motion.div>
            </AnimatePresence>
         </div>
      </main>

      {/* Footer Branding */}
      <footer className="bg-navy text-white/70 py-16 px-4 md:px-8 border-t-[10px] border-t-saffron">
         <div className="gov-container grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-6 md:col-span-2">
               <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-sm shadow-sm">
                    <ECILogo size={48} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-white uppercase tracking-tight leading-none">Election AI</span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Empowering the Indian Electorate</span>
                  </div>
               </div>
               <p className="text-xs leading-relaxed text-slate-400 max-w-md">
                 An official digital initiative dedicated to enhancing electoral participation and transparency through advanced AI services. Ensuring every citizen is informed, registered, and empowered.
               </p>
            </div>
            
            <div className="space-y-6">
               <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2">Service Map</h4>
               <div className="grid grid-cols-1 gap-y-3">
                  {navItems.map(item => (
                    <Link key={item.id} to={`/${item.id}`} className="text-[11px] font-medium hover:text-saffron transition-colors flex items-center gap-2 group">
                      <div className="w-1 h-1 bg-saffron/30 rounded-full group-hover:scale-150 transition-transform" />
                      {item.label}
                    </Link>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
               <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2">ECI Resources</h4>
               <div className="flex flex-col gap-y-3">
                  <a href="#" className="text-[11px] font-medium hover:text-saffron transition-colors">Voter Service Portal</a>
                  <a href="#" className="text-[11px] font-medium hover:text-saffron transition-colors">Know Your Candidate</a>
                  <a href="#" className="text-[11px] font-medium hover:text-saffron transition-colors">Election Commissions (States)</a>
                  <a href="#" className="text-[11px] font-medium hover:text-saffron transition-colors">Model Code of Conduct</a>
               </div>
            </div>
         </div>

         <div className="gov-container mt-16 pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
               <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider text-center md:text-left">
                 © 2026 Election AI • A Digital India Pilot for Electoral Literacy
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Operational Excellence • v1.4.2</span>
               </div>
            </div>
         </div>
      </footer>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setMobileMenuOpen(false)}
               className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               className="fixed top-0 right-0 bottom-0 w-80 bg-white z-[101] flex flex-col shadow-2xl"
            >
               <div className="p-6 bg-navy text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="bg-white p-1 rounded-sm">
                       <ECILogo size={28} />
                     </div>
                     <span className="text-lg font-black uppercase tracking-tight">Election AI</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-white">
                     <X className="w-6 h-6" />
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto py-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.id}
                      to={`/${item.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "w-full flex items-center gap-5 px-8 py-5 text-[11px] font-black uppercase tracking-widest transition-all",
                        activeTab === item.id 
                          ? "bg-navy text-white border-l-4 border-l-saffron shadow-lg" 
                          : "text-slate-400 border-l-4 border-l-transparent"
                      )}
                    >
                      <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-saffron" : "text-slate-300")} />
                      <span>{item.label}</span>
                    </Link>
                  ))}
               </div>
               <div className="p-6 border-t border-slate-100 space-y-4">
                  <button 
                    onClick={() => {
                       setMobileMenuOpen(false);
                       handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-3 py-4 text-[10px] font-black text-red-600 bg-red-50 uppercase tracking-widest border border-red-200"
                  >
                     <LogOut className="w-4 h-4" />
                     {t('logout')}
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
