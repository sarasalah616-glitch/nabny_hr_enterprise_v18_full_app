import { Users, Clock, DollarSign, AlertTriangle, Building2, TrendingUp, FileText, ShoppingCart } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

function Stat({ title, value, icon: Icon, note, color = '#991b1b' }: { title: string; value: string | number; icon: React.ComponentType<{ size?: number }>; note?: string; color?: string }) {
  return (
    <div className="card stat">
      <div style={{ color }}><Icon size={26} /></div>
      <h3>{title}</h3>
      <h1>{value}</h1>
      {note && <p className="muted">{note}</p>}
    </div>
  );
}

function MiniBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
        <span>{label}</span><strong>{value}</strong>
      </div>
      <div style={{ height: 10, borderRadius: 999, background: '#e5e7eb', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#991b1b', borderRadius: 999 }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const getTenantData = useAppStore(s => s.getTenantData);
  const getCompanyHealth = useAppStore(s => s.getCompanyHealth);
  const getRisks = useAppStore(s => s.getRisks);
  const getTenant = useAppStore(s => s.getTenant);
  const tenants = useAppStore(s => s.tenants);
  const currentUser = useAppStore(s => s.currentUser);

  const d = getTenantData();
  const health = getCompanyHealth();
  const risks = getRisks();
  const tenant = getTenant();
  const today = new Date().toISOString().slice(0, 10);
  const m = new Date().toISOString().slice(0, 7);

  const activeEmployees = d.employees.filter(e => e.status === 'active').length;
  const todayIn = d.attendance.filter(a => a.date === today && a.type === 'in');
  const totalPayroll = d.payroll.filter(p => p.month === m).reduce((sum, p) => sum + Number(p.net || 0), 0);
  const openRequests = d.requests.filter(r => !['approved', 'rejected', 'closed'].includes(r.status)).length;
  const openPO = (d.purchaseOrders || []).filter(x => !['closed', 'rejected'].includes(x.status)).length;

  const attendanceByProject = d.projects.map(p => ({
    name: p.name.slice(0, 18),
    value: d.attendance.filter(a => a.date === today && a.type === 'in' && a.projectId === p.id).length,
  }));
  const maxAttendance = Math.max(1, ...attendanceByProject.map(x => x.value));

  const deptData = Array.from(new Set(d.employees.map(e => e.department))).map(dep => ({
    name: dep || 'غير محدد',
    value: d.employees.filter(e => e.department === dep && e.status === 'active').length,
  }));
  const maxDept = Math.max(1, ...deptData.map(x => x.value));

  return (
    <div className="page-fade">
      <div className="card hero" style={{ '--score': health } as React.CSSProperties}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>لوحة التحكم التنفيذية</h1>
          <p className="muted">نظرة شاملة على أداء {tenant?.name} - مباشر ولحظي</p>
          <div className="badges">
            <span className={`badge ${health >= 70 ? 'green' : health >= 50 ? 'yellow' : 'red'}`}>صحة الشركة {health}%</span>
            <span className="badge yellow">طلبات مفتوحة {openRequests}</span>
            <span className="badge blue">مشتريات {openPO}</span>
            <span className="badge">{tenant?.plan}</span>
          </div>
        </div>
        <div className="healthCircle">
          <b>{health}%</b>
          <span>Health</span>
        </div>
      </div>

      <div className="grid">
        <Stat title="الموظفون الفعالون" value={activeEmployees} icon={Users} note="داخل المشاريع الحالية" />
        <Stat title="حضور اليوم" value={`${todayIn.length}/${activeEmployees}`} icon={Clock} note="حضور وانصراف مسجل" color="#059669" />
        <Stat title="إجمالي الرواتب" value={`${totalPayroll.toLocaleString()} ﷼`} icon={DollarSign} note={`مسير ${m}`} color="#2563eb" />
        <Stat title="مؤشر المخاطر" value={`${100 - health}%`} icon={AlertTriangle} note="مرتبط بالتشغيل" color={100 - health > 40 ? '#dc2626' : '#d97706'} />
        <Stat title="المشاريع النشطة" value={d.projects.filter(p => p.status === 'active').length} icon={TrendingUp} note="مرتبطة بـ GPS" color="#7c3aed" />
        <Stat title="الطلبات المعلقة" value={openRequests} icon={FileText} note="تحتاج اعتماد" color="#d97706" />
        <Stat title="أوامر الشراء" value={openPO} icon={ShoppingCart} note="مفتوحة للمراجعة" color="#0891b2" />
        {currentUser?.role === 'owner' && <Stat title="شركات SaaS" value={tenants.length} icon={Building2} note="كل العملاء على المنصة" color="#059669" />}
      </div>

      {risks.length > 0 && (
        <div className="card">
          <h2><AlertTriangle size={20} color="#dc2626" /> تنبيهات المخاطر النشطة</h2>
          <div className="timeline">
            {risks.map((r, i) => (
              <div key={i} className="tl" style={{ borderColor: r.level === 'high' ? '#dc2626' : '#d97706' }}>
                <b>{r.title}</b>
                <p>{r.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        <div className="card">
          <h3>الحضور اليوم بالمشاريع</h3>
          {attendanceByProject.length > 0 ? attendanceByProject.map(x => <MiniBar key={x.name} label={x.name} value={x.value} max={maxAttendance} />) : <div className="empty">لا توجد بصمات اليوم</div>}
        </div>
        <div className="card">
          <h3>توزيع الموظفين بالأقسام</h3>
          {deptData.length > 0 ? deptData.map(x => <MiniBar key={x.name} label={x.name} value={x.value} max={maxDept} />) : <div className="empty">لا يوجد موظفون</div>}
        </div>
      </div>

      <div className="card">
        <h2><Clock size={20} /> آخر الأحداث</h2>
        <div className="timeline">
          {d.attendance.slice(0, 5).map(a => (
            <div key={a.id} className="tl">
              <b>{a.employeeName} - {a.type === 'in' ? 'حضور' : 'انصراف'}</b>
              <p>{a.date} | {a.time} | {a.projectName}</p>
            </div>
          ))}
          {d.attendance.length === 0 && <div className="empty">لا توجد بصمات مسجلة</div>}
        </div>
      </div>
    </div>
  );
}
