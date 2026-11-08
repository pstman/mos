/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * تالار جامع سازهای اوراسیا • از فلات کهن ایران تا حوزه رود دانوب
 * تبیین دقیق ارگانولوژی تطبیقی، شیوه کوک، جغرافیای خاستگاه، اقوام نگهدارنده و پویایی معاصر سازها
 * مؤلف و طراح: ایمان برزجان | استودیو اینامیکس (EnamiX)
 */

import React, { useState } from 'react';
import { Volume2, Music, Compass, Globe, Sparkles, Filter, CheckCircle2, History } from 'lucide-react';
import { audioEngine, TimbreType } from '../utils/audioEngine';

export interface EurasianInstrument {
  id: string;
  namePersian: string;
  nameOriginal: string;
  hornbostelSachs: string; // رده‌بندی زاخس-هورن‌بوستل
  regionSphere: 'iran_plateau' | 'anatolia_mesopotamia' | 'balkan_danube';
  regionTitle: string;
  tuningDetails: string; // ۱. نحوه کوک
  originGeography: string; // ۲. جغرافیای پیدایش و تاریخچه
  ethnicPeoples: string; // ۳. قوم و منطقه‌ای که از آن استفاده می‌کنند
  currentStatus: string; // ۴. وضعیت فعلی ساز (زنده و پویا یا گرد و خاک گرفته)
  isThriving: boolean; // زنده و پویا یا در حاشیه
  sampleTimbre: TimbreType;
  auditionMidi: number;
  auditionCent: number;
  acousticNote: string;
  visualBadgeEmoji: string;
}

