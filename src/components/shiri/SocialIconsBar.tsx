import React, { useState } from 'react';
import { SocialLink, SocialPlatformId } from '../../utils/shiriData';
import { Check, Edit3, Plus, Trash2 } from 'lucide-react';

interface SocialIconsBarProps {
  socials: SocialLink[];
  isVisualEditMode?: boolean;
  onUpdateSocials?: (nextSocials: SocialLink[]) => void;
}

/**
 * Precision Brand SVG Icons for Mostafa Shiri's Global Music & Social Platforms
 */
export const PlatformSvgIcon: React.FC<{ platform: SocialPlatformId; className?: string }> = ({
  platform,
  className = 'w-5 h-5',
}) => {
  switch (platform) {
    case 'spotify':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.305-1.76-8.786-.963-.335.077-.67-.133-.746-.469-.077-.334.132-.67.469-.745 3.809-.87 7.076-.496 9.713 1.115.293.18.386.563.207.855zm1.224-2.722c-.226.367-.706.482-1.072.257-2.687-1.652-6.785-2.131-9.965-1.166-.413.127-.848-.106-.973-.517-.125-.413.108-.848.52-.973 3.632-1.102 8.147-.568 11.234 1.328.366.226.48.707.256 1.071zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71c-.493.15-1.016-.129-1.166-.623-.148-.495.13-1.016.625-1.166 3.532-1.073 9.404-.866 13.115 1.337.445.264.59.838.327 1.282-.264.443-.838.59-1.283.327z" />
        </svg>
      );
    case 'apple':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.96 6.33c.67-.81 1.12-1.94 1-3.08-.96.04-2.13.64-2.82 1.45-.61.7-.11 1.86-.99 2.97 1.08.08 2.14-.53 2.81-1.34" />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case 'telegram':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      );
    case 'amazon':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M14.5 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h3V3h-5zm-8.2 15.2c3.5 2.4 8.7 2.6 12.6.6.3-.15.6.2.35.48-3.3 3.1-9.5 3.1-13.2.2-.3-.25-.05-.65.25-.48z" />
        </svg>
      );
    case 'deezer':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M18.81 4.16v3.03H24V4.16h-5.19zM6.27 8.38v3.027h5.189V8.38h-5.19zm12.54 0v3.027H24V8.38h-5.19zM6.27 12.594v3.027h5.189v-3.027h-5.19zm6.271 0v3.027h5.19v-3.027h-5.19zm6.27 0v3.027H24v-3.027h-5.19zM0 16.81v3.029h5.19V16.81H0zm6.27 0v3.029h5.189V16.81h-5.19zm6.271 0v3.029h5.19V16.81h-5.19zm6.27 0v3.029H24V16.81h-5.19z" />
        </svg>
      );
    case 'tidal':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12.012 3.992L8.008 7.996 4.004 3.992 0 7.996 4.004 12l4.004-4.004L12.012 12l-4.004 4.004 4.004 4.004 4.004-4.004L12.012 12l4.004-4.004-4.004-4.004zm8.008 0L16.016 7.996 20.02 12l4.004-4.004-4.004-4.004z" />
        </svg>
      );
    default:
      return null;
  }
};

