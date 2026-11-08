/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * گریف تعاملی سازهای سنتی ایران: تار، سه‌تار، تنبور و سنتور
 * نمایشگر پرده‌های ۲۸ گانه زه روده، خرک‌های ۹ گانه سنتور و درجات ریزپرده‌ای کُرُن/سُری
 * مؤلف: ایمان برزجان | استودیو اینامیکس (EnamiX)
 */

import React from 'react';
import { DastgahScale, ClassicalScale } from '../utils/pardeheNegarData';
import { audioEngine, TimbreType } from '../utils/audioEngine';

export type TraditionalInstrumentType = 'tar' | 'setar' | 'tanbur' | 'santur';

interface PersianFretboardProps {
  instrumentType: TraditionalInstrumentType;
  currentScale?: DastgahScale | ClassicalScale | null;
  soundTimbre?: TimbreType;
  onNotePlayed?: (midi: number) => void;
}

// 28 Frets of Tar & Setar (پرده‌های ۲۸ گانه)
const TAR_SETAR_FRETS = [
  { fret: 0, name: 'سیم رها (دست‌باز)', cent: 0, semitone: 0 },
  { fret: 1, name: 'ر کُرن (Mujannab)', cent: -45, semitone: 1 },
  { fret: 2, name: 'ر بمل', cent: 0, semitone: 1 },
  { fret: 3, name: 'ر بکار', cent: 0, semitone: 2 },
  { fret: 4, name: 'می کُرن', cent: -50, semitone: 3 },
  { fret: 5, name: 'می بمل', cent: 0, semitone: 3 },
  { fret: 6, name: 'می بکار', cent: 0, semitone: 4 },
  { fret: 7, name: 'فا بکار', cent: 0, semitone: 5 },
  { fret: 8, name: 'فا سری', cent: 50, semitone: 5 },
  { fret: 9, name: 'فا دیز', cent: 0, semitone: 6 },
  { fret: 10, name: 'سل کُرن', cent: -45, semitone: 6 },
  { fret: 11, name: 'سل بکار (پنجم درست)', cent: 0, semitone: 7 },
  { fret: 12, name: 'لا کُرن', cent: -50, semitone: 8 },
  { fret: 13, name: 'لا بمل', cent: 0, semitone: 8 },
  { fret: 14, name: 'لا بکار', cent: 0, semitone: 9 },
  { fret: 15, name: 'سی کُرن (شاه‌گوشه شور)', cent: -45, semitone: 10 },
  { fret: 16, name: 'سی بمل', cent: 0, semitone: 10 },
  { fret: 17, name: 'سی بکار', cent: 0, semitone: 11 },
  { fret: 18, name: 'دو (اکتاو هنگام)', cent: 0, semitone: 12 },
  { fret: 19, name: 'ر کُرن اکتاو', cent: -45, semitone: 13 },
  { fret: 20, name: 'ر بکار اکتاو', cent: 0, semitone: 14 },
  { fret: 21, name: 'می کُرن اکتاو', cent: -50, semitone: 15 },
  { fret: 22, name: 'می بکار اکتاو', cent: 0, semitone: 16 },
  { fret: 23, name: 'فا بکار اکتاو', cent: 0, semitone: 17 },
  { fret: 24, name: 'سل بکار اکتاو', cent: 0, semitone: 19 },
  { fret: 25, name: 'لا کُرن اکتاو', cent: -50, semitone: 20 },
  { fret: 26, name: 'سی کُرن اکتاو', cent: -45, semitone: 22 },
  { fret: 27, name: 'دو اکتاو دوم', cent: 0, semitone: 24 },
];

