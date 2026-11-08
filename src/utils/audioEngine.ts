/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * موتور صوتی مبتنی بر سمپل‌های واقعی (Real WAV / MP3 Sample Engine) برای سامانه پرده‌نگار • استودیو اینامیکس
 *
 * ویژگی‌ها:
 * 1. بارگذاری و پخش نمونه‌های صوتی واقعی با فرمت .wav و .mp3 برای تمامی سازها به جای سینتی‌سایزر خام
 * 2. محاسبه دقیق نرخ پخش میکروتونال (PlaybackRate) برای فواصل کُرُن (-۴۵ سنت)، سُری (+۳۰ سنت)، کُما و فواصل هرمز فرهت
 * 3. امکان آپلود مستقیم فایل‌های .wav / .mp3 از سیستم کاربر (با ذخیره‌سازی دائمی در IndexedDB مرورگر)
 * 4. امکان تعریف لینک مستقیم (.wav / .mp3) از سرور یا فضای ابری برای تک‌نوت پایه یا بانک چندنوتی هر ساز
 * 5. اتاق آکوستیک (Stereo Convolution Reverb) برای طنین طبیعی ساز در فضای تالار موسیقی
 */

export type TimbreType = 'piano' | 'violin' | 'santur' | 'tambal' | 'setar' | 'bouzouki' | 'ney' | 'caval';
export type ArticulationType = 'glissando' | 'staccato';
export type PercussionSound = 'tombak_tom' | 'tombak_bak' | 'daf' | 'clapper';
export type SampleInstrumentId = TimbreType | PercussionSound;

export interface SequenceStep {
  midi: number;
  dur: number;
  centOffset?: number;
}

export interface SampleSlotInfo {
  midi: number;
  noteName: string;
  url: string;
  isCustomUpload?: boolean;
  isCustomUrl?: boolean;
  fileName?: string;
  status: 'loading' | 'loaded' | 'error';
  errorMessage?: string;
}

export interface InstrumentBankInfo {
  id: SampleInstrumentId;
  nameFa: string;
  nameEn: string;
  category: 'melodic' | 'percussion';
  descriptionFa: string;
  defaultRootMidi: number;
  slots: SampleSlotInfo[];
}

const CDN_SAMPLE_BASE = 'https://cdn.jsdelivr.net/gh/nbrosowsky/tonejs-instruments@master/samples';
const CUSTOM_URLS_STORAGE_KEY = 'enamix_pardehnegar_sample_urls_v1';
const IDB_NAME = 'enamix_pardehnegar_samples_idb';
const IDB_STORE = 'uploaded_audio_samples';

export const MIDI_NOTE_LABELS: Record<number, string> = {
  48: 'C3 (دو بم - MIDI 48)',
  50: 'D3 (ر بم - MIDI 50)',
  52: 'E3 (می بم - MIDI 52)',
  53: 'F3 (فا بم - MIDI 53)',
  55: 'G3 (سل بم - MIDI 55)',
  57: 'A3 (لا بم - MIDI 57)',
  60: 'C4 (دو میانی - MIDI 60)',
  62: 'D4 (ر میانی - MIDI 62)',
  64: 'E4 (می میانی - MIDI 64)',
  65: 'F4 (فا میانی - MIDI 65)',
  67: 'G4 (سل میانی - MIDI 67)',
  69: 'A4 (لا ۴۴۰ هرتز - MIDI 69)',
  71: 'B4 (سی میانی - MIDI 71)',
  72: 'C5 (دو زیر - MIDI 72)',
  74: 'D5 (ر زیر - MIDI 74)',
  76: 'E5 (می زیر - MIDI 76)',
  79: 'G5 (سل زیر - MIDI 79)'
};

export const INSTRUMENT_META: Record<
  SampleInstrumentId,
  {
    nameFa: string;
    nameEn: string;
    category: 'melodic' | 'percussion';
    descriptionFa: string;
    defaultRootMidi: number;
  }
> = {
  piano: {
    nameFa: 'پیانو گرند آکوستیک',
    nameEn: 'Acoustic Grand Piano',
    category: 'melodic',
    descriptionFa: 'بانک سمپل چندنوتی پیانو آکوستیک استودیویی (.mp3 / .wav)',
    defaultRootMidi: 60
  },
  violin: {
    nameFa: 'ویولن (کلاسیک و ایرانی)',
    nameEn: 'Solo Acoustic Violin',
    category: 'melodic',
    descriptionFa: 'بانک سمپل آرشه‌ای ویولن طبیعی با پشتیبانی از گلیساندو و کُرُن/سُری',
    defaultRootMidi: 69
  },
  santur: {
    nameFa: 'سنتور ایرانی (۹ خرک)',
    nameEn: 'Persian Santur',
    category: 'melodic',
    descriptionFa: 'سمپل زهی-مضرابی طبیعی با شبیه‌سازی ۴ سیم هم‌کوک هر خرک',
    defaultRootMidi: 62
  },
  tambal: {
    nameFa: 'تسامبال کنسرتی (رومانی)',
    nameEn: 'Carpathian Țambal Mare',
    category: 'melodic',
    descriptionFa: 'سمپل سیم‌های مضرابی سنگین حوضه کارپات و دانوب',
    defaultRootMidi: 62
  },
  setar: {
    nameFa: 'سه‌تار و تنبور ایرانی',
    nameEn: 'Persian Setar',
    category: 'melodic',
    descriptionFa: 'سمپل مضرابی تارهای فلزی/برنجی با طنین کاسه چوبی',
    defaultRootMidi: 60
  },
  bouzouki: {
    nameFa: 'بوزوکی و لوت آناتولی',
    nameEn: 'Anatolian / Greek Bouzouki',
    category: 'melodic',
    descriptionFa: 'سمپل جفت‌سیم مضرابی با حمله شفاف',
    defaultRootMidi: 60
  },
  ney: {
    nameFa: 'نی هفت‌بند ایرانی',
    nameEn: 'Persian Reed Ney',
    category: 'melodic',
    descriptionFa: 'سمپل ساز بادی چوبی/نی طبیعی با نفس نایی',
    defaultRootMidi: 69
  },
  caval: {
    nameFa: 'کاوال چوبی کارپات',
    nameEn: 'Carpathian Wooden Caval',
    category: 'melodic',
    descriptionFa: 'سمپل فلوت چوبی بم دوئینای رومانی',
    defaultRootMidi: 60
  },
  tombak_tom: {
    nameFa: 'تنبک (ضربه تُم مرکز پوست)',
    nameEn: 'Tombak - Tom Center Hit',
    category: 'percussion',
    descriptionFa: 'سمپل ضربه بم میانه پوست تنبک (.wav / .mp3)',
    defaultRootMidi: 60
  },
  tombak_bak: {
    nameFa: 'تنبک (ضربه بَک کناره)',
    nameEn: 'Tombak - Bak Rim Snap',
    category: 'percussion',
    descriptionFa: 'سمپل ضربه زیر و شفاف کناره دهانه تنبک (.wav / .mp3)',
    defaultRootMidi: 60
  },
  daf: {
    nameFa: 'دف و حلقه زنگ‌دار',
    nameEn: 'Persian Frame Drum (Daf)',
    category: 'percussion',
    descriptionFa: 'سمپل کوبه‌ای دف به همراه طنین زنگ‌ها (.wav / .mp3)',
    defaultRootMidi: 60
  },
  clapper: {
    nameFa: 'تواکا / چوب‌آهنگ دانوب',
    nameEn: 'Carpathian Wooden Toacă',
    category: 'percussion',
    descriptionFa: 'سمپل ضربه چوبی ریتم‌های اکساک (.wav / .mp3)',
    defaultRootMidi: 60
  }
};

