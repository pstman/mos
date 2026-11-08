/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * پنل تعاملی سازها و گالری زیبایی‌شناسی موزه‌ای (Instrument Showcase & Museum Aesthetic Panel)
 * انطباق پویا بین کلاویه‌های پیانو، گریف ویولن، دسته ۲۸ پرده‌ای تار و سه‌تار، و صفحه طنینی سنتور
 * مؤلف و طراح: ایمان برزجان | استودیو اینامیکس (EnamiX)
 */

import React, { useState } from 'react';
import { PianoKeyboard } from './PianoKeyboard';
import { ViolinFingerboard } from './ViolinFingerboard';
import { PersianFretboard, TraditionalInstrumentType } from './PersianFretboard';
import { DastgahScale, ClassicalScale, PERSIAN_DASTGAH_DATA, NOTE_NAMES } from '../utils/pardeheNegarData';
import { audioEngine, TimbreType, ArticulationType } from '../utils/audioEngine';
import { Sparkles, Compass, Music, BookOpen, Volume2 } from 'lucide-react';

export type DisplayInstrumentType = 'piano' | 'violin' | 'tar' | 'setar' | 'tanbur' | 'santur';

interface InstrumentMetadata {
  id: DisplayInstrumentType;
  nameFa: string;
  categoryFa: string;
  hornbostelSachs: string;
  materialsFa: string;
  resonanceRangeHz: string;
  historicalEra: string;
  literatureQuote: string;
  quoteAuthor: string;
  badgeEmoji: string;
}

