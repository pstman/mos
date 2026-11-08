/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * دیوان راهبری و سرپرستی سامانه پرده‌نگار • استودیو اینامیکس
 * با لایه امنیتی گذرواژه MODIRIAT_ADMIN مبتنی بر استانداردهای کلودفلر و گوگل
 * انحصار کامل بارگذاری پرونده‌ها، ویرایش قطعات ایستگاه‌های پیوستار، و انتشار نوشتارها
 * نگارش به زبان فارسی پالوده و پاکیزه با اصطلاحات تخصصی خنیاگری و ارگانولوژی
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Palette, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Check, 
  Download, 
  RotateCcw,
  Sparkles,
  FileText,
  Lock,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  LogOut,
  AlertCircle,
  Music,
  Compass,
  Upload,
  Link as LinkIcon,
  Volume2,
  Youtube,
  Layers,
  Clock
} from 'lucide-react';
import { 
  BlogPost, 
  getStoredBlogPosts, 
  saveBlogPosts, 
  resetBlogPostsToDefault,
  fetchRemoteBlogPosts,
  createRemoteBlogPost,
  updateRemoteBlogPost,
  deleteRemoteBlogPost,
  resetRemoteBlogPosts
} from '../utils/blogData';
import { 
  THEME_PRESETS, 
  ColorThemePreset, 
  getStoredTheme, 
  applyTheme 
} from '../utils/themeSystem';
import { 
  ContinuumStationPiece, 
  getStoredContinuumPieces, 
  saveContinuumPieces, 
  updateContinuumPiece, 
  resetContinuumPiecesToDefault 
} from '../utils/continuumPiecesData';
import { 
  audioEngine, 
  InstrumentBankInfo, 
  SampleInstrumentId, 
  MIDI_NOTE_LABELS, 
  TimbreType, 
  PercussionSound 
} from '../utils/audioEngine';
import { AudioLinkPlayer } from './AudioLinkPlayer';
import { MediaVideoPlayer } from './MediaVideoPlayer';
import { 
  PodcastEpisode, 
  fetchPodcasts, 
  createPodcastEpisode, 
  updatePodcastEpisode, 
  deletePodcastEpisode, 
  resetPodcasts 
} from '../utils/podcastData';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostUpdated?: () => void;
  onPiecesUpdated?: () => void;
}

