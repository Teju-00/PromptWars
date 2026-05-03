import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { fetchUserDocuments, addUserDocument, deleteUserDocument, updateUserProgress } from '@/services/firebaseService';
import { ShieldCheck, FileText, Upload, CheckCircle, XCircle, Clock, Loader2, Trash2, ChevronDown, Info, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface Props {
  user: User;
}

interface Doc {
  id: string;
  type: string;
  url: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  timestamp: string;
}

import { useSettings, translations } from '@/context/SettingsContext';

export default function DocumentCenter({ user }: Props) {
  const { t, language } = useSettings();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState(t('aadhaarCard'));
  const [error, setError] = useState<string | null>(null);

  const docConfig: Record<string, { desc: string, required: string }> = {
    [t('aadhaarCard')]: { desc: t('aadhaarDesc'), required: t('aadhaarReq') },
    [t('panCard')]: { desc: t('panDesc'), required: t('panReq') },
    [t('passport')]: { desc: t('passportDesc'), required: t('passportReq') },
    [t('drivingLicense')]: { desc: t('driverDesc'), required: t('driverReq') },
    [t('birthCertificate')]: { desc: t('birthDesc'), required: t('birthReq') },
    [t('utilityBill')]: { desc: t('utilityDesc'), required: t('utilityReq') }
  };

  const docTypes = Object.keys(docConfig);

  useEffect(() => {
    // Re-sync selectedType if language changes and it matches any of the old translations
    // For simplicity, we just reset it to Aadhaar Card translated
    setSelectedType(t('aadhaarCard'));
  }, [t]);

  useEffect(() => {
    const loadDocs = async () => {
      const data = await fetchUserDocuments(user.uid);
      if (data) {
        setDocs(data as Doc[]);
      }
      setLoading(false);
    };
    loadDocs();
  }, [user]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (file) {
      // Validate File Type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError(t('invalidFile'));
        return;
      }

      // Validate File Size (2MB)
      if (file.size > 2000000) {
        setError(t('fileTooLarge'));
        return;
      }

      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        // Simulated AI Rejection Logic (for educational purposes)
        const isLowQuality = Math.random() > 0.9; // 10% chance to simulate rejection
        
        const docData = {
          type: selectedType,
          url: reader.result as string,
          status: isLowQuality ? 'Rejected' : 'Pending',
          rejectionReason: isLowQuality ? (language === 'en' ? 'Image quality too low or document edges not visible.' : t('rejected')) : null,
          timestamp: new Date().toISOString()
        };
        
        await addUserDocument(user.uid, docData);
        await updateUserProgress(user.uid, { documentsUploaded: true });
        const data = await fetchUserDocuments(user.uid);
        if (data) setDocs(data as Doc[]);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeDoc = async (id: string) => {
    await deleteUserDocument(user.uid, id);
    setDocs(docs.filter(d => d.id !== id));
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-navy" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 mb-20">
      <header className="space-y-3 border-l-[10px] border-l-navy pl-8 py-4 bg-white shadow-sm border border-border-slate rounded-sm">
        <span className="inline-block bg-navy text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">Secure Repository</span>
        <h1 className="text-4xl font-bold text-navy uppercase tracking-tight">{t('documentCenter')}</h1>
        <p className="text-slate-500 font-medium text-lg">{t('identifyVerifyDocs')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Upload Section */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-border-slate shadow-md p-8 space-y-8 rounded-sm">
            <div className="space-y-2">
               <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('selectCategory')}</span>
               <div className="relative">
                  <select 
                    value={selectedType}
                    onChange={e => { setSelectedType(e.target.value); setError(null); }}
                    className="w-full bg-[#f8f9fa] border border-slate-300 py-3.5 px-4 text-[13px] font-bold text-navy outline-none rounded-sm appearance-none cursor-pointer focus:border-navy transition-all"
                  >
                    {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
               </div>
            </div>

            <div className="bg-[#FEF7E0] border border-[#FAD242] p-6 space-y-3 rounded-sm">
              <div className="flex items-center gap-2 text-[#B06000]">
                <Info className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{t('confirmEntry')}:</span>
              </div>
              <p className="text-[13px] text-navy font-bold leading-tight">{docConfig[selectedType]?.desc}</p>
              <p className="text-[11px] text-[#734200] font-medium leading-relaxed italic">{docConfig[selectedType]?.required}</p>
            </div>

            <div className="relative group">
              <label className={cn(
                "flex flex-col items-center justify-center w-full h-52 border-2 border-dashed bg-[#f8f9fa] hover:bg-white cursor-pointer transition-all rounded-sm shadow-inner",
                error ? "border-red-500 bg-red-50" : "border-slate-300 hover:border-navy"
              )}>
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-navy" />
                    <span className="text-[11px] font-bold text-navy uppercase tracking-widest">Processing Data...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-slate-200 mb-4 group-hover:scale-110 transition-transform shadow-sm">
                      <Upload className={cn("w-7 h-7 transition-colors", error ? "text-red-400" : "text-navy")} />
                    </div>
                    <span className={cn("text-[10px] font-bold uppercase tracking-[0.15em] transition-colors", error ? "text-red-500 font-black" : "text-slate-500 group-hover:text-navy")}>
                      {error ? t('tryAgain') : t('uploadFile')}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium mt-2 uppercase tracking-tight">PDF, JPEG or PNG (MAX 2MB)</span>
                  </>
                )}
                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleUpload} disabled={uploading} />
              </label>
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-600 text-[10px] font-bold uppercase tracking-tight mt-3 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </motion.p>
              )}
            </div>
          </div>
          
          <div className="bg-[#E8F0FE] border border-[#AECBFA] p-6 rounded-sm space-y-3">
             <div className="flex items-center gap-3">
               <ShieldCheck className="w-5 h-5 text-[#1A73E8]" />
               <span className="text-[11px] font-bold uppercase tracking-wider text-[#185ABC]">{t('technicalAssurance')}</span>
             </div>
             <p className="text-[12px] text-[#1A62D6] font-medium leading-relaxed">
               {t('vaultNote')}
             </p>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between bg-white border border-border-slate px-6 py-4 rounded-sm shadow-sm">
            <div className="flex items-center gap-4">
               <FileText className="w-5 h-5 text-navy" />
               <div>
                  <h3 className="text-sm font-bold text-navy uppercase tracking-tight">{t('inventory')}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{docs.length} Official Records Synchronized</p>
               </div>
            </div>
            <span className="bg-navy text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm">{t('simulationDataOnly')}</span>
          </div>

          {docs.length === 0 ? (
            <div className="bg-[#f8f9fa] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center py-32 text-center rounded-sm">
              <div className="w-20 h-20 bg-white border border-slate-100 rounded-full flex items-center justify-center mb-6 shadow-sm opacity-50">
                 <FileText className="w-10 h-10 text-slate-200" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{t('noDocsUploaded')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {docs.map((doc: any) => (
                  <motion.div 
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border border-border-slate shadow-md flex flex-col overflow-hidden group hover:shadow-lg transition-shadow border-t-8 border-t-navy rounded-sm"
                  >
                    <div className="p-6 space-y-5">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-[11px] font-bold text-navy uppercase tracking-tight">{doc.type}</p>
                            <div className={cn(
                              "flex items-center gap-2 px-3 py-1 w-fit text-[9px] font-bold uppercase tracking-widest rounded-full shadow-inner",
                              doc.status === 'Pending' ? "bg-amber-50 text-amber-700 border border-amber-200" : 
                              doc.status === 'Verified' ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                            )}>
                                {doc.status === 'Pending' ? <Clock className="w-3 h-3" /> : 
                                doc.status === 'Verified' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {doc.status === 'Pending' ? t('pending') : doc.status === 'Verified' ? t('verified') : t('rejected')}
                            </div>
                        </div>
                        <button onClick={() => removeDoc(doc.id)} className="p-2.5 hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all border border-transparent hover:border-red-100 rounded-sm">
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {doc.rejectionReason && (
                        <div className="bg-red-50 p-4 border border-red-100 rounded-sm">
                          <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight leading-normal flex items-start gap-2">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{t('reason')}: {doc.rejectionReason}</span>
                          </p>
                        </div>
                      )}

                      <div className="w-full h-40 bg-[#f8f9fa] border border-slate-200 overflow-hidden relative shadow-inner rounded-sm group/img">
                         <img src={doc.url} className="w-full h-full object-cover grayscale opacity-80 group-hover/img:grayscale-0 group-hover/img:opacity-100 transition-all duration-700 scale-105 group-hover/img:scale-100" alt="Preview" />
                         <div className="absolute inset-0 bg-navy/10 group-hover/img:bg-transparent transition-colors duration-500" />
                         <div className="absolute inset-0 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center bg-navy/40">
                             <div className="bg-white text-navy px-4 py-2 text-[9px] font-bold uppercase tracking-widest shadow-xl rounded-sm">
                                View Official Copy
                             </div>
                         </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                        <p className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-tighter">REF-ID: {doc.id.slice(-12).toUpperCase()}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{new Date(doc.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