const INSTRUMENT_MUSEUM_DATA: Record<DisplayInstrumentType, InstrumentMetadata> = {
  piano: {
    id: 'piano',
    nameFa: 'پیانو کنسرتی (Piano Forte)',
    categoryFa: 'کُردوفون ضربه‌ای کلاویه‌ای (شهری-اروپایی)',
    hornbostelSachs: '۳۱۴.۱۲۲ (کلاویکورد و پیانو با مکانیزم چکش)',
    materialsFa: 'کلاف چدن فشرده، صفحه صداگیر صنوبر آلپ، کلاویه‌های آبنوس و عاج مصنوعی',
    resonanceRangeHz: '۲۷.۵ هرتز (A0) تا ۴۱۸۶ هرتز (C8)',
    historicalEra: 'اختراع بارتولومئو کریستوفوری (۱۷۰۰ میلادی) در فلورانس ایتالیا',
    literatureQuote: '«پیانو چون آینه‌ای بزرگ است که هم هارمونی منظم باخ را بازمی‌تاباند و هم در دستان مرتضی محجوبی، به کوک راست‌پنجگاه و همایون تسلیم می‌شود.»',
    quoteAuthor: 'رساله پیانو در ردیف ایرانی • ایمان برزجان',
    badgeEmoji: '🎹'
  },
  violin: {
    id: 'violin',
    nameFa: 'ویولن کلاسیک و ایرانی (Violin)',
    categoryFa: 'کُردوفون زهی مالشی بدون پرده (آرشه‌ای)',
    hornbostelSachs: '۳۲۱.۳۲۲-۷۱ (کمانچه و لوت‌های آرشه‌ای با گریف صاف)',
    materialsFa: 'صفحه رو کاج ایتالیایی، صفحه زیر و دسته افرا موج‌دار، گریف آبنوس، آرشه با موی دم اسب مغولی',
    resonanceRangeHz: '۱۹۶ هرتز (G3) تا ۳۵۰۰+ هرتز (E7)',
    historicalEra: 'تکامل‌یافته در کرمونا توسط استرادیواری و آماتی؛ بومی‌شده در ایران توسط ابوالحسن صبا',
    literatureQuote: '«ویولن در موسیقی ایرانی نه یک ساز وارداتی، که تداوم زنده صدای کمانچه است؛ با این تفاوت که شفافیت آکوستیک آن امکان اجرای زیرترین فواصل کُرن و سُری را محقق ساخت.»',
    quoteAuthor: 'استاد ابوالحسن صبا',
    badgeEmoji: '🎻'
  },
  tar: {
    id: 'tar',
    nameFa: 'تار ایرانی (Persian Tar)',
    categoryFa: 'کُردوفون زهی زخمه‌ای دوکاسه با کاسه پوستی',
    hornbostelSachs: '۳۲۱.۳۲۲ (لوت دسته‌بلند کاسه طنینی مرکب)',
    materialsFa: 'کاسه و نقاره از چوب کهنه توت، دسته گردو با استخوان شتر، پوست بره تودلی، خرک شاخ کل',
    resonanceRangeHz: '۱۳۰ هرتز (C3) تا ۱۰۴۶ هرتز (C6)',
    historicalEra: 'ساسانی و دربار صفوی، با تکامل نهایی شش‌سیمه در عهد قاجار توسط درویش‌خان',
    literatureQuote: '«تار شاه‌ساز ردیف است؛ طنین نقاره و کاسه‌اش ضربان قلب فرهنگ فلات ایران را بازگو می‌کند.»',
    quoteAuthor: 'میرزا عبدالله فراهانی',
    badgeEmoji: '🪕'
  },
  setar: {
    id: 'setar',
    nameFa: 'سه‌تار (Persian Setar)',
    categoryFa: 'کُردوفون دسته‌بلند چوبی زخمه‌ای (ناخنی)',
    hornbostelSachs: '۳۲۱.۳۲۱ (لوت دسته‌بلند کاسه یکپارچه چوبی)',
    materialsFa: 'کاسه چوب توت خطی، صفحه روزنه‌دار توت، دسته گردو با ۲۸ پرده زه روده گوسفند',
    resonanceRangeHz: '۱۳۰ هرتز (C3) تا ۸۸۰ هرتز (A5)',
    historicalEra: 'قرون نخستین اسلامی، سیم چهارم افزوده درویش مشتاق‌علی‌شاه در قرن سیزدهم هجری',
    literatureQuote: '«سه‌تار برای یک نفر کم و برای دو نفر زیاد است؛ نجوای باطن و خلوتگاه عرفانی خنیاگر است.»',
    quoteAuthor: 'احمد عبادی',
    badgeEmoji: '🪕'
  },
  tanbur: {
    id: 'tanbur',
    nameFa: 'تنبور باستانی (Kurdish Tanbur)',
    categoryFa: 'کُردوفون دسته‌بلند آیینی زهی با پنجه‌نوازی (شرّ)',
    hornbostelSachs: '۳۲۱.۳۲۱ (لوت باستانی بدون پوست با شیوه مضراب‌نوازی پنجه‌ای)',
    materialsFa: 'کاسه ترکه یا چنگ چوب توت کهنه گوران، صفحه صنوبر، ۳ سیم فولادی',
    resonanceRangeHz: '۱۴۶ هرتز (D3) تا ۶۵۹ هرتز (E5)',
    historicalEra: 'هزاره دوم پیش از میلاد در بین‌النهرین و کرمانشاه؛ کهن‌ترین ساز زهی حفظ‌شده',
    literatureQuote: '«بانگ گردش‌های چرخ است این که خلق / می‌سرایندش به طنبور و به حلق»',
    quoteAuthor: 'مولانا جلال‌الدین بلخی',
    badgeEmoji: '🎸'
  },
  santur: {
    id: 'santur',
    nameFa: 'سنتور کهن و تسامبال (Santur & Țambal)',
    categoryFa: 'کُردوفون زهی ضربه‌ای با مضراب‌های نمددار',
    hornbostelSachs: '۳۱۴.۱۲۲ (زیتار جعبه‌ای ذوزنقه‌ای با خرک‌های متحرک)',
    materialsFa: 'کلاف گردوی تیره، صفحه توت یا آزاد کهنه، ۷۲ سیم برنزی و فولادی، مضراب‌های چوب عناب',
    resonanceRangeHz: '۱۶۴ هرتز (E3) تا ۱۱۷۴ هرتز (D6)',
    historicalEra: 'آشور و بابل کهن؛ نیای مستقیم تسامبال کنسرتی دانوب و هارپسیکورد اروپا',
    literatureQuote: '«مضراب سنتور چون قطرات باران بهاری بر کوه‌های زاگرس و کارپات فرود می‌آید.»',
    quoteAuthor: 'استاد حبیب سماعی',
    badgeEmoji: '🎼'
  }
};

interface InstrumentShowcasePanelProps {
  currentScale?: DastgahScale | ClassicalScale | null;
  soundTimbre: TimbreType;
  articulation: ArticulationType;
  namingMode: 'letter' | 'solfege';
  onKeyPlayed: (noteName: string, midi: number, freq: number) => void;
}

