/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * اسطرلاب بصری و کیهان‌شناسی موسیقی ایرانی (Musical Astrolabe & Tonal Cosmography)
 * مرکز ثقل تعاملی پیوند افلاک باستان با فواصل دستگاه‌های ردیف، نسبت‌های ارموی، و فواصل پنج‌گانه هرمز فرهت
 * مؤلف و طراح: ایمان برزجان | استودیو اینامیکس (EnamiX)
 */

import React, { useRef, useEffect, useState } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  Play, 
  Square, 
  Info, 
  Volume2, 
  Maximize2, 
  Compass, 
  Orbit 
} from 'lucide-react';
import { DastgahScale, NOTE_NAMES } from '../utils/pardeheNegarData';
import { audioEngine, TimbreType } from '../utils/audioEngine';

interface AstrolabeNode {
  id: string;
  roleFa: string; // نام کیهانی/موسیقایی
  planetSymbol: string; // نماد ستاره‌شناسی قدیم
  planetNameFa: string;
  pc: number; // Pitch Class 0-11
  midi: number;
  centOffset: number;
  freq: number;
  farhatInterval: string;
  barkeshliRatio: string;
  functionDesc: string;
  orbitRadius: number; // 0.25 to 0.85 of canvas half-size
  baseAngleRad: number;
  color: string;
}

interface MusicalAstrolabeProps {
  currentScale?: DastgahScale | null;
  soundTimbre?: TimbreType;
  onSelectMidi?: (midi: number) => void;
}

