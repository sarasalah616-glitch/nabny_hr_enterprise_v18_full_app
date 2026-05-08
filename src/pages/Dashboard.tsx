import { Users, Clock, DollarSign, AlertTriangle, Building2, TrendingUp, FileText, ShoppingCart } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

export default function Dashboard() {
  const d = useAppStore(s => s.getTenantData());
  const health = useAppStore(s => s.getCompanyHealth());
  const risks = useAppStore(s => s.getRisks());
  const tenant = useAppStore(s => s.getTenant());
  const tenants = useAppStore(s => s.tenants);
  const currentUser = useAppStore(s => s.currentUser);
  const today = new Date().toISOString().slice(0, 10);
  const m = new Date().toISOString().slice(0, 7);

  const todayIn = d.attendance.filter(a => a.date === today && a.type === 'in');
  const totalPayroll = d.payroll.filter(p => p.month === m).reduce((sum, p) => sum + Number(p.net || 0), 0);
  const openRequests = d.requests.filter(r => !['approved', 'rejected', 'closed'].includes(r.status)).length;
  const openPO = (d.purchaseOrders || []).filter(x => !['closed', 'rejected'].includes(x.status)).length;

  const attendanceByProject = d.projects.map(p => ({
    name: p.name.slice(0, 12),
    حضور: d.attendance.filter(a => a.date === today && a.type === 'in' && a.projectId === p.id).length,
  }));

  const COLORS = ['#059669', '#d97706', '#dc2626', '#2563eb', '#7c3aed'];
  const deptData = Array.from(new Set(d.employees.map(e => e.department))).map(dep => ({
    name: dep,
    value: d.employees.filter(e => e.department === dep && e.status === 'active').length,
  }));

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
        <Stat title="الموظفون الفعالون" value={d.employees.filter(e => e.status === 'active').length} icon={Users} note="داخل المشاريع الحالية" />
        <Stat title="حضور اليوم" value={`${todayIn.length}/${d.employees.filter(e => e.status === 'active').length}`} icon={Clock} note="حضور وانصراف مسجل" color="#059669" />
        <Stat title="إجمالي الرواتب" value={`${totalPayroll.toLocaleString()} ﷼`} icon={DollarSign} note={`مسير ${m}`} color="#2563eb" />
        <Stat title="مؤشر المخاطر" value={`${100 - health}%`} icon={AlertTriangle} note="مرتبط بالتشغيل" color={100 - health > 40 ? '#dc2626' : '#d97706'} />
        <Stat title="المشاريع النشطة" value={d.projects.filter(p => p.status === 'active').length} icon={TrendingUp} note="مرتبطة بـ GPS" color="#7c3aed" />
        <Stat title="الطلبات المعلقة" value={openRequests} icon={FileText} note="تحتاج اعتماد" color="#d97706" />
        <Stat title="أوامر الشراء" value={openPO} icon={ShoppingCart} note="مفتوحة للمراجعة" color="#0891b2" />
        {currentUser?.role === 'owner' && (
          <Stat title="شركات SaaS" value={tenants.length} icon={Building2} note="كل العملاء على المنصة" color="#059669" />
        )}
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div className="card">
          <h3>الحضور اليوم بالمشاريع</h3>
          {attendanceByProject.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attendanceByProject}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="حضور" fill="#991b1b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty">لا توجد بصمات اليوم</div>
          )}
        </div>

        <div className="card">
          <h3>توزيع الموظفين بالأقسام</h3>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={deptData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name} (${value})`}>
                  {deptData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty">لا يوجد موظفون</div>
          )}
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
