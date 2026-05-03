import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { fetchUserProgress, updateUserProgress } from '@/services/firebaseService';
import { 
  ShieldCheck, 
  Target, 
  CheckCircle2, 
  CircleDashed, 
  Award, 
  Plus, 
  Minus, 
  ExternalLink, 
  MapPin, 
  ArrowRight, 
  Bell, 
  ChevronRight,
  User as UserIcon,
  Gamepad2,
  FileText,
  MessageSquare,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Props {
  user: User;
}

import { useSettings, translations } from '@/context/SettingsContext';

export default function Dashboard({ user }: Props) {
  const { t } = useSettings();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      const data = await fetchUserProgress(user.uid);
      
      const calculateScore = (p: any) => {
        let sc = 0;
        if (p.registrationStatus === 'Submitted') sc += 25;
        if (p.documentsUploaded) sc += 25;
        if (p.simulationCompleted) sc += 25;
        if (p.quizCompleted) sc += 25;
        return sc;
      };

      if (data) {
        const newScore = calculateScore(data);
        if (newScore !== data.readinessScore) {
           await updateUserProgress(user.uid, { readinessScore: newScore });
           setProgress({ ...data, readinessScore: newScore });
        } else {
           setProgress(data);
        }
      } else {
        const initial = {
          readinessScore: 0,
          completedSteps: [],
          quizScores: {},
          simulationCompleted: false,
          documentsUploaded: false,
          registrationStatus: 'Not Started',
          quizCompleted: false
        };
        await updateUserProgress(user.uid, initial);
        setProgress(initial);
      }
      setLoading(false);
    };
    loadProgress();
  }, [user]);

  if (loading) return (
     <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-navy border-t-saffron rounded-full animate-spin" />
     </div>
  );

  const score = progress?.readinessScore || 0;
  
  const stats = [
    { id: 'registration', label: t('voterRegistration'), done: progress?.registrationStatus === 'Submitted', icon: UserIcon, path: '/registration' },
    { id: 'documents', label: t('identityVerification'), done: progress?.documentsUploaded, icon: ShieldCheck, path: '/documents' },
    { id: 'simulation', label: t('pollingSimulation'), done: progress?.simulationCompleted, icon: Gamepad2, path: '/simulation' },
    { id: 'quiz', label: t('electoralIqQuiz'), done: progress?.quizCompleted, icon: Award, path: '/quiz' },
  ];

  const getRecommendation = () => {
    if (progress?.registrationStatus !== 'Submitted') return stats[0];
    if (!progress?.documentsUploaded) return stats[1];
    if (!progress?.quizCompleted) return stats[3];
    if (!progress?.simulationCompleted) return stats[2];
    return null;
  };

  const recommendation = getRecommendation();

  return (
    <div className="space-y-8 pb-12">
      {/* Official Status Indicator */}
      <div className="flex items-center gap-4 bg-navy text-white px-4 py-2.5 rounded-sm w-fit text-[10px] font-bold uppercase tracking-wider shadow-sm">
         <div className="flex items-center gap-2 pr-4 border-r border-white/20">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Secure Voter Session</span>
         </div>
         <span className="text-saffron">ID: {user.uid.substring(0, 8).toUpperCase()}</span>
      </div>

      {/* Hero Welcome Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-2 border-slate-200 pb-8 bg-white p-8 shadow-sm rounded-sm mb-8 mt-2">
        <div className="space-y-4">
          <div className="inline-block bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold uppercase tracking-widest text-slate-500 rounded-sm">Secure Portal</div>
          <h1 className="text-4xl md:text-5xl font-black text-navy tracking-tight uppercase leading-none">
            {t('dashboard')}
          </h1>
          <p className="text-slate-600 text-lg md:text-xl font-medium max-w-2xl mt-4 border-l-4 border-saffron pl-4">
            {t('welcome')}, <span className="text-navy font-bold">{user.displayName || 'Citizen'}</span>. Access your personalized electoral services and compliance tracking below.
          </p>
        </div>
        <div className="flex gap-4">
           <div className="bg-slate-50 border border-border-slate p-5 flex items-start gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] rounded-sm min-w-[320px]">
              <div className="bg-white p-2 rounded-full shadow-sm border border-slate-100">
                 <Bell className="w-5 h-5 text-saffron shrink-0" />
              </div>
              <div className="min-w-0">
                 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Official ECI Alerts <span className="w-2 h-2 inline-block bg-red-500 rounded-full animate-pulse ml-2"></span></p>
                 <p className="text-sm font-bold text-navy">Voter List Revision starts May 15, 2026. Ensure your documents are up to date.</p>
              </div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-2 md:px-0">
        {/* Dynamic Readiness Score Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-8 bg-white border border-border-slate shadow-sm rounded-sm p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 flex flex-col h-full">
            <div className="flex-1 bg-saffron" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-green-accent" />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
            <div className="space-y-2">
              <span className="inline-block bg-slate-100 text-navy text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-slate-200">
                Electoral Compliance Report
              </span>
              <h2 className="text-3xl font-bold text-navy uppercase tracking-tight">{t('integrityIndex')}</h2>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Integrated eligibility assessment based on biometric and demographic verification.</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-baseline gap-1">
                <span className="text-7xl font-bold text-navy tracking-tight leading-none">{score}</span>
                <span className="text-2xl font-bold text-navy/40">%</span>
              </div>
              <div className={cn(
                "mt-3 py-1.5 px-6 text-[11px] font-bold uppercase tracking-widest text-white rounded-sm",
                score === 100 ? "bg-green-accent" : score >= 50 ? "bg-[#B8860B]" : "bg-[#8B0000]"
              )}>
                {score === 100 ? t('pollReady') : score >= 50 ? t('inProgress') : t('actionRequired')}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="h-6 bg-slate-100 w-full rounded-sm overflow-hidden p-1 border border-slate-200">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-[1px] relative transition-colors",
                  score === 100 ? "bg-green-accent" : "bg-navy"
                )}
              >
                 <div className="absolute top-0 right-0 h-full w-4 bg-white/20" />
              </motion.div>
            </div>
            <div className="bg-slate-50 p-5 border border-slate-200 rounded-sm">
               <div className="flex gap-3 mb-4">
                  {stats.map((s, i) => (
                    <div key={i} className={cn(
                      "flex-1 h-2 rounded-full transition-all duration-700",
                      s.done ? "bg-green-accent" : "bg-slate-200"
                    )} />
                  ))}
               </div>
               <p className="text-xs font-bold text-navy uppercase tracking-wide">
                 {score < 100 ? `Mandatory Requirement: ${recommendation?.label || 'Incomplete'}` : "Requirement Status: All Criteria Satisfied"}
               </p>
            </div>
          </div>
        </motion.div>

        {/* Compliance Checklist */}
        <div className="lg:col-span-4 bg-navy text-white rounded-sm p-8 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold uppercase tracking-tight">{t('complianceSteps')}</h3>
              <div className="text-[10px] font-bold text-saffron uppercase">Verified Portal</div>
            </div>
            <div className="space-y-3">
              {stats.map((stat) => (
                <button 
                  key={stat.id} 
                  onClick={() => navigate(stat.path)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 transition-all rounded-sm border border-transparent",
                    stat.done ? "bg-white/10" : "bg-white text-navy hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <stat.icon className={cn("w-4 h-4", stat.done ? "text-saffron" : "text-navy")} />
                    <span className="text-[11px] font-bold uppercase tracking-wide">{stat.label}</span>
                  </div>
                  {stat.done ? (
                    <CheckCircle2 className="w-4 h-4 text-saffron shrink-0" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-navy shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => recommendation && navigate(recommendation.path)}
            disabled={!recommendation}
            className="w-full mt-10 bg-saffron hover:bg-[#E68A00] text-navy py-4 rounded-sm font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('resumeJourney')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Service Action Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         {/* Recommendation Engine */}
         <div 
          onClick={() => recommendation && navigate(recommendation.path)}
          className="md:col-span-7 geo-card border-none bg-saffron text-navy flex flex-col md:flex-row items-center gap-8 group cursor-pointer hover:bg-saffron/90 transition-colors"
         >
            <div className="w-20 h-20 bg-navy text-white grid place-items-center shrink-0 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
               <Target className="w-10 h-10" />
            </div>
            <div className="space-y-3">
               <div className="tag bg-white text-navy font-black">{t('aiRecommendation')}</div>
               <h3 className="text-xl font-black uppercase tracking-tighter leading-none">
                 {recommendation ? `${t('nextStep')}: ${recommendation.label}` : "Electoral Profile Finalized"}
               </h3>
               <p className="text-xs font-bold leading-relaxed opacity-70">
                 {recommendation 
                    ? `Based on your profile deficiency, you should complete the ${recommendation.label} module immediately.` 
                    : "You have completed all primary modules. Monitor the news feed for election alerts."}
               </p>
               {recommendation && <span className="text-[10px] font-black uppercase border-b-2 border-navy inline-block mt-2">Begin Entry &rarr;</span>}
            </div>
         </div>

         {/* Quick Booth Link */}
         <div 
           onClick={() => navigate('/constituency')}
           className="md:col-span-5 geo-card border-2 border-navy bg-white group cursor-pointer hover:bg-slate-50 transition-all flex flex-col justify-between"
         >
            <div className="flex justify-between items-start">
               <div className="w-10 h-10 bg-slate-100 text-navy grid place-items-center group-hover:bg-navy group-hover:text-white transition-colors">
                  <MapPin className="w-5 h-5" />
               </div>
               <ExternalLink className="w-4 h-4 text-slate-200 group-hover:text-navy" />
            </div>
            <div className="mt-8">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Administrative Service</p>
               <h3 className="text-2xl font-black text-navy uppercase italic">{t('boothLocator')}</h3>
               <p className="text-xs text-slate-500 font-medium mt-2">{t('locateByPincode')}</p>
            </div>
         </div>
      </div>

      {/* Secondary Service Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t-4 border-t-slate-100">
         {[
           { label: t('registration'), icon: FileText, path: '/registration' },
           { label: t('news'), icon: Bell, path: '/news' },
           { label: t('chat'), icon: MessageSquare, path: '/chat' },
           { label: t('quiz'), icon: Award, path: '/quiz' },
         ].map((service, i) => (
           <button 
            key={i} 
            onClick={() => navigate(service.path)}
            className="flex flex-col items-center gap-4 p-6 bg-white border border-slate-100 hover:border-navy hover:shadow-lg transition-all"
           >
              <div className="w-12 h-12 bg-slate-50 text-slate-400 flex items-center justify-center">
                 <service.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-navy">{service.label}</span>
           </button>
         ))}
      </div>
    </div>
  );
}
