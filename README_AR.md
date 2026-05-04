# Nabny HR V19.0 AI GPS + WhatsApp Official API

هذه نسخة ترقية فوق V18.9 مع الحفاظ على الوظائف الأصلية.

## الإضافات الجديدة
- مواقع العمل بخريطة Google مدمجة.
- Radius لكل مشروع/موقع عمل.
- منع الحضور والانصراف خارج نطاق الموقع.
- تسجيل GPS Lat/Lng ودقة الموقع والمسافة.
- محاولة البصمة خارج النطاق تتحول لتنبيه HR.
- إعداد WhatsApp Official Cloud API.
- Queue لرسائل واتساب الرسمية مع إمكانية ربط Supabase Edge Function أو سيرفر وسيط.
- محرك القوانين الذكي.
- تحليل تكلفة الموظفين والمشاريع.

## ملاحظات مهمة للواتساب الرسمي
لا يُنصح بوضع Access Token داخل المتصفح في التشغيل الحقيقي. ضع التوكن داخل Supabase Edge Function أو Backend API، ثم ضع رابط الدالة في خانة Webhook / Edge Function URL.

## التشغيل
```bash
npm install
npm run dev
```

## بيانات دخول تجريبية
- admin / 123456
- hr / 123456
- manager / 123456
- employee / 123456
