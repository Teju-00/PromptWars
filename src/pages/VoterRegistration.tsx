import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { updateUserProgress, updateRegistrationData } from '@/services/firebaseService';
import { ClipboardList, User as UserIcon, MapPin, Camera, CheckCircle, Loader2, Calendar, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface Props {
  user: User;
}

import { useSettings } from '@/context/SettingsContext';

export default function VoterRegistration({ user }: Props) {
  const { t } = useSettings();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    fullName: user.displayName || '',
    dob: '',
    address: '',
    photoBase64: '',
    aadhaar: ''
  });

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = t('nameRequired');
      } else if (formData.fullName.length < 3) {
        newErrors.fullName = t('nameLength');
      } else if (!/^[a-zA-Z\s]*$/.test(formData.fullName)) {
        newErrors.fullName = t('nameAlphabet');
      }

      if (!formData.dob) {
        newErrors.dob = t('dobRequired');
      } else {
        const birthDate = new Date(formData.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 18) {
          newErrors.dob = t('ageLimit');
        }
      }
    }

    if (currentStep === 2) {
      if (!formData.address.trim()) {
        newErrors.address = t('addressRequired');
      } else if (formData.address.length < 10) {
        newErrors.address = t('addressComplete');
      }
      
      if (formData.aadhaar && !/^\d{12}$/.test(formData.aadhaar.replace(/\s/g, ''))) {
        newErrors.aadhaar = t('aadhaarDigits');
      }
    }

    if (currentStep === 3) {
      if (!formData.photoBase64) {
        newErrors.photo = t('photoMandatory');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateStep(step)) {
      setLoading(true);
      try {
        // Save progress to firebase
        await updateRegistrationData(user.uid, formData);
        setStep(s => s + 1);
      } catch (e) {
        console.error("Failed to save progress", e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrev = () => setStep(s => s - 1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setErrors({ photo: t('photoFormat') });
        return;
      }
      if (file.size > 2000000) {
        setErrors({ photo: t('photoSize') });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoBase64: reader.result as string }));
        setErrors(prev => ({ ...prev, photo: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setLoading(true);
    try {
      await updateRegistrationData(user.uid, formData);
      await updateUserProgress(user.uid, {
        registrationStatus: 'Submitted'
      });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-border-slate p-12 text-center space-y-10 shadow-lg rounded-sm animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-[#E6F4EA] text-[#137333] border border-[#A8DAB5] flex items-center justify-center mx-auto rounded-full shadow-inner">
          <CheckCircle className="w-12 h-12" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-navy uppercase tracking-tight">{t('formSubmitted')}</h2>
          <div className="inline-block bg-slate-50 border border-slate-200 px-6 py-2 rounded-full">
            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{t('applicationId')}: </span>
            <span className="text-navy font-bold text-[11px] tracking-widest">REG-{Math.random().toString(36).substring(7).toUpperCase()}</span>
          </div>
          <div className="h-px bg-slate-100 w-24 mx-auto mt-6" />
          <p className="text-slate-600 font-medium leading-relaxed max-w-sm mx-auto text-[15px]">
            {t('officialSubmissionNote')}
          </p>
        </div>
        <div className="pt-6">
          <button className="bg-navy text-white px-10 py-3.5 font-bold uppercase text-xs tracking-widest hover:bg-[#000066] transition-all rounded-sm shadow-md" onClick={() => setSubmitted(false)}>
            {t('startNewSimulation')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 mb-20">
      <header className="space-y-3 border-l-[10px] border-l-navy pl-8 py-4 bg-white shadow-sm border border-border-slate rounded-sm">
        <span className="inline-block bg-navy text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">Integrated Service</span>
        <h1 className="text-4xl font-bold text-navy uppercase tracking-tight">{t('voterRegistration')}</h1>
        <p className="text-slate-500 font-medium text-lg">{t('practiceFillingForm6')}</p>
      </header>

      <div className="bg-white border border-border-slate shadow-md p-10 md:p-14 space-y-12 relative rounded-sm">
        {/* Progress Header */}
        <div className="flex justify-between items-center mb-16 relative px-4 md:px-10">
          {[1, 2, 3].map((i) => (
             <div key={i} className="flex flex-col items-center gap-3 z-10 transition-all relative">
               <div className={cn(
                 "w-12 h-12 flex items-center justify-center font-bold border-2 transition-all rounded-sm shadow-sm",
                 step === i ? "bg-saffron text-navy border-saffron scale-110" : 
                 step > i ? "bg-navy text-white border-navy" : "bg-white text-slate-300 border-slate-200"
               )}>
                 {step > i ? <CheckCircle className="w-5 h-5" /> : i}
               </div>
               <span className={cn(
                 "absolute top-14 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap",
                 step >= i ? "text-navy" : "text-slate-300"
               )}>
                 {i === 1 ? t('personal') : i === 2 ? t('address') : t('photo')}
               </span>
             </div>
          ))}
          <div className="absolute top-6 left-12 right-12 h-1 bg-slate-100 rounded-full" />
          <motion.div 
            className="absolute top-6 left-12 h-1 bg-navy rounded-full shadow-[0_0_8px_rgba(0,0,128,0.3)]" 
            initial={{ width: "0%" }}
            animate={{ width: `${(step - 1) * 50}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-4 md:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('fullName')} (As per Aadhaar/EPIC)</label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#f4f7fa] border-r border-slate-200 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-navy" />
                  </div>
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    className={cn(
                      "w-full bg-[#f8f9fa] border py-3.5 pl-16 pr-6 font-semibold text-navy focus:border-navy focus:bg-white outline-none rounded-sm transition-all",
                      errors.fullName ? "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.2)]" : "border-slate-300"
                    )}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && <p className="text-red-600 text-[10px] font-bold uppercase tracking-tight mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.fullName}</p>}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('dob')}</label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#f4f7fa] border-r border-slate-200 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-navy" />
                  </div>
                  <input 
                    type="date" 
                    value={formData.dob}
                    onChange={e => setFormData({...formData, dob: e.target.value})}
                    className={cn(
                      "w-full bg-[#f8f9fa] border py-3.5 pl-16 pr-6 font-semibold text-navy focus:border-navy focus:bg-white outline-none rounded-sm transition-all",
                      errors.dob ? "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.2)]" : "border-slate-300"
                    )}
                  />
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">{t('ageLimit')}</p>
                  {errors.dob && <p className="text-red-600 text-[10px] font-bold uppercase tracking-tight mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.dob}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('residentialAddress')}</label>
                <div className="relative">
                  <div className="absolute left-0 top-0 w-12 h-14 bg-[#f4f7fa] border-r border-b border-slate-200 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-navy" />
                  </div>
                  <textarea 
                    rows={3}
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className={cn(
                      "w-full bg-[#f8f9fa] border py-4 pl-16 pr-6 font-semibold text-navy focus:border-navy focus:bg-white outline-none rounded-sm transition-all",
                      errors.address ? "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.2)]" : "border-slate-300"
                    )}
                    placeholder="House No, Street, Landmark, City, State, Pincode"
                  />
                  {errors.address && <p className="text-red-600 text-[10px] font-bold uppercase tracking-tight mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.address}</p>}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('aadhaarEpic')}</label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#f4f7fa] border-r border-slate-200 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-navy" />
                  </div>
                  <input 
                    type="text" 
                    value={formData.aadhaar}
                    onChange={e => setFormData({...formData, aadhaar: e.target.value})}
                    className={cn(
                      "w-full bg-[#f8f9fa] border py-3.5 pl-16 pr-6 font-semibold text-navy focus:border-navy focus:bg-white outline-none rounded-sm transition-all",
                      errors.aadhaar ? "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.2)]" : "border-slate-300"
                    )}
                    placeholder="XXXX XXXX XXXX"
                  />
                  {errors.aadhaar && <p className="text-red-600 text-[10px] font-bold uppercase tracking-tight mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.aadhaar}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 text-center">
              <div className={cn(
                "w-56 h-56 bg-[#f8f9fa] border-2 border-dashed mx-auto flex items-center justify-center relative overflow-hidden transition-all rounded-sm shadow-inner group",
                errors.photo ? "border-red-500 bg-red-50" : "border-slate-200 hover:border-navy"
              )}>
                {formData.photoBase64 ? (
                  <img src={formData.photoBase64} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Camera className="w-10 h-10 text-slate-300 group-hover:text-navy transition-colors" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click to upload photo</span>
                  </div>
                )}
                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/jpeg,image/png" />
              </div>
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t('passportSizePhoto')}</p>
                <div className="flex justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  <span className="bg-slate-50 px-2 py-1 border border-slate-100">JPEG/PNG Only</span>
                  <span className="bg-slate-50 px-2 py-1 border border-slate-100">Max Size: 2MB</span>
                </div>
                {errors.photo && <p className="text-red-600 text-[10px] font-bold uppercase tracking-tight mt-6 flex items-center justify-center gap-1"><AlertCircle className="w-3 h-3" />{errors.photo}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-6 mt-12 pt-10 border-t border-slate-100">
          {step > 1 && (
            <button onClick={handlePrev} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 py-4 font-bold uppercase text-xs tracking-widest transition-all rounded-sm" disabled={loading}>
              {t('back')}
            </button>
          )}
          {step < 3 ? (
            <button onClick={handleNext} className="flex-1 bg-navy text-white hover:bg-[#000066] py-4 font-bold uppercase text-xs tracking-widest transition-all shadow-md rounded-sm flex items-center justify-center gap-3 disabled:opacity-70" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('continue')}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-navy text-white hover:bg-[#000066] py-4 font-bold uppercase text-xs tracking-widest transition-all shadow-lg rounded-sm flex items-center justify-center gap-3">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('finalizeRegistration')}
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-[#FEF7E0] border border-[#FAD242] p-8 flex items-start gap-5 rounded-sm">
         <AlertCircle className="w-10 h-10 text-[#B06000]" />
         <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#B06000]">{t('privacyNote')}</p>
            <p className="text-sm text-[#734200] font-medium leading-relaxed italic">
              {t('educationalSimulatorNote')}
            </p>
         </div>
      </div>
    </div>
  );
}