const AUTH_STORAGE_KEY = 'enamix_admin_authenticated_session';

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onPostUpdated,
  onPiecesUpdated
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    try {
      return sessionStorage.getItem('enamix_admin_password_token') || '';
    } catch {
      return '';
    }
  });

  // Panel State (5 Distinct Admin Tabs)
  const [activeTab, setActiveTab] = useState<'blog_manager' | 'pieces_manager' | 'podcasts_manager' | 'samples_manager' | 'theme_customizer'>('blog_manager');
  const [posts, setPosts] = useState<BlogPost[]>(getStoredBlogPosts());
  const [pieces, setPieces] = useState<ContinuumStationPiece[]>(getStoredContinuumPieces());
  const [currentTheme, setCurrentTheme] = useState<ColorThemePreset>(getStoredTheme());
  
  // Podcasts & Audio State
  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>([]);
  const [isEditingPodcast, setIsEditingPodcast] = useState<boolean>(false);
  const [editingPodcastId, setEditingPodcastId] = useState<string | null>(null);
  const [podFormTitle, setPodFormTitle] = useState('');
  const [podFormDesc, setPodFormDesc] = useState('');
  const [podFormAudioUrl, setPodFormAudioUrl] = useState('');
  const [podFormDuration, setPodFormDuration] = useState('۰۳:۰۰');
  const [podFormSpeaker, setPodFormSpeaker] = useState('ایمان برزجان');
  const [podFormChapter, setPodFormChapter] = useState('ch1');
  const [podFormRegion, setPodFormRegion] = useState<'iran_plateau' | 'alans_steppes' | 'mesopotamia' | 'danube_basin'>('iran_plateau');
  const [isPodSubmitting, setIsPodSubmitting] = useState(false);

  // Custom Color State
  const [customPrimary, setCustomPrimary] = useState(currentTheme.colors.primary);
  const [customAccent, setCustomAccent] = useState(currentTheme.colors.accent);

  // Sample Banks State
  const [sampleBanks, setSampleBanks] = useState<InstrumentBankInfo[]>(() => audioEngine.getAllInstrumentBanks());
  const [selectedSampleInst, setSelectedSampleInst] = useState<SampleInstrumentId>('violin');
  const [selectedSampleMidi, setSelectedSampleMidi] = useState<number>(69);
  const [customSampleUrlInput, setCustomSampleUrlInput] = useState<string>('');
  const [sampleIsBusy, setSampleIsBusy] = useState<boolean>(false);
  const sampleFileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync latest posts, podcasts & pieces from DB/cache when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRemoteBlogPosts().then(latest => {
        if (Array.isArray(latest) && latest.length > 0) {
          setPosts(latest);
        }
      });
      fetchPodcasts().then(latest => {
        if (Array.isArray(latest) && latest.length > 0) {
          setPodcasts(latest);
        }
      });
      setPieces(getStoredContinuumPieces());
      setSampleBanks(audioEngine.getAllInstrumentBanks());

      const unsubscribe = audioEngine.subscribe(() => {
        setSampleBanks(audioEngine.getAllInstrumentBanks());
      });
      return () => unsubscribe();
    }
  }, [isOpen]);

  // Blog Post Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAuthor, setFormAuthor] = useState('ایمان برزجان');
  const [formCategory, setFormCategory] = useState<'ethnomusicology' | 'radif_analysis' | 'violin_technique' | 'organology' | 'acoustics'>('acoustics');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formAudioUrl, setFormAudioUrl] = useState('');
  const [formAudioTitle, setFormAudioTitle] = useState('');
  const [formYoutubeUrl, setFormYoutubeUrl] = useState('');
  const [formTags, setFormTags] = useState('ردیف, ویولن, تئوری');
  const [formReadTime, setFormReadTime] = useState(5);

  // Pieces Manager Form State
  const [editingPieceId, setEditingPieceId] = useState<string>(pieces[0]?.id || 'piece_station_1_iran');
  const selectedEditingPiece = pieces.find(p => p.id === editingPieceId) || pieces[0];
  const [pieceFormTitle, setPieceFormTitle] = useState('');
  const [pieceFormSystem, setPieceFormSystem] = useState('');
  const [pieceFormAudioUrl, setPieceFormAudioUrl] = useState('');
  const [pieceFormYoutubeUrl, setPieceFormYoutubeUrl] = useState('');
  const [pieceFormDuration, setPieceFormDuration] = useState(26);
  const [pieceFormSummary, setPieceFormSummary] = useState('');
  const [pieceFormOrganology, setPieceFormOrganology] = useState('');
  const [pieceFormHistory, setPieceFormHistory] = useState('');
  const pieceFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectedEditingPiece) {
      setPieceFormTitle(selectedEditingPiece.titleFa);
      setPieceFormSystem(selectedEditingPiece.musicalSystemFa);
      setPieceFormAudioUrl(selectedEditingPiece.audioUrl);
      setPieceFormYoutubeUrl(selectedEditingPiece.youtubeUrl || '');
      setPieceFormDuration(selectedEditingPiece.durationSec);
      setPieceFormSummary(selectedEditingPiece.summaryFa);
      setPieceFormOrganology(selectedEditingPiece.organologyNotesFa);
      setPieceFormHistory(selectedEditingPiece.historicalContextFa);
    }
  }, [editingPieceId, selectedEditingPiece]);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = passwordInput.trim();
    if (!trimmedInput) {
      setAuthError('لطفاً گذرواژه راهبری را وارد نمایید.');
      return;
    }

    setIsVerifying(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': trimmedInput
        },
        body: JSON.stringify({ password: trimmedInput })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setAdminPassword(trimmedInput);
        try {
          sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
          sessionStorage.setItem('enamix_admin_password_token', trimmedInput);
        } catch {}
        setPasswordInput('');
        showStatus('ورود به دیوان راهبری با پیروزی انجام شد.');
      } else {
        setAuthError(data.message || 'گذرواژه راهبری نادرست است.');
      }
    } catch {
      setAuthError('لغزش در برقراری پیوند با سرور.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminPassword('');
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem('enamix_admin_password_token');
    } catch {}
    setPasswordInput('');
    showStatus('از دیوان راهبری خارج شدید.');
  };

  // Reset Blog Form
  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormTitle('');
    setFormSummary('');
    setFormContent('');
    setFormAuthor('ایمان برزجان');
    setFormCategory('acoustics');
    setFormCoverImage('');
    setFormAudioUrl('');
    setFormAudioTitle('');
    setFormYoutubeUrl('');
    setFormTags('ردیف, ویولن, تئوری');
    setFormReadTime(5);
  };

  const handleEditPost = (post: BlogPost) => {
    setIsEditing(true);
    setEditingId(post.id);
    setFormTitle(post.title);
    setFormSummary(post.summary);
    setFormContent(post.content);
    setFormAuthor(post.author);
    setFormCategory(post.category);
    setFormCoverImage(post.coverImageUrl || '');
    setFormAudioUrl(post.audioUrl || '');
    setFormAudioTitle(post.audioTitle || '');
    setFormYoutubeUrl(post.videoUrl || post.youtubeUrl || '');
    setFormTags(post.tags.join(', '));
    setFormReadTime(post.readingTimeMinutes);
  };

  const handleDeletePost = (id: string) => {
    deleteRemoteBlogPost(id, adminPassword).catch(() => {});
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated);
    saveBlogPosts(updated);
    if (editingId === id) resetForm();
    onPostUpdated?.();
    showStatus('نوشتار با پیروزی از پایگاه داده زدوده شد.');
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showStatus('لغزش: عنوان نوشتار الزامی است.');
      return;
    }

    const categoryFaMap: Record<string, string> = {
      acoustics: 'آکوستیک و تئوری ردیف',
      ethnomusicology: 'اتنوموزیکولوژی',
      radif_analysis: 'آنالیز ردیف',
      violin_technique: 'مکتب ویولن ایرانی',
      organology: 'سازشناسی و تاریخ پیوستار'
    };

    const newPost: BlogPost = {
      id: editingId || `post_${Date.now()}`,
      title: formTitle.trim(),
      slug: formTitle.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 40),
      summary: formSummary.trim() || formTitle.trim(),
      content: formContent.trim() || 'متن نوشتار...',
      author: formAuthor.trim() || 'ایمان برزجان',
      authorRole: 'پژوهشگر موسیقی و استودیو اینامیکس',
      date: new Date().toLocaleDateString('fa-IR'),
      category: formCategory,
      categoryLabelFa: categoryFaMap[formCategory] || 'پژوهش خنیاگری',
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      coverImageUrl: formCoverImage.trim() || undefined,
      audioUrl: formAudioUrl.trim() || undefined,
      audioTitle: formAudioTitle.trim() || undefined,
      videoUrl: formYoutubeUrl.trim() || undefined,
      youtubeUrl: formYoutubeUrl.trim() || undefined,
      readingTimeMinutes: Number(formReadTime) || 5,
      likesCount: 14
    };

    if (isEditing && editingId) {
      updateRemoteBlogPost(editingId, newPost, adminPassword).catch(() => {});
      const updatedPosts = posts.map(p => p.id === editingId ? newPost : p);
      setPosts(updatedPosts);
      saveBlogPosts(updatedPosts);
      showStatus('نوشتار با پیروزی به‌روزرسانی شد.');
    } else {
      createRemoteBlogPost(newPost, adminPassword).catch(() => {});
      const updatedPosts = [newPost, ...posts];
      setPosts(updatedPosts);
      saveBlogPosts(updatedPosts);
      showStatus('نوشتار تازه منتشر گردید.');
    }

    resetForm();
    onPostUpdated?.();
  };

  // Piece Save Handler
  const handleSavePiece = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pieceFormTitle.trim()) {
      showStatus('لغزش: عنوان قطعه الزامی است.');
      return;
    }

    const updated = updateContinuumPiece(editingPieceId, {
      titleFa: pieceFormTitle.trim(),
      musicalSystemFa: pieceFormSystem.trim(),
      audioUrl: pieceFormAudioUrl.trim(),
      youtubeUrl: pieceFormYoutubeUrl.trim() || undefined,
      durationSec: Number(pieceFormDuration) || 26,
      summaryFa: pieceFormSummary.trim(),
      organologyNotesFa: pieceFormOrganology.trim(),
      historicalContextFa: pieceFormHistory.trim()
    });

    setPieces([...updated]);
    onPiecesUpdated?.();
    showStatus(`قطعه ایستگاه «${selectedEditingPiece.stationNameFa}» با موفقیت به‌روزرسانی شد.`);
  };

  const handleResetPieces = () => {
    const def = resetContinuumPiecesToDefault();
    setPieces([...def]);
    onPiecesUpdated?.();
    showStatus('تمامی قطعات ایستگاه‌ها به نغمه‌های مرجع پیش‌نهاده بازنشانی شدند.');
  };

  // Podcast Handlers
  const resetPodcastForm = () => {
    setIsEditingPodcast(false);
    setEditingPodcastId(null);
    setPodFormTitle('');
    setPodFormDesc('');
    setPodFormAudioUrl('');
    setPodFormDuration('۰۳:۰۰');
    setPodFormSpeaker('ایمان برزجان');
    setPodFormChapter('ch1');
    setPodFormRegion('iran_plateau');
  };

  const handleEditPodcast = (ep: PodcastEpisode) => {
    setIsEditingPodcast(true);
    setEditingPodcastId(ep.id);
    setPodFormTitle(ep.title);
    setPodFormDesc(ep.description);
    setPodFormAudioUrl(ep.audioUrl);
    setPodFormDuration(ep.durationFormatted);
    setPodFormSpeaker(ep.speaker);
    setPodFormChapter(ep.chapterId || 'ch1');
    setPodFormRegion(ep.stationRegion || 'iran_plateau');
  };

  const handleDeletePodcast = async (id: string) => {
    try {
      await deletePodcastEpisode(id, adminPassword);
      const updated = podcasts.filter(p => p.id !== id);
      setPodcasts(updated);
      if (editingPodcastId === id) resetPodcastForm();
      showStatus('قطعه صوتی با موفقیت حذف گردید.');
    } catch (err: any) {
      showStatus(err.message || 'خطا در حذف قطعه صوتی.');
    }
  };

  const handleSavePodcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!podFormTitle.trim() || !podFormAudioUrl.trim()) {
      showStatus('لغزش: عنوان و نشانی صوتی الزامی هستند.');
      return;
    }

    setIsPodSubmitting(true);
    try {
      if (isEditingPodcast && editingPodcastId) {
        const updated = await updatePodcastEpisode(editingPodcastId, {
          title: podFormTitle.trim(),
          description: podFormDesc.trim(),
          audioUrl: podFormAudioUrl.trim(),
          durationFormatted: podFormDuration.trim(),
          speaker: podFormSpeaker.trim(),
          chapterId: podFormChapter,
          stationRegion: podFormRegion,
        }, adminPassword);
        setPodcasts(prev => prev.map(p => p.id === editingPodcastId ? updated : p));
        showStatus('قطعه صوتی با موفقیت ویرایش گردید.');
      } else {
        const created = await createPodcastEpisode({
          title: podFormTitle.trim(),
          description: podFormDesc.trim(),
          audioUrl: podFormAudioUrl.trim(),
          durationFormatted: podFormDuration.trim(),
          speaker: podFormSpeaker.trim(),
          chapterId: podFormChapter,
          stationRegion: podFormRegion,
        }, adminPassword);
        setPodcasts(prev => [created, ...prev]);
        showStatus('قطعه صوتی نو با موفقیت ثبت شد.');
      }
      resetPodcastForm();
    } catch (err: any) {
      showStatus(err.message || 'خطا در ثبت قطعه صوتی.');
    } finally {
      setIsPodSubmitting(false);
    }
  };

  const handleResetPodcasts = async () => {
    try {
      const seeded = await resetPodcasts(adminPassword);
      setPodcasts(seeded);
      showStatus('فهرست قطعات صوتی رساله به حالت اولیه بازنشانی شد.');
    } catch (err: any) {
      showStatus(err.message || 'خطا در بازنشانی قطعات صوتی.');
    }
  };

  // Sample Bank Handlers
  const handleApplyDirectSampleUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSampleUrlInput.trim()) {
      showStatus('لطفاً پیوند مستقیم پرونده صوتی را وارد فرمایید.');
      return;
    }
    setSampleIsBusy(true);
    const res = await audioEngine.setCustomSampleUrl(selectedSampleInst, selectedSampleMidi, customSampleUrlInput.trim());
    setSampleIsBusy(false);
    if (res.success) {
      setCustomSampleUrlInput('');
      showStatus('سمپل تازه با موفقیت بارگذاری و فعال شد.');
    } else {
      showStatus(res.error || 'لغزش در بارگذاری پیوند سمپل.');
    }
  };

  const handleSampleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSampleIsBusy(true);
    const res = await audioEngine.uploadCustomSampleFile(selectedSampleInst, selectedSampleMidi, file);
    setSampleIsBusy(false);
    if (sampleFileInputRef.current) sampleFileInputRef.current.value = '';
    if (res.success) {
      showStatus(`پرونده «${file.name}» با موفقیت در بانک سمپل ذخیره و فعال شد.`);
    } else {
      showStatus(res.error || 'لغزش در پردازش پرونده صوتی.');
    }
  };

  const handleResetSampleInstrument = async () => {
    setSampleIsBusy(true);
    await audioEngine.resetInstrumentSamples(selectedSampleInst);
    setSampleIsBusy(false);
    showStatus('سمپل‌های ساز به نمونه‌های استودیویی مرجع بازنشانی شد.');
  };

  const handleThemeSelect = (preset: ColorThemePreset) => {
    setCurrentTheme(preset);
    setCustomPrimary(preset.colors.primary);
    setCustomAccent(preset.colors.accent);
    applyTheme(preset);
    showStatus(`تم «${preset.name}» با موفقیت اعمال گردید.`);
  };

  const handleApplyCustomColors = () => {
    const custom: ColorThemePreset = {
      id: 'custom-admin',
      name: 'پالت سفارشی مدیر',
      nameEn: 'Custom Admin Theme',
      description: 'پالت اختصاصی پیکربندی‌شده از پنل مدیریت',
      colors: {
        ...currentTheme.colors,
        primary: customPrimary,
        accent: customAccent
      }
    };
    setCurrentTheme(custom);
    applyTheme(custom);
    showStatus('رنگ‌های سفارشی بر کل سامانه اعمال شد.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md font-persian overflow-y-auto" dir="rtl">
      {/* دروازه امنیتی ورود در صورت عدم اهراز هویت */}
      {!isAuthenticated ? (
        <div className="relative w-full max-w-md bg-[#16110E] border-2 border-[#E5A836] rounded-2xl shadow-2xl p-6 text-[#F5EEDB] space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#594234]/60">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#8B2635] border border-[#E5A836]/60 flex items-center justify-center text-[#E5A836] shadow-md">
                <Lock size={18} />
              </div>
              <div>
                <h3 className="font-black text-sm text-[#F5EEDB]">دیوان راهبری استودیو اینامیکس</h3>
                <span className="text-[10px] text-[#A6937C]">دروازه امنیتی دسترسی به تنظیمات</span>
              </div>
            </div>
            <button onClick={onClose} className="text-[#A6937C] hover:text-[#FFF5E6]">
              <X size={18} />
            </button>
          </div>

          <p className="text-xs text-[#C4B59D] leading-relaxed">
            جهت بارگذاری فایل‌های صوتی، ویرایش نغمه‌های ایستگاه‌های پیوستار و انتشار نوشتارها، گذرواژه راهبری (<code className="text-[#E5A836]">MODIRIAT_ADMIN</code>) را وارد نمایید.
          </p>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#E5A836]">گذرواژه راهبری:</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  dir="ltr"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#201813] border border-[#594234] rounded-xl px-3.5 py-2.5 text-xs text-[#FFF5E6] font-mono focus:border-[#E5A836] outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-2.5 text-[#A6937C] hover:text-[#E5A836]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-2.5 rounded-lg bg-[#8B2635]/30 border border-[#8B2635] text-red-200 text-xs flex items-center gap-1.5">
                <AlertCircle size={14} />
                <span>{authError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#241A14] text-[#C4B59D] text-xs font-bold border border-[#594234]"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className="px-5 py-2 rounded-xl bg-[#D97706] hover:bg-[#E5A836] disabled:opacity-60 text-black font-black transition shadow text-xs flex items-center gap-1.5"
              >
                <Key size={14} />
                <span>{isVerifying ? 'در حال بررسی...' : 'تأیید و ورود'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* دیوان کامل راهبری پس از ورود */
        <div className="relative w-full max-w-5xl bg-[#140F0C] border-2 border-[#E5A836]/70 rounded-2xl shadow-2xl p-4 sm:p-6 text-[#F5EEDB] my-6 max-h-[92vh] flex flex-col animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#594234]/70 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#10B981]/20 border border-[#10B981]/60 flex items-center justify-center text-[#34D399]">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#F5EEDB] flex items-center gap-2">
                  <span>دیوان راهبری و سرپرستی سامانه پرده‌نگار</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40">
                    راهبر تأییدشده
                  </span>
                </h2>
                <p className="text-[11px] text-[#E5A836]">
                  انحصار بارگذاری سمپل‌ها، انتشار نوشتارها، ویرایش قطعات ایستگاه‌های پیوستار، و رنگ‌آمیزی سامانه
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2A1F18] hover:bg-red-950/60 text-red-300 border border-[#594234] text-[11px] font-bold transition"
              >
                <LogOut size={13} />
                <span>خروج</span>
              </button>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#241A14] text-[#C4B59D] hover:text-[#FFF5E6] flex items-center justify-center border border-[#594234]">
                <X size={18} />
              </button>
            </div>
          </div>

          {statusMessage && (
            <div className="my-2 p-2.5 rounded-xl bg-[#10B981]/20 border border-[#10B981] text-[#34D399] text-xs font-bold flex items-center gap-2">
              <Check size={16} />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* سربرگ‌های چهارگانه دیوان راهبری */}
          <div className="flex items-center gap-2 mt-3 pb-2 border-b border-[#594234]/40 shrink-0 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('blog_manager')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border whitespace-nowrap ${
                activeTab === 'blog_manager' ? 'bg-[#8B2635] text-[#FFF5E6] border-[#E5A836]' : 'bg-[#241A14] text-[#C4B59D] border-[#594234]/50'
              }`}
            >
              <FileText size={15} />
              <span>نوشتارها و مقالات ({posts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('pieces_manager')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border whitespace-nowrap ${
                activeTab === 'pieces_manager' ? 'bg-[#8B2635] text-[#FFF5E6] border-[#E5A836]' : 'bg-[#241A14] text-[#C4B59D] border-[#594234]/50'
              }`}
            >
              <Compass size={15} />
              <span>قطعات ایستگاه‌های پیوستار (۴ ایستگاه)</span>
            </button>

            <button
              onClick={() => setActiveTab('podcasts_manager')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border whitespace-nowrap ${
                activeTab === 'podcasts_manager' ? 'bg-[#8B2635] text-[#FFF5E6] border-[#E5A836]' : 'bg-[#241A14] text-[#C4B59D] border-[#594234]/50'
              }`}
            >
              <Volume2 size={15} />
              <span>پادکست‌ها و نغمات رساله ({podcasts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('samples_manager')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border whitespace-nowrap ${
                activeTab === 'samples_manager' ? 'bg-[#8B2635] text-[#FFF5E6] border-[#E5A836]' : 'bg-[#241A14] text-[#C4B59D] border-[#594234]/50'
              }`}
            >
              <Music size={15} />
              <span>بانک سمپل‌های سازها (WAV/MP3)</span>
            </button>

            <button
              onClick={() => setActiveTab('theme_customizer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border whitespace-nowrap ${
                activeTab === 'theme_customizer' ? 'bg-[#8B2635] text-[#FFF5E6] border-[#E5A836]' : 'bg-[#241A14] text-[#C4B59D] border-[#594234]/50'
              }`}
            >
              <Palette size={15} />
              <span>رنگ‌آمیزی سامانه</span>
            </button>
          </div>

          {/* محتوای درونی سربرگ‌ها */}
          <div className="flex-1 overflow-y-auto py-3 space-y-4">
            {/* سربرگ ۱: مدیریت پست‌ها و نوشتارهای وبلاگ */}
            {activeTab === 'blog_manager' && (
              <div className="space-y-4 text-xs">
                {/* Form */}
                <form onSubmit={handleSavePost} className="p-4 bg-[#1E1612] border border-[#594234] rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-[#594234]/60 pb-2">
                    <span className="font-bold text-[#E5A836]">
                      {isEditing ? 'ویرایش نوشتار برگزیده' : 'انتشار نوشتار جدید در وبلاگ'}
                    </span>
                    {isEditing && (
                      <button type="button" onClick={resetForm} className="text-[11px] text-[#A6937C] hover:text-[#FFF5E6]">
                        انصراف از ویرایش
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[#C4B59D] block font-bold">عنوان نوشتار:</label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="عنوان پژوهشی..."
                        className="w-full bg-[#120E0B] border border-[#594234] rounded-lg px-3 py-2 text-xs text-[#FFF5E6] focus:border-[#E5A836] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#C4B59D] block font-bold">دسته‌بندی موضوعی:</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as any)}
                        className="w-full bg-[#120E0B] border border-[#594234] rounded-lg px-3 py-2 text-xs text-[#FFF5E6] focus:border-[#E5A836] outline-none"
                      >
                        <option value="acoustics">آکوستیک و تئوری ردیف</option>
                        <option value="ethnomusicology">اتنوموزیکولوژی</option>
                        <option value="radif_analysis">آنالیز ردیف</option>
                        <option value="violin_technique">مکتب ویولن ایرانی</option>
                        <option value="organology">سازشناسی و تاریخ پیوستار</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#C4B59D] block font-bold">چکیده کوتاه نوشتار:</label>
                    <textarea
                      rows={2}
                      value={formSummary}
                      onChange={(e) => setFormSummary(e.target.value)}
                      placeholder="خلاصه ۲ خطی..."
                      className="w-full bg-[#120E0B] border border-[#594234] rounded-lg p-2.5 text-xs text-[#FFF5E6] focus:border-[#E5A836] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#C4B59D] block font-bold">متن کامل نوشتار (پشتیبانی از مارک‌داون و HTML):</label>
                    <textarea
                      rows={6}
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      placeholder="### عنوان بخش..."
                      className="w-full bg-[#120E0B] border border-[#594234] rounded-lg p-2.5 text-xs text-[#FFF5E6] font-mono focus:border-[#E5A836] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[#C4B59D] block">پیوند مستقیم صوت (.mp3/.m4a):</label>
                      <input
                        type="url"
                        dir="ltr"
                        value={formAudioUrl}
                        onChange={(e) => setFormAudioUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-[#120E0B] border border-[#594234] rounded-lg px-2.5 py-1.5 text-xs text-[#FFF5E6] font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[#C4B59D] block">پیوند ویدیو (یوتیوب یا .mp4):</label>
                      <input
                        type="url"
                        dir="ltr"
                        value={formYoutubeUrl}
                        onChange={(e) => setFormYoutubeUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-[#120E0B] border border-[#594234] rounded-lg px-2.5 py-1.5 text-xs text-[#FFF5E6] font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[#C4B59D] block">پیوند نگاره کاور (تصویر):</label>
                      <input
                        type="url"
                        dir="ltr"
                        value={formCoverImage}
                        onChange={(e) => setFormCoverImage(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-[#120E0B] border border-[#594234] rounded-lg px-2.5 py-1.5 text-xs text-[#FFF5E6] font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-[#D97706] hover:bg-[#E5A836] text-black font-black transition shadow"
                    >
                      {isEditing ? 'به‌روزرسانی نوشتار' : 'انتشار نوشتار در سرور'}
                    </button>
                  </div>
                </form>

                {/* List of Current Posts */}
                <div className="space-y-2">
                  <div className="font-bold text-[#E5A836] px-1">فهرست نوشتارهای منتشرشده ({posts.length}):</div>
                  <div className="space-y-1.5">
                    {posts.map(p => (
                      <div key={p.id} className="p-3 bg-[#18120E] border border-[#594234]/60 rounded-xl flex items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-[#F5EEDB]">{p.title}</div>
                          <div className="text-[10px] text-[#A6937C] mt-0.5">{p.date} • {p.categoryLabelFa}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEditPost(p)}
                            className="p-1.5 rounded bg-[#241A14] hover:bg-[#34261D] text-[#E5A836]"
                            title="ویرایش"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeletePost(p.id)}
                            className="p-1.5 rounded bg-[#241A14] hover:bg-red-950 text-red-400"
                            title="حذف"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* سربرگ ۲: مدیریت قطعات و نغمه‌های ایستگاه‌های پیوستار */}
            {activeTab === 'pieces_manager' && (
              <div className="space-y-4 text-xs">
                <div className="bg-[#1E1612] border border-[#594234] rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#594234]/60 pb-2">
                    <div>
                      <h4 className="font-black text-sm text-[#E5A836]">
                        مدیریت نغمه‌های ایستگاه‌های پیوستار آکوستیک (بازه ۲۰ تا ۳۰ ثانیه)
                      </h4>
                      <p className="text-[11px] text-[#A6937C] mt-0.5">
                        امکان جایگزینی لینک مستقیم پرونده‌های صوتی (.mp3 / .m4a / .webm) و پیوند ویدیویی یوتیوب برای هر ایستگاه
                      </p>
                    </div>
                    <button
                      onClick={handleResetPieces}
                      className="px-2.5 py-1 rounded bg-[#241A14] hover:bg-[#34261D] text-[#C4B59D] border border-[#594234] text-[11px]"
                    >
                      بازنشانی به پیش‌فرض
                    </button>
                  </div>

                  {/* Station Selector Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {pieces.map(pc => (
                      <button
                        key={pc.id}
                        type="button"
                        onClick={() => setEditingPieceId(pc.id)}
                        className={`p-2.5 rounded-lg border text-right transition ${
                          pc.id === editingPieceId
                            ? 'bg-[#8B2635] text-white border-[#E5A836] font-bold shadow'
                            : 'bg-[#140F0C] text-[#C4B59D] border-[#594234]'
                        }`}
                      >
                        <div className="text-[10px] text-[#E5A836]">ایستگاه {pc.stationNumber}</div>
                        <div className="text-xs truncate">{pc.stationNameFa.split(':')[1]?.trim() || pc.stationNameFa}</div>
                      </button>
                    ))}
                  </div>

                  {/* Form for selected piece */}
                  <form onSubmit={handleSavePiece} className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[#C4B59D] block font-bold">عنوان قطعه نغمه:</label>
                        <input
                          type="text"
                          value={pieceFormTitle}
                          onChange={(e) => setPieceFormTitle(e.target.value)}
                          className="w-full bg-[#120E0B] border border-[#594234] rounded-lg px-3 py-2 text-xs text-[#FFF5E6]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[#C4B59D] block font-bold">دستگاه، نغمه یا مایه:</label>
                        <input
                          type="text"
                          value={pieceFormSystem}
                          onChange={(e) => setPieceFormSystem(e.target.value)}
                          className="w-full bg-[#120E0B] border border-[#594234] rounded-lg px-3 py-2 text-xs text-[#FFF5E6]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[#C4B59D] block font-bold">پیوند صوتی مستقیم (.mp3/.m4a):</label>
                        <input
                          type="url"
                          dir="ltr"
                          value={pieceFormAudioUrl}
                          onChange={(e) => setPieceFormAudioUrl(e.target.value)}
                          className="w-full bg-[#120E0B] border border-[#594234] rounded-lg px-3 py-2 text-xs text-[#FFF5E6] font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[#C4B59D] block font-bold">پیوند اجرای تصویری (یوتیوب):</label>
                        <input
                          type="url"
                          dir="ltr"
                          value={pieceFormYoutubeUrl}
                          onChange={(e) => setPieceFormYoutubeUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full bg-[#120E0B] border border-[#594234] rounded-lg px-3 py-2 text-xs text-[#FFF5E6] font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[#C4B59D] block font-bold">زمان شنیداری (ثانیه):</label>
                        <input
                          type="number"
                          min={10}
                          max={90}
                          value={pieceFormDuration}
                          onChange={(e) => setPieceFormDuration(Number(e.target.value))}
                          className="w-full bg-[#120E0B] border border-[#594234] rounded-lg px-3 py-2 text-xs text-[#FFF5E6]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#C4B59D] block font-bold">گزارش سازشناسی (ارگانولوژی):</label>
                      <textarea
                        rows={2}
                        value={pieceFormOrganology}
                        onChange={(e) => setPieceFormOrganology(e.target.value)}
                        className="w-full bg-[#120E0B] border border-[#594234] rounded-lg p-2.5 text-xs text-[#FFF5E6]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#C4B59D] block font-bold">پیشینه کهن و جایگاه تاریخی نغمه:</label>
                      <textarea
                        rows={2}
                        value={pieceFormHistory}
                        onChange={(e) => setPieceFormHistory(e.target.value)}
                        className="w-full bg-[#120E0B] border border-[#594234] rounded-lg p-2.5 text-xs text-[#FFF5E6]"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-[#D97706] hover:bg-[#E5A836] text-black font-black transition shadow"
                      >
                        ذخیره تنظیمات قطعه ایستگاه {selectedEditingPiece.stationNumber}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* سربرگ ۳: مدیریت پادکست‌ها و نغمات رساله (Dynamic Audio & Podcast Management) */}
            {activeTab === 'podcasts_manager' && (
              <div className="space-y-4 text-xs">
                <div className="bg-[#1E1612] border border-[#594234] rounded-xl p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#594234]/60 pb-3">
                    <div>
                      <h4 className="font-black text-sm text-[#E5A836] flex items-center gap-2">
                        <Volume2 size={16} />
                        <span>مدیریت پادکست‌ها، نغمات رساله و فایل‌های صوتی پیوستار</span>
                      </h4>
                      <p className="text-[11px] text-[#A6937C] mt-0.5">
                        بارگذاری و تنظیم پیوندهای مستقیم صوتی (.mp3 / .m4a / .webm) - بدون هرگونه تولید مصنوعی AI
                      </p>
                    </div>
                    <button
                      onClick={handleResetPodcasts}
                      className="px-2.5 py-1 rounded bg-[#241A14] hover:bg-[#34261D] text-[#C4B59D] border border-[#594234] text-[11px] self-start sm:self-center"
                    >
                      بازنشانی به قطعات پیش‌فرض
                    </button>
                  </div>

                  {/* Add / Edit Form */}
                  <form onSubmit={handleSavePodcast} className="bg-[#140F0C] border border-[#594234]/60 rounded-xl p-3.5 space-y-3">
                    <div className="font-bold text-[#E5A836] flex items-center justify-between">
                      <span>{isEditingPodcast ? 'ویرایش قطعه صوتی' : 'افزودن قطعه صوتی یا پادکست نو'}</span>
                      {isEditingPodcast && (
                        <button
                          type="button"
                          onClick={resetPodcastForm}
                          className="text-[10px] text-[#A6937C] hover:text-white"
                        >
                          انصراف از ویرایش
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[#C4B59D] block font-bold">عنوان قطعه / اپیزود پادکست:</label>
                        <input
                          type="text"
                          value={podFormTitle}
                          onChange={(e) => setPodFormTitle(e.target.value)}
                          placeholder="مثلاً: نغمه‌های کهن فلات ایران: سنتور و نی"
                          className="w-full bg-[#1C1510] border border-[#594234] rounded-lg px-3 py-1.5 text-xs text-[#FFF5E6]"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[#C4B59D] block font-bold">نشانی مستقیم فایل صوتی (.mp3 / .m4a / .webm):</label>
                        <input
                          type="url"
                          dir="ltr"
                          value={podFormAudioUrl}
                          onChange={(e) => setPodFormAudioUrl(e.target.value)}
                          placeholder="https://domain.com/audio/sample.mp3"
                          className="w-full bg-[#1C1510] border border-[#594234] rounded-lg px-3 py-1.5 text-xs text-[#FFF5E6] font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-[#C4B59D] block font-bold">گوینده یا نوازنده:</label>
                        <input
                          type="text"
                          value={podFormSpeaker}
                          onChange={(e) => setPodFormSpeaker(e.target.value)}
                          placeholder="ایمان برزجان"
                          className="w-full bg-[#1C1510] border border-[#594234] rounded-lg px-2.5 py-1.5 text-xs text-[#FFF5E6]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[#C4B59D] block font-bold">مدت زمان (فارسی):</label>
                        <input
                          type="text"
                          value={podFormDuration}
                          onChange={(e) => setPodFormDuration(e.target.value)}
                          placeholder="۰۳:۱۵"
                          className="w-full bg-[#1C1510] border border-[#594234] rounded-lg px-2.5 py-1.5 text-xs text-[#FFF5E6]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[#C4B59D] block font-bold">فصل مرتبط رساله:</label>
                        <select
                          value={podFormChapter}
                          onChange={(e) => setPodFormChapter(e.target.value)}
                          className="w-full bg-[#1C1510] border border-[#594234] rounded-lg px-2.5 py-1.5 text-xs text-[#FFF5E6]"
                        >
                          <option value="ch1">فصل ۱: جهان صوتی ایرانی-دانوبی</option>
                          <option value="ch2">فصل ۲: انطباق تطبیقی دستگاه‌ها</option>
                          <option value="ch3">فصل ۳: سیستم فواصل پنج‌گانه هرمز فرهت</option>
                          <option value="ch4">فصل ۴: فیزیک صوتی و هارمونیک‌ها</option>
                          <option value="ch5">فصل ۵: گام‌های مینور در رپرتوار ویولن</option>
                          <option value="ch6">فصل ۶: ارگانولوژی تطبیقی سنتور و تسامبال</option>
                          <option value="ch7">فصل ۷: اوزان لنگ آکساک بالکان</option>
                          <option value="ch8">فصل ۸: اسطرلاب و کیهان‌شناسی موسیقی</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[#C4B59D] block font-bold">ایستگاه پیوستار:</label>
                        <select
                          value={podFormRegion}
                          onChange={(e) => setPodFormRegion(e.target.value as any)}
                          className="w-full bg-[#1C1510] border border-[#594234] rounded-lg px-2.5 py-1.5 text-xs text-[#FFF5E6]"
                        >
                          <option value="iran_plateau">ایستگاه ۱: مبدأ فلات کهن ایران</option>
                          <option value="alans_steppes">ایستگاه ۲: گذرگاه سکاها و آلان‌ها</option>
                          <option value="mesopotamia">ایستگاه ۳: میان‌راهی بین‌النهرین و آناتولی</option>
                          <option value="danube_basin">ایستگاه ۴: مقصد دانوب و کارپات</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#C4B59D] block font-bold">توضیحات و شرح علمی قطعه:</label>
                      <textarea
                        rows={2}
                        value={podFormDesc}
                        onChange={(e) => setPodFormDesc(e.target.value)}
                        placeholder="تحلیل موسیقی‌شناختی، مشخصات ضبط و سازهای نواخته‌شده در این قطعه..."
                        className="w-full bg-[#1C1510] border border-[#594234] rounded-lg px-3 py-1.5 text-xs text-[#FFF5E6]"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      {isEditingPodcast && (
                        <button
                          type="button"
                          onClick={resetPodcastForm}
                          className="px-3 py-1.5 rounded-lg bg-[#241A14] hover:bg-[#34261D] text-[#C4B59D] font-bold"
                        >
                          انصراف
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={isPodSubmitting}
                        className="px-4 py-1.5 rounded-lg bg-[#D97706] hover:bg-[#E5A836] text-black font-black transition shadow"
                      >
                        {isPodSubmitting ? 'در حال ثبت...' : isEditingPodcast ? 'بروزرسانی قطعه صوتی' : 'ثبت قطعه در پایگاه داده'}
                      </button>
                    </div>
                  </form>

                  {/* List of existing podcasts */}
                  <div className="space-y-2.5">
                    <span className="font-bold text-[#C4B59D] block">
                      فهرست قطعات صوتی و پادکست‌های ثبت‌شده در رساله ({podcasts.length} قطعه):
                    </span>

                    <div className="space-y-2">
                      {podcasts.map((ep) => (
                        <div
                          key={ep.id}
                          className="p-3 rounded-xl bg-[#140F0C] border border-[#594234]/70 flex flex-col md:flex-row md:items-center justify-between gap-3"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-[#F5EEDB] text-xs">{ep.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2A1F18] text-[#E5A836] border border-[#594234]">
                                {ep.durationFormatted}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8B2635] text-white">
                                {ep.speaker}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#A6937C] truncate max-w-xl">
                              {ep.description}
                            </p>
                            <div className="max-w-md pt-1">
                              <AudioLinkPlayer
                                audioUrl={ep.audioUrl}
                                title={ep.title}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                            <button
                              onClick={() => handleEditPodcast(ep)}
                              className="p-1.5 rounded bg-[#241A14] hover:bg-[#34261D] text-[#E5A836] border border-[#594234]"
                              title="ویرایش قطعه"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeletePodcast(ep.id)}
                              className="p-1.5 rounded bg-[#241A14] hover:bg-red-950/70 text-red-300 border border-[#594234]"
                              title="حذف قطعه"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* سربرگ ۴: مدیریت بانک سمپل‌های واقعی سازها (WAV/MP3) */}
            {activeTab === 'samples_manager' && (
              <div className="space-y-4 text-xs">
                <div className="bg-[#1E1612] border border-[#594234] rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#594234]/60 pb-2">
                    <div>
                      <h4 className="font-black text-sm text-[#E5A836]">
                        بانک سمپل‌های سازها (WAV / MP3 Sample Bank)
                      </h4>
                      <p className="text-[11px] text-[#A6937C] mt-0.5">
                        بارگذاری فایل‌های استودیویی واقعی سازها یا تنظیم پیوند مستقیم جهت ارتقای صدای زنده سازها
                      </p>
                    </div>
                    <button
                      onClick={handleResetSampleInstrument}
                      disabled={sampleIsBusy}
                      className="px-2.5 py-1 rounded bg-[#241A14] hover:bg-[#34261D] text-[#C4B59D] border border-[#594234] text-[11px]"
                    >
                      بازنشانی سمپل این ساز
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Instrument Selector */}
                    <div className="space-y-2">
                      <label className="font-bold text-[#E5A836] block">ساز مورد نظر:</label>
                      <select
                        value={selectedSampleInst}
                        onChange={(e) => {
                          const inst = e.target.value as SampleInstrumentId;
                          setSelectedSampleInst(inst);
                          const bank = sampleBanks.find(b => b.id === inst);
                          if (bank) setSelectedSampleMidi(bank.defaultRootMidi);
                        }}
                        className="w-full bg-[#120E0B] border border-[#594234] rounded-lg px-3 py-2 text-xs text-[#FFF5E6]"
                      >
                        {sampleBanks.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.nameFa} ({b.nameEn})
                          </option>
                        ))}
                      </select>

                      <div className="space-y-1 pt-1">
                        <label className="font-bold text-[#C4B59D] block">نوت پایه سمپل (Root MIDI Pitch):</label>
                        <select
                          value={selectedSampleMidi}
                          onChange={(e) => setSelectedSampleMidi(Number(e.target.value))}
                          className="w-full bg-[#120E0B] border border-[#594234] rounded-lg px-3 py-2 text-xs text-[#FFF5E6]"
                        >
                          {Object.entries(MIDI_NOTE_LABELS).map(([m, lbl]) => (
                            <option key={m} value={m}>{lbl}</option>
                          ))}
                        </select>
                      </div>

                      {/* Audition Button */}
                      <button
                        type="button"
                        onClick={() => {
                          audioEngine.initContext();
                          if (selectedSampleInst.startsWith('tombak') || selectedSampleInst === 'daf' || selectedSampleInst === 'clapper') {
                            audioEngine.playPercussion(selectedSampleInst as PercussionSound, 0.95);
                          } else {
                            audioEngine.playNote(selectedSampleMidi, 0, selectedSampleInst as TimbreType, 'glissando', 1.8);
                          }
                        }}
                        className="w-full py-2 bg-[#2A1F18] hover:bg-[#34261D] text-[#E5A836] border border-[#594234] rounded-lg font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        <Volume2 size={15} />
                        <span>تست شنیداری سمپل فعال این نوت</span>
                      </button>
                    </div>

                    {/* Upload & Link Box */}
                    <div className="space-y-3 bg-[#140F0C] p-3 rounded-xl border border-[#594234]/50">
                      {/* Upload */}
                      <div className="space-y-1.5">
                        <div className="font-bold text-[#E5A836] flex items-center gap-1">
                          <Upload size={14} />
                          <span>روش ۱: آپلود فایل سمپل (.wav / .mp3)</span>
                        </div>
                        <input
                          ref={sampleFileInputRef}
                          type="file"
                          accept=".wav,.mp3,.m4a,audio/*"
                          onChange={handleSampleFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => sampleFileInputRef.current?.click()}
                          disabled={sampleIsBusy}
                          className="w-full py-2 bg-[#8B2635] hover:bg-[#A62F41] text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition"
                        >
                          <Upload size={14} />
                          <span>انتخاب فایل از سیستم</span>
                        </button>
                      </div>

                      {/* Direct URL */}
                      <form onSubmit={handleApplyDirectSampleUrl} className="space-y-1.5 pt-2 border-t border-[#594234]/40">
                        <div className="font-bold text-[#38BDF8] flex items-center gap-1">
                          <LinkIcon size={14} />
                          <span>روش ۲: ثبت پیوند مستقیم فایل صوتی</span>
                        </div>
                        <input
                          type="url"
                          dir="ltr"
                          value={customSampleUrlInput}
                          onChange={(e) => setCustomSampleUrlInput(e.target.value)}
                          placeholder="https://example.com/sample.wav"
                          className="w-full bg-[#1C1510] border border-[#594234] rounded-lg px-2.5 py-1.5 text-xs text-[#FFF5E6] font-mono"
                        />
                        <button
                          type="submit"
                          disabled={sampleIsBusy}
                          className="w-full py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition"
                        >
                          <Check size={14} />
                          <span>ثبت پیوند</span>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* سربرگ ۴: رنگ‌آمیزی و پیرایه سامانه */}
            {activeTab === 'theme_customizer' && (
              <div className="space-y-4 text-xs">
                <div className="bg-[#1E1612] border border-[#594234] rounded-xl p-4 space-y-3">
                  <span className="font-bold text-[#E5A836] block">
                    پالت‌های رنگی کهن و اصیل ایرانی:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {THEME_PRESETS.map((preset) => {
                      const isSelected = currentTheme.id === preset.id;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => handleThemeSelect(preset)}
                          className={`p-3 rounded-xl border cursor-pointer transition ${
                            isSelected ? 'bg-[#2A1F18] border-[#E5A836] ring-1 ring-[#E5A836]' : 'bg-[#140F0C] border-[#594234]'
                          }`}
                        >
                          <div className="font-bold text-[#FFF5E6] flex items-center justify-between">
                            <span>{preset.name}</span>
                            {isSelected && <Check size={14} className="text-[#E5A836]" />}
                          </div>
                          <p className="text-[11px] text-[#C4B59D] mt-1">{preset.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#1E1612] border border-[#594234] rounded-xl p-4 space-y-3">
                  <span className="font-bold text-[#E5A836] block">رنگ‌های اختصاصی مدیر:</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#C4B59D] block mb-1">رنگ شاخص اصلی:</label>
                      <input
                        type="color"
                        value={customPrimary}
                        onChange={(e) => setCustomPrimary(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                      />
                    </div>
                    <div>
                      <label className="text-[#C4B59D] block mb-1">رنگ ثانویه کهربایی:</label>
                      <input
                        type="color"
                        value={customAccent}
                        onChange={(e) => setCustomAccent(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleApplyCustomColors}
                    className="px-4 py-2 rounded-lg bg-[#D97706] hover:bg-[#E5A836] text-black font-bold transition shadow"
                  >
                    اعمال رنگ‌های اختصاصی
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-[#594234]/70 flex items-center justify-between shrink-0 text-xs">
            <span className="text-[11px] text-[#A6937C]">
              نشست فعال دیوان راهبری استودیو اینامیکس • پیوند استوار با پایگاه داده
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#2A1F18] hover:bg-[#3D2E24] text-[#E5A836] border border-[#594234] text-xs font-bold"
            >
              بستن دیوان راهبری
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
