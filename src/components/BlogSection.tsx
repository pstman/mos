/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * بخش عمومی وبلاگ و مقالات تخصصی پژوهشی پرده‌نگار • استودیو اینامیکس
 * امکانات ویژه:
 * ۱. لینکسازی مجزا و اشتراک‌گذاری مستقیم (Deep Linking & Web Share API / Copy Link)
 * ۲. پشتیبانی از انواع رسانه‌های مستقیم: ویدیوهای مستقیم (MP4, WebM) و یوتیوب
 * ۳. پشتیبانی کامل از فایل‌های صوتی به‌ویژه M4A (MPEG-4 Audio)، MP3، OGG و WAV
 * ۴. پشتیبانی از تصاویر با بزرگ‌نمایی لایت‌باکس و رندر بهینه مارک‌داون
 */

import React, { useState, useEffect, useRef } from 'react';
import { BlogPost, getStoredBlogPosts, fetchRemoteBlogPosts } from '../utils/blogData';
import { AudioLinkPlayer } from './AudioLinkPlayer';
import { MediaVideoPlayer } from './MediaVideoPlayer';
import { 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  Heart, 
  Share2, 
  ArrowRight, 
  Search, 
  Video, 
  Music, 
  BookOpen,
  Link,
  Check,
  Maximize2,
  X,
  ExternalLink
} from 'lucide-react';

