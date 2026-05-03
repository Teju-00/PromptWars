import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Newspaper, Calendar, ArrowRight, Bookmark, Filter, SortAsc, SortDesc, Clock, ExternalLink, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NEWS_DATA, NewsItem } from '@/constants/newsData';
import { fetchLiveElectionNews } from '@/services/geminiService';
import { useSettings } from '@/context/SettingsContext';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 4;
const CATEGORIES = ['All', 'Election Law', 'Data Analysis', 'Guides', 'Political'];
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=800&h=600';

export default function NewsFeed() {
  const { language } = useSettings();
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch live news from Gemini
      const liveNews = await fetchLiveElectionNews(language);
      if (liveNews && liveNews.length > 0) {
        setNewsList(liveNews);
        // Also save to session storage for detail view
        sessionStorage.setItem('live_news_cache', JSON.stringify(liveNews));
      } else {
        // Fallback to static data if API fails or returns empty
        setNewsList(NEWS_DATA);
      }
    } catch (err) {
      console.error("Failed to fetch live news:", err);
      // Fallback
      setNewsList(NEWS_DATA);
      setError("Failed to fetch live updates. Showing recent cached news.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if we have cached news for this session to avoid re-fetching on every back navigation
    const cached = sessionStorage.getItem('live_news_cache');
    if (cached) {
      try {
        setNewsList(JSON.parse(cached));
        setLoading(false);
      } catch (e) {
        fetchNews();
      }
    } else {
      fetchNews();
    }
  }, [language]);

  const filteredAndSortedNews = useMemo(() => {
    let result = [...newsList];
    
    if (selectedCategory !== 'All') {
      result = result.filter(item => item.category === selectedCategory);
    }
    
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      // Fallback if parsing dates fails
      if (isNaN(dateA) || isNaN(dateB)) return 0;

      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    return result;
  }, [newsList, selectedCategory, sortOrder]);

  useEffect(() => {
    setVisibleItems(ITEMS_PER_PAGE);
  }, [selectedCategory, sortOrder]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && visibleItems < filteredAndSortedNews.length) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loading, visibleItems, filteredAndSortedNews.length]);

  const loadMore = () => {
    // don't set global loading state for infinite scroll
    setVisibleItems(prev => Math.min(prev + 2, filteredAndSortedNews.length));
  };
  
  const handleImageError = (id: string) => {
      setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header className="space-y-3 border-l-[10px] border-l-navy pl-8 py-4 bg-white shadow-sm border border-border-slate flex justify-between items-start">
        <div>
          <span className="inline-block bg-navy text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 mb-2">Official News Channel</span>
          <h1 className="text-4xl font-bold text-navy uppercase tracking-tight">Public Information Feed</h1>
          <p className="text-slate-500 font-medium text-lg mt-2">Verified updates, policy changes, and electoral procedures for Indian citizens.</p>
        </div>
        <button 
          onClick={fetchNews} 
          disabled={loading}
          className="bg-[#f8f9fa] border border-slate-200 text-navy px-4 py-2 text-[11px] font-bold uppercase tracking-widest hover:border-navy hover:shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Sync News
        </button>
      </header>

      {/* Filters and Sorting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-white border border-border-slate shadow-sm">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-5 py-2.5 text-[11px] font-bold uppercase tracking-tight transition-all border",
                selectedCategory === cat 
                  ? "bg-navy text-white border-navy shadow-md" 
                  : "bg-white text-slate-500 border-slate-200 hover:border-navy hover:text-navy"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4 self-end md:self-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400">
            {sortOrder === 'newest' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
            Sort Order:
          </div>
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-sm text-[11px] font-bold uppercase outline-none cursor-pointer focus:border-navy transition-colors shadow-sm"
          >
            <option value="newest">Latest Updates</option>
            <option value="oldest">Historical Data</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-[#FEF7E0] border border-[#FAD242] p-4 flex items-start gap-3 rounded-sm shadow-sm">
          <AlertCircle className="w-5 h-5 text-[#B06000] shrink-0 mt-0.5" />
          <p className="text-[13px] text-[#734200] font-medium leading-relaxed">{error}</p>
        </div>
      )}

      {loading && newsList.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-sm overflow-hidden flex flex-col h-[480px] animate-pulse">
              <div className="bg-slate-200 h-48 w-full" />
              <div className="p-8 space-y-4 flex-1">
                <div className="h-3 bg-slate-200 w-1/3 rounded" />
                <div className="h-6 bg-slate-200 w-full rounded" />
                <div className="h-6 bg-slate-200 w-4/5 rounded" />
                <div className="h-4 bg-slate-200 w-full rounded mt-6" />
                <div className="h-4 bg-slate-200 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedNews.length === 0 ? (
        <div className="bg-white border border-slate-200 p-16 text-center shadow-sm">
          <Newspaper className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-navy uppercase tracking-tight mb-2">No Updates Found</h2>
          <p className="text-slate-500 font-medium">Try adjusting your category filter or refreshing the feed.</p>
          <button 
            onClick={() => setSelectedCategory('All')} 
            className="mt-6 bg-navy text-white px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-[#000066] transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedNews.slice(0, visibleItems).map((item, index) => (
              <motion.article 
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: (index % ITEMS_PER_PAGE) * 0.05 }}
                className="bg-white border border-border-slate rounded-sm overflow-hidden flex flex-col group shadow-sm hover:shadow-md transition-all h-full"
              >
                <div className="flex-1 flex flex-col">
                  <div className="bg-slate-100 h-48 w-full relative overflow-hidden border-b border-slate-100">
                     <img 
                       src={(!item.imageUrl || imageErrors[item.id]) ? FALLBACK_IMAGE : item.imageUrl} 
                       alt={item.title} 
                       onError={() => handleImageError(item.id)}
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                       referrerPolicy="no-referrer"
                     />
                     <div className="absolute top-4 left-4">
                        <span className="bg-[#1A73E8] text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 shadow-sm">
                          {item.category}
                        </span>
                     </div>
                  </div>
                  
                  <div className="p-8 space-y-4 flex-1 flex flex-col">
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.date}
                      </div>
                      <div className="w-1 h-1 bg-slate-200 rounded-full" />
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {item.readTime}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-navy leading-tight uppercase transition-colors group-hover:text-[#1A73E8] line-clamp-2">
                      {item.title}
                    </h3>
                    
                    <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6 line-clamp-3">
                      {item.excerpt}
                    </p>

                    <div className="mt-auto pt-6 flex justify-between items-center border-t border-slate-50">
                       <button
                         onClick={() => navigate(`/news/${item.id}`)}
                         className="bg-navy text-white px-6 py-2.5 text-[11px] font-bold uppercase tracking-wide hover:bg-[#1A73E8] transition-all flex items-center gap-2 shadow-sm"
                       >
                         Full Article <ArrowRight className="w-3 h-3" />
                       </button>
                       <div className="flex gap-4">
                         <Bookmark className="w-4 h-4 text-slate-300 hover:text-navy cursor-pointer transition-colors" />
                         <ExternalLink className="w-4 h-4 text-slate-300 hover:text-navy cursor-pointer transition-colors" />
                       </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}

      {visibleItems < filteredAndSortedNews.length && !loading && (
        <div ref={loaderRef} className="py-8 flex justify-center">
          <div className="flex items-center gap-3 text-navy font-bold text-xs uppercase tracking-widest">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading more verified news...
          </div>
        </div>
      )}

      <div className="bg-white border-[1px] border-slate-200 p-12 text-center space-y-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rotate-45 translate-x-16 -translate-y-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-50 rotate-45 -translate-x-16 translate-y-16" />
        
        <div className="relative space-y-6">
          <div className="w-16 h-16 bg-navy text-white flex items-center justify-center mx-auto rounded-full shadow-md">
             <Newspaper className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-navy uppercase tracking-tight">Election Bulletin Subscription</h2>
            <p className="text-slate-500 font-medium max-w-lg mx-auto text-sm">
              Register your email address to receive real-time notifications regarding polling dates, candidate lists, and advisory notes.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
            <input 
              type="email" 
              placeholder="Enter your official email"
              className="flex-1 bg-[#f8f9fa] border border-slate-300 px-6 py-3 font-medium text-sm outline-none focus:border-navy shadow-inner" 
            />
            <button className="bg-navy text-white px-8 py-3 font-bold uppercase text-xs tracking-widest hover:bg-[#1A73E8] transition-all shadow-md active:scale-95">
              Subscribe Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