export const SocialIconsBar: React.FC<SocialIconsBarProps> = ({
  socials,
  isVisualEditMode = false,
  onUpdateSocials,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempLabel, setTempLabel] = useState('');
  const [tempUrl, setTempUrl] = useState('');
  const [tempPlatform, setTempPlatform] = useState<SocialPlatformId>('spotify');

  const startEdit = (soc: SocialLink) => {
    setEditingId(soc.id);
    setTempLabel(soc.label);
    setTempUrl(soc.url);
    setTempPlatform(soc.platform);
  };

  const saveEdit = () => {
    if (!editingId || !onUpdateSocials) return;
    const next = socials.map((s) =>
      s.id === editingId
        ? { ...s, label: tempLabel.trim() || s.label, url: tempUrl.trim() || s.url, platform: tempPlatform }
        : s
    );
    onUpdateSocials(next);
    setEditingId(null);
  };

  const deleteSoc = (id: string) => {
    if (!onUpdateSocials) return;
    onUpdateSocials(socials.filter((s) => s.id !== id));
    setEditingId(null);
  };

  const addNewSoc = () => {
    if (!onUpdateSocials) return;
    const newItem: SocialLink = {
      id: `soc-${Date.now()}`,
      platform: 'instagram',
      label: 'شبکه جدید',
      url: 'https://instagram.com/MostafaShiri_Music',
    };
    onUpdateSocials([...socials, newItem]);
    startEdit(newItem);
  };

  return (
    <div id="socials" className="relative py-2.5 px-4 flex flex-col items-center">
      <div
        dir="ltr"
        className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-4xl mx-auto"
      >
        {socials.map((soc) => (
          <div key={soc.id} className="relative group">
            <a
              href={isVisualEditMode ? '#edit-social' : soc.url}
              target={isVisualEditMode ? undefined : '_blank'}
              rel={isVisualEditMode ? undefined : 'noopener noreferrer'}
              onClick={(e) => {
                if (isVisualEditMode) {
                  e.preventDefault();
                  startEdit(soc);
                }
              }}
              title={soc.label}
              aria-label={soc.label}
              className={`w-10 h-10 rounded-full bg-[var(--bg-card)] border flex items-center justify-center text-[var(--color-gold)] transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:bg-[var(--color-gold)] hover:text-[#050505] hover:shadow-[0_8px_25px_rgba(214,179,108,0.4)] ${
                isVisualEditMode
                  ? 'border-dashed border-[var(--color-gold)] ring-2 ring-[var(--color-gold)]/20'
                  : 'border-[var(--color-border)] hover:border-[var(--color-gold)]'
              }`}
            >
              <PlatformSvgIcon platform={soc.platform} className="w-4 h-4" />
            </a>

            {/* Tooltip Label */}
            <span className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono-num text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
              {soc.label}
            </span>

            {isVisualEditMode && (
              <span className="pointer-events-none absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--color-gold)] text-[#050505] flex items-center justify-center shadow">
                <Edit3 className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        ))}

        {isVisualEditMode && (
          <button
            type="button"
            onClick={addNewSoc}
            title="افزودن شبکه اجتماعی جدید"
            className="w-12 h-12 rounded-full border border-dashed border-[var(--color-gold)] text-[var(--color-gold)] flex items-center justify-center hover:bg-[var(--color-gold)]/15 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Inline Visual Editor Popover for Selected Social Icon */}
      {isVisualEditMode && editingId && (
        <div className="mt-6 w-full max-w-md rounded-2xl bg-[var(--bg-card)] border border-[var(--color-gold)] p-4 shadow-2xl z-30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--color-gold)]">
              ویرایش مستقیم آیکون شبکه اجتماعی
            </span>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="text-xs text-[var(--text-muted)] hover:text-white cursor-pointer"
            >
              بستن
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
            <select
              value={tempPlatform}
              onChange={(e) => setTempPlatform(e.target.value as SocialPlatformId)}
              className="px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--color-border)] text-xs text-[var(--text-main)]"
            >
              <option value="spotify">Spotify (اسپاتیفای)</option>
              <option value="apple">Apple Music (اپل موزیک)</option>
              <option value="youtube">YouTube (یوتیوب)</option>
              <option value="instagram">Instagram (اینستاگرام)</option>
              <option value="telegram">Telegram (تلگرام)</option>
              <option value="amazon">Amazon Music (آمازون موزیک)</option>
              <option value="deezer">Deezer (دیزر)</option>
              <option value="tidal">Tidal (تایدال)</option>
            </select>
            <input
              type="text"
              value={tempLabel}
              onChange={(e) => setTempLabel(e.target.value)}
              placeholder="عنوان (مثلاً Spotify)"
              className="px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--color-border)] text-xs text-[var(--text-main)]"
            />
          </div>
          <input
            type="url"
            dir="ltr"
            value={tempUrl}
            onChange={(e) => setTempUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--color-border)] text-xs font-mono-num text-[var(--text-main)] mb-3"
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={saveEdit}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--color-gold)] text-[#050505] font-bold text-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>تأیید</span>
            </button>
            <button
              type="button"
              onClick={() => deleteSoc(editingId)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-500/40 text-red-400 text-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف آیکون</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