interface BlogSectionProps {
  onOpenTreatise: () => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ onOpenTreatise }) => {
  const [posts, setPosts] = useState<BlogPost[]>(getStoredBlogPosts());
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  const articleTopRef = useRef<HTMLDivElement | null>(null);

  // Sync latest posts from server database
  useEffect(() => {
    fetchRemoteBlogPosts().then(loadedPosts => {
      if (Array.isArray(loadedPosts) && loadedPosts.length > 0) {
        setPosts(loadedPosts);
      }
    });
  }, []);

  // --- 1. Deep Linking: Detect post in URL on mount and hash changes ---
  useEffect(() => {
    const checkUrlForPost = () => {
      const hash = window.location.hash || '';
      const search = window.location.search || '';

      // Pattern 1: #blog?post=slug_or_id or #post=slug_or_id
      let postIdentifier: string | null = null;

      if (hash.includes('post=')) {
        const queryPart = hash.split('?')[1] || hash.replace('#', '');
        const params = new URLSearchParams(queryPart);
        postIdentifier = params.get('post');
      } else if (search.includes('post=')) {
        const params = new URLSearchParams(search);
        postIdentifier = params.get('post');
      } else if (hash.startsWith('#post/')) {
        postIdentifier = hash.replace('#post/', '');
      }

      if (postIdentifier && posts.length > 0) {
        const decoded = decodeURIComponent(postIdentifier).trim().toLowerCase();
        const found = posts.find(
          p => p.id.toLowerCase() === decoded || (p.slug && p.slug.toLowerCase() === decoded)
        );
        if (found) {
          setSelectedPost(found);
          setTimeout(() => {
            articleTopRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
      }
    };

    checkUrlForPost();
    window.addEventListener('hashchange', checkUrlForPost);
    window.addEventListener('popstate', checkUrlForPost);

    return () => {
      window.removeEventListener('hashchange', checkUrlForPost);
      window.removeEventListener('popstate', checkUrlForPost);
    };
  }, [posts]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Select a post and update deep link in URL
  const handleSelectPost = (post: BlogPost) => {
    setSelectedPost(post);
    const postSlugOrId = post.slug || post.id;
    const newHash = `#blog?post=${encodeURIComponent(postSlugOrId)}`;
    window.history.replaceState(null, '', newHash);
    setTimeout(() => {
      articleTopRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Back to list view and clean URL hash
  const handleBackToList = () => {
    setSelectedPost(null);
    window.history.replaceState(null, '', '#blog');
  };

  // --- 2. Share & Deep Link Action ---
  const handleShare = async (post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    const postSlugOrId = post.slug || post.id;
    const shareUrl = `${window.location.origin}${window.location.pathname}#blog?post=${encodeURIComponent(postSlugOrId)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.title} • پرده‌نگار`,
          text: post.summary,
          url: shareUrl
        });
        showToast('مقاله با موفقیت به اشتراک گذاشته شد.');
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return; // User closed native share dialog
      }
    }

    // Fallback: Copy direct deep link to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('✓ لینک مستقیم مقاله در کلیپ‌بورد کپی شد (آماده ارسال و اشتراک‌گذاری)');
    } catch {
      // Secondary fallback
      window.prompt('لینک مستقیم جهت اشتراک‌گذاری مقاله:', shareUrl);
    }
  };

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedPosts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter posts based on search & category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Safe and responsive Markdown & HTML formatter
  const renderFormattedContent = (content: string) => {
    return (
      <div 
        className="prose prose-invert max-w-none text-[#E8DCC8] leading-relaxed space-y-4 text-sm sm:text-base font-persian"
        dangerouslySetInnerHTML={{
          __html: formatMarkdownToHtml(content)
        }}
      />
    );
  };

  const formatMarkdownToHtml = (md: string) => {
    let html = md;
    
    // Markdown Images with responsive styling and zoom: ![alt](url)
    html = html.replace(
      /!\[(.*?)\]\((.*?)\)/g,
      '<div class="my-5 text-center"><img src="$2" alt="$1" class="rounded-xl border border-[#594234]/70 max-h-[460px] mx-auto shadow-xl hover:border-[#E5A836] transition cursor-pointer" loading="lazy" onclick="window.dispatchEvent(new CustomEvent(\'blog-image-zoom\', { detail: \'$2\' }))" /><p class="text-xs text-[#A6937C] mt-2 italic font-mono">$1</p></div>'
    );

    // Markdown Links: [title](url)
    html = html.replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#E5A836] hover:underline font-bold inline-flex items-center gap-1">$1 ↗</a>'
    );

    // Headers
    html = html.replace(/### (.*?)\n/g, '<h3 class="text-lg sm:text-xl font-bold text-[#E5A836] mt-6 mb-2 border-b border-[#594234]/50 pb-1">$1</h3>');
    html = html.replace(/#### (.*?)\n/g, '<h4 class="text-base sm:text-lg font-bold text-[#FFF5E6] mt-4 mb-2">$1</h4>');
    
    // Blockquotes
    html = html.replace(/> (.*?)\n/g, '<blockquote class="border-r-4 border-[#E5A836] bg-[#241A14] p-3 rounded-lg my-3 text-[#D6C7B2] italic">$1</blockquote>');
    
    // Bold & Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#FFF5E6] font-bold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="text-[#E5A836]">$1</em>');
    
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-[#120E0B] border border-[#594234]/70 p-3 rounded-xl overflow-x-auto text-xs font-mono text-[#34D399] my-3 leading-relaxed" dir="ltr"><code>$1</code></pre>');
    
    // Bullet lists
    html = html.replace(/^\* (.*?)$/gm, '<li class="mr-4 list-disc text-[#D6C7B2]">$1</li>');
    html = html.replace(/^- (.*?)$/gm, '<li class="mr-4 list-disc text-[#D6C7B2]">$1</li>');

    // Paragraph breaks
    html = html.replace(/\n\n/g, '<p class="my-3 leading-loose"></p>');

    return html;
  };

  // Listen for custom image zoom events dispatched from markdown images
  useEffect(() => {
    const handleZoomEvent = (e: any) => {
      if (e.detail) setZoomImageUrl(e.detail);
    };
    window.addEventListener('blog-image-zoom', handleZoomEvent);
    return () => window.removeEventListener('blog-image-zoom', handleZoomEvent);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 font-persian" dir="rtl" ref={articleTopRef}>
      {/* Toast Notification for Share / Copy */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#10B981] text-black px-5 py-2.5 rounded-xl text-xs font-bold shadow-2xl z-50 animate-bounce flex items-center gap-2 border border-emerald-300">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Lightbox Image Zoom Modal */}
      {zoomImageUrl && (
        <div 
          onClick={() => setZoomImageUrl(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
        >
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#E5A836]/60 shadow-2xl">
            <button
              onClick={() => setZoomImageUrl(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-[#8B2635] transition"
              title="بستن تصویر"
            >
              <X size={18} />
            </button>
            <img 
              src={zoomImageUrl} 
              alt="بزرگ‌نمایی تصویر" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#241A14] via-[#1A130F] to-[#241A14] border border-[#594234] rounded-2xl p-5 sm:p-7 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1.5 text-center md:text-right">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-2xl">📰</span>
            <h2 className="text-lg sm:text-2xl font-black text-[#F5EEDB]">
              وبلاگ و مقالات تخصصی اتنوموزیکولوژی
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#C4B59D]">
            پژوهش‌های ایمان برزجان پیرامون فیزیک آکوستیک ردیف، سنت‌سنجی فواصل، ارگانولوژی و پیوستار اوراسیا
          </p>
        </div>

        <button
          onClick={onOpenTreatise}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B2635] hover:bg-[#A62F41] text-[#FFF5E6] font-bold text-xs border border-[#E5A836]/60 transition shadow shrink-0"
        >
          <BookOpen size={16} />
          <span>مطالعه رساله‌های تحقیقاتی PDF</span>
        </button>
      </div>

      {/* --- SELECTED POST FULL VIEW --- */}
      {selectedPost ? (
        <article className="bg-[#18120E] border border-[#594234] rounded-2xl p-5 sm:p-8 space-y-6 shadow-2xl animate-in fade-in duration-300">
          {/* Top Bar: Back & Direct Share */}
          <div className="flex items-center justify-between gap-2 border-b border-[#594234]/40 pb-4">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2A1F18] hover:bg-[#3D2E24] text-[#E5A836] text-xs font-bold transition border border-[#594234]/60"
            >
              <ArrowRight size={16} />
              <span>بازگشت به فهرست مقالات</span>
            </button>

            <button
              onClick={(e) => handleShare(selectedPost, e)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D97706] hover:bg-[#E5A836] text-black text-xs font-bold transition shadow"
              title="اشتراک‌گذاری لینک مستقیم این مقاله"
            >
              <Share2 size={15} />
              <span>اشتراک‌گذاری و کپی لینک</span>
            </button>
          </div>

          {/* Cover image with Lightbox Zoom option */}
          {selectedPost.coverImageUrl && (
            <div 
              onClick={() => setZoomImageUrl(selectedPost.coverImageUrl || null)}
              className="w-full h-56 sm:h-80 rounded-xl overflow-hidden border border-[#594234]/50 relative group cursor-zoom-in"
              title="جهت بزرگ‌نمایی تصویر کلیک کنید"
            >
              <img
                src={selectedPost.coverImageUrl}
                alt={selectedPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18120E] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] bg-black/60 px-2.5 py-1 rounded-lg text-[#E5A836] backdrop-blur-sm border border-black/30">
                <Maximize2 size={13} />
                <span>بزرگ‌نمایی تصویر کاور</span>
              </div>
            </div>
          )}

          {/* Post Header Details */}
          <div className="space-y-3 pb-4 border-b border-[#594234]/50">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-[#8B2635] text-[#FFF5E6] text-xs font-bold border border-[#E5A836]/40">
                {selectedPost.categoryLabelFa}
              </span>

              {/* Direct Link indicator */}
              <span className="text-[11px] font-mono text-[#A6937C] flex items-center gap-1 bg-[#241A14] px-2 py-0.5 rounded border border-[#594234]/40" dir="ltr">
                <Link size={12} className="text-[#E5A836]" />
                <span>#blog?post={selectedPost.slug || selectedPost.id}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-[#F5EEDB] leading-tight">
              {selectedPost.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#A6937C]">
              <div className="flex items-center gap-1.5 text-[#E5A836]">
                <User size={15} />
                <span>{selectedPost.author} ({selectedPost.authorRole})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={15} />
                <span>{selectedPost.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={15} />
                <span>زمان مطالعه: {selectedPost.readingTimeMinutes} دقیقه</span>
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-[#241A14] border-r-4 border-[#E5A836] text-xs sm:text-sm text-[#D6C7B2] leading-relaxed">
            <strong>خلاصه پژوهش:</strong> {selectedPost.summary}
          </div>

          {/* --- Attached Audio Player: Full Support for M4A, MP3, OGG, WAV --- */}
          {selectedPost.audioUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#E5A836]">
                <div className="flex items-center gap-2">
                  <Music size={16} />
                  <span>شنیدن فایل صوتی پیوست مقاله:</span>
                </div>
                <span className="text-[10px] text-[#A6937C] font-normal">
                  پشتیبانی از فرمت‌های M4A ،MP3 ،WAV و OGG
                </span>
              </div>
              <AudioLinkPlayer
                audioUrl={selectedPost.audioUrl}
                title={selectedPost.audioTitle || selectedPost.title}
              />
            </div>
          )}

          {/* --- Attached Video Player: Direct MP4/WebM & YouTube Support --- */}
          {(selectedPost.videoUrl || selectedPost.youtubeUrl) && (
            <div className="space-y-2">
              <MediaVideoPlayer
                videoUrl={selectedPost.videoUrl || selectedPost.youtubeUrl || ''}
                title={selectedPost.title}
                posterUrl={selectedPost.coverImageUrl}
              />
            </div>
          )}

          {/* Rich Content Rendered with Markdown & Safe HTML */}
          <div className="pt-2">
            {renderFormattedContent(selectedPost.content)}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#594234]/50">
            <Tag size={15} className="text-[#E5A836]" />
            {selectedPost.tags.map((tag, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-[#2A1F18] text-[#C4B59D] border border-[#594234]/60">
                #{tag}
              </span>
            ))}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-[#594234]/50 text-xs">
            <button
              onClick={(e) => handleLike(selectedPost.id, e)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
                likedPosts[selectedPost.id]
                  ? 'bg-[#8B2635] text-[#FFF5E6] border-[#E5A836]'
                  : 'bg-[#2A1F18] text-[#C4B59D] border-[#594234] hover:text-[#FFF5E6]'
              }`}
            >
              <Heart size={16} className={likedPosts[selectedPost.id] ? 'fill-current text-red-400' : ''} />
              <span>پسندیدم ({selectedPost.likesCount + (likedPosts[selectedPost.id] ? 1 : 0)})</span>
            </button>

            <button
              onClick={(e) => handleShare(selectedPost, e)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2A1F18] hover:bg-[#3D2E24] text-[#E5A836] border border-[#594234] transition font-bold"
            >
              <Share2 size={16} />
              <span>اشتراک‌گذاری مستقیم این مقاله</span>
            </button>
          </div>
        </article>
      ) : (
        /* --- BLOG POSTS LIST GRID VIEW --- */
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#1C1410] p-3 rounded-xl border border-[#594234]/60">
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A6937C]" />
              <input
                type="text"
                placeholder="جستجو در مقالات و واژگان..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#2A1F18] border border-[#594234] rounded-lg pr-9 pl-3 py-1.5 text-xs text-[#F5EEDB] placeholder-[#A6937C] focus:border-[#E5A836] outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
              {[
                { id: 'all', label: 'همه موضوعات' },
                { id: 'acoustics', label: 'آکوستیک و تئوری' },
                { id: 'organology', label: 'سازشناسی' },
                { id: 'violin_technique', label: 'تکنیک ویولن' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap border ${
                    selectedCategory === cat.id
                      ? 'bg-[#8B2635] text-[#FFF5E6] border-[#E5A836]'
                      : 'bg-[#241A14] text-[#C4B59D] border-[#594234]/50 hover:bg-[#2C211B]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <div
                key={post.id}
                onClick={() => handleSelectPost(post)}
                className="group bg-[#1A130F] hover:bg-[#241A14] border border-[#594234]/60 hover:border-[#E5A836] rounded-2xl overflow-hidden transition duration-300 flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1"
              >
                <div>
                  {/* Card Cover Image */}
                  {post.coverImageUrl && (
                    <div className="w-full h-44 overflow-hidden relative border-b border-[#594234]/40">
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-2.5 right-2.5 text-[10px] px-2.5 py-0.5 rounded-full bg-[#8B2635]/90 text-[#FFF5E6] font-bold border border-[#E5A836]/40 backdrop-blur-sm">
                        {post.categoryLabelFa}
                      </span>
                    </div>
                  )}

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 space-y-2.5">
                    <h3 className="text-sm sm:text-base font-black text-[#F5EEDB] group-hover:text-[#E5A836] transition leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-[#C4B59D] line-clamp-3 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>
                </div>

                {/* Card Footer with Meta and Share Button */}
                <div className="p-4 sm:p-5 pt-0 border-t border-[#594234]/30 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-[#A6937C] pt-2">
                    <span>{post.author}</span>
                    <span>{post.readingTimeMinutes} دقیقه مطالعه</span>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Media Badges */}
                    <div className="flex items-center gap-1.5">
                      {post.audioUrl && (
                        <span className="text-[10px] flex items-center gap-1 text-[#38BDF8] bg-[#0C2538] px-2 py-0.5 rounded-md border border-[#0284C7]/50 font-mono">
                          <Music size={11} />
                          {post.audioUrl.toLowerCase().includes('.m4a') ? 'M4A' : 'صوت'}
                        </span>
                      )}
                      {(post.videoUrl || post.youtubeUrl) && (
                        <span className="text-[10px] flex items-center gap-1 text-[#34D399] bg-[#14261C] px-2 py-0.5 rounded-md border border-[#10B981]/50 font-mono">
                          <Video size={11} />
                          {(post.videoUrl && !post.videoUrl.includes('youtube')) ? 'MP4' : 'ویدیو'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Card Share Button */}
                      <button
                        onClick={(e) => handleShare(post, e)}
                        className="p-1.5 rounded-lg bg-[#2A1F18] hover:bg-[#3D2E24] text-[#A6937C] hover:text-[#E5A836] border border-[#594234]/60 transition"
                        title="اشتراک‌گذاری و کپی لینک مستقیم مقاله"
                      >
                        <Share2 size={13} />
                      </button>

                      <span className="text-xs font-bold text-[#E5A836] group-hover:underline flex items-center gap-1">
                        <span>مطالعه</span>
                        <span>←</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="p-8 text-center text-xs text-[#A6937C] bg-[#16110E] rounded-xl border border-[#594234]/40">
              مقاله‌ای مطابق با عبارت جستجو یافت نشد.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
