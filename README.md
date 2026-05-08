# NABNY OS V23 SaaS Core

نسخة V23 تحول النظام إلى بنية SaaS أولية قابلة للبيع:

- Multi-Tenant: كل شركة لها `tenantId` وبيانات منفصلة.
- White Label لكل شركة: اسم النظام، الهوية، الألوان، الخلفية، اللوجو.
- SaaS Admin للمالك: إدارة الشركات، الاشتراكات، المستخدمين، الإيقاف والتفعيل.
- عزل بيانات الموظفين، المشاريع، الحضور، الطلبات، البيرول، الإشعارات، وAudit حسب الشركة الحالية.
- AI Assistant يقرأ بيانات Tenant الحالي فقط.
- Payroll وAttendance وReports تم ربطها بعزل الشركات.

## بيانات الدخول التجريبية

- مالك المنصة: `owner / 123456`
- شركة نبني: `admin / 123456`
- HR: `hr / 123456`
- مدير موقع: `manager / 123456`
- شركة تجريبية: اختر شركة تجريبية ثم `demo / 123456`

> ملاحظة: هذه نسخة Frontend SaaS Core محلية باستخدام Zustand Persist. للـ Production الحقيقي على الإنترنت يلزم ربط Supabase/PostgreSQL + RLS + Auth + Edge Functions + Payment Gateway.
