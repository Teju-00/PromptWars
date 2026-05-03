import React, { useState, useRef, useEffect } from 'react';
import { getElectionAssistantResponse } from '@/services/geminiService';
import { Send, User as UserIcon, ShieldCheck, Sparkles, Languages } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

import { useSettings } from '@/context/SettingsContext';

export default function ChatAssistant() {
  const { language, t } = useSettings();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: language === 'hi' ? "नमस्ते! मैं आपका भारत चुनाव साथी हूँ। मैं आपको मतदान प्रक्रिया समझने, पात्रता सत्यापित करने या चुनावी शब्दों को समझाने में मदद कर सकता हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?" : language === 'te' ? "నమస్తే! నేను మీ భారత ఎన్నికల సహాయకుడిని. ఓటింగ్ ప్రక్రియను అర్థం చేసుకోవడంలో, అర్హతను ధృవీకరించడంలో లేదా ఎన్నికల నిబంధనలను వివరించడంలో నేను మీకు సహాయపడగలను. ఈరోజు నేనేమి సహాయం చేయగలను?" : "Namaste! I am your India Election Companion. I can help you understand the voting process, verify eligibility, or explain election terms. How can I assist you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const response = await getElectionAssistantResponse(input, language);
    const assistantMsg: Message = { role: 'assistant', content: response || (language === 'hi' ? "क्षमा करें, मैं इसे संसाधित नहीं कर सका।" : language === 'te' ? "క్షమించండి, నేను దానిని ప్రాసెస్ చేయలేకపోయాను." : "I'm sorry, I couldn't process that.") };
    
    setMessages(prev => [...prev, assistantMsg]);
    setIsTyping(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 mb-20">
      <header className="space-y-3 border-l-[10px] border-l-navy pl-8 py-4 bg-white shadow-sm border border-border-slate rounded-sm">
        <span className="inline-block bg-navy text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">Virtual Assistance</span>
        <h1 className="text-4xl font-bold text-navy uppercase tracking-tight">Electoral Knowledge AI</h1>
        <p className="text-slate-500 font-medium text-lg">Instant technical support for voter eligibility, registration processes, and constitutional protocols.</p>
      </header>

      <div className="flex flex-col h-[700px] bg-white border border-border-slate shadow-xl relative rounded-sm overflow-hidden">
        {/* Chat Header */}
        <div className="p-6 bg-[#f4f7fa] border-b border-slate-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-navy text-white flex items-center justify-center rounded-sm shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy uppercase tracking-tight">Official Election Companion</h2>
              <p className="text-[10px] text-green-600 flex items-center gap-1.5 font-bold uppercase tracking-widest">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live Verification Server Active
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
             <div className="px-3 py-1 bg-white border border-slate-200 text-[9px] font-bold uppercase tracking-widest text-slate-500 rounded-sm">
               Secure Session
             </div>
             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center opacity-50">
               <Languages className="w-4 h-4 text-navy" />
             </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-[#f8f9fa]/50" ref={scrollRef}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-start gap-5 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-10 h-10 flex items-center justify-center shrink-0 border-2 rounded-sm shadow-sm transition-all",
                msg.role === 'user' ? "bg-navy text-white border-navy" : "bg-white text-navy border-slate-200"
              )}>
                {msg.role === 'user' ? <UserIcon className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div className={cn(
                "p-8 text-[15px] leading-relaxed border relative shadow-md transition-all rounded-sm",
                msg.role === 'user' 
                  ? "bg-navy text-white border-navy font-medium" 
                  : "bg-white text-navy border-slate-200 font-medium"
              )}>
                {/* Bubble Tip */}
                <div className={cn(
                  "absolute top-4 w-3 h-3 rotate-45 border transition-all",
                  msg.role === 'user' 
                    ? "bg-navy border-navy -right-1.5" 
                    : "bg-white border-l border-b border-l-slate-200 border-b-slate-200 -left-1.5"
                )} />
                <div className="markdown-body prose prose-sm prose-slate max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] ml-14">
              <span>{t('aiResponding')}</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-navy rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-navy rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-navy rounded-full animate-bounce [animation-delay:0.4s]" />
              </span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-8 bg-white border-t-2 border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <div className="relative flex shadow-md rounded-sm overflow-hidden">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('askAnything')}
              className="flex-1 bg-[#f8f9fa] border-none py-5 px-8 focus:ring-2 focus:ring-inset focus:ring-navy transition-all font-semibold text-navy placeholder:text-slate-400 placeholder:font-normal"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-navy text-white px-10 border-none hover:bg-[#000066] disabled:opacity-50 transition-all font-bold uppercase tracking-widest text-xs flex items-center gap-3 shrink-0"
            >
              <Send className="w-4 h-4" />
              {t('submit')}
            </button>
          </div>
          <div className="flex items-center justify-center gap-10 mt-8">
             <div className="h-px bg-slate-100 flex-1" />
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#f4a261] rounded-full" />
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                  Encrypted Electoral Knowledge Engine • ECI Synchronized
                </p>
             </div>
             <div className="h-px bg-slate-100 flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
