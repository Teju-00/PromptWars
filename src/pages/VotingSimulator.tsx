import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '@/firebase';
import { updateUserProgress } from '@/services/firebaseService';
import { 
  Users, 
  Fingerprint, 
  PenTool, 
  Layout, 
  CheckCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Info,
  Award,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SimStep = 'intro' | 'identity' | 'register' | 'inking' | 'booth_entry' | 'evm' | 'vvpat' | 'finished';

export default function VotingSimulator() {
  const [step, setStep] = useState<SimStep>('intro');
  const [votedParty, setVotedParty] = useState<any>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const steps = [
    { id: 'intro', label: 'Welcome', icon: Clock, desc: 'Your journey starts at the polling station boundary.' },
    { id: 'identity', label: 'ID Check', icon: Fingerprint, desc: 'Verification of your identity by the First Polling Officer.' },
    { id: 'register', label: 'Signing', icon: PenTool, desc: 'Signing the Register of Voters (Form 17A).' },
    { id: 'inking', label: 'Inking', icon: Award, desc: 'Marking your index finger with indelible ink.' },
    { id: 'booth_entry', label: 'The Booth', icon: ShieldCheck, desc: 'Entering the secret voting compartment.' },
    { id: 'evm', label: 'The Vote', icon: Layout, desc: 'Casting your ballot using the Ballot Unit.' },
    { id: 'vvpat', label: 'Verification', icon: ShieldCheck, desc: 'Checking your vote on the VVPAT display.' },
    { id: 'finished', label: 'Success', icon: CheckCircle, desc: 'Polling process complete.' },
  ];

  const parties = [
    { id: 1, name: 'Progressive Visionive Party', symbol: '❂', color: 'bg-orange-500' },
    { id: 2, name: 'National Service League', symbol: '✦', color: 'bg-blue-600' },
    { id: 3, name: 'People First Congress', symbol: '✋', color: 'bg-emerald-600' },
    { id: 4, name: 'Democratic Front', symbol: '⚒', color: 'bg-red-500' },
    { id: 5, name: 'Regional Solidarity', symbol: '☂', color: 'bg-amber-500' },
    { id: 6, name: 'NOTA', nameFull: 'None of the Above', symbol: '✖', color: 'bg-zinc-400', isNota: true },
  ];

  const educativeTips = {
    'evm': 'The Ballot Unit allows you to press only one button. Once pressed, the unit locks to prevent multiple voting.',
    'vvpat': 'The VVPAT (Voter Verified Paper Audit Trail) prints a slip showing the serial number, name, and symbol of the candidate. It remains visible for 7 seconds.',
    'nota': 'NOTA gives voters the option to express that they do not support any of the candidates while participating in the democratic process.'
  };

  const nextStep = () => {
    const currentIndex = steps.findIndex(s => s.id === step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1].id as SimStep);
    }
  };

  useEffect(() => {
    if (step === 'vvpat') {
      const timer = setTimeout(() => {
        nextStep();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'finished' && auth.currentUser) {
      updateUserProgress(auth.currentUser.uid, { simulationCompleted: true });
    }
  }, [step]);

  const reset = () => {
    setStep('intro');
    setVotedParty(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-8 gap-8">
        <div className="space-y-3">
          <span className="inline-block bg-navy text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">Procedural Awareness</span>
          <h1 className="text-4xl font-bold text-navy uppercase tracking-tight leading-none">Poll Process Simulator</h1>
          <p className="text-slate-500 font-medium text-lg">Experience the step-by-step reality of a polling station interaction.</p>
        </div>
        
        {/* Step Progress */}
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-1.5 h-3 items-center">
            {steps.map((s, i) => {
              const index = steps.findIndex(st => st.id === step);
              return (
                <div 
                  key={s.id} 
                  className={cn(
                    "w-8 h-2.5 transition-all duration-500 rounded-sm border",
                    i <= index ? "bg-navy border-navy shadow-sm" : "bg-white border-slate-200"
                  )}
                />
              );
            })}
          </div>
          <span className="text-[10px] font-bold text-navy uppercase tracking-widest">
            Phase {steps.findIndex(s => s.id === step) + 1} of {steps.length}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-border-slate shadow-sm p-8 space-y-6 rounded-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-navy" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#6E6E6E] flex items-center gap-2">
              <Info className="w-4 h-4" /> Current Phase Overview
            </h3>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold uppercase text-navy">
                {steps.find(s => s.id === step)!.label}
              </h2>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {steps.find(s => s.id === step)!.desc}
              </p>
            </div>
            
            <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-navy border border-slate-100">
                {React.createElement(steps.find(s => s.id === step)!.icon, { className: "w-6 h-6" })}
              </div>
              <span className="text-[10px] font-bold text-navy uppercase tracking-widest">Verification Active</span>
            </div>
          </div>

          <div className="bg-[#E6F4EA] border border-[#A8DAB5] p-6 space-y-3 rounded-sm">
             <h4 className="text-[10px] font-bold uppercase text-[#137333] tracking-widest flex items-center gap-2">
               Official Voter Insight
               <ShieldCheck className="w-3.5 h-3.5" />
             </h4>
             <p className="text-xs text-[#0D652D] font-medium leading-relaxed">
                {step === 'evm' ? educativeTips.evm : 
                 step === 'vvpat' ? educativeTips.vvpat :
                 "The simulation strictly follows Election Commission of India (ECI) booth protocols to ensure voter literacy."}
             </p>
          </div>
        </div>

        {/* Interaction Stage */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-border-slate shadow-sm rounded-sm min-h-[550px] flex flex-col items-center justify-center relative overflow-hidden p-8 md:p-12">
             {/* Background branding - subtle */}
             <div className="absolute top-4 right-4 opacity-5 rotate-12">
                <Users className="w-40 h-40" />
             </div>

             <AnimatePresence mode="wait">
               {step === 'intro' && (
                 <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="text-center space-y-8 z-10 px-8">
                    <div className="w-24 h-24 bg-saffron text-navy grid place-items-center mx-auto shadow-2xl">
                       <Layout className="w-12 h-12" />
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-3xl font-black text-navy uppercase leading-[0.9]">Ready to <br/>Poll?</h2>
                      <p className="text-slate-500 font-medium max-w-sm">This simulation will take approximately 2 minutes. You will experience the technical steps of casting a digital ballot.</p>
                    </div>
                    <button onClick={nextStep} className="btn-primary w-full py-5 text-sm group">
                       Initialize Process <ArrowRight className="inline ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                 </motion.div>
               )}

               {step === 'identity' && (
                 <motion.div key="id" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="text-center space-y-8 z-10 p-8 w-full max-w-md">
                   <div className="w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 group hover:border-navy transition-colors cursor-pointer">
                      <ShieldCheck className="w-10 h-10 text-slate-300 group-hover:text-navy" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scan EPIC / Aadhaar Card</span>
                   </div>
                   <div className="geo-card bg-amber-50 border-amber-200 text-left">
                      <p className="text-[9px] font-black text-amber-700 uppercase mb-2">Protocol Note:</p>
                      <p className="text-xs text-amber-900 font-bold leading-relaxed">The First Polling Officer checks your name in the Electoral Roll and your identity document.</p>
                   </div>
                   <button onClick={nextStep} className="btn-primary w-full py-4 uppercase">Verify & Proceed</button>
                 </motion.div>
               )}

               {step === 'register' && (
                 <motion.div key="reg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 w-full max-w-md p-8">
                   <h3 className="text-xs font-black uppercase text-slate-400 mb-6 text-center">Form 17A: Register of Voters</h3>
                   <div className="border border-slate-200 p-8 space-y-4 bg-slate-50">
                      <div className="h-4 bg-slate-200 w-3/4 rounded-full" />
                      <div className="h-4 bg-slate-200 w-1/2 rounded-full" />
                      <div className="h-px bg-slate-200 w-full mt-8" />
                      <div className="flex justify-between items-end">
                         <span className="text-[8px] font-mono text-slate-400 uppercase tracking-tighter">Voter Sign / Thumb:</span>
                         <button onClick={nextStep} className="font-display italic text-2xl text-navy hover:text-saffron transition-colors">Sign digitally here...</button>
                      </div>
                   </div>
                 </motion.div>
               )}

               {step === 'inking' && (
                 <motion.div key="ink" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8">
                   <div className="relative">
                      <div className="w-32 h-32 bg-slate-100 rounded-full mx-auto flex items-center justify-center overflow-hidden">
                         <PenTool className="w-12 h-12 text-navy animate-bounce" />
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-4 border-navy rounded-full border-t-transparent animate-spin duration-[3000ms]" />
                   </div>
                   <h3 className="text-xl font-black text-navy uppercase">Applying Indelible Ink</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-xs mx-auto">The mark of pride and integrity. Applied to the left index finger.</p>
                   <button onClick={nextStep} className="btn-primary" >Confirm Mark</button>
                 </motion.div>
               )}

               {step === 'booth_entry' && (
                 <motion.div key="entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8">
                   <div className="w-32 h-40 bg-navy mx-auto relative flex items-end p-4 border-x-4 border-t-4 border-slate-700">
                      <div className="w-2 h-2 rounded-full bg-saffron absolute top-4 left-1/2 -translate-x-1/2 animate-ping" />
                      <div className="w-full h-1 bg-saffron" />
                   </div>
                   <div className="space-y-4">
                     <h3 className="text-2xl font-black text-navy uppercase leading-tight">Secret <br/>Compartment</h3>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-widest underline decoration-saffron decoration-2">Privacy is your Right</p>
                   </div>
                   <button onClick={nextStep} className="btn-primary w-full py-4">Enter Voting Booth</button>
                 </motion.div>
               )}

               {step === 'evm' && (
                 <motion.div key="evm" initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md p-4 space-y-4 bg-slate-200 border-x border-t border-slate-300 rounded-t-xl shadow-2xl">
                    <div className="bg-slate-300 p-2 rounded-lg flex justify-between items-center">
                       <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
                          <div className="w-12 h-2 bg-slate-400 rounded-full" />
                       </div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">ECI Ballot Unit</p>
                    </div>

                    <div className="bg-white border border-slate-300 divide-y divide-slate-100 max-h-[380px] overflow-y-auto custom-scrollbar">
                       {parties.map((party) => (
                         <div key={party.id} className="grid grid-cols-12 items-center p-3 gap-2 group">
                            <div className="col-span-1 text-[10px] font-black text-slate-300">{party.id}</div>
                            <div className="col-span-6 flex flex-col">
                               <span className="text-[10px] font-black uppercase text-navy leading-tight">{party.name}</span>
                               <span className="text-[8px] font-bold text-slate-400 uppercase">{party.isNota ? party.nameFull : "Candidate Representative"}</span>
                            </div>
                            <div className="col-span-2 text-2xl text-center grayscale group-hover:grayscale-0 transition-all">{party.symbol}</div>
                            <div className="col-span-3 flex justify-end">
                               <button 
                                 onClick={() => {
                                   setVotedParty(party);
                                   nextStep();
                                 }}
                                 className="w-12 h-8 bg-blue-600 rounded-sm shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 transition-all border border-blue-800 flex items-center justify-center"
                               >
                                  <div className="w-6 h-6 rounded-full bg-white/10" />
                               </button>
                            </div>
                         </div>
                       ))}
                    </div>
                    
                    <div className="flex justify-center pb-2">
                      <div className="w-12 h-2 rounded-full bg-slate-300" />
                    </div>
                 </motion.div>
               )}

               {step === 'vvpat' && (
                 <motion.div key="vvpat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-10 py-10">
                    <div className="w-64 h-56 bg-slate-800 p-4 mx-auto relative rounded-lg shadow-2xl border-b-[12px] border-slate-900">
                       <div className="w-full h-full bg-zinc-900 border-4 border-slate-700 p-6 flex flex-col items-center justify-center space-y-4">
                          {/* Inner Screen */}
                          <motion.div 
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white w-full h-full p-4 flex flex-col items-center justify-center space-y-2 border-b-8 border-b-slate-100 shadow-inner"
                          >
                             <div className="flex justify-between w-full mb-2 border-b border-slate-100 pb-1">
                                <span className="text-[8px] font-black text-slate-400">SL: {votedParty?.id}</span>
                                <span className="text-[8px] font-black text-slate-400 uppercase">Verification Slip</span>
                             </div>
                             <div className="text-4xl">{votedParty?.symbol}</div>
                             <p className="text-sm font-black text-navy uppercase tracking-widest">{votedParty?.name}</p>
                             <div className="tag bg-green-100 text-green-700 text-[8px]">Processed</div>
                          </motion.div>
                       </div>
                       
                       {/* Light */}
                       <div className="absolute top-2 right-4 w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-black text-navy uppercase flex items-center justify-center gap-2">
                         <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" /> VVPAT Display active
                      </p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic">Verification ends in 7 seconds...</p>
                    </div>
                 </motion.div>
               )}

               {step === 'finished' && (
                 <motion.div key="end" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8 z-10 p-4">
                    <div className="w-24 h-24 bg-navy text-saffron grid place-items-center mx-auto rounded-full shadow-2xl mb-6">
                       <Award className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-4xl font-black text-navy uppercase tracking-tighter italic leading-none">I VOTED!</h2>
                      <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Electoral Simulation Certificate</p>
                    </div>
                    <div className="geo-card border-slate-200 bg-slate-50 p-6 space-y-4">
                       <p className="text-sm text-navy font-bold">This certifies that you have successfully simulated the technical process of voting in the Indian Election system.</p>
                       <div className="flex items-center gap-2 justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-[10px] font-black uppercase text-slate-600">Verification complete</span>
                       </div>
                    </div>
                    <button onClick={reset} className="btn-secondary w-full py-4 tracking-tighter">Re-Enter Station Profile</button>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>
      </div>
      
      <div className="geo-card border-none bg-navy text-white p-8 flex items-center justify-between overflow-hidden">
         <div className="space-y-2 relative z-10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-saffron">Knowledge Check</h3>
            <p className="text-lg font-black uppercase italic leading-tight">VVPAT slips are not <br/>handed to voters.</p>
            <p className="text-xs text-slate-400 font-medium">Slips fall into a sealed drop box automatically.</p>
         </div>
         <History className="w-32 h-32 text-white/5 absolute -right-8 -bottom-8 rotate-12" />
      </div>
    </div>
  );
}

function History({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}
