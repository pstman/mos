/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * تالار فواصل، کالیبراسیون سُنت‌ها و درآمدهای ردیف موسیقی ایرانی
 * هم‌زمانی دیداری و شنیداری هندسه تونال، ریزپرده‌ها و رپرتوار کهن
 * 
 * سلسله‌مراتب ارجاع علمی (قانون قطعی):
 * ۱. مرجع اول و اصلی: رساله و متدولوژی پژوهشی ایمان برزجان (EnamiX)
 * ۲. مرجع دوم: دکتر هرمز فرهت (Hormoz Farhat - The Dastgah Concept)
 * ۳. مرجع سوم: دکتر مهدی برکشلی (Dr. Mehdi Barkeshli)
 */

import React, { useState } from 'react';
import { 
  PERSIAN_DASTGAH_DATA, 
  DastgahScale, 
  NOTE_NAMES, 
  AUTHOR_CREDITS,
  ClassicalPieceRepertoire
} from '../utils/pardeheNegarData';
import { audioEngine, TimbreType } from '../utils/audioEngine';
import { PianoKeyboard } from './PianoKeyboard';
import { ViolinFingerboard } from './ViolinFingerboard';
import { PersianFretboard } from './PersianFretboard';
import { 
  Volume2, 
  Play, 
  Square, 
  BookOpen, 
  Sliders, 
  CheckCircle2, 
  Layers, 
  Compass, 
  Music, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface CentsCalibrationHallProps {
  selectedDastgahId?: string;
  onSelectDastgah?: (dastgah: DastgahScale) => void;
  soundTimbre?: TimbreType;
  onOpenTreatise?: () => void;
}

export const CentsCalibrationHall: React.FC<CentsCalibrationHallProps> = ({
  selectedDastgahId,
  onSelectDastgah,
  soundTimbre = 'setar',
  onOpenTreatise
}) => {
  const [activeDastgahId, setActiveDastgahId] = useState<string>(selectedDastgahId || PERSIAN_DASTGAH_DATA[0].id);
  const [activeSubTab, setActiveSubTab] = useState<'calibration_matrix' | 'daramad_repertoire'>('calibration_matrix');
  const [activeVisualizer, setActiveVisualizer] = useState<'piano' | 'violin' | 'fretboard'>('fretboard');
  const [highlightedMidi, setHighlightedMidi] = useState<number | null>(null);
  const [isPlayingScaleSequence, setIsPlayingScaleSequence] = useState<boolean>(false);
  const [playingPieceId, setPlayingPieceId] = useState<string | null>(null);

  const currentDastgah: DastgahScale = 
    PERSIAN_DASTGAH_DATA.find(d => d.id === activeDastgahId) || PERSIAN_DASTGAH_DATA[0];

  const rootPc = currentDastgah.notes[0];
  const tonicMidi = 60 + rootPc;

  // Degrees 1 to 8 ascending sequence
  const scaleRows = [
    ...currentDastgah.notes.map((pc, idx) => {
      const semitonesFromTonic = (pc - rootPc + 12) % 12;
      const midi = tonicMidi + semitonesFromTonic;
      const microCent = currentDastgah.microCents?.[pc] || 0;
      const freq = audioEngine.midiToFreq(midi, microCent);
      const intervalCents = semitonesFromTonic * 100 + microCent - (currentDastgah.microCents?.[rootPc] || 0);
      const isShahed = currentDastgah.shahedMidi ? (currentDastgah.shahedMidi % 12 === pc) : false;
      const isIst = currentDastgah.istMidi ? (currentDastgah.istMidi % 12 === pc) : false;
      const isMicro = microCent !== 0;

      let farhatCode = 'M (دوم بزرگ)';
      if (idx === 0) {
        farhatCode = 'P1 (پایه / هم‌صدا • ۰¢)';
      } else if (isMicro) {
        farhatCode = microCent < 0
          ? `n (دوم خنثی کُرُن • ${Math.round(intervalCents)}¢)`
          : `N (دوم خنثای بزرگ سُری • ${Math.round(intervalCents)}¢)`;
      } else if (idx === 3) {
        farhatCode = `P4 (چهارم درست • ${Math.round(intervalCents)}¢)`;
      } else if (idx === 4) {
        farhatCode = `P5 (پنجم درست • ${Math.round(intervalCents)}¢)`;
      } else {
        farhatCode = `${Math.round(intervalCents)}¢ نسبت به پایه`;
      }

      const noteNameObj = NOTE_NAMES[pc];
      const defaultLabel = noteNameObj
        ? `${noteNameObj.natural || noteNameObj.sharp || ''} (${noteNameObj.solfege})`
        : `نوت ${pc}`;
      const displayLabel = currentDastgah.microLabels?.[pc]?.letter || defaultLabel;

      return {
        degreeLabel: `درجه ${idx + 1}`,
        displayLabel,
        isMicro,
        microCent,
        freq,
        midi,
        farhatCode,
        isShahed,
        isIst,
        intervalCents,
        pc
      };
    }),
    // Degree 8: Octave
    (() => {
      const pc = rootPc;
      const midi = tonicMidi + 12;
      const microCent = currentDastgah.microCents?.[pc] || 0;
      const freq = audioEngine.midiToFreq(midi, microCent);
      const noteNameObj = NOTE_NAMES[pc];
      const baseName = currentDastgah.microLabels?.[pc]?.letter ||
        `${noteNameObj?.natural || noteNameObj?.sharp || ''} (${noteNameObj?.solfege || ''})`;
      const displayLabel = `${baseName} (هنگـام)`;

      return {
        degreeLabel: 'درجه ۸ (هنگام / اکتاو)',
        displayLabel,
        isMicro: microCent !== 0,
        microCent,
        freq,
        midi,
        farhatCode: 'P8 (هنگام درست • ۱۲۰۰¢)',
        isShahed: Boolean(currentDastgah.shahedMidi && (currentDastgah.shahedMidi % 12 === pc)),
        isIst: Boolean(currentDastgah.istMidi && (currentDastgah.istMidi % 12 === pc)),
        intervalCents: 1200,
        pc
      };
    })()
  ];

  const handlePlaySingleDegree = (midi: number, cent: number) => {
    setHighlightedMidi(midi);
    audioEngine.playNote(
      midi,
      cent,
      soundTimbre === 'piano' ? 'setar' : soundTimbre,
      'glissando',
      1.2
    );
    setTimeout(() => setHighlightedMidi(null), 600);
  };

  const handlePlayScaleAscending = () => {
    if (isPlayingScaleSequence) {
      audioEngine.stopAll();
      setIsPlayingScaleSequence(false);
      setHighlightedMidi(null);
      return;
    }

    setIsPlayingScaleSequence(true);
    const midis = scaleRows.map(r => r.midi);
    const microCentsMap = currentDastgah.microCents || {};

    audioEngine.playScaleSequence(
      midis,
      microCentsMap,
      soundTimbre === 'piano' ? 'setar' : soundTimbre,
      'glissando',
      (m) => setHighlightedMidi(m),
      () => {
        setIsPlayingScaleSequence(false);
        setHighlightedMidi(null);
      }
    );
  };

  const handlePlayPiece = (piece: ClassicalPieceRepertoire) => {
    if (playingPieceId === piece.id) {
      audioEngine.stopAll();
      setPlayingPieceId(null);
      return;
    }

    setPlayingPieceId(piece.id);
    audioEngine.playMotifMelody(
      piece.motifMelody,
      soundTimbre === 'piano' ? 'setar' : soundTimbre,
      115,
      undefined,
      () => setPlayingPieceId(null)
    );
  };

  const handleSelectDastgah = (dastgah: DastgahScale) => {
    setActiveDastgahId(dastgah.id);
    onSelectDastgah?.(dastgah);
  };

  return (
    <div className="w-full space-y-5 font-persian" dir="rtl">
      {/* Editorial Header Banner */}
      <div className="bg-[#1C1612] rounded-2xl border-2 border-[#594234] p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#2A1F18] border border-[#E5A836] flex items-center justify-center text-2xl shadow">
              ⚖️
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#F5EEDB]">
                تالار فواصل، کالیبراسیون سُنت‌ها و درآمدهای ردیف
              </h2>
              <p className="text-xs sm:text-sm text-[#C4B59D]">
                سامانه دیداری-شنیداری هندسه تونال، اندازه‌گیری آزمایشگاهی انحراف سنت‌ها و رپرتوار درآمدها
              </p>
            </div>
          </div>

          {onOpenTreatise && (
            <button
              onClick={onOpenTreatise}
              className="px-3.5 py-2 rounded-xl bg-[#8B2635] hover:bg-[#A32D3F] text-white border border-[#E5A836]/40 text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shadow"
            >
              <BookOpen size={14} />
              <span>مطالعه رساله پژوهشی و مراجع</span>
            </button>
          )}
        </div>

        {/* سه‌گانه مراجع علمی آکادمیک (قانون قطعی و سلسله‌مراتب ارجاع) */}
        <div className="bg-[#140F0C] border border-[#E5A836]/40 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E5A836]">
            <ShieldCheck size={15} />
            <span>سلسله‌مراتب ارجاع علمی و کالیبراسیون فواصل:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
            <div className="p-2.5 rounded-lg bg-[#201813] border border-[#E5A836]/50 space-y-1">
              <span className="font-bold text-[#E5A836] block">
                ۱. مرجع اول و اصلی: رساله پژوهشی ایمان برزجان (EnamiX)
              </span>
              <p className="text-[#C4B59D] leading-relaxed">
                متدولوژی بردار مدال، تطبیق دقیق گریف و کلاویه، و اندازه‌گیری انحراف فرکانس‌های ردیف با خطای کمتر از ۱ سنت.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-[#201813] border border-[#594234]/60 space-y-1">
              <span className="font-bold text-[#F5EEDB] block">
                ۲. مرجع دوم: دکتر هرمز فرهت (Hormoz Farhat)
              </span>
              <p className="text-[#C4B59D] leading-relaxed">
                سیستم فواصل پنج‌گانه ردیف (m, n, N, M, P) در دانشگاه کمبریج و ابطال نظریه ۲۴ ربع‌پرده مساوی کلنل وزیری.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-[#201813] border border-[#594234]/60 space-y-1">
              <span className="font-bold text-[#F5EEDB] block">
                ۳. مرجع سوم: دکتر مهدی برکشلی (Dr. Mehdi Barkeshli)
              </span>
              <p className="text-[#C4B59D] leading-relaxed">
                گام صفی‌الدین ارموی و فارابی، نسبت‌های بقیه و مجنب و ساختار پرده‌های ۲۲ گانه گریف سازهای سنتی.
              </p>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#594234]/50">
          <button
            onClick={() => setActiveSubTab('calibration_matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              activeSubTab === 'calibration_matrix'
                ? 'bg-[#8B2635] text-white border-[#E5A836] shadow-md'
                : 'bg-[#241A14] text-[#C4B59D] border-[#594234]/50 hover:bg-[#2C211B]'
            }`}
          >
            <Sliders size={14} />
            <span>کالیبراسیون سُنت‌ها و هندسه تونال ردیف</span>
          </button>

          <button
            onClick={() => setActiveSubTab('daramad_repertoire')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              activeSubTab === 'daramad_repertoire'
                ? 'bg-[#8B2635] text-white border-[#E5A836] shadow-md'
                : 'bg-[#241A14] text-[#C4B59D] border-[#594234]/50 hover:bg-[#2C211B]'
            }`}
          >
            <Music size={14} />
            <span>گنجینه پیش‌درآمدها، درآمدها و گوشه‌ها ({PERSIAN_DASTGAH_DATA.length} دستگاه)</span>
          </button>
        </div>
      </div>

      {/* Dastgah Selector Bar */}
      <div className="bg-[#16110E] border border-[#594234]/60 rounded-xl p-3 space-y-2">
        <span className="text-xs font-bold text-[#E5A836] block">
          انتخاب دستگاه یا آواز جهت کالیبراسیون فواصل و شنیدن نغمات:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {PERSIAN_DASTGAH_DATA.map(dastgah => {
            const isSelected = activeDastgahId === dastgah.id;
            return (
              <button
                key={dastgah.id}
                onClick={() => handleSelectDastgah(dastgah)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#D97706] text-black font-black border-[#FFE082] shadow-md scale-105'
                    : 'bg-[#241A14] text-[#C4B59D] border-[#594234]/50 hover:bg-[#2C211B]'
                }`}
              >
                {dastgah.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: Cents Calibration & Dynamic Simultaneous Geometry */}
      {activeSubTab === 'calibration_matrix' && (
        <div className="space-y-4">
          {/* Visual Instrument Selector */}
          <div className="bg-[#1C1612] border border-[#594234] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#EDE0C8]">
              <Layers size={15} className="text-[#E5A836]" />
              <span>انتخاب نمایشگر هم‌زمان برای مشاهده هندسه تونال:</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveVisualizer('fretboard')}
                className={`px-3 py-1 rounded-lg font-bold border transition ${
                  activeVisualizer === 'fretboard'
                    ? 'bg-[#8B2635] text-white border-[#E5A836]'
                    : 'bg-[#241A14] text-[#C4B59D] border-[#594234]'
                }`}
              >
                🪕 گریف تار و سه‌تار (۲۸ پرده)
              </button>
              <button
                onClick={() => setActiveVisualizer('piano')}
                className={`px-3 py-1 rounded-lg font-bold border transition ${
                  activeVisualizer === 'piano'
                    ? 'bg-[#8B2635] text-white border-[#E5A836]'
                    : 'bg-[#241A14] text-[#C4B59D] border-[#594234]'
                }`}
              >
                🎹 کلاویه‌های پیانو (۵۱ کلید)
              </button>
              <button
                onClick={() => setActiveVisualizer('violin')}
                className={`px-3 py-1 rounded-lg font-bold border transition ${
                  activeVisualizer === 'violin'
                    ? 'bg-[#8B2635] text-white border-[#E5A836]'
                    : 'bg-[#241A14] text-[#C4B59D] border-[#594234]'
                }`}
              >
                🎻 گریف ویولن صبا
              </button>
            </div>
          </div>

          {/* Render Selected Dynamic Instrument */}
          <div className="bg-[#120E0B] p-3 rounded-2xl border border-[#594234]/70 shadow-lg">
            {activeVisualizer === 'fretboard' && (
              <PersianFretboard
                instrumentType="setar"
                currentScale={currentDastgah}
                soundTimbre={soundTimbre}
                onNotePlayed={(m) => setHighlightedMidi(m)}
              />
            )}
            {activeVisualizer === 'piano' && (
              <PianoKeyboard
                currentScale={currentDastgah}
                isPersian={true}
                soundTimbre={soundTimbre}
                articulation="glissando"
                namingMode="letter"
                accidentalMode="auto"
                highlightedMidi={highlightedMidi}
                onKeyPlayed={(_name, midi) => setHighlightedMidi(midi)}
              />
            )}
            {activeVisualizer === 'violin' && (
              <ViolinFingerboard
                currentScale={currentDastgah}
                isPersian={true}
                soundTimbre={soundTimbre}
                articulation="glissando"
                namingMode="letter"
                onNotePlayed={(_name, midi) => setHighlightedMidi(midi)}
              />
            )}
          </div>

          {/* Matrix Calibration Table */}
          <div className="bg-[#1A130E] border-2 border-[#594234] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#594234]/70 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#F5EEDB]">
                  جدول کالیبراسیون دقیق ۸ مرتبه گام دستگاه «{currentDastgah.name}»
                </h3>
                <p className="text-[11px] text-[#A6937C]">
                  تمامی درجات به صورت صعودی و یکنواخت از پایه تا اکتاو مرتب شده‌اند
                </p>
              </div>

              <button
                onClick={handlePlayScaleAscending}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow ${
                  isPlayingScaleSequence
                    ? 'bg-[#EF4444] text-white animate-pulse'
                    : 'bg-[#D97706] hover:bg-[#E5A836] text-black font-black'
                }`}
              >
                {isPlayingScaleSequence ? <Square size={14} /> : <Play size={14} />}
                <span>{isPlayingScaleSequence ? 'توقف اجرای گام' : 'شنیدن توالی صعودی و نزولی گام'}</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#594234]/60">
              <table className="w-full text-xs text-right border-collapse">
                <thead className="bg-[#241A14] text-[#F5EEDB]">
                  <tr>
                    <th className="p-3">مرتبه</th>
                    <th className="p-3">نام پرده</th>
                    <th className="p-3">بسامد (Hz)</th>
                    <th className="p-3">فاصله سِنت نسبت به پایه</th>
                    <th className="p-3">رده‌بندی هرمز فرهت</th>
                    <th className="p-3">نقش ملودیک</th>
                    <th className="p-3 text-center">شنیدن تک‌نوت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#594234]/30">
                  {scaleRows.map((row, idx) => {
                    const isLit = highlightedMidi === row.midi;
                    return (
                      <tr
                        key={idx}
                        className={`transition ${
                          isLit 
                            ? 'bg-[#8B2635]/40 text-[#FFF5E6]' 
                            : 'hover:bg-[#201813]'
                        }`}
                      >
                        <td className="p-3 font-bold text-[#F5EEDB]">{row.degreeLabel}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            row.isMicro ? 'bg-[#D97706]/30 text-[#FFE082] border border-[#D97706]' : 'text-[#EDE0C8]'
                          }`}>
                            {row.displayLabel}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-[#E5A836]">
                          {Math.round(row.freq * 100) / 100} Hz
                        </td>
                        <td className="p-3 font-mono text-[#34D399]">
                          {Math.round(row.intervalCents)}¢
                        </td>
                        <td className="p-3 text-[#EDE0C8]">{row.farhatCode}</td>
                        <td className="p-3">
                          {row.isShahed && (
                            <span className="px-2 py-0.5 rounded bg-[#8B5CF6]/30 text-[#C4B5FD] font-bold text-[10px] ml-1">
                              شاهد
                            </span>
                          )}
                          {row.isIst && (
                            <span className="px-2 py-0.5 rounded bg-[#10B981]/30 text-[#6EE7B7] font-bold text-[10px]">
                              ایست
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handlePlaySingleDegree(row.midi, row.microCent)}
                            className="p-1.5 rounded-lg bg-[#2A201A] hover:bg-[#8B2635] text-[#E5A836] hover:text-white border border-[#594234] transition shadow"
                            title={`شنیدن طنین ${row.displayLabel}`}
                          >
                            <Volume2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Daramad Repertoire & Motifs */}
      {activeSubTab === 'daramad_repertoire' && (
        <div className="space-y-4">
          <div className="bg-[#1C1612] border border-[#594234] rounded-2xl p-4 sm:p-5 shadow-xl space-y-2">
            <h3 className="font-black text-sm sm:text-base text-[#F5EEDB] flex items-center gap-2">
              <Music size={16} className="text-[#E5A836]" />
              <span>رپرتوار گوشه‌ها و پیش‌درآمدهای دستگاه «{currentDastgah.name}»</span>
            </h3>
            <p className="text-xs text-[#C4B59D]">
              روی هر قطعه کلیک کنید تا موتیف و درجات آن بر روی کلاویه‌ها و گریف پخش شود:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentDastgah.repertoire.map((piece) => {
              const isPlaying = playingPieceId === piece.id;
              return (
                <div
                  key={piece.id}
                  className={`bg-[#1A130E] border-2 rounded-2xl p-4 space-y-3 transition shadow-lg ${
                    isPlaying 
                      ? 'border-[#E5A836] bg-[#221711] ring-1 ring-[#E5A836]' 
                      : 'border-[#594234]/70 hover:border-[#E5A836]/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-black text-sm text-[#F5EEDB]">
                        {piece.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-[#A6937C] mt-0.5">
                        <span>آهنگساز / روایت: {piece.composer}</span>
                        <span>•</span>
                        <span className="text-[#E5A836]">{piece.meter}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlayPiece(piece)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow ${
                        isPlaying
                          ? 'bg-[#EF4444] text-white animate-pulse'
                          : 'bg-[#D97706] hover:bg-[#E5A836] text-black font-black'
                      }`}
                    >
                      {isPlaying ? <Square size={13} /> : <Play size={13} />}
                      <span>{isPlaying ? 'توقف' : 'شنیدن موتیف'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-[#C4B59D] leading-relaxed bg-[#140F0C] p-2.5 rounded-xl border border-[#594234]/40">
                    {piece.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