export const EURASIAN_INSTRUMENTS: EurasianInstrument[] = [
  {
    id: 'tar',
    namePersian: 'تار ایرانی',
    nameOriginal: 'Tār (شاه‌کاسه و نقاره دوتکه)',
    hornbostelSachs: '۳۲۱.۳۲۲ (کُردوفون زهی زخمه‌ای با کاسه طنینی پوستی)',
    regionSphere: 'iran_plateau',
    regionTitle: 'فلات مرکزی ایران، شیراز، اصفهان و قفقاز',
    tuningDetails: 'کوک مبنا بر پایه دو - دو - سل - سل - دو - دو (سیم‌های سفید، زرد و هنگام-مشتاق)؛ در مایه‌های افشاری و دشتی به دو - سل - ر - ر و در چهارگاه و اصفهان به دو - فا - دو - دو تغییر می‌یابد.',
    originGeography: 'فلات باستانی ایران و تکامل‌یافته از رباب و تنبور ساسانی؛ فرم ۶ سیمه نوین در دربار قاجار به دستان خنیاگر آقا علی‌اکبر فراهانی و غلامحسین درویش تکامل نهایی یافت.',
    ethnicPeoples: 'خنیاگران ردیف فلات مرکزی ایران، اقوام آذری در حوزه قفقاز، و خنیاگران کلاسیک تاجیکستان و خراسان بزرگ.',
    currentStatus: 'بسیار زنده و پویا؛ ساز سلطان و محور اصلی رپرتوار موسیقی دستگاهی ایران، با مراکز آموزش عالی متعدد و میلیون‌ها شنونده فعال.',
    isThriving: true,
    sampleTimbre: 'setar',
    auditionMidi: 60,
    auditionCent: 0,
    acousticNote: 'پوست بره تودلی، خرک شاخ کل و پرده‌های زه روده ۲۸ تایی با فواصل خنثی',
    visualBadgeEmoji: '🪕'
  },
  {
    id: 'setar',
    namePersian: 'سه‌تار',
    nameOriginal: 'Setār (چهارسیم زرین)',
    hornbostelSachs: '۳۲۱.۳۲۱ (کُردوفون دسته‌بلند زهی زخمه‌ای چوبی بدون پوست)',
    regionSphere: 'iran_plateau',
    regionTitle: 'فلات ایران و بزم‌های عرفانی شیراز و اصفهان',
    tuningDetails: 'سیم یکم سفید (دو C4)، سیم دوم زرد (سل G3)، سیم سوم مشتاق (دو C4)، و سیم چهارم بم (دو C3 یا سل G2 بسته به مایه و دستگاه).',
    originGeography: 'مشتق از خانواده تنبور خراسان در ادوار نخستین پس از اسلام؛ در سده سیزدهم هجری سیم چهارم آن توسط درویش مشتاق‌علی‌شاه کرمانی افزوده شد.',
    ethnicPeoples: 'خنیاگران عرفانی و فلات‌نشینان ایران، یاران خانقاه و پژوهشگران معاصر ردیف میرزاعبدالله و ابوالحسن صبا.',
    currentStatus: 'فوق‌العاده زنده، ریشه‌دار و پویا؛ سازِ خلوت، اندیشه و نجوای درون‌گرایانه ایرانی با مکاتب نوازندگی پرشمار.',
    isThriving: true,
    sampleTimbre: 'setar',
    auditionMidi: 60,
    auditionCent: 0,
    acousticNote: 'کاسه چوب توت کهن، صفحه نازک افرا و نوازندگی منحصراً با ناخن سبابه راست',
    visualBadgeEmoji: '🪵'
  },
  {
    id: 'tanbur',
    namePersian: 'تنبور باستانی',
    nameOriginal: 'Tanbūr (ساز ذکر و هوره‌های کهن)',
    hornbostelSachs: '۳۲۱.۳۲۱ (کُردوفون زهی زخمه‌ای دسته‌بلند کهن)',
    regionSphere: 'iran_plateau',
    regionTitle: 'زاگرس مرکزی، دالاهو، گوران، صحنه و کرمانشاه',
    tuningDetails: 'دو کوک آیینی اصلی دارد: کوک پنج‌پایه (دو - دو - سل) برای نغمه‌های رزمی و سماعی؛ و کوک باستانی طرز (دو - دو - فا یا ر) ویژه مقام‌های حقانی و کلام‌های مقدس.',
    originGeography: 'شوش و تمدن عیلام باستان (هزاره دوم پیش از میلاد) و حجاری‌های طاق‌بستان ساسانی؛ کهن‌ترین ساز زهی پیوسته در تاریخ بشر.',
    ethnicPeoples: 'مردم کُرد زبان زاگرس و پیروان کهن آیین یارسان (اهل حق) در گوران، کرند و صحنه.',
    currentStatus: 'بسیار زنده و در اوج حرمت قدسی؛ نواختن آن با پنجه‌ریزی‌های سریع (شُر) در خانقاه‌ها همچنان آمیخته با قداست هزاره‌های پیشین است.',
    isThriving: true,
    sampleTimbre: 'setar',
    auditionMidi: 55,
    auditionCent: 0,
    acousticNote: 'چوب توت یکپارچه یا ترکه‌ای، ۱۴ پرده باستانی و شیوه نواختن پنجه‌ای خروشان',
    visualBadgeEmoji: '✨'
  },
  {
    id: 'dotar',
    namePersian: 'دوتار کهن خراسان و ترکمن‌صحرا',
    nameOriginal: 'Dotār (خنیاگری حماسی بخشی‌ها)',
    hornbostelSachs: '۳۲۱.۳۲۱ (کُردوفون دوتار زهی زخمه‌ای دسته‌بلند)',
    regionSphere: 'iran_plateau',
    regionTitle: 'خراسان بزرگ (قوچان، تربت جام، هرات) و ترکمن‌صحرا',
    tuningDetails: 'دو کوک مشهور دارد: کوک چهارگاه/نوایی بر مبنای فاصله چهارم (فا - دو یا ر - لا)؛ و کوک تجنیس/گرایلی بر مبنای فاصله پنجم درست (سل - دو).',
    originGeography: 'استپ‌های باستانی فرارود، خوارزم و ماوراءالنهر؛ تنیده در فرهنگ راویان حماسه‌های کوراوغلو و شاهنامه.',
    ethnicPeoples: 'بخشی‌های ترکمن، کردهای کرمانج شمال خراسان، و خنیاگران فارسی‌زبان هرات و شرق ایران.',
    currentStatus: 'کاملاً پویا و زنده؛ ثبت در فهرست میراث ناملموس جهانی یونسکو، با حضور نسل‌های نوین بخشی‌ها و جشنواره‌های حماسی.',
    isThriving: true,
    sampleTimbre: 'setar',
    auditionMidi: 58,
    auditionCent: 0,
    acousticNote: 'دو سیم ابریشمی کهن (اکنون فولادی)، پرده‌بندی ۱۳ تا ۱۸ تایی و سرپنجه‌های محکم',
    visualBadgeEmoji: '🌾'
  },
  {
    id: 'santur',
    namePersian: 'سنتور ایرانی',
    nameOriginal: 'Santūr (زنگ‌بار ۷۲ سیمه)',
    hornbostelSachs: '۳۱۴.۱۲۲ (کُردوفون جعبه‌ای کوبه‌ای با مضراب‌های سبک)',
    regionSphere: 'iran_plateau',
    regionTitle: 'فلات کهن ایران، بین‌النهرین و قفقاز',
    tuningDetails: 'ساز دارای ۹ خرک زرد (بم) و ۹ خرک سفید (زیر) و ۹ خرک پشت‌خرک است؛ کوک‌های متنوع ردیف بر پایه‌های لا (راست‌کوک)، رِ (چپ‌کوک) و می صورت می‌پذیرد.',
    originGeography: 'تمدن کهن بابل و آشور (کتیبه‌های نینوا ۶۶۹ پیش از میلاد) و دوران ساسانی؛ ساختار ۹ خرکی مدرن در عصر قاجار نظام‌مند شد.',
    ethnicPeoples: 'خنیاگران سراسر فلات ایران، شهرهای شیراز، اصفهان، ری و تهران، با انطباق‌هایی در عراق و آذربایجان.',
    currentStatus: 'در اوج بالندگی، شکوه و حیات؛ پای ثابت ارکسترهای موسیقی کلاسیک ایران و تکنوازی‌های سرعتی و ریزپردازانه.',
    isThriving: true,
    sampleTimbre: 'santur',
    auditionMidi: 69,
    auditionCent: 0,
    acousticNote: 'چوب گردوی کهن کهنه‌شور، کلاف‌های سخت و مضراب‌های باریک چوبی نمددار',
    visualBadgeEmoji: '🎼'
  },
  {
    id: 'kamancheh',
    namePersian: 'کمانچه اصیل',
    nameOriginal: 'Kamāncheh (آرشه موی دم اسب)',
    hornbostelSachs: '۳۲۱.۳۲۲ (کُردوفون زهی آرشه‌ای کاسه‌ای با پایه فلزی)',
    regionSphere: 'iran_plateau',
    regionTitle: 'لرستان، آذربایجان، کردستان، تهران و قفقاز',
    tuningDetails: 'کوک کلاسیک چهار سیم: می (سیم ۱ زیر) - لا (سیم ۲) - رِ (سیم ۳) - سل (سیم ۴ بم) منطبق بر ویولن؛ در لرستان و نغمه‌های محلی کوک‌های ر-لا-ر-لا یا ر-لا-ر-سل کاربرد دارد.',
    originGeography: 'ایران باستان و آسیای میانه؛ در رساله موسیقی‌الکبیر ابونصر فارابی به عنوان "رباب با آرشه" تشریح گردیده است.',
    ethnicPeoples: 'خنیاگران لر، آذربایجانی، کرد، ارمنی و سراسر حوزه فرهنگی فلات ایران.',
    currentStatus: 'بسیار زنده و درخشان در سطح جهانی؛ با ثبت در میراث یونسکو و اجرا توسط نوابغی چون علی‌اصغر بهاری و کیهان کلهر.',
    isThriving: true,
    sampleTimbre: 'violin',
    auditionMidi: 69,
    auditionCent: 0,
    acousticNote: 'کاسه گردویی پشت‌باز (لری) یا کروی کامل، پوست ماهی یا بره و چرخش ساز حول پایه',
    visualBadgeEmoji: '🎻'
  },
  {
    id: 'barbat_oud',
    namePersian: 'بربط و عود',
    nameOriginal: 'Barbat / ʿŪd (سینه مرغابی باستانی)',
    hornbostelSachs: '۳۲۱.۳۲۱ (کُردوفون زهی زخمه‌ای کاسه‌بزرگ دسته‌کوتاه بی‌پرده)',
    regionSphere: 'anatolia_mesopotamia',
    regionTitle: 'ایران ساسانی، حیره، دمشق، بغداد، قاهره و استانبول',
    tuningDetails: 'کوک عربی/ترکی کلاسیک: دو (C2) - فا (F2) - لا (A2) - رِ (D3) - سل (G3) - دو (C4) در ۵ یا ۶ جفت سیم ارتعاشی.',
    originGeography: 'ایران ساسانی (ساز باربد در دربار تیسفون)؛ پس از فتح اسلام به بین‌النهرین رفت و با نام "عود" ستون تئوری فارابی و ارموی گشت.',
    ethnicPeoples: 'خنیاگران خاورمیانه، اعراب، ترکان عثمانی و خنیاگران جنوب و مرکز ایران.',
    currentStatus: 'در جهان عرب و ترکیه پادشاه بلامنازع سازهاست؛ در ایران چند سده کم‌فروغ بود اما در نیم قرن اخیر با تلاش‌های منصور نریمان احیا شد و بسیار پویاست.',
    isThriving: true,
    sampleTimbre: 'setar',
    auditionMidi: 62,
    auditionCent: 0,
    acousticNote: 'صفحه کاسه‌ای چوب افرا با سوراخ‌های اسلیمی مشبک و مضراب شاه‌پر عقاب',
    visualBadgeEmoji: '🪕'
  },
  {
    id: 'ney',
    namePersian: 'نی هفت‌بند',
    nameOriginal: 'Ney (نوای نای اسرارآمیز نیستان)',
    hornbostelSachs: '۴۲۱.۱۱۱ (آئروفون بادی لب‌نواخت لوله‌ای بی‌زبانه)',
    regionSphere: 'iran_plateau',
    regionTitle: 'نیستان‌های کویر و فلات ایران، اصفهان، نایین و کاشان',
    tuningDetails: 'کوک مکانیکی ندارد؛ با ابعاد فیزیکی برش لوله نی و تکنیک دندانی کنترل می‌شود. تنوع اندازه از "نی دو"، "نی رِ"، تا "نی لا" گستره‌های بم و زیر را پدید می‌آورد.',
    originGeography: 'بین‌النهرین باستان (جام‌های نقره سومری) و کهن‌ترین ساز بادی بشر؛ تکنیک استثنایی دندانی (بین دندان‌های پیشین) شیوه منحصربه‌فرد نایب اسدالله اصفهانی است.',
    ethnicPeoples: 'خنیاگران صوفی، اهل معرفت، چوپانان فلات و استادان ردیف موسیقی دستگاهی ایران.',
    currentStatus: 'زنده، پررمزوراز و الهام‌بخش؛ نماد ادبیات مولوی با مکتبی زنده به پرچمداری حسن کسایی و محمد موسوی.',
    isThriving: true,
    sampleTimbre: 'ney',
    auditionMidi: 62,
    auditionCent: 0,
    acousticNote: 'گیاه نیشکر بیابانی هفت‌بند با ۶ سوراخ و صدادهی غنی چندپژواکه زنگ‌دار',
    visualBadgeEmoji: '🎋'
  },
  {
    id: 'kaval',
    namePersian: 'کاوال کارپات و بالکان',
    nameOriginal: 'Caval / Kaval (فلوت چوپانی استپ و کوهستان)',
    hornbostelSachs: '۴۲۱.۱۱۱ (آئروفون لوله‌ای چوبی با لبه دمشی اریب)',
    regionSphere: 'balkan_danube',
    regionTitle: 'کوهستان کارپات، دشت‌های والاچیا، مولداوی، بلغارستان و تراکیه',
    tuningDetails: 'کوک شده بر گام دیاتونیک رِ (D) یا دو (C) با ۸ روزنه صوتی و ۴ روزنه ارتعاشی موسوم به "سوراخ‌های شیطان" برای بازتولید رزونانس‌های میکروتونال.',
    originGeography: 'استپ‌های قفقاز و بالکان با نفوذ چوپانان عثمانی؛ واسطه صوتی میان فلوت‌های استپی سکاها و نغمه‌های دوئینای رومانیایی.',
    ethnicPeoples: 'چوپانان والاش، گاگائوز، بلغار، رومانیایی و خنیاگران چادرنشین دامنه کارپات.',
    currentStatus: 'زنده در آیین‌های بومی شبانی، رقص‌های باستانی بالکان و موسیقی دوئینای ثبت‌شده یونسکو، گرچه در مدرنیته شهری محدودتر شده است.',
    isThriving: true,
    sampleTimbre: 'caval',
    auditionMidi: 62,
    auditionCent: 0,
    acousticNote: 'چوب آلو، زبان‌گنجشک یا شمشاد خراطی‌شده با دمیدن مایل از دهانه مخروطی',
    visualBadgeEmoji: '🪵'
  },
  {
    id: 'tambal',
    namePersian: 'تسامبال رومانی و مولداوی',
    nameOriginal: 'Țambal / Cimbalom (پادشاه زهی لوتاری‌های دانوب)',
    hornbostelSachs: '۳۱۴.۱۲۲ (کُردوفون کوبه‌ای جعبه‌ای بزرگ با پدال خفه‌کن)',
    regionSphere: 'balkan_danube',
    regionTitle: 'رومانی (والاچیا، اولتنیا)، مولداوی و مجارستان',
    tuningDetails: 'طیف فرکانسی کامل کروماتیک از C2 تا E6؛ کوک بسیار دقیق متکی بر تارهای فولادی کشیده با چکش‌های پنبه‌پوش و پدال مکانیکی رزونانس.',
    originGeography: 'نواده مستقیم سنتور ایرانی و قانون شرقی که در قرن هفدهم به بالکان رسید و در قرن نوزدهم در بوداپست توسط یوزف شوندا مکانیکی شد.',
    ethnicPeoples: 'خنیاگران روما (لوتاری Lăutari) در حوضه رود دانوب و ارکسترهای تاراف رومانیایی.',
    currentStatus: 'بسیار زنده، پرشور و پرچمدار؛ ستون فقرات موسیقی پرسرعت و هیجان‌انگیز مجالس بالکان و جشنواره‌های اروپایی.',
    isThriving: true,
    sampleTimbre: 'tambal',
    auditionMidi: 60,
    auditionCent: 0,
    acousticNote: 'چکش‌های دست‌ساز پوشیده از چرم و پنبه با تکنیک‌های آکوردنوازی و ترمولوهای طوفانی',
    visualBadgeEmoji: '🎹'
  },
  {
    id: 'gadulka',
    namePersian: 'گادولکا بالکان',
    nameOriginal: 'Gadulka (لیره آرشه‌ای واخوان‌دار)',
    hornbostelSachs: '۳۲۱.۳۲۲ (کُردوفون گلابی‌شکل زهی آرشه‌ای عمودی)',
    regionSphere: 'balkan_danube',
    regionTitle: 'بلغارستان، تراکیه و دامنه‌های جنوبی دانوب',
    tuningDetails: '۳ سیم اصلی نوازندگی (لا - لا - می) به همراه تا ۱۰ سیم باریک واخوان پنهان در زیر دسته که با لرزش سمپاتیک طنین مدام ایجاد می‌کنند.',
    originGeography: 'مشتق از لیرای بیزانسی و کمانچه قرون وسطایی در امتداد شاهراه کنستانتینوپل به بالکان.',
    ethnicPeoples: 'خنیاگران اسلاو جنوبی، رقصندگان هورو در بالکان و گروه‌های هم‌نوازی روستایی.',
    currentStatus: 'نیمه‌مهجور و به حاشیه رفته؛ در ارکسترهای دولتی فولکلور نگهداری می‌شود اما در میان نسل جوان شهری کم‌رنگ شده و گرد زمان بر آن نشسته است.',
    isThriving: false,
    sampleTimbre: 'violin',
    auditionMidi: 69,
    auditionCent: 0,
    acousticNote: 'کاسه یکپارچه چوب گلابی بدون صفحه انگشت‌گذاری با لمس جانبی ناخن بر سیم‌ها',
    visualBadgeEmoji: '🎻'
  },
  {
    id: 'cobza',
    namePersian: 'کوبوز لوتاری',
    nameOriginal: 'Cobza (بربط شکسته دهقانان دانوب)',
    hornbostelSachs: '۳۲۱.۳۲۱ (کُردوفون زهی زخمه‌ای دسته بسیار کوتاه با سرپنجه شکسته ۹۰ درجه)',
    regionSphere: 'balkan_danube',
    regionTitle: 'رومانی، مولداوی و حاشیه رود پروت و دانوب',
    tuningDetails: '۴ جفت سیم دوگانه (کوک رِ - لا - رِ - لا یا سل - دو - سل - دو) برای اجرای ریتم‌های ریز و هارمونی‌های لنگان.',
    originGeography: 'شاخه باستانی از خانواده بربط و عود که با کوچ قبایل ترک‌تبار کومان و پچنگ در سده دوازدهم میلادی به جلگه‌های دانوب آورده شد.',
    ethnicPeoples: 'لوتاری‌های قدیمی رومانی و نوازندگان دوره‌گرد مولداوی.',
    currentStatus: 'گرد و خاک گرفته و در آستانه انقراض کامل؛ در سده بیستم تقریباً فراموش شد و اکنون تنها شمار معدودی از احیاگران تجربی به آن جان می‌بخشند.',
    isThriving: false,
    sampleTimbre: 'setar',
    auditionMidi: 62,
    auditionCent: 0,
    acousticNote: 'دسته فوق‌العاده کوتاه و پهن بدون پرده، با مضراب شاه‌پَر غاز',
    visualBadgeEmoji: '🪶'
  },
  {
    id: 'bouzouki',
    namePersian: 'بوزوکی یونانی',
    nameOriginal: 'Bouzouki (ساز نغمه‌های ربتیکو)',
    hornbostelSachs: '۳۲۱.۳۲۱ (کُردوفون زهی زخمه‌ای کاسه‌گرد دسته‌بلند فلزی)',
    regionSphere: 'balkan_danube',
    regionTitle: 'یونان، پیرائوس، آتن، تسالونیکی و سواحل اژه',
    tuningDetails: 'کوک سنتی تریخوردو ۳ جفتی: رِ (D) - لا (A) - رِ (D)؛ و کوک مدرن تتراخوردو ۴ جفتی: دو (C) - فا (F) - لا (A) - رِ (D).',
    originGeography: 'مشتق از تنبور بیزانسی و باغلامای عثمانی؛ با مهاجرت بزرگ یونانیان ازمیر و آسیای صغیر در دهه ۱۹۲۰ به بندر پیرائوس تولد نوین یافت.',
    ethnicPeoples: 'مردم یونان، اهالی بندر و پیشگامان جنبش هنری ربتیکو (Rebetiko).',
    currentStatus: 'فوق‌العاده زنده، پررونق و نماد هویت ملی یونان؛ پرکاربرد در تئاترها، ارکسترهای بین‌المللی و شب‌نشینی‌های سراسر مدیترانه.',
    isThriving: true,
    sampleTimbre: 'bouzouki',
    auditionMidi: 62,
    auditionCent: 0,
    acousticNote: 'کاسه ساخته‌شده از نوارهای باریک گردو و آبنوس با مضراب سخت و صدای زنگ‌دار شفاف',
    visualBadgeEmoji: '🎸'
  }
];