export const InstrumentShowcasePanel: React.FC<InstrumentShowcasePanelProps> = ({
  currentScale,
  soundTimbre,
  articulation,
  namingMode,
  onKeyPlayed
}) => {
  const [selectedInst, setSelectedInst] = useState<DisplayInstrumentType>('piano');
  const effectiveScale = currentScale || PERSIAN_DASTGAH_DATA[0];
  const isPersian = Boolean('microCents' in effectiveScale);

  const museumMeta = INSTRUMENT_MUSEUM_DATA[selectedInst];

  return (
    <div className="w-full space-y-4 font-persian" dir="rtl">
      {/* Top Instrument Selector Bar */}
      <div className="bg-[#1C1612] border-2 border-[#594234] rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎻</span>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#F5EEDB]">
              نمایشگر تعاملی سازها و گریف‌های ردیف
            </h3>
            <p className="text-[11px] text-[#A6937C]">
              برای تغییر گریف و مشاهده انطباق نُت‌ها، ساز مورد نظر را برگزینید:
            </p>
          </div>
        </div>

        {/* Instrument Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {(['piano', 'violin', 'tar', 'setar', 'tanbur', 'santur'] as DisplayInstrumentType[]).map(inst => {
            const meta = INSTRUMENT_MUSEUM_DATA[inst];
            const isSelected = selectedInst === inst;
            return (
              <button
                key={inst}
                onClick={() => setSelectedInst(inst)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap border ${
                  isSelected
                    ? 'bg-[#8B2635] text-white border-[#E5A836] shadow-lg scale-105'
                    : 'bg-[#241A14] text-[#C4B59D] border-[#594234]/60 hover:bg-[#2C211B]'
                }`}
              >
                <span>{meta.badgeEmoji}</span>
                <span>{meta.nameFa.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Interactive Fingerboard / Keys (Left 8 Cols) + Museum Aesthetic Panel (Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Interactive Instrument View (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {selectedInst === 'piano' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#E5A836] px-1">
                <span>صفحه کلاویه‌های پیانو (۵۱ کلاویه استاندارد از F2 تا G6):</span>
                <span className="text-[#A6937C]">کلاویه‌های روشن‌شونده با انطباق فرکانس</span>
              </div>
              <PianoKeyboard
                currentScale={effectiveScale}
                isPersian={isPersian}
                soundTimbre={soundTimbre}
                articulation={articulation}
                namingMode={namingMode}
                accidentalMode="auto"
                highlightedMidi={null}
                onKeyPlayed={onKeyPlayed}
              />
            </div>
          )}

          {selectedInst === 'violin' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#E5A836] px-1">
                <span>گریف ویولن، کوک‌های ۴ سیم و پرده‌بندی فواصل:</span>
                <span className="text-[#A6937C]">سیم ۱ (می) تا سیم ۴ (سل/دو)</span>
              </div>
              <ViolinFingerboard
                currentScale={effectiveScale}
                isPersian={isPersian}
                soundTimbre={soundTimbre}
                articulation={articulation}
                namingMode={namingMode}
                onNotePlayed={onKeyPlayed}
              />
            </div>
          )}

          {(selectedInst === 'tar' || selectedInst === 'setar' || selectedInst === 'tanbur' || selectedInst === 'santur') && (
            <PersianFretboard
              instrumentType={selectedInst as TraditionalInstrumentType}
              currentScale={effectiveScale}
              soundTimbre={soundTimbre}
              onNotePlayed={(midi) => onKeyPlayed(NOTE_NAMES[midi % 12]?.natural || 'نوت', midi, audioEngine.midiToFreq(midi))}
            />
          )}
        </div>

        {/* Museum Aesthetic Exhibition Card (4 cols) */}
        <div className="lg:col-span-4 bg-gradient-to-b from-[#241A14] to-[#140F0C] border-2 border-[#E5A836]/60 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#594234]/70 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">{museumMeta.badgeEmoji}</span>
              <div>
                <h4 className="font-black text-sm sm:text-base text-[#F5EEDB]">
                  {museumMeta.nameFa}
                </h4>
                <span className="text-[10px] text-[#E5A836] block font-mono">
                  {museumMeta.hornbostelSachs}
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8B2635] text-white font-bold">
              موزه ساز
            </span>
          </div>

          {/* Organological Anatomical Specs */}
          <div className="space-y-2 text-xs">
            <div className="bg-[#1C1510] p-2.5 rounded-xl border border-[#594234]/40 space-y-1">
              <span className="text-[#A6937C] text-[10px] block font-bold">کالبدشناسی و متریال:</span>
              <p className="text-[#EDE0C8] text-[11px] leading-relaxed">
                {museumMeta.materialsFa}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-[#1C1510] p-2 rounded-lg border border-[#594234]/40">
                <span className="text-[#A6937C] block">گستره فرکانسی:</span>
                <span className="font-bold text-[#E5A836] font-mono text-[11px]">
                  {museumMeta.resonanceRangeHz}
                </span>
              </div>

              <div className="bg-[#1C1510] p-2 rounded-lg border border-[#594234]/40">
                <span className="text-[#A6937C] block">خاستگاه و تکامل:</span>
                <span className="font-bold text-[#F5EEDB] text-[11px]">
                  {museumMeta.historicalEra}
                </span>
              </div>
            </div>
          </div>

          {/* Literary / Treatise Citation */}
          <div className="p-3 rounded-xl bg-[#1A120D] border-r-4 border-[#8B2635] text-xs text-[#C4B59D] space-y-1.5 leading-relaxed">
            <p className="italic text-[#F5EEDB] text-[11px]">
              {museumMeta.literatureQuote}
            </p>
            <span className="text-[10px] text-[#E5A836] block font-bold text-left" dir="ltr">
              — {museumMeta.quoteAuthor}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
