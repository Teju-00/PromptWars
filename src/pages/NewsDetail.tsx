import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NEWS_DATA, NewsItem } from '@/constants/newsData';
import { fetchNewsById } from '@/services/firebaseService';
import { ArrowLeft, Calendar, Clock, Bookmark, Share2, Printer, Loader2, AlertCircle, Newspaper } from 'lucide-react';
import { motion } from 'motion/react';
import { useSettings } from '@/context/SettingsContext';

export default function NewsDetail() {
  const { id } = useParams();
  const { t, language } = useSettings();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=800&h=600';

  useEffect(() => {
    const loadNews = async () => {
      if (!id) return;
      
      // 1. Check live news cache
      const cached = sessionStorage.getItem('live_news_cache');
      if (cached) {
        try {
          const liveNews: NewsItem[] = JSON.parse(cached);
          const found = liveNews.find(n => n.id === id);
          if (found) {
            setNews(found);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Cache parsing error", e);
        }
      }

      // 2. Check static fallback data
      const staticNews = NEWS_DATA.find(n => n.id === id);
      if (staticNews) {
        setNews(staticNews);
        setLoading(false);
        return;
      }

      // 3. Fallback attempt to fetch from Firebase (if previously used)
      setLoading(true);
      try {
        const dynamicNews = await fetchNewsById(id);
        if (dynamicNews) {
          setNews(dynamicNews as NewsItem);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [id, language]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-12 h-12 text-navy animate-spin" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Decrypting intelligence feed...</p>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <h2 className="text-2xl font-black text-navy uppercase">Article Not Found</h2>
        <Link to="/news" className="btn-secondary">Back to Feed</Link>
      </div>
    );
  }

  const relatedArticles = NEWS_DATA.filter(n => n.id !== news.id).slice(0, 2);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-12 mb-20"
    >
      <div className="flex items-center justify-between">
        <Link 
          to="/news" 
          className="inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-[#1B72E8] hover:text-navy transition-all px-4 py-2 bg-[#E8F0FE] rounded-full border border-transparent hover:border-[#1B72E8] group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> 
          Return to Public Information Feed
        </Link>
        <div className="flex items-center gap-4">
           <button className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-navy hover:shadow-md transition-all rounded-sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4" />
           </button>
           <button 
             className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-navy hover:shadow-md transition-all rounded-sm"
             onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: news.title,
                  text: news.excerpt,
                  url: window.location.href,
                }).catch(console.error);
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
             }}
           >
              <Share2 className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="space-y-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <span className="bg-navy text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-sm shadow-sm">{news.category}</span>
             <div className="h-px bg-slate-200 flex-1" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-navy uppercase leading-tight tracking-tight">
            {news.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-8 py-5 border-y border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-[#EA4335]" />
            <span className="text-slate-600">{news.date}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-[#FBBC04]" />
            <span className="text-slate-600">{news.readTime}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-4 h-4 text-[#34A853]" />
            <span className="text-slate-600">Verification ID: INF-{news.id.toUpperCase()}</span>
          </div>
        </div>

        <div className="bg-white border border-border-slate shadow-xl relative rounded-sm p-2 overflow-hidden bg-gradient-to-br from-slate-50 to-white">
          <img 
            src={(!news.imageUrl || imageError) ? FALLBACK_IMAGE : news.imageUrl} 
            alt={news.title} 
            onError={() => setImageError(true)}
            className="w-full h-auto object-cover max-h-[600px] shadow-inner"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-8">
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-10">
              <p className="text-2xl font-bold text-navy leading-relaxed border-l-[12px] border-l-saffron pl-10 py-2 bg-slate-50 shadow-sm italic">
                {news.excerpt}
              </p>
              <div className="text-lg text-slate-700 leading-[1.8] space-y-8 font-medium whitespace-pre-line text-justify">
                {news.content}
              </div>
            </div>
            
            <div className="bg-[#FEF7E0] border border-[#FAD242] p-8 space-y-4 rounded-sm shadow-sm">
              <div className="flex items-center gap-3">
                 <AlertCircle className="w-5 h-5 text-[#B06000]" />
                 <h4 className="text-xs font-bold uppercase tracking-widest text-[#B06000]">Official ECI Information Protocol</h4>
              </div>
              <p className="text-sm text-[#734200] font-medium leading-relaxed italic">
                This news simulation is strictly for educational purposes within the Elector AI pilot program. All strategic electoral updates should be cross-verified against official notifications issued via results.eci.gov.in.
              </p>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-10">
            <div className="bg-white border border-border-slate p-8 space-y-8 shadow-md rounded-sm">
              <div className="flex items-center gap-3">
                 <Newspaper className="w-5 h-5 text-navy" />
                 <h5 className="text-[12px] font-bold uppercase tracking-widest text-navy">Related Circulars</h5>
              </div>
              <div className="space-y-8">
                {relatedArticles.map(item => (
                  <Link key={item.id} to={`/news/${item.id}`} className="block group space-y-3">
                    <span className="text-[9px] font-bold text-saffron uppercase tracking-widest bg-slate-50 px-2 py-0.5 border border-slate-100 rounded-sm">{item.category}</span>
                    <h6 className="text-[15px] font-bold text-navy uppercase leading-tight group-hover:text-[#1B72E8] transition-colors">
                      {item.title}
                    </h6>
                    <div className="h-px bg-slate-100 w-12" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-navy p-8 text-white space-y-4 rounded-sm shadow-xl">
               <h3 className="text-lg font-bold uppercase tracking-tight">Stay Informed</h3>
               <p className="text-xs text-slate-300 font-medium leading-relaxed uppercase tracking-wider">Join our official broadcast list for priority electoral alerts.</p>
               <div className="flex gap-2">
                 <input type="email" placeholder="Email Address" className="flex-1 bg-white/10 border border-white/20 px-3 py-2 text-xs outline-none focus:bg-white/20" />
                 <button className="bg-saffron text-navy px-4 py-2 text-[10px] font-bold uppercase tracking-widest">Sign Up</button>
               </div>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}