export const PersianFretboard: React.FC<PersianFretboardProps> = ({
  instrumentType,
  currentScale,
  soundTimbre = 'setar',
  onNotePlayed,
}) => {
  const isPersian = Boolean(currentScale && 'microCents' in currentScale);
  const scaleNotes = currentScale?.notes || [];
  const microCents = isPersian ? (currentScale as DastgahScale).microCents || {} : {};

  // Strings definition
  const strings = React.useMemo(() => {
    if (instrumentType === 'tar') {
      return [
        { id: 'tar_white', name: 'سیم‌های سفید (دو C4)', baseMidi: 60, color: '#F5EEDB' },
        { id: 'tar_yellow', name: 'سیم‌های زرد (سل G3)', baseMidi: 55, color: '#E5A836' },
        { id: 'tar_bass', name: 'سیم‌های بم و مشتاق (دو C3/C4)', baseMidi: 48, color: '#C4B59D' },
      ];
    } else if (instrumentType === 'setar') {
      return [
        { id: 'setar_white', name: 'سیم یکم سفید (دو C4)', baseMidi: 60, color: '#F5EEDB' },
        { id: 'setar_yellow', name: 'سیم دوم زرد (سل G3)', baseMidi: 55, color: '#E5A836' },
        { id: 'setar_moshtagh', name: 'سیم سوم مشتاق (دو C4)', baseMidi: 60, color: '#F5EEDB' },
        { id: 'setar_bass', name: 'سیم چهارم بم (دو C3)', baseMidi: 48, color: '#C4B59D' },
      ];
    } else if (instrumentType === 'tanbur') {
      return [
        { id: 'tanbur_1', name: 'سیم اول (فا F3 یا سل G3)', baseMidi: 55, color: '#E5A836' },
        { id: 'tanbur_2', name: 'سیم دوم (دو C4)', baseMidi: 60, color: '#F5EEDB' },
        { id: 'tanbur_3', name: 'سیم سوم (دو C4)', baseMidi: 60, color: '#F5EEDB' },
      ];
    }
    return [];
  }, [instrumentType]);

  const handlePlayFretNote = (midi: number, cent: number) => {
    audioEngine.playNote(
      midi,
      cent,
      instrumentType === 'tar' ? 'setar' : instrumentType === 'setar' ? 'setar' : 'santur',
      'glissando',
      1.5
    );
    onNotePlayed?.(midi);
  };

  if (instrumentType === 'santur') {
    // 9 Yellow & 9 White Bridges of Santur (خرک‌های ۹ گانه سنتور)
    const yellowBridges = [
      { num: 1, name: 'می E3', midi: 52, pc: 4 },
      { num: 2, name: 'فا F3', midi: 53, pc: 5 },
      { num: 3, name: 'سل G3', midi: 55, pc: 7 },
      { num: 4, name: 'لا کُرن / بکار A3', midi: 57, pc: 9, isMicro: true },
      { num: 5, name: 'سی کُرن / بمل B3', midi: 59, pc: 11, isMicro: true },
      { num: 6, name: 'دو C4', midi: 60, pc: 0 },
      { num: 7, name: 'ر D4', midi: 62, pc: 2 },
      { num: 8, name: 'می کُرن / بمل E4', midi: 64, pc: 4, isMicro: true },
      { num: 9, name: 'فا F4', midi: 65, pc: 5 },
    ];

    const whiteBridges = [
      { num: 1, name: 'می E4', midi: 64, pc: 4 },
      { num: 2, name: 'فا F4', midi: 65, pc: 5 },
      { num: 3, name: 'سل G4', midi: 67, pc: 7 },
      { num: 4, name: 'لا کُرن / بکار A4', midi: 69, pc: 9, isMicro: true },
      { num: 5, name: 'سی کُرن / بمل B4', midi: 71, pc: 11, isMicro: true },
      { num: 6, name: 'دو C5', midi: 72, pc: 0 },
      { num: 7, name: 'ر D5', midi: 74, pc: 2 },
      { num: 8, name: 'می کُرن / بمل E5', midi: 76, pc: 4, isMicro: true },
      { num: 9, name: 'فا F5', midi: 77, pc: 5 },
    ];

    return (
      <div className="w-full bg-[#1A130E] border-2 border-[#594234] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#594234]/60 pb-2">
          <span className="font-bold text-[#E5A836] text-xs sm:text-sm flex items-center gap-2">
            <span>🎼 صفحه طنینی سنتور ۷۲ سیمه سل‌کوک • ۱۸ خرک چوب گردو</span>
          </span>
          <span className="text-[11px] text-[#A6937C]">خرک‌های زرد (راست) و خرک‌های سفید (چپ)</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Yellow Bridges (سمت راست - سیم‌های برنزی زرد) */}
          <div className="bg-[#140F0C] border border-[#E5A836]/40 rounded-xl p-3 space-y-2">
            <span className="text-xs font-bold text-[#E5A836] block border-b border-[#594234]/40 pb-1">
              🟡 پوزیسیون خرک‌های زرد (سیم‌های بم فسفربرنز)
            </span>
            <div className="space-y-1.5">
              {yellowBridges.map(b => {
                const isActive = scaleNotes.includes(b.pc);
                const cent = microCents[b.pc] || 0;
                return (
                  <button
                    key={b.num}
                    onClick={() => handlePlayFretNote(b.midi, cent)}
                    className={`w-full p-2 rounded-lg flex items-center justify-between text-xs transition border ${
                      isActive
                        ? 'bg-[#8B2635] text-white border-[#E5A836] shadow-md font-bold'
                        : 'bg-[#1C1510] text-[#C4B59D] border-[#594234]/50 hover:bg-[#2A1F18]'
                    }`}
                  >
                    <span>خرک {b.num}: {b.name}</span>
                    <span className="text-[10px] font-mono opacity-80">{b.midi} MIDI</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* White Bridges (سمت چپ - سیم‌های فولادی سفید) */}
          <div className="bg-[#140F0C] border border-[#C4B59D]/40 rounded-xl p-3 space-y-2">
            <span className="text-xs font-bold text-[#F5EEDB] block border-b border-[#594234]/40 pb-1">
              ⚪ پوزیسیون خرک‌های سفید (سیم‌های زیر فولادی)
            </span>
            <div className="space-y-1.5">
              {whiteBridges.map(b => {
                const isActive = scaleNotes.includes(b.pc);
                const cent = microCents[b.pc] || 0;
                return (
                  <button
                    key={b.num}
                    onClick={() => handlePlayFretNote(b.midi, cent)}
                    className={`w-full p-2 rounded-lg flex items-center justify-between text-xs transition border ${
                      isActive
                        ? 'bg-[#8B2635] text-white border-[#E5A836] shadow-md font-bold'
                        : 'bg-[#1C1510] text-[#C4B59D] border-[#594234]/50 hover:bg-[#2A1F18]'
                    }`}
                  >
                    <span>خرک {b.num}: {b.name}</span>
                    <span className="text-[10px] font-mono opacity-80">{b.midi} MIDI</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fretted Neck for Tar, Setar, Tanbur
  return (
    <div className="w-full bg-[#1A130E] border-2 border-[#594234] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-[#594234]/60 pb-2">
        <span className="font-bold text-[#E5A836] text-xs sm:text-sm flex items-center gap-2">
          <span>🪕 گریف و دستان‌بندی {instrumentType === 'tar' ? 'تار ایرانی' : instrumentType === 'setar' ? 'سه‌تار' : 'تنبور'}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8B2635] text-white">
            ۲۸ پرده زه روده گوسفند
          </span>
        </span>
        <span className="text-[11px] text-[#A6937C]">روی پرده‌های درخشان کلیک کنید تا طنین کوک را بشنوید</span>
      </div>

      {/* Strings Row */}
      <div className="space-y-3">
        {strings.map(st => (
          <div key={st.id} className="bg-[#140F0C] p-2.5 rounded-xl border border-[#594234]/60 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#EDE0C8]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: st.color }} />
                <span>{st.name}</span>
              </span>
              <button
                onClick={() => handlePlayFretNote(st.baseMidi, 0)}
                className="text-[10px] px-2 py-0.5 rounded bg-[#2A1F18] hover:bg-[#3D2E24] text-[#E5A836] border border-[#594234]"
              >
                ▶ سیم دست‌باز
              </button>
            </div>

            {/* Horizontal Fret Row */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
              {TAR_SETAR_FRETS.slice(0, 19).map(f => {
                const noteMidi = st.baseMidi + f.semitone;
                const notePc = noteMidi % 12;
                const isInScale = scaleNotes.includes(notePc);
                const cent = microCents[notePc] || f.cent;
                const isMicro = f.cent !== 0 || cent !== 0;

                return (
                  <button
                    key={f.fret}
                    onClick={() => handlePlayFretNote(noteMidi, cent)}
                    className={`shrink-0 px-2 py-1.5 rounded-md text-[10px] transition border flex flex-col items-center justify-center min-w-[54px] ${
                      isInScale
                        ? isMicro
                          ? 'bg-[#D97706] text-black font-black border-[#FFE082] shadow-lg'
                          : 'bg-[#8B2635] text-white font-bold border-[#E5A836] shadow-md'
                        : 'bg-[#1C1510] text-[#7A6A58] border-[#3D2E24]/60 hover:text-[#C4B59D]'
                    }`}
                    title={`پرده ${f.fret}: ${f.name} • ${noteMidi} MIDI`}
                  >
                    <span className="truncate max-w-[48px]">{f.name.split(' ')[0]}</span>
                    <span className="text-[9px] opacity-75 font-mono">{f.fret === 0 ? '۰' : f.fret}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
