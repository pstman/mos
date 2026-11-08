/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * راهنمای تخصصی کالیبراسیون سنت‌ها و فواصل میکروتونال ردیف
 * تطبیق دقیق با رساله دکتر هرمز فرهت، مهدی برکشلی و ردیف صبا
 */

import React, { useState } from 'react';
import { Volume2, X, Info, CheckCircle2, Play, Square } from 'lucide-react';
import { DastgahScale, PERSIAN_DASTGAH_DATA, NOTE_NAMES } from '../utils/pardeheNegarData';
import { audioEngine } from '../utils/audioEngine';

interface MicrotonalCentsGuideProps {
  isOpen: boolean;
  onClose: () => void;
  currentScale?: DastgahScale | null;
}

export const MicrotonalCentsGuide: React.FC<MicrotonalCentsGuideProps> = ({
  isOpen,
  onClose,
  currentScale
}) => {
  const [selectedDastgahId, setSelectedDastgahId] = useState<string>(
    currentScale?.id || 'shor_la'
  );
  const [auditioningMidi, setAuditioningMidi] = useState<number | null>(null);
  const [isPlayingFullScale, setIsPlayingFullScale] = useState(false);

  if (!isOpen) return null;

  const targetDastgah = PERSIAN_DASTGAH_DATA.find(d => d.id === selectedDastgahId) || PERSIAN_DASTGAH_DATA[0];

  const handleAudition = (midi: number, centOffset = 0) => {
    audioEngine.initContext();
    setAuditioningMidi(midi);
    audioEngine.playNote(midi, centOffset, 'violin', 'glissando', 1.2);
    setTimeout(() => setAuditioningMidi(null), 1200);
  };

  const handleToggleFullScale = () => {
    if (isPlayingFullScale) {
      audioEngine.stopAll();
      setIsPlayingFullScale(false);
      setAuditioningMidi(null);
      return;
    }

    const rootPc = targetDastgah.notes[0];
    const tonicMidi = 60 + rootPc;
    const scaleMidis = targetDastgah.notes.map(pc => {
      const semitonesFromTonic = (pc - rootPc + 12) % 12;
      return tonicMidi + semitonesFromTonic;
    });
    // Add octave note
    scaleMidis.push(tonicMidi + 12);

    setIsPlayingFullScale(true);
    audioEngine.playScaleSequence(
      scaleMidis,
      targetDastgah.microCents || {},
      'violin',
      'glissando',
      (midi) => setAuditioningMidi(midi),
      () => {
        setIsPlayingFullScale(false);
        setAuditioningMidi(null);
      }
    );
  };

  const rootPc = targetDastgah.notes[0];
  const tonicMidi = 60 + rootPc;

  // Build the strictly ascending degrees from tonic to octave (Degrees 1 to 8)
  const scaleRows = [
    ...targetDastgah.notes.map((pc, idx) => {
      const semitonesFromTonic = (pc - rootPc + 12) % 12;
      const midi = tonicMidi + semitonesFromTonic;
      const microCent = targetDastgah.microCents?.[pc] || 0;
      const freq = audioEngine.midiToFreq(midi, microCent);
      const intervalCents = semitonesFromTonic * 100 + microCent - (targetDastgah.microCents?.[rootPc] || 0);
      const isShahed = targetDastgah.shahedMidi ? (targetDastgah.shahedMidi % 12 === pc) : false;
      const isIst = targetDastgah.istMidi ? (targetDastgah.istMidi % 12 === pc) : false;
      const isMicro = microCent !== 0;

      let farhatCode = 'M (دوم بزرگ)';
      if (idx === 0) {
        farhatCode = 'P1 (پایه / هم‌صدا • ۰¢)';
      } else if (isMicro) {
        farhatCode = microCent < 0
          ? `n (دوم/فاصله خنثی کُرُن • ${Math.round(intervalCents)}¢)`
          : `N (فاصله خنثای بزرگ سُری • ${Math.round(intervalCents)}¢)`;
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
      const displayLabel = targetDastgah.microLabels?.[pc]?.letter || defaultLabel;

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
      };
    }),
    // Degree 8: Octave
    (() => {
      const pc = rootPc;
      const midi = tonicMidi + 12;
      const microCent = targetDastgah.microCents?.[pc] || 0;
      const freq = audioEngine.midiToFreq(midi, microCent);
      const isMicro = microCent !== 0;
      const noteNameObj = NOTE_NAMES[pc];
      const baseName = targetDastgah.microLabels?.[pc]?.letter ||
        `${noteNameObj?.natural || noteNameObj?.sharp || ''} (${noteNameObj?.solfege || ''})`;
      const displayLabel = `${baseName} (هنگـام)`;

      return {
        degreeLabel: 'درجه ۸ (هنگام / اکتاو)',
        displayLabel,
        isMicro,
        microCent,
        freq,
        midi,
        farhatCode: 'P8 (هنگام درست • ۱۲۰۰¢)',
        isShahed: Boolean(targetDastgah.shahedMidi && (targetDastgah.shahedMidi % 12 === pc)),
        isIst: Boolean(targetDastgah.istMidi && (targetDastgah.istMidi % 12 === pc)),
      };
    })()
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-persian overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-4xl bg-[#16110E] border-2 border-[#E5A836] rounded-2xl shadow-2xl p-5 sm:p-7 text-[#F5EEDB] my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#594234]/70 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔬</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#F5EEDB]">
                کالیبراسیون سنت‌ها و انطباق میکروتونال با رساله پژوهشی
              </h2>
              <p className="text-xs text-[#E5A836] mt-0.5">
                بررسی فیزیک اصوات، انحراف سنت‌ها (Cents) و ابعاد پنج‌گانه هرمز فرهت ($m, n, N, M, P$)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="بستن پنجره"
            className="w-9 h-9 rounded-full bg-[#241A14] hover:bg-[#34261D] text-[#C4B59D] hover:text-[#FFF5E6] flex items-center justify-center border border-[#594234] transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-6 pt-4 pr-1 pl-2 text-xs sm:text-sm">
          {/* Key Notice Banner */}
          <div className="bg-[#241A14] border-r-4 border-[#D97706] p-4 rounded-xl flex items-start gap-3">
            <Info size={22} className="text-[#E5A836] shrink-0 mt-0.5" />
            <div className="space-y-1.5 leading-relaxed text-[#D6C7B2]">
              <p className="font-bold text-[#FFF5E6]">
                چرا در رساله و اجرای اصیل، ربع‌پرده‌ها ۵۰ سنت نیستند؟
              </p>
              <p>
                در تقسیم‌بندی ۲۴ قسمتی علینقی وزیری، هر نیم‌پرده مکانیکی به دو ربع‌پرده مساوی ۵۰ سنتی تفکیک شد. اما پژوهش‌های دکتر هرمز فرهت در دانشگاه کمبریج و محاسبات دکتر مهدی برکشلی نشان داد که گوش نوازندگان اصیل ایران (صبا، یاحقی، برومند) از <strong>فواصل خنثای طبیعی</strong> پیروی می‌کند:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-[#E5A836]">
                <li><strong>کُرُن (𝄳):</strong> بم‌کنندگی بین ۴۰ تا ۴۵ سنت (ایجاد فاصله خنثی حدود ۱۳۵ سنت با نت قبل).</li>
                <li><strong>سُری (𝄲):</strong> زیرکنندگی بین ۳۵ تا ۴۰ سنت (ایجاد فاصله خنثای بزرگ حدود ۱۶۰ سنت).</li>
                <li><strong>دوم افزوده بزرگ (P):</strong> فاصله ۲۶۵ تا ۲۸۰ سنتی میان ر کُرن تا می در چهارگاه و لا کُرن تا سی در همایون.</li>
              </ul>
            </div>
          </div>

          {/* Dastgah Selector & Full Scale Player */}
          <div className="bg-[#1C1410] p-4 rounded-xl border border-[#594234]/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-xs font-bold text-[#E5A836]">
                  دستگاه / مقام جهت کالیبراسیون درجات:
                </label>
                <select
                  value={selectedDastgahId}
                  onChange={(e) => setSelectedDastgahId(e.target.value)}
                  className="bg-[#2A1F18] border border-[#594234] rounded-lg px-3 py-1.5 text-xs text-[#F5EEDB] focus:border-[#E5A836] outline-none"
                >
                  {PERSIAN_DASTGAH_DATA.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleToggleFullScale}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition border ${
                  isPlayingFullScale
                    ? 'bg-[#8B2635] text-white border-white animate-pulse'
                    : 'bg-[#D97706] hover:bg-[#E5A836] text-black border-[#E5A836]'
                }`}
                title="شنیدن توالی صعودی و نزولی تمامی ۸ درجه گام با کوک دقیق میکروتونال"
              >
                {isPlayingFullScale ? <Square size={13} /> : <Play size={13} />}
                <span>{isPlayingFullScale ? 'توقف پخش گام' : 'شنیدن توالی صعودی درجات گام'}</span>
              </button>
            </div>

            {/* Scale Tuning & Microtone Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-[#2A1F18] text-[#E5A836] border-b border-[#594234]">
                    <th className="p-2.5">مرتبه و درجه</th>
                    <th className="p-2.5">نوت و نشانه</th>
                    <th className="p-2.5">انحراف سنت (¢)</th>
                    <th className="p-2.5">بسامد در گام صعودی (Hz)</th>
                    <th className="p-2.5">فاصله فرهت با پایه</th>
                    <th className="p-2.5">عملکرد ردیفی</th>
                    <th className="p-2.5 text-center">شنیدن</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#594234]/30 text-[#D6C7B2]">
                  {scaleRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`${
                        auditioningMidi === row.midi
                          ? 'bg-[#E5A836]/25 font-bold'
                          : row.isMicro
                          ? 'bg-[#8B2635]/15 font-semibold'
                          : idx === 7
                          ? 'bg-[#2A1F18]/40'
                          : ''
                      } transition`}
                    >
                      <td className="p-2.5 font-bold text-[#F5EEDB]">{row.degreeLabel}</td>
                      <td className="p-2.5 flex items-center gap-1.5">
                        <span className="font-mono text-[#FFF5E6]">
                          {row.displayLabel}
                        </span>
                        {row.isMicro && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#8B2635] text-white">
                            میکروتون
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-mono">
                        {row.microCent === 0 ? (
                          <span className="text-gray-400">۰¢ (طبیعی)</span>
                        ) : (
                          <span className={row.microCent < 0 ? 'text-amber-400' : 'text-emerald-400'}>
                            {row.microCent > 0 ? `+${row.microCent}¢` : `${row.microCent}¢`}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-mono text-[#E5A836] font-bold">
                        {row.freq.toFixed(2)} Hz
                      </td>
                      <td className="p-2.5 text-[11px] text-[#A6937C]">
                        {row.farhatCode}
                      </td>
                      <td className="p-2.5 text-[11px]">
                        {row.isShahed && <span className="text-[#34D399] font-bold">شاهد اصلی • </span>}
                        {row.isIst && <span className="text-[#60A5FA] font-bold">ایست نهایی • </span>}
                        {!row.isShahed && !row.isIst && (
                          <span className="text-gray-400">{idx === 7 ? 'هنگام شاهد' : 'متغیر/گردش'}</span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => handleAudition(row.midi, row.microCent)}
                          className={`p-1.5 rounded-lg border transition ${
                            auditioningMidi === row.midi
                              ? 'bg-[#E5A836] text-black border-white shadow-md'
                              : 'bg-[#2A1F18] hover:bg-[#3D2E24] text-[#E5A836] border-[#594234]'
                          }`}
                          title={`شنیدن ${row.displayLabel} با بسامد ${row.freq.toFixed(1)} هرتز`}
                        >
                          <Volume2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Theoretical Foundations of Violin Strings */}
          <div className="bg-[#1C1410] p-4 rounded-xl border border-[#594234]/60 space-y-3">
            <h4 className="text-xs font-bold text-[#E5A836] flex items-center gap-1.5">
              <CheckCircle2 size={16} />
              کوک چهار سیم ویولن در این دستگاه و ارتعاش واخوان‌ها:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {targetDastgah.kookViolin.map((k) => (
                <div key={k.stringNumber} className="p-3 rounded-lg bg-[#241A14] border border-[#594234]/50 text-center space-y-1">
                  <span className="text-[10px] text-[#A6937C] block">سیم {k.stringNumber}</span>
                  <span className="font-bold text-[#FFF5E6] block">{k.name}</span>
                  <span className="font-mono text-[#E5A836] text-[11px] block">{k.freq.toFixed(1)} Hz</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#594234]/70 flex items-center justify-between shrink-0 text-xs">
          <span className="text-[#A6937C]">
            مرجع علمی: رساله «The Dastgah Concept in Persian Music» - دکتر هرمز فرهت، کمبریج
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#D97706] hover:bg-[#E5A836] text-black font-bold transition"
          >
            تأیید و بازگشت به سامانه
          </button>
        </div>
      </div>
    </div>
  );
};
