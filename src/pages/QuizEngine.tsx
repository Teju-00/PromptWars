import React, { useState, useEffect } from 'react';
import { auth } from '@/firebase';
import { fetchQuizQuestions, updateUserProgress } from '@/services/firebaseService';
import { INITIAL_QUIZ } from '@/constants/initialData';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, AlertCircle, Award, ArrowRight, RotateCcw, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useSettings } from '@/context/SettingsContext';

export default function QuizEngine() {
  const { language, t } = useSettings();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [categoryScores, setCategoryScores] = useState<Record<string, { correct: number, total: number }>>({});
  const [isFinished, setIsFinished] = useState(false);

  const shuffleArray = (array: any[]) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const prepareQuestions = (data: any[]) => {
    // Shuffle questions
    const shuffledQuestions = shuffleArray(data).slice(0, 5); // Take 5 random questions for a quick quiz
    
    // Shuffle options for each question
    return shuffledQuestions.map(q => {
      // Choose base text based on language
      const qText = language === 'hi' ? q.question_hi : language === 'te' ? q.question_te : q.question;
      const opts = language === 'hi' ? q.options_hi : language === 'te' ? q.options_te : q.options;
      const expl = language === 'hi' ? q.explanation_hi : language === 'te' ? q.explanation_te : q.explanation;

      const options = (opts || q.options).map((opt: string, idx: number) => ({ text: opt, originalIndex: idx }));
      const shuffledOptions = shuffleArray(options);
      const newCorrectIndex = shuffledOptions.findIndex(o => o.originalIndex === q.correctAnswerIndex);
      
      return {
        ...q,
        question: qText || q.question,
        options: shuffledOptions.map(o => o.text),
        correctAnswerIndex: newCorrectIndex,
        explanation: expl || q.explanation
      };
    });
  };

  useEffect(() => {
    const loadQuiz = async () => {
      const data = await fetchQuizQuestions();
      const baseQuestions = (data && data.length > 0) ? data : INITIAL_QUIZ;
      setQuestions(prepareQuestions(baseQuestions));
    };
    loadQuiz();
  }, [language]);

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    
    const currentQ = questions[currentIndex];
    const isCorrect = index === currentQ.correctAnswerIndex;
    
    if (isCorrect) {
      setScore(s => s + 1);
    }

    setCategoryScores(prev => {
      const cat = currentQ.category || 'General';
      const existing = prev[cat] || { correct: 0, total: 0 };
      return {
        ...prev,
        [cat]: {
          correct: existing.correct + (isCorrect ? 1 : 0),
          total: existing.total + 1
        }
      };
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      if (auth.currentUser) {
        updateUserProgress(auth.currentUser.uid, { 
          quizCompleted: true,
          lastQuizScore: score,
          lastQuizTotal: questions.length
        });
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setCategoryScores({});
    setIsFinished(false);
    setQuestions(prepareQuestions(INITIAL_QUIZ));
  };

  if (questions.length === 0) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-navy" />
    </div>
  );

  if (isFinished) {
    const percentage = (score / questions.length) * 100;
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-border-slate shadow-sm p-12 text-center space-y-10 max-w-2xl mx-auto rounded-sm"
      >
        <div className="w-20 h-20 bg-navy text-white flex items-center justify-center mx-auto rounded-sm shadow-md">
          <Award className="w-10 h-10" />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-navy uppercase tracking-tight">{t('evalReport')}</h2>
          <span className="inline-block bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">Assessment Finalized</span>
        </div>
        
        <div className="py-8 border-y border-slate-100">
            <div className="text-8xl font-bold text-navy tracking-tighter leading-none">{Math.round(percentage)}%</div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#6E6E6E] mt-4">{t('accuracyRate')}</div>
        </div>

        <div className="space-y-6">
           <h4 className="text-[11px] font-bold uppercase tracking-wider text-navy bg-slate-50 py-3 border-x-4 border-navy">{t('performanceBreakdown')}</h4>
           <div className="grid grid-cols-1 gap-4 text-left">
              {Object.entries(categoryScores).map(([cat, stats]) => (
                <div key={cat} className="flex justify-between items-center py-4 px-6 bg-[#f8f9fa] border border-slate-200 rounded-sm">
                   <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{cat}</span>
                   <div className="flex items-center gap-4">
                      <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-navy" style={{ width: `${(stats.correct / stats.total) * 100}%` }} />
                      </div>
                      <span className="text-sm font-bold text-navy min-w-[40px] text-right">{stats.correct}/{stats.total}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="pt-6">
           <button onClick={handleRestart} className="bg-navy text-white w-full py-4 font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-md hover:bg-[#000066] transition-all rounded-sm active:scale-[0.98]">
             <RotateCcw className="w-4 h-4" /> {t('startNewIntake')}
           </button>
        </div>
      </motion.div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between border-l-[10px] border-l-navy pl-8 py-4 bg-white shadow-sm border border-border-slate rounded-sm gap-8">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className={cn(
              "text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm border",
              q.difficulty === 'Easy' ? "bg-[#E6F4EA] text-[#137333] border-[#A8DAB5]" :
              q.difficulty === 'Medium' ? "bg-[#FEF7E0] text-[#B06000] border-[#FAD242]" : "bg-[#FCE8E6] text-[#C5221F] border-[#F1998E]"
            )}>
              {q.difficulty} Level
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#1A73E8] bg-[#E8F0FE] border border-[#AECBFA] px-2.5 py-1 rounded-sm">
              Domain: {q.category}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-navy uppercase tracking-tight">{t('voterIq')}</h1>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{t('question')} {currentIndex + 1} {t('of')} {questions.length}</p>
        </div>
        <div className="flex gap-2">
           {questions.map((_, i) => (
             <div 
               key={i} 
               className={cn(
                 "h-2 w-10 transition-all duration-300 rounded-sm border",
                 i < currentIndex ? "bg-navy border-navy" : i === currentIndex ? "bg-saffron border-saffron shadow-[0_0_8px_rgba(255,152,0,0.4)]" : "bg-white border-slate-200"
               )} 
             />
           ))}
        </div>
      </header>

      <div className="bg-white border border-border-slate shadow-sm p-10 md:p-14 space-y-12 relative rounded-sm">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
           <AlertCircle className="w-40 h-40 text-navy" />
        </div>
        
        <div className="relative">
          <h2 className="text-3xl font-bold text-navy leading-snug">{q.question}</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 relative">
          {q.options.map((option: string, i: number) => {
            const isCorrect = i === q.correctAnswerIndex;
            const isSelected = i === selectedOption;
            
            let btnClass = "border-slate-200 bg-white hover:border-navy hover:bg-[#F8F9FA]";
            let labelClass = "bg-white text-navy border-slate-200 group-hover:border-navy";

            if (isAnswered) {
              if (isCorrect) {
                 btnClass = "border-[#137333] bg-[#E6F4EA] text-[#137333] shadow-sm";
                 labelClass = "bg-[#137333] text-white border-[#137333]";
              }
              else if (isSelected) {
                 btnClass = "border-[#C5221F] bg-[#FCE8E6] text-[#C5221F] shadow-sm";
                 labelClass = "bg-[#C5221F] text-white border-[#C5221F]";
              }
              else {
                 btnClass = "border-slate-100 opacity-50 bg-[#FBFBFB]";
                 labelClass = "bg-slate-50 text-slate-300 border-slate-100";
              }
            }

            return (
              <button
                key={i}
                disabled={isAnswered}
                onClick={() => handleOptionClick(i)}
                className={cn(
                  "flex items-center justify-between p-6 border transition-all text-left group rounded-sm shadow-sm",
                  btnClass
                )}
              >
                <div className="flex items-center gap-5">
                   <div className={cn(
                     "w-8 h-8 flex items-center justify-center text-[12px] font-bold border transition-colors rounded-sm",
                     labelClass
                   )}>
                     {String.fromCharCode(65 + i)}
                   </div>
                   <span className="font-bold text-sm tracking-tight">{option}</span>
                </div>
                {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 shrink-0" />}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {isAnswered && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#202124] text-white p-10 rounded-sm shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -rotate-45 translate-x-16 -translate-y-16" />
              
              <div className="relative space-y-6">
                <div className="flex items-center gap-3 text-saffron font-bold uppercase text-[10px] tracking-widest border-b border-white/10 pb-4">
                  <Info className="w-4 h-4" />
                  Official Resolution Detail
                </div>
                <p className="text-slate-300 text-[15px] leading-relaxed font-medium">
                  {q.explanation}
                </p>
                
                <button 
                  onClick={handleNext} 
                  className="w-full bg-saffron text-navy py-4 mt-4 font-bold uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-white transition-all shadow-lg active:scale-[0.98]"
                >
                  {currentIndex === questions.length - 1 ? "Generate Evaluation Report" : "Proceed to Next Question"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
