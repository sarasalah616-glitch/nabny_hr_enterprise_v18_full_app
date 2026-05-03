# Nabny HR Enterprise V18.4 Final

نسخة Enterprise نهائية مبدئية لشركة نبني للمقاولات.

## أهم المزايا
- Login users محلي للتجربة + جاهز Supabase Auth
- صلاحيات: Admin / HR / Manager / Employee
- تطبيق موظف منفصل داخل نفس النظام
- مواقع عمل متعددة
- تحديد مسافة البصمة لكل موقع
- بصمة حضور وانصراف حسب GPS
- رفض البصمة خارج النطاق
- طلبات الموظف: إجازة، إذن، سلفة، مهمة عمل، مباشرة عمل
- إشعارات داخل النظام
- Queue لإيميلات النظام
- Payroll Engine: راتب أساسي، بدلات، غياب، تأخير، إضافي، صافي الراتب
- نماذج ذكية باسم شركة نبني فقط بدون ذكر اسم السيستم داخل النموذج
- إدارة موظفين فعلية بدون أسماء وهمية
- حفظ LocalStorage للتجربة + Schema Supabase كامل

## التشغيل
npm install
npm run dev

## Vercel
Framework: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist

## Supabase
شغل:
supabase/schema.sql
supabase/rls.sql
