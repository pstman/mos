# راهنمای اتصال و اجرای وب‌سایت رسمی مصطفی شیری بر روی Cloudflare (Workers / Pages + KV)

این پروژه به صورت ۱۰۰٪ مستقل برای **وب‌سایت رسمی مصطفی شیری (Mostafa Shiri | خواننده · آهنگساز · تنظیم‌کننده)** آماده شده و بدون نیاز به هیچ تغییر کدی، قابل استقرار روی **Cloudflare Workers** یا **Cloudflare Pages** به همراه پایگاه داده ابری **Cloudflare Workers KV** است.

---

## ۱. ساختار فایل‌های کلودفلر در پروژه
- `worker.ts`: ورودی اصلی **Cloudflare Worker** که هم فایل‌های استاتیک فرانت‌اند (`./dist`) و هم درخواست‌های سرورلس `/api/*` را مدیریت می‌کند.
- `functions/api/[[route]].ts`: مسیریاب خودکار **Cloudflare Pages Functions** در صورت اتصال مستقیم ریپازیتوری گیت‌هاب به Cloudflare Pages.
- `src/server/apiRouter.ts`: هسته سرورلس مدیریت داده‌های سایت (`/api/shiri/data`، `/api/shiri/reset` و `/api/admin/verify`) متصل به فضای KV.
- `wrangler.toml`: فایل تنظیمات استاندارد کلودفلر با نام سرویس `mostafa-shiri-official` و اتصال فضای ذخیره‌سازی `SHIRI_KV`.

---

## ۲. روش اول: استقرار سریع با دستور Wrangler (Cloudflare Workers)

### گام ۱: ورود به حساب کلودفلر
```bash
npx wrangler login
```

### گام ۲: ساخت فضای پایگاه داده KV
```bash
npx wrangler kv namespace create SHIRI_KV
npx wrangler kv namespace create SHIRI_KV --preview
```
شناسه‌های (`id` و `preview_id`) دریافتی را در فایل `wrangler.toml` جایگزین کنید.

### گام ۳: بیلد و انتشار روی کلودفلر
```bash
npm run cf:deploy
```
*(این دستور ابتدا `vite build` را اجرا کرده و سپس کل سایت و API سرورلس را روی کلودفلر منتشر می‌کند).*

---

## ۳. روش دوم: اتصال مستقیم گیت‌هاب به Cloudflare Pages

1. وارد داشبورد **Cloudflare > Workers & Pages** شوید و **Create application > Pages > Connect to Git** را انتخاب کنید.
2. تنظیمات بیلد را به شکل زیر وارد کنید:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. پس از ساخت پروژه، از مسیر **Settings > Functions > KV namespace bindings** یک بایندینگ با نام `SHIRI_KV` به فضای KV خود متصل کنید.
4. اکنون هر زمان که از داخل **پنل مدیریت سایت** (لینک فوتر · رمز پیش‌فرض: `ms1376`) یا از طریق **ویرایشگر زنده دیداری (Live Visual Editor)** دکمه **Apply** را بزنید، تغییرات در لحظه روی کلودفلر ذخیره شده و برای تمام بازدیدکنندگان نمایش داده می‌شود.
