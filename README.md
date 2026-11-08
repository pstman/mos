# وب‌سایت رسمی مصطفی شیری | Mostafa Shiri Official Website

وب‌سایت شخصی و استودیویی **مصطفی شیری** (خواننده، آهنگساز و تنظیم‌کننده)، مجهز به:
- **پلیر استودیویی اختصاصی و اکولایزر ۵ بانده زنده (Web Audio API DSP)**
- **پلیر ویدیویی استودیویی با حالت نور صحنه (Theater Glow)**
- **پنل مدیریت کامل + ویرایشگر زنده و دیداری روی خود سایت (Live Visual Editor با دکمه Apply)**
- **کنترل تعداد پست در هر صفحه (پیش‌فرض ۲ پست) و تنظیم درصد اندازه پست‌ها (`70%` تا `115%`)**
- **آماده اتصال و اجرا روی Cloudflare Workers / Cloudflare Pages + KV**

## اجرای محلی (Local Development)
```bash
npm install
npm run dev
```

## بیلد و انتشار روی کلودفلر (Cloudflare Deployment)
```bash
npm run cf:deploy
```
برای جزئیات کامل اتصال به Cloudflare KV، فایل `CLOUDFLARE_GUIDE.md` را مطالعه نمایید.