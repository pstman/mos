# راهنمای استقرار سرورلس پرده‌نگار بر روی Cloudflare با سیستم KV

این سند راهنمای کامل راه‌اندازی و انتشار پروژه **پرده‌نگار (Pardeh-Negar)** به عنوان یک برنامه فول‌استک سرورلس (Serverless) بر روی بستر کلودفلر با پایگاه داده کلید-مقدار **Cloudflare Workers KV** است.

---

## ۱. منطق معماری جدید و بهینه‌سازی دیتابیس (KV Database)

در نسخه قبلی، مقالات و یادداشت‌های پژوهشی وبلاگ در فایل محلی `data/blog_posts.json` ذخیره می‌شدند که برای سرورهای سنتی مناسب بود، اما در محیط سرورلس کلودفلر سیستم فایل محلی غیرقابل نوشتن (Read-only ephemeral) است.

### تغییرات و بهینه‌سازی‌های اعمال شده:
1. **سرویس دیتابیس اختصاصی KV (`src/server/kvDatabase.ts`)**:
   - تمامی عملیات خواندن، نوشتن، ویرایش، حذف و بازنشانی مقالات به توابع بهینه KV کلودفلر تبدیل شدند.
   - **کش لبه‌ای با تاخیر صفر (Sub-millisecond Global Caching)**: مقالات در سطح دیتاسنترهای لبه‌ای کلودفلر کش می‌شوند.
   - **مقداردهی اولیه خودکار (Auto-seed)**: در نخستین اجرای برنامه پس از دیپلوی، چنانچه فضای KV خالی باشد، مقالات پژوهشی مرجع استاد ایمان برزجان به صورت خودکار در فضای KV ذخیره می‌شوند.
2. **مسیریاب یکپارچه سرورلس (`src/server/apiRouter.ts`)**:
   - تمامی اندپوینت‌های `/api/*` با استانداردهای مدرن Web Fetch API بازنویسی شدند.
   - مدیریت امن متغیر محیطی `MODIRIAT_ADMIN` بدون قرار گرفتن هیچ رمز ثابتی در کدها.
3. **انطباق دوگانه (Dual Deployment Compatibility)**:
   - **Cloudflare Workers (از طریق `worker.ts` و `wrangler.toml`)**: بارگذاری خودکار استتیک‌ها از دایرکتوری `dist` و هندل کردن APIها.
   - **Cloudflare Pages (از طریق `functions/api/[[route]].ts`)**: اتصال مستقیم ریپازیتوری گیت‌هاب به پنل Pages بدون نیاز به تنظیمات پیچیده.
   - **محیط توسعه لوکال (`server.ts`)**: با یک آداپتور شبیه‌ساز KV همچنان امکان اجرای سرور Express به صورت آفلاین وجود دارد.

---

## ۲. مراحل استقرار با استفاده از ابزار Wrangler

### مرحله اول: ورود به حساب کلودفلر
در ترمینال، دستور زیر را اجرا کنید:
```bash
npx wrangler login
```

### مرحله دوم: ساخت فضای پایگاه‌داده KV
دستورهای زیر را اجرا کنید تا دو فضای KV (یکی برای تولید و دیگری برای تست محلی) ساخته شوند:
```bash
# ساخت فضای اصلی
npx wrangler kv namespace create BLOG_KV

# ساخت فضای پیش‌نمایش (Preview)
npx wrangler kv namespace create BLOG_KV --preview
```

خروجی این دو دستور شناسه‌هایی (ID) شبیه به زیر به شما می‌دهد:
```toml
[[kv_namespaces]]
binding = "BLOG_KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
preview_id = "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
```
این شناسه‌ها را در فایل `wrangler.toml` پروژه جایگزین مقادیر پیش‌فرض کنید.

### مرحله سوم: تنظیم کلمه عبور مدیریت (رمز امنیت وبلاگ)
برای تنظیم رمز عبور پنل مدیریت وبلاگ، دستور زیر را اجرا کرده و رمز انتخابی خود را وارد نمایید:
```bash
npx wrangler secret put MODIRIAT_ADMIN
```

### مرحله چهارم: بیلد و تست محلی با شبیه‌ساز KV
```bash
# نصب وابستگی‌ها
npm install --legacy-peer-deps

# بیلد فرانت‌اند
npm run build

# اجرای شبیه‌ساز کلودفلر در لوکال
npx wrangler dev
```

### مرحله پنجم: انتشار نهایی روی کلودفلر
```bash
npm run cf:deploy
```
یا:
```bash
npx wrangler deploy
```

---

## ۳. روش جایگزین: استقرار مستقیم از طریق Cloudflare Pages

چنانچه ترجیح می‌دهید پروژه با هر بار `git push` به صورت خودکار توسط کلودفلر بیلد شود:
1. در داشبورد کلودفلر به بخش **Workers & Pages** بروید.
2. گزینه **Create application** و سپس سربرگ **Pages** را انتخاب کنید.
3. دکمه **Connect to Git** را زده و ریپازیتوری `PARDEH-NEGAR` را انتخاب کنید.
4. تنظیمات بیلد:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. در بخش **Settings > Functions > KV namespace bindings**:
   - نام Variable name را `BLOG_KV` بگذارید و به فضای KV متصل کنید.
6. در بخش **Settings > Environment variables**:
   - متغیر `MODIRIAT_ADMIN` را اضافه کرده و رمز مدیریت دلخواه را قرار دهید.