export const EurasianInstrumentsHall: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'iran_plateau' | 'anatolia_mesopotamia' | 'balkan_danube'>('all');
  const [auditioningInstId, setAuditioningInstId] = useState<string | null>(null);

  const filteredInstruments = EURASIAN_INSTRUMENTS.filter(inst => {
    if (activeFilter === 'all') return true;
    return inst.regionSphere === activeFilter;
  });

  const handleAuditionNote = (inst: EurasianInstrument) => {
    audioEngine.initContext();
    setAuditioningInstId(inst.id);
    audioEngine.playNote(inst.auditionMidi, inst.auditionCent, inst.sampleTimbre, 'glissando', 1.8);
    window.setTimeout(() => setAuditioningInstId(null), 1800);
  };

  return (
    <div className="w-full space-y-6 font-persian" dir="rtl">
      {/* Editorial Header Banner */}
      <div className="bg-[#1A1410] rounded-2xl border border-[#594234]/70 p-5 sm:p-7 shadow-2xl space-y-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#D97706]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🎻</span>
              <h2 className="text-xl sm:text-2xl font-black text-[#F5EEDB]">
                تالار سازهای اوراسیا • از فلات کهن ایران تا حوزه رود دانوب
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#C4B59D] leading-relaxed max-w-4xl">
              تبارشناسی تطبیقی ارگانولوژی، نظام‌های کوک، جغرافیای خاستگاه، اقوام میراث‌دار و سنجش درجه پویایی معاصر سازها.
              بررسی پیوستار صوتی سازهای زهی، بادی و کوبه‌ای که در امتداد شاهراه‌های کوچ تاریخی و تمدنی سفر کرده‌اند.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#120D0A] px-3.5 py-2 rounded-xl border border-[#594234]/60 text-xs text-[#E5A836]">
            <Compass size={18} />
            <span className="font-bold">{EURASIAN_INSTRUMENTS.length} ساز ارگانولوژیک</span>
          </div>
        </div>

        {/* Region Filter Bar */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#594234]/40">
          <span className="text-xs font-bold text-[#E5A836] flex items-center gap-1.5 ml-2">
            <Filter size={14} />
            <span>فیلتر حوزه تمدنی:</span>
          </span>

          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeFilter === 'all'
                ? 'bg-[#8B2635] text-white border-[#E5A836] shadow'
                : 'bg-[#221A15] text-[#C4B59D] border-[#594234]/50 hover:bg-[#2C211B]'
            }`}
          >
            همه سازهای شاهراه ({EURASIAN_INSTRUMENTS.length})
          </button>

          <button
            onClick={() => setActiveFilter('iran_plateau')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeFilter === 'iran_plateau'
                ? 'bg-[#8B2635] text-white border-[#E5A836] shadow'
                : 'bg-[#221A15] text-[#C4B59D] border-[#594234]/50 hover:bg-[#2C211B]'
            }`}
          >
            فلات کهن ایران (تار، سه‌تار، سنتور، تنبور، دوتار، نی، کمانچه)
          </button>

          <button
            onClick={() => setActiveFilter('anatolia_mesopotamia')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeFilter === 'anatolia_mesopotamia'
                ? 'bg-[#8B2635] text-white border-[#E5A836] shadow'
                : 'bg-[#221A15] text-[#C4B59D] border-[#594234]/50 hover:bg-[#2C211B]'
            }`}
          >
            آناتولی و بین‌النهرین (بربط / عود)
          </button>

          <button
            onClick={() => setActiveFilter('balkan_danube')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeFilter === 'balkan_danube'
                ? 'bg-[#8B2635] text-white border-[#E5A836] shadow'
                : 'bg-[#221A15] text-[#C4B59D] border-[#594234]/50 hover:bg-[#2C211B]'
            }`}
          >
            حوضه بالکان و دانوب (تسامبال، کاوال، گادولکا، کوبوز، بوزوکی)
          </button>
        </div>
      </div>

      {/* Instruments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredInstruments.map((inst) => {
          const isAuditioning = auditioningInstId === inst.id;

          return (
            <div
              key={inst.id}
              className="bg-[#18120E] rounded-2xl border border-[#594234]/60 p-5 space-y-4 shadow-xl hover:border-[#8B2635] transition flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-xl bg-[#221914] border border-[#594234]/60">
                      {inst.visualBadgeEmoji}
                    </span>
                    <div>
                      <h3 className="text-lg font-black text-[#F5EEDB] flex items-center gap-2">
                        <span>{inst.namePersian}</span>
                        <span className="text-xs font-normal text-[#E5A836] font-mono">| {inst.nameOriginal}</span>
                      </h3>
                      <p className="text-[11px] text-[#A6937C] font-mono">
                        رده‌بندی زاخس-هورن‌بوستل: {inst.hornbostelSachs}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold border shrink-0 ${
                      inst.isThriving
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-600/50'
                        : 'bg-amber-950/60 text-amber-400 border-amber-600/50'
                    }`}
                  >
                    {inst.isThriving ? '✓ زنده و پویا' : '⚠️ در گذر زمان غبارگرفته'}
                  </span>
                </div>

                <div className="text-xs font-bold text-[#D97706] flex items-center gap-1.5 pt-1">
                  <Globe size={13} />
                  <span>حوزه جغرافیایی: {inst.regionTitle}</span>
                </div>
              </div>

              {/* 4 Dedicated Organological Paragraphs */}
              <div className="space-y-2.5 text-xs text-[#D6C7B2] leading-relaxed border-t border-[#594234]/40 pt-3">
                {/* 1. Tuning */}
                <div className="p-2.5 rounded-xl bg-[#1F1712] border border-[#594234]/40 space-y-1">
                  <span className="font-bold text-[#E5A836] block">۱. نحوه کوک و فواصل:</span>
                  <p>{inst.tuningDetails}</p>
                </div>

                {/* 2. Origin Geography */}
                <div className="p-2.5 rounded-xl bg-[#1F1712] border border-[#594234]/40 space-y-1">
                  <span className="font-bold text-[#E5A836] block">۲. جغرافیای پیدایش و پیشینه:</span>
                  <p>{inst.originGeography}</p>
                </div>

                {/* 3. Ethnic Peoples */}
                <div className="p-2.5 rounded-xl bg-[#1F1712] border border-[#594234]/40 space-y-1">
                  <span className="font-bold text-[#E5A836] block">۳. قوم و منطقه‌ای که از آن استفاده می‌کنند:</span>
                  <p>{inst.ethnicPeoples}</p>
                </div>

                {/* 4. Current Status */}
                <div className="p-2.5 rounded-xl bg-[#1F1712] border border-[#594234]/40 space-y-1">
                  <span className="font-bold text-[#E5A836] block">۴. وضعیت فعلی ساز (زنده یا گرد و خاک گرفته):</span>
                  <p>{inst.currentStatus}</p>
                </div>
              </div>

              {/* Card Footer: Audition Button & Acoustics */}
              <div className="pt-3 border-t border-[#594234]/40 flex items-center justify-between gap-3 text-xs">
                <span className="text-[11px] text-[#A6937C] truncate" title={inst.acousticNote}>
                  🔬 {inst.acousticNote}
                </span>

                <button
                  onClick={() => handleAuditionNote(inst)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 border ${
                    isAuditioning
                      ? 'bg-[#E5A836] text-black border-white shadow-lg animate-pulse'
                      : 'bg-[#2A201A] hover:bg-[#3D2E24] text-[#E5A836] border-[#594234]'
                  }`}
                  title="شنیدن نمونه صوتی استودیویی این ساز"
                >
                  <Volume2 size={15} />
                  <span>{isAuditioning ? 'در حال پخش...' : 'شنیدن صدای ساز'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
