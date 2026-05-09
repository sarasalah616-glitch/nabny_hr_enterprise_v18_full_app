# NABNY OS v25 Enterprise Command Center

نسخة إنتاجية مطورة من NABNY OS مبنية على React + Vite.

## أهم التحديثات
- AI Assistant تنفيذي داخل النظام.
- نماذج HR ذكية بتعبئة تلقائية: سلفة، إجازة، تجديد إقامة، تجديد جواز، خطاب تعريف.
- مركز ملفات الموظفين مع رفع ملفات وتنبيهات انتهاء الوثائق.
- تطبيق موظف بثلاث لغات: عربي، English، اردو.
- إعدادات وقت البصمة للحضور والانصراف مع GPS اختياري/إجباري.
- أقسام الشركة: الإدارة، الموارد البشرية، المالية، المشتريات، الإنشاءات، الصيانة، التشغيل.
- تقارير شهرية وأرشفة الحركات حسب الشهر.
- صلاحيات وأدوار: owner, admin, hr, manager, employee.

## بيانات الدخول التجريبية
- admin / 123456
- owner / 123456
- hr / 123456
- manager / 123456
- employee / 123456

## إعدادات Vercel
- Framework Preset: Vite
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

## تشغيل محلي
```bash
npm install
npm run dev
```

## ملاحظة مهمة
لا ترفع مجلد `node_modules` ولا `dist` إلى GitHub. Vercel سيقوم بتثبيت الحزم وبناء النسخة تلقائيًا.
