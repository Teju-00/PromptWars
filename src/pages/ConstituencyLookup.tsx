import React, { useState } from 'react';
import { Search, MapPin, Loader2, Info, Phone, Navigation, Landmark, Layers, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export default function ConstituencyLookup() {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async () => {
    if (!pincode || pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/lookup-constituency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode })
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to fetch constituency data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
      <header className="space-y-3 border-l-[10px] border-l-navy pl-8 py-4 bg-white shadow-sm border border-border-slate">
        <span className="inline-block bg-navy text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">Administrative Service</span>
        <h1 className="text-4xl font-bold text-navy uppercase tracking-tight">Voter Booth Locator</h1>
        <p className="text-slate-500 font-medium text-lg">Identify your designated polling station and parliamentary assembly details using your Area PINCODE.</p>
      </header>

      <div className="bg-white border border-border-slate shadow-sm p-10 space-y-10 relative">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Landmark className="w-24 h-24 text-navy" />
        </div>

        <div className="space-y-6 max-w-xl relative">
           <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Target Area Search (PINCODE)</label>
           <div className="flex flex-col sm:flex-row gap-4 items-stretch">
             <div className="relative flex-1">
               <input 
                type="text" 
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit Pincode"
                className="w-full bg-[#f8f9fa] border border-slate-300 py-4 px-6 text-2xl font-bold text-navy tracking-[0.2em] focus:bg-white focus:border-navy focus:outline-none transition-all placeholder:text-slate-300 placeholder:tracking-normal shadow-inner"
               />
               <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
             </div>
             <button 
              onClick={handleLookup}
              disabled={loading || pincode.length !== 6}
              className="bg-navy text-white px-10 py-4 rounded-sm hover:bg-[#000066] transition-all font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-md"
             >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Search Details
             </button>
           </div>
           {error && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-600 text-[10px] font-bold uppercase tracking-wide bg-red-50 p-3 border border-red-100 rounded-sm">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
             </motion.div>
           )}
        </div>

        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-10 border-t border-slate-100 space-y-10"
            >
              {/* Constituency Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Parliamentary (LS)', value: result.lokSabha, icon: Layers },
                  { label: 'Legislative (AC)', value: result.assembly, icon: Landmark },
                  { label: 'Election Phase', value: result.phase, icon: Info },
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-slate-50 border border-slate-200 rounded-sm space-y-3 hover:bg-white hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-white border border-slate-200 text-navy flex items-center justify-center rounded-sm">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                      <p className="text-xl font-bold text-navy uppercase tracking-tight">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {result.booth && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mt-12 bg-[#f4f7fa] p-8 md:p-12 border border-slate-200 rounded-sm">
                   {/* Booth Details */}
                   <div className="md:col-span-12 lg:col-span-7 space-y-8">
                      <div className="space-y-4">
                         <span className="inline-block bg-green-accent text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm">Assigned Station Active</span>
                         <h2 className="text-3xl font-bold text-navy uppercase leading-tight">{result.booth.name}</h2>
                         <div className="flex flex-wrap items-center gap-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                            <span className="bg-navy text-white px-3 py-1 mt-1">Booth Identification No: {result.booth.no}</span>
                            <span className="bg-white border border-slate-200 px-3 py-1 mt-1">EPIC PART ID: RS/2026/01</span>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 border border-slate-200 shadow-sm">
                         <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-sm flex items-center justify-center border border-slate-100 shrink-0">
                               <MapPin className="w-5 h-5 text-navy" />
                            </div>
                            <div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Official Address</p>
                               <p className="text-sm text-navy font-semibold leading-relaxed">{result.booth.address}</p>
                            </div>
                         </div>
                         <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-sm flex items-center justify-center border border-slate-100 shrink-0">
                               <Navigation className="w-5 h-5 text-navy" />
                            </div>
                            <div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Station Landmark</p>
                               <p className="text-sm text-navy font-semibold leading-relaxed">{result.booth.landmark}</p>
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center justify-between bg-white px-8 py-5 border border-navy border-l-8 rounded-sm shadow-sm">
                          <div className="flex items-center gap-5">
                             <div className="w-12 h-12 bg-navy text-white flex items-center justify-center rounded-sm font-bold text-lg">
                                {result.booth.blo.name.split(' ').map((n: any) => n[0]).join('')}
                             </div>
                             <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booth Level Officer (BLO)</p>
                                <p className="text-base font-bold text-navy uppercase">{result.booth.blo.name}</p>
                             </div>
                          </div>
                          <button className="flex items-center gap-2 bg-slate-50 hover:bg-navy hover:text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border border-slate-200 rounded-sm text-navy">
                             <Phone className="w-4 h-4" />
                             Contact
                          </button>
                      </div>
                   </div>

                   {/* Map Integration */}
                   <div className="md:col-span-12 lg:col-span-5 space-y-6">
                      <div className="w-full aspect-square bg-slate-50 border border-slate-200 relative overflow-hidden group shadow-inner">
                         <div className="absolute inset-0 p-8 opacity-10">
                            <div className="w-full h-full border-[10px] border-navy rounded-full scale-110" />
                            <div className="w-full h-3 bg-navy absolute top-1/2 left-0 -rotate-12" />
                            <div className="w-3 h-full bg-navy absolute top-0 left-1/3 rotate-6" />
                         </div>
                         <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div 
                              animate={{ y: [0, -12, 0] }}
                              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                            >
                               <MapPin className="w-16 h-16 text-navy fill-saffron drop-shadow-xl" />
                            </motion.div>
                         </div>
                         <div className="absolute bottom-6 left-6 right-6 bg-navy text-white px-5 py-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest shadow-2xl rounded-sm">
                            <span>COORDS: {result.booth.coordinates.lat}, {result.booth.coordinates.lng}</span>
                            <span className="text-saffron">DISTANCE: 1.2 KM</span>
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center py-10 border-t border-slate-200">
         <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-[0.2em] max-w-2xl mx-auto">
           Voter Information data is synchronized from the ECI Integrated Service Portal. For discrepancies, please visit <a href="https://voters.eci.gov.in/" className="text-navy hover:text-saffron underline transition-colors" target="_blank">voters.eci.gov.in</a> or contact your district election officer.
         </p>
      </div>
    </div>
  );
}