export const MusicalAstrolabe: React.FC<MusicalAstrolabeProps> = ({
  currentScale,
  soundTimbre = 'setar',
  onSelectMidi
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<AstrolabeNode | null>(null);
  const [activeLaserNodeId, setActiveLaserNodeId] = useState<string | null>(null);
  const [isCyclingOrbits, setIsCyclingOrbits] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1);

  // Rotation angles
  const rotationAngleRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const laserProgressRef = useRef<number>(0);

  // Derive root PC and modal nodes based on current scale
  const rootPc = currentScale ? currentScale.notes[0] : 9; // Default 'A' (La) for Shor
  const tonicMidi = 60 + rootPc;
  const tonicMicroCent = currentScale?.microCents?.[rootPc] || 0;
  const tonicFreq = audioEngine.midiToFreq(tonicMidi, tonicMicroCent);
  const tonicNoteObj = NOTE_NAMES[rootPc];
  const tonicName = currentScale?.microLabels?.[rootPc]?.letter || 
    `${tonicNoteObj?.natural || tonicNoteObj?.sharp || ''} (${tonicNoteObj?.solfege || ''})`;

  // Construct Planetary Nodes from Scale Roles
  const nodes: AstrolabeNode[] = React.useMemo(() => {
    if (!currentScale) return [];

    const result: AstrolabeNode[] = [];
    const notes = currentScale.notes;

    // 1. Shahed (شاهد / مریخ-خورشید نغمگی)
    const shahedPc = currentScale.shahedMidi ? (currentScale.shahedMidi % 12) : notes[0];
    const shahedSemitones = (shahedPc - rootPc + 12) % 12;
    const shahedMidi = tonicMidi + shahedSemitones;
    const shahedCent = currentScale.microCents?.[shahedPc] || 0;
    result.push({
      id: 'shahed',
      roleFa: 'شاهد (شاه‌بیت ملودیک)',
      planetSymbol: '♂',
      planetNameFa: 'بهرام (مریخ)',
      pc: shahedPc,
      midi: shahedMidi,
      centOffset: shahedCent,
      freq: audioEngine.midiToFreq(shahedMidi, shahedCent),
      farhatInterval: shahedSemitones === 0 ? 'P1 (مرکز هم‌صدا)' : 'n / M (کشش دانگ اول)',
      barkeshliRatio: '۹/۸ (طنینی طوسی)',
      functionDesc: 'نوت دارای بیشترین تکرار و کشش نغمگی؛ قطب مغناطیسی گردش ملودی در درآمدها و گوشه‌های ردیف.',
      orbitRadius: 0.38,
      baseAngleRad: Math.PI * 0.25,
      color: '#EF4444'
    });

    // 2. Ist (ایست / زحل - لنگرگاه سکون)
    const istPc = currentScale.istMidi ? (currentScale.istMidi % 12) : notes[notes.length - 1];
    const istSemitones = (istPc - rootPc + 12) % 12;
    const istMidi = tonicMidi + istSemitones;
    const istCent = currentScale.microCents?.[istPc] || 0;
    result.push({
      id: 'ist',
      roleFa: 'ایست (توقفگاه و لنگر)',
      planetSymbol: '♄',
      planetNameFa: 'کیوان (زحل)',
      pc: istPc,
      midi: istMidi,
      centOffset: istCent,
      freq: audioEngine.midiToFreq(istMidi, istCent),
      farhatInterval: istSemitones === 0 ? 'P1 (پایان فرود)' : 'm / n (ایست موقت)',
      barkeshliRatio: '۲۵۶/۲۴۳ (بقیه فیثاغورثی)',
      functionDesc: 'نوت توقف در پایان جملات یا فرودهای موقت؛ ایجاد حس آرامش نسبی و پایستگی نغمه.',
      orbitRadius: 0.52,
      baseAngleRad: Math.PI * 0.75,
      color: '#10B981'
    });

    // 3. Motaghayyer (متغیر / عطارد - دگرگونی‌پذیر)
    const secondDegreePc = notes[1] !== undefined ? notes[1] : (rootPc + 2) % 12;
    const secondSemitones = (secondDegreePc - rootPc + 12) % 12;
    const secondMidi = tonicMidi + secondSemitones;
    const secondCent = currentScale.microCents?.[secondDegreePc] || 0;
    result.push({
      id: 'motaghayyer',
      roleFa: 'متغیر (درجه دوم / ربع‌پرده کُرُن)',
      planetSymbol: '☿',
      planetNameFa: 'تیر (عطارد)',
      pc: secondDegreePc,
      midi: secondMidi,
      centOffset: secondCent,
      freq: audioEngine.midiToFreq(secondMidi, secondCent),
      farhatInterval: secondCent < 0 ? 'n (دوم خنثی • ۱۳۵¢)' : 'M (دوم بزرگ • ۲۰۴¢)',
      barkeshliRatio: 'مجنب فارابی (۸۱/۸۰ کمای دیدیموس)',
      functionDesc: 'نوت دگرگونی‌پذیر که با صعود ملودی به گوشه‌های بالاتر تغییر پرده داده و رنگ مدال را متحول می‌سازد.',
      orbitRadius: 0.64,
      baseAngleRad: Math.PI * 1.35,
      color: '#F59E0B'
    });

    // 4. Foroud (فرود / قمر - بازگشت به مبدأ)
    const subTonicPc = (rootPc + 10) % 12;
    const subSemitones = (subTonicPc - rootPc + 12) % 12;
    const subMidi = tonicMidi - (12 - subSemitones);
    const subCent = currentScale.microCents?.[subTonicPc] || 0;
    result.push({
      id: 'foroud',
      roleFa: 'فرود (نوت اتصال و پیش‌فرود)',
      planetSymbol: '☽',
      planetNameFa: 'ماه (قمر)',
      pc: subTonicPc,
      midi: subMidi,
      centOffset: subCent,
      freq: audioEngine.midiToFreq(subMidi, subCent),
      farhatInterval: 'M / m (یک پرده پایین‌تر از پایه)',
      barkeshliRatio: '۱۶/۱۵ (نیم‌پرده بزرگ)',
      functionDesc: 'شاهراه پیوند ملودی برای بازگشت شکوهمند به مایه اصلی؛ عامل کشش و حل نهایی ملودیک.',
      orbitRadius: 0.76,
      baseAngleRad: Math.PI * 1.85,
      color: '#06B6D4'
    });

    // 5. Ouj (اوج / مشتری - بلندای دستگاه)
    const fifthDegreePc = notes[4] !== undefined ? notes[4] : (rootPc + 7) % 12;
    const fifthSemitones = (fifthDegreePc - rootPc + 12) % 12;
    const fifthMidi = tonicMidi + fifthSemitones;
    const fifthCent = currentScale.microCents?.[fifthDegreePc] || 0;
    result.push({
      id: 'ouj',
      roleFa: 'اوج (پنجم درست / بلندا)',
      planetSymbol: '♃',
      planetNameFa: 'برجیس (مشتری)',
      pc: fifthDegreePc,
      midi: fifthMidi,
      centOffset: fifthCent,
      freq: audioEngine.midiToFreq(fifthMidi, fifthCent),
      farhatInterval: 'P5 (پنجم درست • ۷۰۲¢)',
      barkeshliRatio: '۳/۲ (نسبت مطلق فیثاغورثی)',
      functionDesc: 'اوج فوران احساسی و گسترش ردیف در منطقه صوتی زیر؛ سرآغاز گوشه‌های شهناز، عشاق و زابل.',
      orbitRadius: 0.88,
      baseAngleRad: Math.PI * 0.45,
      color: '#8B5CF6'
    });

    return result;
  }, [currentScale, rootPc, tonicMidi]);

  // Click handler for node
  const handleNodeClick = (node: AstrolabeNode) => {
    setSelectedNode(node);
    setActiveLaserNodeId(node.id);
    laserProgressRef.current = 1.0;

    // Audition studio note sample
    audioEngine.playNote(
      node.midi,
      node.centOffset,
      soundTimbre === 'piano' ? 'santur' : soundTimbre,
      'glissando',
      1.6
    );

    onSelectMidi?.(node.midi);

    // Auto-fade laser after 1.2s
    setTimeout(() => {
      setActiveLaserNodeId(null);
    }, 1200);
  };

  // Play Central Tonic Sun
  const handleTonicClick = () => {
    setSelectedNode(null);
    setActiveLaserNodeId('tonic');
    audioEngine.playNote(
      tonicMidi,
      tonicMicroCent,
      soundTimbre === 'piano' ? 'santur' : soundTimbre,
      'glissando',
      1.8
    );
    onSelectMidi?.(tonicMidi);
    setTimeout(() => {
      setActiveLaserNodeId(null);
    }, 1200);
  };

  // Celestial Cycle Sequence (Play through nodes sequentially)
  const handleToggleCelestialCycle = () => {
    if (isCyclingOrbits) {
      setIsCyclingOrbits(false);
      return;
    }

    setIsCyclingOrbits(true);
    let step = 0;
    const sequence: Array<{ type: 'tonic'; node?: undefined } | { type: 'node'; node: AstrolabeNode }> = [
      { type: 'tonic' },
      ...nodes.map(n => ({ type: 'node' as const, node: n })),
      { type: 'tonic' }
    ];

    const timer = setInterval(() => {
      if (step >= sequence.length) {
        clearInterval(timer);
        setIsCyclingOrbits(false);
        return;
      }

      const current = sequence[step];
      if (current.type === 'tonic') {
        handleTonicClick();
      } else if (current.type === 'node' && current.node) {
        handleNodeClick(current.node);
      }
      step++;
    }, 750);
  };

  // Canvas Render Loop with Astrolabe Engravings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 480;
      const height = canvas.clientHeight || 480;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const maxR = (Math.min(width, height) / 2) * 0.92 * zoomScale;

      if (isRotating) {
        rotationAngleRef.current += 0.003;
      }
      const rot = rotationAngleRef.current;

      // 1. Draw Astrolabe Outer Brass Plates (حلقه برنجی و گاه‌شمار ادوار)
      const gradBrass = ctx.createRadialGradient(cx, cy, maxR * 0.2, cx, cy, maxR);
      gradBrass.addColorStop(0, '#1E1510');
      gradBrass.addColorStop(0.7, '#2A1F18');
      gradBrass.addColorStop(0.96, '#4A3525');
      gradBrass.addColorStop(1, '#8C673D');

      ctx.beginPath();
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
      ctx.fillStyle = gradBrass;
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#E5A836';
      ctx.stroke();

      // Outer Degree Teeth (دندانه‌های درجه‌بندی ۳۶۰ درجه‌ای اسطرلاب)
      const teethCount = 72;
      for (let i = 0; i < teethCount; i++) {
        const thAngle = (i / teethCount) * Math.PI * 2;
        const isMajor = i % 6 === 0;
        const len = isMajor ? 10 : 5;
        const x1 = cx + Math.cos(thAngle) * (maxR - 2);
        const y1 = cy + Math.sin(thAngle) * (maxR - 2);
        const x2 = cx + Math.cos(thAngle) * (maxR - 2 - len);
        const y2 = cy + Math.sin(thAngle) * (maxR - 2 - len);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isMajor ? '#F5EEDB' : 'rgba(229, 168, 54, 0.45)';
        ctx.lineWidth = isMajor ? 1.5 : 0.8;
        ctx.stroke();
      }

      // Inner Decorative Brass Ring
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * 0.88, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(229, 168, 54, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Astrological / Modal Houses (ادوار دوازده‌گانه)
      for (let h = 0; h < 12; h++) {
        const hAngle = (h / 12) * Math.PI * 2 + rot * 0.2;
        const x1 = cx + Math.cos(hAngle) * (maxR * 0.3);
        const y1 = cy + Math.sin(hAngle) * (maxR * 0.3);
        const x2 = cx + Math.cos(hAngle) * (maxR * 0.88);
        const y2 = cy + Math.sin(hAngle) * (maxR * 0.88);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(89, 66, 52, 0.25)';
        ctx.lineWidth = 0.75;
        ctx.stroke();
      }

      // 2. Draw Planetary Concentric Orbits (مدارهای سیاره‌ای)
      nodes.forEach((node) => {
        const r = maxR * node.orbitRadius;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = activeLaserNodeId === node.id 
          ? 'rgba(229, 168, 54, 0.7)' 
          : 'rgba(166, 147, 124, 0.18)';
        ctx.lineWidth = activeLaserNodeId === node.id ? 2 : 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 3. Draw Laser Ray if Active Node clicked
      if (activeLaserNodeId && activeLaserNodeId !== 'tonic') {
        const activeNode = nodes.find(n => n.id === activeLaserNodeId);
        if (activeNode) {
          const curAngle = activeNode.baseAngleRad + rot;
          const nx = cx + Math.cos(curAngle) * (maxR * activeNode.orbitRadius);
          const ny = cy + Math.sin(curAngle) * (maxR * activeNode.orbitRadius);

          // Glowing laser beam from node to central Sun
          const laserGrad = ctx.createLinearGradient(nx, ny, cx, cy);
          laserGrad.addColorStop(0, activeNode.color);
          laserGrad.addColorStop(0.5, '#FFF5E6');
          laserGrad.addColorStop(1, '#E5A836');

          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(cx, cy);
          ctx.strokeStyle = laserGrad;
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#E5A836';
          ctx.shadowBlur = 15;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Shockwave ripple ring at center
          ctx.beginPath();
          ctx.arc(cx, cy, 32 + Math.sin(Date.now() * 0.015) * 8, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(245, 238, 219, 0.5)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // 4. Draw Orbiting Planetary Nodes
      nodes.forEach((node) => {
        const curAngle = node.baseAngleRad + rot;
        const nx = cx + Math.cos(curAngle) * (maxR * node.orbitRadius);
        const ny = cy + Math.sin(curAngle) * (maxR * node.orbitRadius);
        const isSelected = selectedNode?.id === node.id;
        const isActiveLaser = activeLaserNodeId === node.id;

        // Glow halo
        if (isSelected || isActiveLaser) {
          ctx.beginPath();
          ctx.arc(nx, ny, 16, 0, Math.PI * 2);
          ctx.fillStyle = node.color + '44';
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(nx, ny, 9, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = '#FFF5E6';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Planet symbol
        ctx.font = '10px serif';
        ctx.fillStyle = '#140F0C';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.planetSymbol, nx, ny);

        // Label above/below node
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#F5EEDB';
        ctx.fillText(node.roleFa.split(' ')[0], nx, ny - 14);
      });

      // 5. Draw Central Radiant Sun (مایه بنیادین / Tonic)
      const sunPulse = Math.sin(Date.now() * 0.004) * 2;
      const sunR = 24 + sunPulse;

      // Sun corona rays
      const rays = 16;
      for (let r = 0; r < rays; r++) {
        const rAng = (r / rays) * Math.PI * 2 - rot * 0.5;
        const rayLen = sunR + 8 + (r % 2 === 0 ? 6 : 2);
        const rx = cx + Math.cos(rAng) * rayLen;
        const ry = cy + Math.sin(rAng) * rayLen;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(rx, ry);
        ctx.strokeStyle = 'rgba(229, 168, 54, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Sun core
      const sunGrad = ctx.createRadialGradient(cx, cy, 3, cx, cy, sunR);
      sunGrad.addColorStop(0, '#FFF5E6');
      sunGrad.addColorStop(0.3, '#F59E0B');
      sunGrad.addColorStop(0.85, '#D97706');
      sunGrad.addColorStop(1, '#8B2635');

      ctx.beginPath();
      ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
      ctx.fillStyle = sunGrad;
      ctx.fill();
      ctx.strokeStyle = '#FFE082';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Center text
      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = '#FFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('پایه', cx, cy - 4);
      ctx.font = '8px sans-serif';
      ctx.fillText(tonicName.split(' ')[0] || 'Tonic', cx, cy + 6);

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [nodes, isRotating, selectedNode, activeLaserNodeId, zoomScale, tonicName]);

  // Click on canvas to hit nodes or central sun
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const distToCenter = Math.hypot(x - cx, y - cy);

    // Click on Center Tonic Sun
    if (distToCenter <= 30) {
      handleTonicClick();
      return;
    }

    // Check click on nodes
    const maxR = (Math.min(rect.width, rect.height) / 2) * 0.92 * zoomScale;
    const rot = rotationAngleRef.current;

    for (const node of nodes) {
      const curAngle = node.baseAngleRad + rot;
      const nx = cx + Math.cos(curAngle) * (maxR * node.orbitRadius);
      const ny = cy + Math.sin(curAngle) * (maxR * node.orbitRadius);
      const distToNode = Math.hypot(x - nx, y - ny);

      if (distToNode <= 22) {
        handleNodeClick(node);
        return;
      }
    }
  };

  return (
    <div className="w-full bg-[#16110E] rounded-2xl border-2 border-[#594234] p-4 sm:p-6 shadow-2xl space-y-4 font-persian" dir="rtl">
      {/* Astrolabe Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#594234]/70 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2A1F18] border border-[#E5A836] flex items-center justify-center text-xl shadow">
            🧭
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-[#F5EEDB] flex items-center gap-2">
              <span>اسطرلاب صوتی و کیهان‌شناسی مدال</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8B2635] text-white font-bold border border-[#E5A836]/40">
                منظومه فواصل
              </span>
            </h3>
            <p className="text-[11px] text-[#C4B59D]">
              انطباق افلاک باستانی و درجات ردیف: خورشید بنیادین در مرکز و سیارات شاهد، ایست، متغیر و اوج در مدارها
            </p>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 shadow ${
              isRotating 
                ? 'bg-[#2A1F18] text-[#E5A836] border-[#E5A836]' 
                : 'bg-[#1C1510] text-[#A6937C] border-[#594234]'
            }`}
            title="توقف یا چرخش فلک اسطرلاب"
          >
            <RotateCw size={13} className={isRotating ? 'animate-spin' : ''} />
            <span>{isRotating ? 'گردش فلک: پویا' : 'گردش فلک: ایستا'}</span>
          </button>

          <button
            onClick={handleToggleCelestialCycle}
            className={`px-3 py-1.5 rounded-lg font-bold transition text-xs flex items-center gap-1.5 shadow ${
              isCyclingOrbits
                ? 'bg-[#EF4444] text-white animate-pulse'
                : 'bg-[#D97706] hover:bg-[#E5A836] text-black'
            }`}
            title="شنیدن توالی گردش افلاک و پرتوهای مدال"
          >
            {isCyclingOrbits ? <Square size={13} /> : <Play size={13} />}
            <span>{isCyclingOrbits ? 'توقف گردش' : 'گردش نغمگی افلاک'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas and Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Interactive Canvas Centerpiece (7 Cols) */}
        <div 
          ref={containerRef}
          className="lg:col-span-7 flex flex-col items-center justify-center relative select-none"
        >
          <div className="relative w-full max-w-[420px] aspect-square rounded-full shadow-2xl p-1 bg-gradient-to-b from-[#3D2E24] via-[#1A130E] to-[#0D0A08] border border-[#E5A836]/40">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="w-full h-full rounded-full cursor-pointer touch-none"
              title="روی خورشید مرکزی یا گره‌های سیاره‌ای کلیک کنید"
            />

            {/* Quick helper badge */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#140F0C]/90 border border-[#594234] px-3 py-1 rounded-full text-[10px] text-[#A6937C] whitespace-nowrap shadow pointer-events-none">
              👆 برای پرتاب پرتو و شنیدن نوت روی سیارات کلیک فرمایید
            </div>
          </div>
        </div>

        {/* Scientific Inspector Tooltip / Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {selectedNode ? (
            <div className="bg-[#1C1612] border-2 border-[#E5A836] rounded-xl p-4 shadow-xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#594234]/70 pb-2">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3.5 h-3.5 rounded-full inline-block"
                    style={{ backgroundColor: selectedNode.color }}
                  />
                  <h4 className="font-black text-sm text-[#F5EEDB]">
                    {selectedNode.roleFa}
                  </h4>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#2A1F18] text-[#E5A836] font-mono border border-[#594234]">
                  فلک {selectedNode.planetNameFa} {selectedNode.planetSymbol}
                </span>
              </div>

              {/* Acoustic & Mathematical Specs Matrix */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#140F0C] p-2 rounded-lg border border-[#594234]/40">
                  <span className="text-[#A6937C] block text-[10px]">بسامد دقیق (Hz):</span>
                  <span className="font-bold text-[#E5A836] font-mono text-xs">
                    {Math.round(selectedNode.freq * 100) / 100} هرتز
                  </span>
                </div>

                <div className="bg-[#140F0C] p-2 rounded-lg border border-[#594234]/40">
                  <span className="text-[#A6937C] block text-[10px]">انحراف ریزپرده (Cent):</span>
                  <span className="font-bold text-[#34D399] font-mono text-xs">
                    {selectedNode.centOffset === 0 ? '۰¢ (معتدل)' : `${selectedNode.centOffset > 0 ? '+' : ''}${selectedNode.centOffset}¢`}
                  </span>
                </div>

                <div className="bg-[#140F0C] p-2 rounded-lg border border-[#594234]/40">
                  <span className="text-[#A6937C] block text-[10px]">رده‌بندی هرمز فرهت:</span>
                  <span className="font-bold text-[#F5EEDB]">
                    {selectedNode.farhatInterval}
                  </span>
                </div>

                <div className="bg-[#140F0C] p-2 rounded-lg border border-[#594234]/40">
                  <span className="text-[#A6937C] block text-[10px]">نسبت ارموی و برکشلی:</span>
                  <span className="font-bold text-[#F5EEDB] font-mono">
                    {selectedNode.barkeshliRatio}
                  </span>
                </div>
              </div>

              <div className="space-y-1 bg-[#140F0C] p-2.5 rounded-lg border border-[#594234]/40 text-xs text-[#C4B59D] leading-relaxed">
                <span className="text-[#E5A836] font-bold block text-[11px]">کارکرد نغمگی در ردیف:</span>
                <p>{selectedNode.functionDesc}</p>
              </div>

              <button
                onClick={() => handleNodeClick(selectedNode)}
                className="w-full py-2 bg-[#8B2635] hover:bg-[#A32D3F] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 border border-[#E5A836]/40 transition shadow"
              >
                <Volume2 size={14} />
                <span>شنیدن مجدد طنین سیاره و پرتاب پرتو نوری</span>
              </button>
            </div>
          ) : (
            /* Default Central Sun Info Card */
            <div className="bg-[#1C1612] border border-[#594234] rounded-xl p-4 shadow-xl space-y-3">
              <div className="flex items-center gap-2 border-b border-[#594234]/60 pb-2">
                <span className="text-xl">☀️</span>
                <h4 className="font-black text-sm text-[#F5EEDB]">
                  خورشید مرکزی: مایه بنیادین (Tonic) • {tonicName}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#140F0C] p-2 rounded-lg border border-[#594234]/40">
                  <span className="text-[#A6937C] block text-[10px]">بسامد مایه پایه:</span>
                  <span className="font-bold text-[#E5A836] font-mono text-xs">
                    {Math.round(tonicFreq * 100) / 100} هرتز
                  </span>
                </div>

                <div className="bg-[#140F0C] p-2 rounded-lg border border-[#594234]/40">
                  <span className="text-[#A6937C] block text-[10px]">موقعیت در پرده‌ها:</span>
                  <span className="font-bold text-[#F5EEDB] text-xs">
                    مرکز ثقل گام (۰¢)
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#C4B59D] leading-relaxed bg-[#140F0C] p-2.5 rounded-lg border border-[#594234]/40">
                مایه بنیادین به مثابه خورشید در مرکز اسطرلاب قرار دارد؛ تمام درجات، مایه‌گردانی‌ها، تحریرها و فرودهای ردیف پیرامون این مرکز به چرخش درمی‌آیند و در نهایت به آن بازمی‌گردند.
              </p>

              <button
                onClick={handleTonicClick}
                className="w-full py-2 bg-[#D97706] hover:bg-[#E5A836] text-black rounded-lg font-black text-xs flex items-center justify-center gap-2 transition shadow"
              >
                <Volume2 size={14} />
                <span>شنیدن طنین مایه بنیادین (مرکز ملودیک)</span>
              </button>
            </div>
          )}

          {/* Quick Node Selector Chips */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-[#A6937C] block">انتخاب سریع گره‌های منظومه نغمگی:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={handleTonicClick}
                className="px-2.5 py-1 rounded-lg bg-[#2A1F18] hover:bg-[#3D2E24] text-[#E5A836] border border-[#594234] text-[11px] font-bold"
              >
                ☀️ پایه
              </button>
              {nodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition ${
                    selectedNode?.id === node.id
                      ? 'bg-[#8B2635] text-white border-[#E5A836]'
                      : 'bg-[#1C1510] text-[#C4B59D] border-[#594234]'
                  }`}
                >
                  {node.planetSymbol} {node.roleFa.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
