import { ShieldCheck, Workflow, Clock, DollarSign, AlertTriangle, TrendingUp, Users, FileText } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

function Stat({ title, value, icon: Icon, note }: { title: string; value: string | number; icon: React.ComponentType<{ size?: number }>; note?: string }) {
  return (
    <div className="card stat">
      <Icon size={24} />
      <h3>{title}</h3>
      <h1>{value}</h1>
      {note && <p className="muted">{note}</p>}
    </div>
  );
}

export default function OwnerAI() {
  const s = useAppStore(s => s);
  const d = s.getTenantData();
  const health = s.getCompanyHealth();
  const risks = s.getRisks();
  const tenant = s.getTenant();
  const today = new Date().toISOString().slice(0, 10);
  const m = new Date().toISOString().slice(0, 7);
  const present = new Set(s.attendance.filter(a => a.date === today && a.type === 'in' && a.tenantId === s.currentTenantId).map(a => a.employeeId)).size;
  const activeEmps = d.employees.filter(e => e.status === 'active').length;
  const pending = d.requests.filter(r => !['approved', 'rejected', 'closed'].includes(r.status)).length;
  const total = d.payroll.filter(p => p.month === m).reduce((sum, p) => sum + Number(p.net || 0), 0);
  const docAlerts = s.getDocumentAlerts();
  const expiredContracts = (d.contracts || []).filter(c => c.endDate && c.endDate <= today).length;

  const score = health;
  const decision = score >= 80 ? 'ممتاز - الشركة بحالة جيدة جداً' : score >= 60 ? 'جيد - يوصى بمتابعة الطلبات المعلقة' : score >= 40 ? 'تنبيه - مراجعة الحضور والمشاكل المفتوحة' : 'خطر - تدخل فوري مطلوب';

  return (
    <div className="page-fade">
      <div className="card hero" style={{ '--score': health } as React.CSSProperties}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>عين صاحب الشركة</h1>
          <p className="muted">مراقبة شاملة لـ {tenant?.name} - تحليل فوري مدعوم بالذكاء الاصطناعي</p>
          <div className="badges">
            <span className={`badge ${health >= 70 ? 'green' : health >= 50 ? 'yellow' : 'red'}`}>صحة الشركة {health}%</span>
            <span className="badge orange">مخاطر {100 - health}%</span>
            {docAlerts.length > 0 && <span className="badge red">مستندات {docAlerts.length}</span>}
          </div>
        </div>
        <div className="healthCircle">
          <b>{health}%</b>
          <span>صحة الشركة</span>
        </div>
      </div>

      <div className="grid">
        <Stat title="الحضور اليوم" value={`${present}/${activeEmps}`} icon={Clock} note="موظف حاضر / إجمالي الفعالين" />
        <Stat title="طلبات تحتاج متابعة" value={pending} icon={Workflow} note="اعتمادات معلقة" />
        <Stat title="تكلفة الرواتب" value={`${total.toLocaleString()} ﷼`} icon={DollarSign} note="هذا الشهر" />
        <Stat title="قرار AI" value={score >= 70 ? 'مستقر' : 'تدخل'} icon={ShieldCheck} note="توصية تنفيذية" />
        <Stat title="المشاريع النشطة" value={d.projects.filter(p => p.status === 'active').length} icon={TrendingUp} note="مرصودة بـ GPS" />
        <Stat title="عهد ومعدات" value={(d.assets || []).length} icon={Users} note={`قيمة ${(d.assets || []).reduce((s, a) => s + a.value, 0).toLocaleString()} ﷼`} />
        <Stat title="مستندات منتبه" value={docAlerts.filter(d => (d.daysToExpire || 0) <= 30).length} icon={FileText} note="تحتاج تجديد قريباً" />
        <Stat title="عقود منتهية" value={expiredContracts} icon={AlertTriangle} note="تحتاج مراجعة" />
      </div>

      <div className="card">
        <h2><ShieldCheck size={20} color="#059669" /> قرار AI التنفيذي</h2>
        <div style={{ padding: '16px', background: score >= 70 ? '#f0fdf4' : score >= 50 ? '#fffbeb' : '#fef2f2', borderRadius: 16, borderRight: `4px solid ${score >= 70 ? '#059669' : score >= 50 ? '#d97706' : '#dc2626'}`, fontSize: 15, fontWeight: 600 }}>
          {decision}
        </div>
      </div>

      {risks.length > 0 && (
        <div className="card">
          <h2><AlertTriangle size={20} color="#dc2626" /> المخاطر التشغيلية</h2>
          <div className="timeline">
            {risks.map((r, i) => (
              <div key={i} className="tl" style={{ borderColor: r.level === 'high' ? '#dc2626' : '#d97706' }}>
                <b>
                  <span style={{ color: r.level === 'high' ? '#dc2626' : '#d97706', marginLeft: 6 }}>
                    {r.level === 'high' ? '● عالي' : '● متوسط'}
                  </span>
                  {r.title}
                </b>
                <p>{r.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {risks.length === 0 && (
        <div className="card">
          <div className="empty" style={{ background: '#f0fdf4', color: '#166534' }}>
            لا توجد مخاطر عالية الآن. صحة الشركة {health}% - الأمور تسير بشكل طبيعي.
          </div>
        </div>
      )}

      <div className="card">
        <h2>تقدم المشاريع</h2>
        {d.projects.map(p => (
          <div key={p.id} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 600 }}>{p.name}</span>
              <span className="muted">{p.progress || 0}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${p.progress || 0}%`, background: `linear-gradient(90deg, #0f172a, #991b1b)` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span className="muted">الميزانية: {Number(p.budget).toLocaleString()} ﷼</span>
              <span className="muted">المصروف: {Number(p.spent).toLocaleString()} ﷼</span>
            </div>
          </div>
        ))}
        {d.projects.length === 0 && <div className="empty">لا توجد مشاريع</div>}
      </div>
    </div>
  );
}
