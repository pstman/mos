/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * زیرمجموعه پیوستار آکوستیک: جهان صوتی فلات کهن ایران تا حوزه رود دانوب
 * کارتوگرافی کهن‌نگاری ۲۱:۹، تالار قطعات ایستگاه‌بندی‌شده (۲۰ تا ۳۰ ثانیه)، سازهای جفت و ارگانولوژی
 * بدون هوش مصنوعی یا صداهای ساختگی، با کاربرد فارسی پالوده و پاکیزه
 */

import React, { useState } from 'react';
import { CartographicCanvas } from './CartographicCanvas';
import { PairedInstrumentsModal } from './PairedInstrumentsModal';
import { NodeDetailDrawer } from './NodeDetailDrawer';
import { ResearchTreatiseModal } from './ResearchTreatiseModal';
import { ContinuumPiecesHall } from './ContinuumPiecesHall';
import {
  CartographicNode,
  TRANSMISSION_ROUTES,
  PAIRED_INSTRUMENT_STUDIES,
} from '../utils/acousticMath';

export const ContinuumSubmodule: React.FC = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>('romani-diaspora');
  const [selectedNode, setSelectedNode] = useState<CartographicNode | null>(null);
  const [activeInstrumentPlate, setActiveInstrumentPlate] = useState<string | null>(null);
  const [isTreatiseOpen, setIsTreatiseOpen] = useState(false);

  const selectedRoute = TRANSMISSION_ROUTES.find(r => r.id === selectedRouteId);

  return (
    <div className="w-full space-y-8 font-persian" dir="rtl">
      {/* سربرگ پژوهشی پیوستار */}
      <div className="text-center max-w-4xl mx-auto space-y-2 pt-2">
        <div className="flex items-center justify-center gap-2 text-xs tracking-widest text-[#D97706] font-bold">
          <span>کارتوگرافی کهن‌نگاری و پژوهش ارگانولوژی</span>
          <span aria-hidden="true">·</span>
          <span>سبک باروک و رنسانس</span>
          <span aria-hidden="true">·</span>
          <span>نمای عریض ۲۱:۹</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#F5EEDB] tracking-wide">
          پیوستار آکوستیک: جهان خنیاگری فلات کهن ایران تا حوزه دانوب
        </h2>

        <p className="text-xs sm:text-sm text-[#C4B59D] leading-relaxed">
          ردیابی کوچ تاریخی پرده‌بندی‌ها، سازشناسی تطبیقی (ارگانولوژی) و اوزان لنگ خنیاگری از فلات باستانی ایران، گذر از میان‌رودان و شاهراه قفقاز و سکاها، تا فرودگاه کارپات و حوزه رود دانوب در رومانی
        </p>

        {/* دکمه دسترسی به پژوهش‌نامه */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setIsTreatiseOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#2A201A] hover:bg-[#3D2E24] text-[#E5A836] border border-[#594234] text-xs font-bold transition shadow-md flex items-center gap-2"
          >
            <span>📜 مطالعه پژوهش‌نامه بنیادین و مراجع کهن</span>
          </button>
        </div>
      </div>

      {/* بخش یکم: تالار قطعات و ایستگاه‌بندی جغرافیایی (۲۰ تا ۳۰ ثانیه) */}
      <ContinuumPiecesHall
        onOpenTreatise={() => setIsTreatiseOpen(true)}
      />

      {/* بخش دوم: نقشه کارتوگرافی ۲۱:۹ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#594234]/40 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#F5EEDB]">
              نقشه کهن‌نگاری پیوستار (نمای عریض ۲۱:۹)
            </span>
            <span className="text-xs text-[#C4B59D] hidden sm:inline">
              · بر روی پایگاه‌ها کلیک کنید یا خطوط درخشان را برای بررسی شاهراه‌ها برگزینید
            </span>
          </div>
          <div className="text-xs text-[#D97706] font-mono">
            مقیاس: ۱:۳,۵۰۰,۰۰۰ تصویر مرکاتور کهن
          </div>
        </div>

        <CartographicCanvas
          selectedRouteId={selectedRouteId}
          onSelectRoute={setSelectedRouteId}
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
          onOpenInstrumentPlate={setActiveInstrumentPlate}
          isPlayingAudio={false}
        />

        {/* گزارش شاهراه برگزیده */}
        {selectedRoute && (
          <div className="p-4 bg-[#1F1915] border border-[#594234]/60 rounded-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: selectedRoute.color }}
                />
                <h3 className="text-base font-bold text-[#F5EEDB]">
                  {selectedRoute.persianName}
                </h3>
                <span className="text-xs text-[#C4B59D]">
                  (دوران تاریخی: {selectedRoute.epoch})
                </span>
              </div>
              <p className="text-xs text-[#C4B59D] leading-relaxed max-w-4xl">
                {selectedRoute.historicalNarrative}
              </p>
              <div className="text-xs text-[#E5A836]">
                <strong>دستاورد و میراث خنیاگری: </strong>
                <span>{selectedRoute.musicalContributions}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedRouteId(null)}
              className="px-3.5 py-1.5 bg-[#2C221C] hover:bg-[#8B2635] text-[#EDE0C8] text-xs font-bold rounded-lg transition whitespace-nowrap border border-[#594234]"
            >
              زدودن فیلتر مسیر
            </button>
          </div>
        )}
      </section>

      {/* بخش سوم: لوحه‌های قلم‌زنی سازهای جفت و ارگانولوژی تطبیقی */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#594234]/40 pb-2">
          <span className="text-sm font-bold text-[#F5EEDB]">
            سازهای جفت و سازشناسی تطبیقی (ارگانولوژی) ایران و حوزه دانوب
          </span>
          <span className="text-xs text-[#C4B59D]">
            لوحه‌های قلم‌زنی و مس‌نگاری کهن
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PAIRED_INSTRUMENT_STUDIES.map(study => (
            <div
              key={study.id}
              className="p-4 bg-[#1F1915] border border-[#594234]/60 rounded-xl shadow-md space-y-3 flex flex-col justify-between"
            >
              <div>
                <h4 className="text-sm font-bold text-[#F5EEDB]">
                  {study.persianTitle}
                </h4>
                <div className="text-xs text-[#E5A836] mt-0.5">{study.persianSubtitle}</div>
                <p className="text-xs text-[#C4B59D] mt-2 line-clamp-3 leading-relaxed">
                  {study.acousticContinuumTheory}
                </p>
              </div>

              <button
                onClick={() => setActiveInstrumentPlate(study.id)}
                className="w-full py-2 bg-[#2C221C] hover:bg-[#8B2635] text-[#EDE0C8] text-xs font-bold rounded-lg border border-[#594234] transition"
              >
                بررسی لوحه قلم‌زنی و شناخت ساز
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* پنجره‌ها و کشوهای جانبی */}
      {selectedNode && (
        <NodeDetailDrawer
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {activeInstrumentPlate && (
        <PairedInstrumentsModal
          studyId={activeInstrumentPlate}
          onClose={() => setActiveInstrumentPlate(null)}
        />
      )}

      {isTreatiseOpen && (
        <ResearchTreatiseModal
          isOpen={isTreatiseOpen}
          onClose={() => setIsTreatiseOpen(false)}
        />
      )}
    </div>
  );
};