/**
 * بانک پیش‌فرض سمپل‌های واقعی استودیویی (.mp3 / .wav) از CDN جهانی
 * مدیر یا کاربر می‌تواند هر یک از این لینک‌ها را با لینک مستقیم .wav یا .mp3 دلخواه خود جایگزین کند
 */
export const DEFAULT_STUDIO_SAMPLE_URLS: Record<SampleInstrumentId, Record<number, string>> = {
  piano: {
    48: `${CDN_SAMPLE_BASE}/piano/C3.mp3`,
    55: `${CDN_SAMPLE_BASE}/piano/G3.mp3`,
    60: `${CDN_SAMPLE_BASE}/piano/C4.mp3`,
    67: `${CDN_SAMPLE_BASE}/piano/G4.mp3`,
    72: `${CDN_SAMPLE_BASE}/piano/C5.mp3`,
    79: `${CDN_SAMPLE_BASE}/piano/G5.mp3`
  },
  violin: {
    55: `${CDN_SAMPLE_BASE}/violin/G3.mp3`,
    60: `${CDN_SAMPLE_BASE}/violin/C4.mp3`,
    64: `${CDN_SAMPLE_BASE}/violin/E4.mp3`,
    69: `${CDN_SAMPLE_BASE}/violin/A4.mp3`,
    72: `${CDN_SAMPLE_BASE}/violin/C5.mp3`,
    76: `${CDN_SAMPLE_BASE}/violin/E5.mp3`
  },
  santur: {
    48: `${CDN_SAMPLE_BASE}/harp/C3.mp3`,
    55: `${CDN_SAMPLE_BASE}/harp/G3.mp3`,
    62: `${CDN_SAMPLE_BASE}/harp/D4.mp3`,
    69: `${CDN_SAMPLE_BASE}/harp/A4.mp3`,
    72: `${CDN_SAMPLE_BASE}/harp/C5.mp3`,
    79: `${CDN_SAMPLE_BASE}/harp/G5.mp3`
  },
  tambal: {
    48: `${CDN_SAMPLE_BASE}/harp/C3.mp3`,
    55: `${CDN_SAMPLE_BASE}/harp/G3.mp3`,
    62: `${CDN_SAMPLE_BASE}/harp/D4.mp3`,
    69: `${CDN_SAMPLE_BASE}/harp/A4.mp3`,
    72: `${CDN_SAMPLE_BASE}/harp/C5.mp3`
  },
  setar: {
    48: `${CDN_SAMPLE_BASE}/guitar-acoustic/C3.mp3`,
    55: `${CDN_SAMPLE_BASE}/guitar-acoustic/G3.mp3`,
    60: `${CDN_SAMPLE_BASE}/guitar-acoustic/C4.mp3`,
    67: `${CDN_SAMPLE_BASE}/guitar-acoustic/G4.mp3`,
    72: `${CDN_SAMPLE_BASE}/guitar-acoustic/C5.mp3`
  },
  bouzouki: {
    50: `${CDN_SAMPLE_BASE}/guitar-acoustic/D3.mp3`,
    57: `${CDN_SAMPLE_BASE}/guitar-acoustic/A3.mp3`,
    62: `${CDN_SAMPLE_BASE}/guitar-acoustic/D4.mp3`,
    69: `${CDN_SAMPLE_BASE}/guitar-acoustic/A4.mp3`,
    74: `${CDN_SAMPLE_BASE}/guitar-acoustic/D5.mp3`
  },
  ney: {
    60: `${CDN_SAMPLE_BASE}/flute/C4.mp3`,
    64: `${CDN_SAMPLE_BASE}/flute/E4.mp3`,
    69: `${CDN_SAMPLE_BASE}/flute/A4.mp3`,
    72: `${CDN_SAMPLE_BASE}/flute/C5.mp3`,
    76: `${CDN_SAMPLE_BASE}/flute/E5.mp3`
  },
  caval: {
    60: `${CDN_SAMPLE_BASE}/flute/C4.mp3`,
    64: `${CDN_SAMPLE_BASE}/flute/E4.mp3`,
    69: `${CDN_SAMPLE_BASE}/flute/A4.mp3`,
    72: `${CDN_SAMPLE_BASE}/flute/C5.mp3`
  },
  tombak_tom: {},
  tombak_bak: {},
  daf: {},
  clapper: {}
};

interface StoredCustomUrlEntry {
  url: string;
  fileName?: string;
}

type CustomUrlBank = Partial<Record<SampleInstrumentId, Record<number, StoredCustomUrlEntry>>>;

interface IdbSampleRecord {
  key: string; // `${instrument}_${midi}`
  instrument: SampleInstrumentId;
  midi: number;
  fileName: string;
  mimeType: string;
  data: ArrayBuffer;
}

class SynthesizerEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private metronomeGain: GainNode | null = null;
  private treatiseGain: GainNode | null = null;
  private treatiseOscs: OscillatorNode[] = [];
  private treatiseFilter: BiquadFilterNode | null = null;
  private isTreatiseActive: boolean = false;
  private analyser: AnalyserNode | null = null;
  private activeVoices: Set<{ stop: () => void }> = new Set();
  private scheduledTimerIds: number[] = [];
  private isMuted: boolean = false;

  // Decoded AudioBuffers per instrument and root MIDI note
  private decodedSamples: Record<SampleInstrumentId, Record<number, AudioBuffer>> = {
    piano: {},
    violin: {},
    santur: {},
    tambal: {},
    setar: {},
    bouzouki: {},
    ney: {},
    caval: {},
    tombak_tom: {},
    tombak_bak: {},
    daf: {},
    clapper: {}
  };

  // Status tracking for UI Sample Bank Manager
  private slotStatus: Record<SampleInstrumentId, Record<number, SampleSlotInfo>> = {
    piano: {},
    violin: {},
    santur: {},
    tambal: {},
    setar: {},
    bouzouki: {},
    ney: {},
    caval: {},
    tombak_tom: {},
    tombak_bak: {},
    daf: {},
    clapper: {}
  };

  private listeners: Set<() => void> = new Set();
  private preloadInitialized: boolean = false;
  private stringBufferCache: Map<string, AudioBuffer> = new Map();
  private percussionBufferCache: Map<PercussionSound, AudioBuffer> = new Map();

  constructor() {
    this.initializeSlotMetadata();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch {
        // ignore listener error
      }
    });
  }

  private getStoredCustomUrls(): CustomUrlBank {
    try {
      const raw = localStorage.getItem(CUSTOM_URLS_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as CustomUrlBank;
      }
    } catch {
      // ignore
    }
    return {};
  }

  private saveStoredCustomUrls(bank: CustomUrlBank) {
    try {
      localStorage.setItem(CUSTOM_URLS_STORAGE_KEY, JSON.stringify(bank));
    } catch (err) {
      console.error('[AudioEngine] Failed to save custom sample URLs:', err);
    }
  }

  private initializeSlotMetadata() {
    const customBank = this.getStoredCustomUrls();
    (Object.keys(INSTRUMENT_META) as SampleInstrumentId[]).forEach((inst) => {
      const defaults = DEFAULT_STUDIO_SAMPLE_URLS[inst] || {};
      const customs = customBank[inst] || {};
      const allMidis = Array.from(
        new Set([...Object.keys(defaults).map(Number), ...Object.keys(customs).map(Number)])
      ).sort((a, b) => a - b);

      this.slotStatus[inst] = {};
      for (const midi of allMidis) {
        const customEntry = customs[midi];
        const url = customEntry?.url || defaults[midi];
        if (!url) continue;
        this.slotStatus[inst][midi] = {
          midi,
          noteName: MIDI_NOTE_LABELS[midi] || `MIDI ${midi}`,
          url,
          isCustomUrl: Boolean(customEntry),
          fileName: customEntry?.fileName,
          status: 'loading'
        };
      }
    });
  }

  public initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(16, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(3.5, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.2, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      this.dryGain = this.ctx.createGain();
      this.dryGain.gain.setValueAtTime(0.86, this.ctx.currentTime);

      this.wetGain = this.ctx.createGain();
      this.wetGain.gain.setValueAtTime(0.26, this.ctx.currentTime);

      this.convolver = this.ctx.createConvolver();
      this.convolver.buffer = this.createAcousticRoomImpulse(1.5, 3.4);

      this.masterGain.connect(this.dryGain);
      this.masterGain.connect(this.convolver);
      this.convolver.connect(this.wetGain);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.85;

      this.dryGain.connect(this.compressor);
      this.wetGain.connect(this.compressor);
      this.compressor.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      this.metronomeGain = this.ctx.createGain();
      this.metronomeGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.metronomeGain.connect(this.compressor);

      this.treatiseGain = this.ctx.createGain();
      this.treatiseGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
      this.treatiseGain.connect(this.convolver);
      this.treatiseGain.connect(this.compressor);

      this.preloadAllSamples();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Opens IndexedDB to store and retrieve user-uploaded .wav / .mp3 files
   */
  private openSampleIdb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB not supported'));
        return;
      }
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: 'key' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private async loadUploadedSamplesFromIdb() {
    if (!this.ctx) return;
    try {
      const db = await this.openSampleIdb();
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.getAll();

      const records: IdbSampleRecord[] = await new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });

      for (const rec of records) {
        try {
          const cloned = rec.data.slice(0);
          const audioBuf = await this.ctx.decodeAudioData(cloned);
          this.decodedSamples[rec.instrument][rec.midi] = audioBuf;
          this.slotStatus[rec.instrument][rec.midi] = {
            midi: rec.midi,
            noteName: MIDI_NOTE_LABELS[rec.midi] || `MIDI ${rec.midi}`,
            url: `local://${rec.fileName}`,
            isCustomUpload: true,
            fileName: rec.fileName,
            status: 'loaded'
          };
        } catch (err) {
          console.warn('[AudioEngine] Failed decoding stored IDB sample:', rec.key, err);
        }
      }
      this.notifyListeners();
    } catch {
      // IDB optional
    }
  }

  /**
   * Preloads all configured .wav / .mp3 URLs and IndexedDB uploads into AudioBuffers
   */
  public preloadAllSamples() {
    if (this.preloadInitialized || !this.ctx) return;
    this.preloadInitialized = true;

    // 1. Load any user-uploaded .wav/.mp3 files from IndexedDB first
    this.loadUploadedSamplesFromIdb().then(() => {
      // 2. Fetch remote .wav / .mp3 sample URLs for slots not already overridden by local upload
      (Object.keys(INSTRUMENT_META) as SampleInstrumentId[]).forEach((inst) => {
        const slots = this.slotStatus[inst] || {};
        Object.values(slots).forEach((slot) => {
          if (!slot.isCustomUpload && slot.url && !slot.url.startsWith('local://')) {
            this.fetchAndDecodeSampleUrl(inst, slot.midi, slot.url, slot.isCustomUrl, slot.fileName);
          }
        });
      });
    });
  }

  private async fetchAndDecodeSampleUrl(
    instrument: SampleInstrumentId,
    midi: number,
    url: string,
    isCustomUrl?: boolean,
    fileName?: string
  ): Promise<boolean> {
    this.initContext();
    if (!this.ctx) return false;

    this.slotStatus[instrument][midi] = {
      midi,
      noteName: MIDI_NOTE_LABELS[midi] || `MIDI ${midi}`,
      url,
      isCustomUrl,
      fileName,
      status: 'loading'
    };
    this.notifyListeners();

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const arrayBuf = await response.arrayBuffer();
      const audioBuf = await this.ctx.decodeAudioData(arrayBuf);
      this.decodedSamples[instrument][midi] = audioBuf;
      this.slotStatus[instrument][midi] = {
        midi,
        noteName: MIDI_NOTE_LABELS[midi] || `MIDI ${midi}`,
        url,
        isCustomUrl,
        fileName,
        status: 'loaded'
      };
      this.notifyListeners();
      return true;
    } catch (err: any) {
      this.slotStatus[instrument][midi] = {
        midi,
        noteName: MIDI_NOTE_LABELS[midi] || `MIDI ${midi}`,
        url,
        isCustomUrl,
        fileName,
        status: 'error',
        errorMessage: err?.message || 'خطا در بارگذاری فایل صوتی'
      };
      this.notifyListeners();
      return false;
    }
  }

  /**
   * Public API: Set or add a direct .wav / .mp3 / .m4a URL for an instrument at a specific root MIDI note
   */
  public async setCustomSampleUrl(
    instrument: SampleInstrumentId,
    midi: number,
    url: string
  ): Promise<{ success: boolean; error?: string }> {
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      return { success: false, error: 'لینک فایل صوتی خالی است.' };
    }

    const customBank = this.getStoredCustomUrls();
    if (!customBank[instrument]) customBank[instrument] = {};
    customBank[instrument]![midi] = { url: cleanUrl };
    this.saveStoredCustomUrls(customBank);

    const ok = await this.fetchAndDecodeSampleUrl(instrument, midi, cleanUrl, true);
    if (!ok) {
      return {
        success: false,
        error: 'امکان دریافت یا رمزگشایی این لینک صوتی (.wav / .mp3) وجود ندارد. از مستقیم بودن لینک و فعال بودن CORS اطمینان حاصل کنید.'
      };
    }
    return { success: true };
  }

  /**
   * Public API: Upload a local .wav / .mp3 / .m4a file from user's device for an instrument
   */
  public async uploadCustomSampleFile(
    instrument: SampleInstrumentId,
    midi: number,
    file: File
  ): Promise<{ success: boolean; error?: string }> {
    this.initContext();
    if (!this.ctx) {
      return { success: false, error: 'موتور صوتی در دسترس نیست.' };
    }

    try {
      const arrayBuf = await file.arrayBuffer();
      const copyForDecode = arrayBuf.slice(0);
      const audioBuf = await this.ctx.decodeAudioData(copyForDecode);

      this.decodedSamples[instrument][midi] = audioBuf;
      this.slotStatus[instrument][midi] = {
        midi,
        noteName: MIDI_NOTE_LABELS[midi] || `MIDI ${midi}`,
        url: `local://${file.name}`,
        isCustomUpload: true,
        fileName: file.name,
        status: 'loaded'
      };

      // Save in IndexedDB for persistence across reloads
      try {
        const db = await this.openSampleIdb();
        const tx = db.transaction(IDB_STORE, 'readwrite');
        const store = tx.objectStore(IDB_STORE);
        const record: IdbSampleRecord = {
          key: `${instrument}_${midi}`,
          instrument,
          midi,
          fileName: file.name,
          mimeType: file.type || 'audio/wav',
          data: arrayBuf
        };
        store.put(record);
      } catch (idbErr) {
        console.warn('[AudioEngine] Could not persist sample to IDB:', idbErr);
      }

      this.notifyListeners();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: 'فرمت فایل صوتی معتبر نیست یا مرورگر قادر به رمزگشایی آن نمی‌باشد (فرمت‌های مجاز: WAV, MP3, M4A, OGG).'
      };
    }
  }

  /**
   * Public API: Reset an instrument back to its default studio sample bank
   */
  public async resetInstrumentSamples(instrument: SampleInstrumentId) {
    const customBank = this.getStoredCustomUrls();
    delete customBank[instrument];
    this.saveStoredCustomUrls(customBank);

    // Clear from IndexedDB
    try {
      const db = await this.openSampleIdb();
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const allKeysReq = store.getAllKeys();
      allKeysReq.onsuccess = () => {
        const keys = (allKeysReq.result || []) as string[];
        keys.forEach((k) => {
          if (k.startsWith(`${instrument}_`)) {
            store.delete(k);
          }
        });
      };
    } catch {
      // ignore
    }

    // Re-initialize default slots for this instrument
    this.decodedSamples[instrument] = {};
    this.slotStatus[instrument] = {};
    const defaults = DEFAULT_STUDIO_SAMPLE_URLS[instrument] || {};
    Object.entries(defaults).forEach(([midiStr, url]) => {
      const midi = Number(midiStr);
      this.fetchAndDecodeSampleUrl(instrument, midi, url, false);
    });
    this.notifyListeners();
  }

  /**
   * Public API: Returns full status of all instrument sample banks for UI management
   */
  public getAllInstrumentBanks(): InstrumentBankInfo[] {
    return (Object.keys(INSTRUMENT_META) as SampleInstrumentId[]).map((id) => {
      const meta = INSTRUMENT_META[id];
      const slotsObj = this.slotStatus[id] || {};
      const slots = Object.values(slotsObj).sort((a, b) => a.midi - b.midi);
      return {
        id,
        nameFa: meta.nameFa,
        nameEn: meta.nameEn,
        category: meta.category,
        descriptionFa: meta.descriptionFa,
        defaultRootMidi: meta.defaultRootMidi,
        slots
      };
    });
  }

  /**
   * Finds the closest decoded AudioBuffer sample for any target MIDI note
   */
  private findClosestDecodedSample(
    instrument: SampleInstrumentId,
    targetMidi: number
  ): { baseMidi: number; buffer: AudioBuffer } | null {
    const bank = this.decodedSamples[instrument];
    if (!bank) return null;
    const availableMidis = Object.keys(bank).map(Number);
    if (availableMidis.length === 0) return null;

    let closestMidi = availableMidis[0];
    let minDiff = Math.abs(targetMidi - closestMidi);
    for (const m of availableMidis) {
      const diff = Math.abs(targetMidi - m);
      if (diff < minDiff) {
        minDiff = diff;
        closestMidi = m;
      }
    }
    return { baseMidi: closestMidi, buffer: bank[closestMidi] };
  }

  private createAcousticRoomImpulse(durationSec: number, decayRate: number): AudioBuffer {
    const sr = this.ctx!.sampleRate;
    const length = Math.floor(sr * durationSec);
    const impulse = this.ctx!.createBuffer(2, length, sr);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    const earlyReflectionsMs = [11, 19, 27, 36, 44, 53];
    const earlyGains = [0.42, -0.32, 0.25, -0.2, 0.16, 0.12];

    for (let idx = 0; idx < earlyReflectionsMs.length; idx++) {
      const sampleIdx = Math.floor((earlyReflectionsMs[idx] / 1000) * sr);
      if (sampleIdx < length) {
        left[sampleIdx] += earlyGains[idx];
        right[Math.min(length - 1, sampleIdx + Math.floor(sr * 0.0012))] += earlyGains[idx] * 0.92;
      }
    }

    let lpL = 0;
    let lpR = 0;
    for (let i = 0; i < length; i++) {
      const t = i / sr;
      const env = Math.exp(-t * decayRate);
      const damp = Math.max(0.12, 0.65 * Math.exp(-t * 1.8));
      const rawL = (Math.random() * 2 - 1) * env * 0.26;
      const rawR = (Math.random() * 2 - 1) * env * 0.26;
      lpL = lpL + damp * (rawL - lpL);
      lpR = lpR + damp * (rawR - lpR);
      left[i] += lpL;
      right[i] += lpR;
    }

    return impulse;
  }

  /**
   * Physical Waveguide fallback only while network samples are still downloading
   */
  private getPhysicalFallbackBuffer(freq: number, duration: number, timbre: TimbreType): AudioBuffer {
    const sr = this.ctx!.sampleRate;
    const roundedFreq = Math.round(freq * 100) / 100;
    const cacheKey = `${timbre}_${roundedFreq}_${Math.round(duration * 10)}`;
    const cached = this.stringBufferCache.get(cacheKey);
    if (cached) return cached;

    const totalSamples = Math.floor(sr * Math.min(duration + 0.3, 3.2));
    const buffer = this.ctx!.createBuffer(1, totalSamples, sr);
    const out = buffer.getChannelData(0);

    const delayLength = Math.max(8, Math.round(sr / freq));
    const delayLine = new Float32Array(delayLength);
    for (let i = 0; i < delayLength; i++) {
      delayLine[i] = (Math.random() * 2 - 1) * Math.exp(-i / (delayLength * 0.5));
    }

    let ptr = 0;
    let lastOut = 0;
    for (let n = 0; n < totalSamples; n++) {
      const current = delayLine[ptr];
      const nextPtr = (ptr + 1) % delayLength;
      const filtered = 0.35 * lastOut + 0.65 * (0.5 * (current + delayLine[nextPtr]));
      lastOut = filtered;
      delayLine[ptr] = filtered * 0.9965;
      out[n] = current * 0.5;
      ptr = nextPtr;
    }

    this.stringBufferCache.set(cacheKey, buffer);
    return buffer;
  }

  public getAnalyser(): AnalyserNode | null {
    this.initContext();
    return this.analyser;
  }

  public setVolume(val: number) {
    this.initContext();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }

  public setMetronomeVolume(val: number) {
    this.initContext();
    if (this.metronomeGain && this.ctx) {
      this.metronomeGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }

  public setTreatiseVolume(val: number) {
    this.initContext();
    if (this.treatiseGain && this.ctx) {
      this.treatiseGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.setVolume(this.isMuted ? 0 : 0.85);
    this.setMetronomeVolume(this.isMuted ? 0 : 0.85);
    return this.isMuted;
  }

  public stopAll() {
    for (const tid of this.scheduledTimerIds) {
      window.clearTimeout(tid);
    }
    this.scheduledTimerIds = [];

    for (const voice of this.activeVoices) {
      try {
        voice.stop();
      } catch {
        // already stopped
      }
    }
    this.activeVoices.clear();
  }

  public midiToFreq(midi: number, centOffset = 0): number {
    const baseFreq = 440 * Math.pow(2, (midi - 69) / 12);
    return baseFreq * Math.pow(2, centOffset / 1200);
  }

  /**
   * Plays a melodic note using the decoded .wav / .mp3 sample bank with exact microtonal playbackRate
   */
  public playNote(
    midi: number,
    centOffset = 0,
    timbre: TimbreType = 'piano',
    articulation: ArticulationType = 'glissando',
    duration = 1.6,
    startTimeOffset = 0
  ): { stop: () => void } {
    this.initContext();
    if (!this.ctx || !this.masterGain) return { stop: () => {} };

    const t0 = this.ctx.currentTime + startTimeOffset;
    const dur = articulation === 'staccato' ? Math.min(0.32, duration) : Math.max(0.55, duration);

    const voiceGain = this.ctx.createGain();
    voiceGain.connect(this.masterGain);

    const nodesToStop: (AudioNode & { stop?: (when?: number) => void })[] = [];

    // Lookup closest real decoded .wav / .mp3 sample for the requested instrument
    // (or fallback to piano/violin sample if that instrument is still loading)
    const sampleMatch =
      this.findClosestDecodedSample(timbre, midi) ||
      this.findClosestDecodedSample('piano', midi);

    if (sampleMatch) {
      const semitoneDelta = (midi - sampleMatch.baseMidi) + (centOffset / 100);
      const targetRate = Math.pow(2, semitoneDelta / 12);

      // Instrument-specific acoustic shaping on the real sample
      const isBowedOrWind = timbre === 'violin' || timbre === 'ney' || timbre === 'caval';
      const isHammeredCourse = timbre === 'santur' || timbre === 'tambal' || timbre === 'bouzouki';

      const attackSec = isBowedOrWind
        ? (articulation === 'staccato' ? 0.02 : 0.065)
        : 0.004;
      const releaseTailSec = isHammeredCourse ? 0.65 : 0.38;

      voiceGain.gain.setValueAtTime(0.0001, t0);
      voiceGain.gain.linearRampToValueAtTime(0.95, t0 + attackSec);
      voiceGain.gain.setValueAtTime(0.88, t0 + dur * 0.75);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + releaseTailSec);

      // Primary Sample Buffer Source
      const src = this.ctx.createBufferSource();
      src.buffer = sampleMatch.buffer;

      if (isBowedOrWind && articulation === 'glissando') {
        // Gentle Persian micro-portamento slide into the note
        src.playbackRate.setValueAtTime(targetRate * 0.993, t0);
        src.playbackRate.exponentialRampToValueAtTime(targetRate, t0 + 0.045);
      } else {
        src.playbackRate.setValueAtTime(targetRate, t0);
      }

      // Acoustic body EQ filter tailored to the instrument
      const eqFilter = this.ctx.createBiquadFilter();
      if (timbre === 'santur') {
        eqFilter.type = 'peaking';
        eqFilter.frequency.setValueAtTime(3400, t0);
        eqFilter.Q.setValueAtTime(1.4, t0);
        eqFilter.gain.setValueAtTime(4.5, t0);
      } else if (timbre === 'setar') {
        eqFilter.type = 'peaking';
        eqFilter.frequency.setValueAtTime(1850, t0);
        eqFilter.Q.setValueAtTime(1.6, t0);
        eqFilter.gain.setValueAtTime(3.8, t0);
      } else if (timbre === 'ney' || timbre === 'caval') {
        eqFilter.type = 'lowpass';
        eqFilter.frequency.setValueAtTime(timbre === 'ney' ? 3600 : 2400, t0);
      } else {
        eqFilter.type = 'allpass';
      }

      src.connect(eqFilter);
      eqFilter.connect(voiceGain);
      src.start(t0);
      src.stop(t0 + dur + releaseTailSec + 0.05);
      nodesToStop.push(src);

      // For Santur, Țambal, and Bouzouki, trigger a second unison course string (+1.4 cents, 7ms micro-delay)
      // using the real sample to create authentic multi-string kharak shimmer
      if (isHammeredCourse) {
        const unisonSrc = this.ctx.createBufferSource();
        unisonSrc.buffer = sampleMatch.buffer;
        const unisonRate = targetRate * Math.pow(2, 1.4 / 1200);
        unisonSrc.playbackRate.setValueAtTime(unisonRate, t0 + 0.006);

        const unisonGain = this.ctx.createGain();
        unisonGain.gain.setValueAtTime(0.38, t0 + 0.006);

        unisonSrc.connect(unisonGain);
        unisonGain.connect(eqFilter);
        unisonSrc.start(t0 + 0.006);
        unisonSrc.stop(t0 + dur + releaseTailSec + 0.05);
        nodesToStop.push(unisonSrc);
      }
    } else {
      // Physical waveguide fallback only during the first second before CDN samples finish decoding
      const freq = this.midiToFreq(midi, centOffset);
      const wgBuf = this.getPhysicalFallbackBuffer(freq, dur, timbre);
      const wgSrc = this.ctx.createBufferSource();
      wgSrc.buffer = wgBuf;

      voiceGain.gain.setValueAtTime(0.0001, t0);
      voiceGain.gain.linearRampToValueAtTime(0.9, t0 + 0.005);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.25);

      wgSrc.connect(voiceGain);
      wgSrc.start(t0);
      wgSrc.stop(t0 + dur + 0.3);
      nodesToStop.push(wgSrc);
    }

    const voiceHandle = {
      stop: () => {
        try {
          voiceGain.gain.setTargetAtTime(0.0001, this.ctx?.currentTime || 0, 0.025);
          nodesToStop.forEach((n) => {
            if (n.stop) n.stop((this.ctx?.currentTime || 0) + 0.04);
          });
        } catch {}
        this.activeVoices.delete(voiceHandle);
      }
    };

    this.activeVoices.add(voiceHandle);
    return voiceHandle;
  }

  /**
   * Generates a natural acoustic percussion AudioBuffer when no custom .wav/.mp3 percussion sample is uploaded yet
   */
  private getDefaultPercussionBuffer(sound: PercussionSound): AudioBuffer {
    const cached = this.percussionBufferCache.get(sound);
    if (cached) return cached;

    const sr = this.ctx!.sampleRate;
    const duration = sound === 'tombak_tom' ? 0.42 : sound === 'daf' ? 0.35 : 0.18;
    const length = Math.floor(sr * duration);
    const buf = this.ctx!.createBuffer(1, length, sr);
    const data = buf.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sr;
      if (sound === 'tombak_tom') {
        // Warm goatskin center membrane + wooden goblet resonance
        const pitchEnv = 64 + 82 * Math.exp(-t * 36);
        const bodyEnv = Math.exp(-t * 9.5);
        const slap = (Math.random() * 2 - 1) * Math.exp(-t * 95) * 0.28;
        data[i] = (Math.sin(2 * Math.PI * pitchEnv * t) * 0.85 + Math.sin(2 * Math.PI * 114 * t) * 0.25) * bodyEnv + slap;
      } else if (sound === 'tombak_bak') {
        // Crisp rim finger-snap harmonics
        const env = Math.exp(-t * 28);
        const snap = (Math.random() * 2 - 1) * Math.exp(-t * 80) * 0.35;
        data[i] =
          (Math.sin(2 * Math.PI * 385 * t) * 0.6 +
            Math.sin(2 * Math.PI * 615 * t) * 0.3 +
            Math.sin(2 * Math.PI * 960 * t) * 0.18) *
            env +
          snap;
      } else if (sound === 'daf') {
        // Frame drum membrane + metallic zang rings
        const skinEnv = Math.exp(-t * 14);
        const zangEnv = Math.exp(-t * 11) * (1 - Math.exp(-t * 60));
        const zangNoise = (Math.random() * 2 - 1) * Math.sin(2 * Math.PI * 4600 * t) * zangEnv * 0.42;
        data[i] = Math.sin(2 * Math.PI * (82 + 75 * Math.exp(-t * 30)) * t) * skinEnv * 0.75 + zangNoise;
      } else {
        // Wooden Toacă board strike
        const woodEnv = Math.exp(-t * 38);
        data[i] =
          (Math.sin(2 * Math.PI * 680 * t) * 0.6 +
            Math.sin(2 * Math.PI * 1090 * t) * 0.35 +
            Math.sin(2 * Math.PI * 1720 * t) * 0.2) *
          woodEnv;
      }
    }

    this.percussionBufferCache.set(sound, buf);
    return buf;
  }

  /**
   * Plays percussion hit using uploaded/linked .wav/.mp3 sample if available, or acoustic sample buffer
   */
  public playPercussion(sound: PercussionSound, volume = 0.8) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t0 = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.95, t0);
    gain.connect(this.masterGain);

    const customMatch = this.findClosestDecodedSample(sound, 60);
    const bufferToPlay = customMatch ? customMatch.buffer : this.getDefaultPercussionBuffer(sound);

    const src = this.ctx.createBufferSource();
    src.buffer = bufferToPlay;
    src.connect(gain);
    src.start(t0);
  }

  /**
   * Natural Rosewood Block Metronome Click
   */
  public playMetronomeClick(accent: 'high' | 'low' = 'low', volume = 0.85) {
    this.initContext();
    if (!this.ctx || !this.metronomeGain) return;

    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const freq = accent === 'high' ? 1480 : 980;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t0);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.72, t0 + 0.022);

    const peak = (accent === 'high' ? 0.92 : 0.72) * volume;
    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + 0.0015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.028);

    osc.connect(gain);
    gain.connect(this.metronomeGain);

    osc.start(t0);
    osc.stop(t0 + 0.035);
  }

  public isTreatiseAudioPlaying(): boolean {
    return this.isTreatiseActive;
  }

  public startTreatiseAudio() {
    this.initContext();
    if (!this.ctx || !this.treatiseGain || this.isTreatiseActive) return;

    this.stopTreatiseAudio();
    this.isTreatiseActive = true;

    const t0 = this.ctx.currentTime;
    this.treatiseFilter = this.ctx.createBiquadFilter();
    this.treatiseFilter.type = 'lowpass';
    this.treatiseFilter.frequency.setValueAtTime(680, t0);
    this.treatiseFilter.connect(this.treatiseGain);

    const baseFreqs = [130.81, 196.00, 261.63, 392.00];
    baseFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.treatiseFilter) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t0);
      oscGain.gain.setValueAtTime(0.001, t0);
      oscGain.gain.linearRampToValueAtTime(0.11 / (idx + 1), t0 + 1.8);

      osc.connect(oscGain);
      oscGain.connect(this.treatiseFilter);
      osc.start(t0);
      this.treatiseOscs.push(osc);
    });
  }

  public stopTreatiseAudio() {
    if (this.ctx) {
      for (const osc of this.treatiseOscs) {
        try {
          osc.stop();
        } catch {
          // Ignore
        }
      }
    }
    this.treatiseOscs = [];
    this.isTreatiseActive = false;
  }

  public playScaleSequence(
    scaleMidiNotes: number[],
    microCents: Record<number, number> = {},
    timbre: TimbreType = 'piano',
    articulation: ArticulationType = 'glissando',
    onNoteTrigger?: (midi: number) => void,
    onComplete?: () => void
  ) {
    this.stopAll();
    this.initContext();

    const sequence: number[] = [...scaleMidiNotes];
    for (let i = scaleMidiNotes.length - 2; i >= 0; i--) {
      sequence.push(scaleMidiNotes[i]);
    }

    const stepIntervalMs = Math.max(240, Math.min(500, Math.floor(10000 / sequence.length)));

    sequence.forEach((midi, idx) => {
      const tid = window.setTimeout(() => {
        const pitchClass = midi % 12;
        const centOffset = microCents[pitchClass] || 0;
        this.playNote(midi, centOffset, timbre, articulation, 0.75);
        if (onNoteTrigger) onNoteTrigger(midi);

        if (idx === sequence.length - 1 && onComplete) {
          const finishTid = window.setTimeout(onComplete, 750);
          this.scheduledTimerIds.push(finishTid);
        }
      }, idx * stepIntervalMs);

      this.scheduledTimerIds.push(tid);
    });
  }

  public playContinuumSuite(
    onPhaseChange?: (phase: string) => void,
    onComplete?: () => void
  ): () => void {
    this.stopAll();
    this.initContext();

    interface SuiteStep {
      midi: number;
      centOffset: number;
      timbre: TimbreType;
      durationSec: number;
      stepGapSec: number;
      phaseName: string;
    }

    const suiteSteps: SuiteStep[] = [
      { midi: 67, centOffset: 0, timbre: 'santur', durationSec: 1.4, stepGapSec: 0.9, phaseName: 'فلات کهن ایران (سنتور - درآمد شور)' },
      { midi: 69, centOffset: -45, timbre: 'santur', durationSec: 1.2, stepGapSec: 0.8, phaseName: 'فلات کهن ایران (سی کُرن - ریزپرده اصیل)' },
      { midi: 70, centOffset: 0, timbre: 'santur', durationSec: 1.2, stepGapSec: 0.8, phaseName: 'فلات کهن ایران (سنتور)' },
      { midi: 72, centOffset: 0, timbre: 'santur', durationSec: 1.5, stepGapSec: 1.1, phaseName: 'فلات کهن ایران (اوج دانگ اول)' },
      { midi: 74, centOffset: 0, timbre: 'ney', durationSec: 1.9, stepGapSec: 1.3, phaseName: 'فلات کهن ایران (نوای نای هفت‌بند)' },
      { midi: 72, centOffset: 0, timbre: 'ney', durationSec: 1.3, stepGapSec: 0.9, phaseName: 'فلات کهن ایران (تحریر نی)' },
      { midi: 70, centOffset: 0, timbre: 'santur', durationSec: 1.2, stepGapSec: 0.8, phaseName: 'فلات کهن ایران (سنتور)' },
      { midi: 69, centOffset: -45, timbre: 'santur', durationSec: 1.3, stepGapSec: 0.9, phaseName: 'فلات کهن ایران (فرود کُرن)' },
      { midi: 67, centOffset: 0, timbre: 'santur', durationSec: 2.4, stepGapSec: 1.7, phaseName: 'فلات کهن ایران (ایست کامل شور)' },

      { midi: 67, centOffset: 0, timbre: 'setar', durationSec: 1.1, stepGapSec: 0.7, phaseName: 'پل شاهراه آناتولی (سه‌تار و تنبور)' },
      { midi: 69, centOffset: -22, timbre: 'bouzouki', durationSec: 1.0, stepGapSec: 0.6, phaseName: 'پل شاهراه آناتولی (کمای هولدرین)' },
      { midi: 70, centOffset: 0, timbre: 'setar', durationSec: 1.0, stepGapSec: 0.6, phaseName: 'پل شاهراه آناتولی (مقام اوشاک)' },
      { midi: 72, centOffset: 0, timbre: 'bouzouki', durationSec: 1.2, stepGapSec: 0.8, phaseName: 'پل شاهراه آناتولی (طنین بوزوکی)' },
      { midi: 74, centOffset: 0, timbre: 'bouzouki', durationSec: 1.4, stepGapSec: 1.0, phaseName: 'پل شاهراه آناتولی (گردش سماعی)' },
      { midi: 72, centOffset: 0, timbre: 'setar', durationSec: 1.1, stepGapSec: 0.7, phaseName: 'پل شاهراه آناتولی (سه‌تار)' },
      { midi: 69, centOffset: -22, timbre: 'bouzouki', durationSec: 1.1, stepGapSec: 0.8, phaseName: 'پل شاهراه آناتولی (کما)' },
      { midi: 67, centOffset: 0, timbre: 'setar', durationSec: 1.9, stepGapSec: 1.4, phaseName: 'پل شاهراه آناتولی (فرود آناتولی)' },

      { midi: 67, centOffset: 0, timbre: 'caval', durationSec: 1.9, stepGapSec: 1.4, phaseName: 'حوضه کارپات-دانوب (سوز دوئینای رومانی با کاوال)' },
      { midi: 70, centOffset: 0, timbre: 'caval', durationSec: 1.5, stepGapSec: 1.1, phaseName: 'حوضه کارپات-دانوب (کاوال چوبی)' },
      { midi: 73, centOffset: 35, timbre: 'caval', durationSec: 1.7, stepGapSec: 1.2, phaseName: 'حوضه کارپات-دانوب (چهارم افزوده لیدیایی)' },
      { midi: 74, centOffset: 0, timbre: 'caval', durationSec: 2.0, stepGapSec: 1.4, phaseName: 'حوضه کارپات-دانوب (اوج دوئینا)' },
      { midi: 74, centOffset: 0, timbre: 'tambal', durationSec: 0.65, stepGapSec: 0.35, phaseName: 'حوضه کارپات-دانوب (پایکوبی هورا با تسمبال)' },
      { midi: 72, centOffset: 0, timbre: 'tambal', durationSec: 0.65, stepGapSec: 0.35, phaseName: 'حوضه کارپات-دانوب (تسمبال لوتاری)' },
      { midi: 73, centOffset: 35, timbre: 'tambal', durationSec: 0.7, stepGapSec: 0.35, phaseName: 'حوضه کارپات-دانوب (تسمبال)' },
      { midi: 74, centOffset: 0, timbre: 'tambal', durationSec: 0.7, stepGapSec: 0.35, phaseName: 'حوضه کارپات-دانوب (تسمبال)' },
      { midi: 76, centOffset: 0, timbre: 'tambal', durationSec: 0.8, stepGapSec: 0.45, phaseName: 'حوضه کارپات-دانوب (مضراب‌های سریع)' },
      { midi: 74, centOffset: 0, timbre: 'tambal', durationSec: 0.65, stepGapSec: 0.35, phaseName: 'حوضه کارپات-دانوب (فرود هورا)' },
      { midi: 72, centOffset: 0, timbre: 'tambal', durationSec: 0.7, stepGapSec: 0.4, phaseName: 'حوضه کارپات-دانوب (تسمبال)' },
      { midi: 70, centOffset: 0, timbre: 'tambal', durationSec: 0.8, stepGapSec: 0.5, phaseName: 'حوضه کارپات-دانوب (فرود)' },
      { midi: 67, centOffset: 0, timbre: 'tambal', durationSec: 2.8, stepGapSec: 2.2, phaseName: 'حوضه کارپات-دانوب (طنین پایانی وحدت پیوستار)' }
    ];

    let accumulatedMs = 0;
    suiteSteps.forEach((step, idx) => {
      const tid = window.setTimeout(() => {
        this.playNote(step.midi, step.centOffset, step.timbre, 'glissando', step.durationSec);
        if (onPhaseChange) onPhaseChange(step.phaseName);

        if (idx === suiteSteps.length - 1 && onComplete) {
          const endTid = window.setTimeout(onComplete, Math.floor(step.durationSec * 1000 + 800));
          this.scheduledTimerIds.push(endTid);
        }
      }, accumulatedMs);

      this.scheduledTimerIds.push(tid);
      accumulatedMs += Math.floor(step.stepGapSec * 1000);
    });

    return () => this.stopAll();
  }

  public playMotifMelody(
    melody: SequenceStep[],
    timbre: TimbreType = 'violin',
    tempoBpm = 110,
    onNoteTrigger?: (midi: number) => void,
    onComplete?: () => void
  ) {
    this.stopAll();
    this.initContext();

    const beatMs = (60 / tempoBpm) * 1000;
    let accumulatedTime = 0;

    melody.forEach((step, idx) => {
      const stepDurationMs = step.dur * beatMs;
      const tid = window.setTimeout(() => {
        this.playNote(step.midi, step.centOffset || 0, timbre, 'glissando', step.dur * (60 / tempoBpm) * 1.25);
        if (onNoteTrigger) onNoteTrigger(step.midi);

        if (idx === melody.length - 1 && onComplete) {
          const finishTid = window.setTimeout(onComplete, Math.floor(stepDurationMs + 600));
          this.scheduledTimerIds.push(finishTid);
        }
      }, accumulatedTime);

      this.scheduledTimerIds.push(tid);
      accumulatedTime += stepDurationMs;
    });
  }

  public playTriadChord(midis: number[], timbre: TimbreType = 'piano') {
    this.initContext();
    midis.forEach((midi, idx) => {
      this.playNote(midi, 0, timbre, 'glissando', 2.2, idx * 0.025);
    });
  }

  public playScaleDemonstration(
    scaleId: string,
    onNoteTriggerOrInstrument?: ((noteName: string) => void) | TimbreType,
    onComplete?: () => void
  ): () => void {
    const noteCb = typeof onNoteTriggerOrInstrument === 'function' ? onNoteTriggerOrInstrument : undefined;
    return this.playContinuumSuite((phase) => {
      if (noteCb) noteCb(phase);
    }, onComplete);
  }

  public playMicrotone(
    semitonesFromC4: number,
    centOffset = 0,
    instrumentType: TimbreType = 'santur',
    duration = 2.0
  ): { stop: () => void } {
    return this.playNote(60 + semitonesFromC4, centOffset, instrumentType, 'glissando', duration);
  }
}

export const audioEngine = new SynthesizerEngine();
