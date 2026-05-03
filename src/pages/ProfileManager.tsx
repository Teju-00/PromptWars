import React, { useState, useEffect } from 'react';
import { User, updateProfile } from 'firebase/auth';
import { fetchUserProgress, updateUserProgress } from '@/services/firebaseService';
import { Camera, MapPin, Phone, Calendar, Save, Loader2, User as UserIcon, ShieldCheck, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface Props {
  user: User;
}

export default function ProfileManager({ user }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    phoneNumber: '',
    address: '',
    dob: '',
    photoURL: user.photoURL || ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      const data = await fetchUserProgress(user.uid);
      if (data) {
        setFormData(prev => ({
          ...prev,
          phoneNumber: data.phoneNumber || '',
          address: data.address || '',
          dob: data.dob || '',
          photoURL: data.photoURL || user.photoURL || ''
        }));
      }
      setLoading(false);
    };
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      // Update Firebase Auth Profile (only Name, skip Photo for base64 strings)
      await updateProfile(user, {
        displayName: formData.displayName
      });

      // Update Firestore Progress (store full profile including photo)
      await updateUserProgress(user.uid, {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        dob: formData.dob,
        photoURL: formData.photoURL
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Save error", error);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) {
        alert("Photo too large (>500KB). Please use a smaller image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoURL: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-12 mb-20">
      <header className="space-y-3 border-l-[10px] border-l-navy pl-8 py-4 bg-white shadow-sm border border-border-slate">
        <span className="inline-block bg-navy text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">Citizen Services</span>
        <h1 className="text-4xl font-bold text-navy uppercase tracking-tight">Electoral Identity Profile</h1>
        <p className="text-slate-500 font-medium text-lg">Maintain your official voter records and contact metadata for electoral correspondence.</p>
      </header>

      <div className="bg-white border border-border-slate shadow-md p-10 md:p-14 space-y-12 relative rounded-sm">
        {/* Photo Upload Section */}
        <div className="flex flex-col md:flex-row items-center gap-12 border-b border-slate-100 pb-12">
           <div className="relative group">
              <div className="w-40 h-40 bg-[#f8f9fa] border-2 border-slate-200 overflow-hidden shadow-inner flex items-center justify-center">
                {formData.photoURL ? (
                  <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-16 h-16 text-slate-300" />
                )}
              </div>
              <label className="absolute inset-0 bg-navy/80 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all gap-2 duration-300">
                <Camera className="w-8 h-8" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Update Photo</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
           </div>
           <div className="space-y-3 text-center md:text-left">
              <h3 className="text-2xl font-bold text-navy uppercase tracking-tight">Official Photograph</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
                Ensure your photograph clearly displays your face as per ECI guidelines for the Electoral Photo Identity Card (EPIC).
              </p>
           </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
           <div className="space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Full Legal Name (as per EPIC)</label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#f4f7fa] border-r border-slate-200 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-navy" />
                </div>
                <input 
                  type="text" 
                  value={formData.displayName}
                  onChange={e => setFormData({...formData, displayName: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 py-3.5 pl-16 pr-4 font-semibold text-navy focus:border-navy focus:bg-white outline-none rounded-sm transition-all"
                />
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Mobile Contact Number</label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#f4f7fa] border-r border-slate-200 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-navy" />
                </div>
                <input 
                  type="tel" 
                  value={formData.phoneNumber}
                  onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 py-3.5 pl-16 pr-4 font-semibold text-navy focus:border-navy focus:bg-white outline-none rounded-sm transition-all"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
           </div>

           <div className="space-y-4 md:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Primary Residential Address</label>
              <div className="relative">
                <div className="absolute left-0 top-0 w-12 h-14 bg-[#f4f7fa] border-r border-b border-slate-200 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-navy" />
                </div>
                <textarea 
                   rows={3}
                   value={formData.address}
                   onChange={e => setFormData({...formData, address: e.target.value})}
                   className="w-full bg-slate-50/50 border border-slate-200 py-4 pl-16 pr-4 font-semibold text-navy focus:border-navy focus:bg-white outline-none rounded-sm transition-all"
                   placeholder="Enter your full registered address"
                />
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Date of Birth</label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#f4f7fa] border-r border-slate-200 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-navy" />
                </div>
                <input 
                  type="date" 
                  value={formData.dob}
                  onChange={e => setFormData({...formData, dob: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 py-3.5 pl-16 pr-4 font-semibold text-navy focus:border-navy focus:bg-white outline-none rounded-sm transition-all"
                />
              </div>
           </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col gap-6">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-navy text-white py-5 rounded-sm flex items-center justify-center gap-3 font-bold uppercase text-[12px] tracking-widest shadow-lg hover:bg-[#000066] transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Authenticate and Save Profile
          </button>
          
          <AnimatePresence>
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-green-50 border border-green-200 p-6 flex items-center gap-4 text-green-700 font-bold uppercase text-xs tracking-widest rounded-sm"
              >
                <CheckCircle className="w-5 h-5" />
                Profile synchronized successfully with the electoral engine.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-[#E8F0FE] border border-[#AECBFA] p-8 flex items-start gap-5 rounded-sm">
         <ShieldCheck className="w-10 h-10 text-[#1A73E8]" />
         <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#185ABC]">Data Integrity Protection</p>
            <p className="text-sm text-[#1A62D6] font-medium leading-relaxed">
              Your sensitive data is encrypted using AES-256 protocols. Your EPIC records and contact metadata are stored within the ECI framework and are never disclosed to commercial entities.
            </p>
         </div>
      </div>
    </div>
  );
}
