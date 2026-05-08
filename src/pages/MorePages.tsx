import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Building2, AlertTriangle, History, Users, FileText, Bell, Settings, ShoppingCart, ClipboardCheck, Package, Eye, BarChart3, Download, Plus, Trash2, Check, X } from 'lucide-react';

/* ===== TENANT SWITCHER ===== */
export function TenantSwitcher() {
  const currentUser = useAppStore(s => s.currentUser);
  const tenants = useAppStore(s => s.tenants);
  const currentTenantId = useAppStore(s => s.currentTenantId);
  const switchTenant = useAppStore(s => s.switchTenant);
  if (currentUser?.role !== 'owner') return null;
  return (
    <select value={currentTenantId} onChange={e => { try { switchTenant(e.target.value); } catch (err) { alert((err as Error).message); } }}>
      {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
    </select>
  );
}

/* ===== SAAS ADMIN ===== */
export function SaaSAdmin() {
  const s = useAppStore(s => s);
  const [form, setForm] = useState({ name: '', domain: '', plan: 'Trial', seats: 10, renewalDate: '2026-12-31' });
  const [user, setUser] = useState({ tenantId: s.currentTenantId, username: '', password: '123456', name: '', role: 'admin' });

  const saveTenant = () => {
    try { const t = s.addTenant(form); setForm({ name: '', domain: '', plan: 'Trial', seats: 10, renewalDate: '2026-12-31' }); setUser({ ...user, tenantId: t.id }); }
    catch (e) { alert((e as Error).message); }
  };
  const saveUser = () => {
    try { s.createTenantUser(user); setUser({ tenantId: s.currentTenantId, username: '', password: '123456', name: '', role: 'admin' }); }
    catch (e) { alert((e as Error).message); }
  };

  return (
    <div className="page-fade">
      <div className="card">
        <h2><Building2 size={22} /> لوحة SaaS للمالك</h2>
        <div className="grid" style={{ marginBottom: 20 }}>
          <div className="card stat"><h3>الشركات</h3><h1>{s.tenants.length}</h1></div>
          <div className="card stat"><h3>نشطة</h3><h1>{s.tenants.filter(t => t.status === 'active').length}</h1></div>
          <div className="card stat"><h3>المستخدمون</h3><h1>{s.users.length}</h1></div>
        </div>

        <h3>إضافة شركة جديدة</h3>
        <div className="settingsGrid">
          <label>اسم الشركة<input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="اسم الشركة" /></label>
          <label>الدومين<input className="input" value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} placeholder="company.local" /></label>
          <label>الخطة
            <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}>
              <option>Trial</option><option>Business</option><option>Enterprise AI</option>
            </select>
          </label>
          <label>عدد المقاعد<input className="input" type="number" value={form.seats} onChange={e => setForm({ ...form, seats: Number(e.target.value) })} /></label>
          <label>تجديد<input className="input" type="date" value={form.renewalDate} onChange={e => setForm({ ...form, renewalDate: e.target.value })} /></label>
        </div>
        <button className="btn green" onClick={saveTenant}><Plus size={16} /> إضافة شركة</button>

        <h3 style={{ marginTop: 24 }}>إضافة مستخدم</h3>
        <div className="settingsGrid">
          <label>الشركة
            <select value={user.tenantId} onChange={e => setUser({ ...user, tenantId: e.target.value })}>
              {s.tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
          <label>الاسم<input className="input" value={user.name} onChange={e => setUser({ ...user, name: e.target.value })} placeholder="الاسم الكامل" /></label>
          <label>اسم الدخول<input className="input" value={user.username} onChange={e => setUser({ ...user, username: e.target.value })} placeholder="username" /></label>
          <label>كلمة المرور<input className="input" value={user.password} onChange={e => setUser({ ...user, password: e.target.value })} /></label>
          <label>الدور
            <select value={user.role} onChange={e => setUser({ ...user, role: e.target.value })}>
              <option value="admin">مدير</option><option value="hr">موارد بشرية</option>
              <option value="manager">مشرف</option><option value="employee">موظف</option>
            </select>
          </label>
        </div>
        <button className="btn green" onClick={saveUser}><Plus size={16} /> إضافة مستخدم</button>

        <h3 style={{ marginTop: 24 }}>الشركات على المنصة</h3>
        <table className="table">
          <thead><tr><th>الشركة</th><th>الخطة</th><th>الحالة</th><th>التجديد</th><th>إجراء</th></tr></thead>
          <tbody>
            {s.tenants.map(t => (
              <tr key={t.id}>
                <td><strong>{t.name}</strong><br /><span className="muted">{t.domain}</span></td>
                <td><span className="badge">{t.plan}</span></td>
                <td><span className={`badge ${t.subscriptionStatus === 'active' ? 'green' : t.subscriptionStatus === 'trial' ? 'yellow' : 'red'}`}>{t.subscriptionStatus}</span></td>
                <td>{t.renewalDate}</td>
                <td>
                  <button className="btn light" onClick={() => s.updateTenant(t.id, { subscriptionStatus: t.subscriptionStatus === 'suspended' ? 'active' : 'suspended', status: t.status === 'suspended' ? 'active' : 'suspended' })}>
                    {t.subscriptionStatus === 'suspended' ? 'تفعيل' : 'إيقاف'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===== RISK ===== */
export function Risk() {
  const s = useAppStore(s => s);
  const d = s.getTenantData();
  const health = s.getCompanyHealth();
  const risks = s.getRisks();
  return (
    <div className="page-fade">
      <div className="card">
        <h2><AlertTriangle size={22} /> مؤشر المخاطر التشغيلي</h2>
        <div className="riskMeter">
          <div className="riskMeter-inner" style={{ width: `${100 - health}%` }} />
        </div>
        <div className="grid" style={{ marginBottom: 20 }}>
          <div className="card stat"><h3>صحة الشركة</h3><h1 style={{ color: health >= 70 ? '#059669' : health >= 50 ? '#d97706' : '#dc2626' }}>{health}%</h1></div>
          <div className="card stat"><h3>نسبة الخطر</h3><h1 style={{ color: '#dc2626' }}>{100 - health}%</h1></div>
          <div className="card stat"><h3>الطلبات المفتوحة</h3><h1>{d.requests.filter(r => !['approved', 'rejected', 'closed'].includes(r.status)).length}</h1></div>
          <div className="card stat"><h3>المخاطر المكتشفة</h3><h1>{risks.length}</h1></div>
        </div>

        <h3>تنبيهات المخاطر</h3>
        {risks.length > 0 ? (
          <div className="timeline">
            {risks.map((r, i) => (
              <div key={i} className="tl" style={{ borderColor: r.level === 'high' ? '#dc2626' : '#d97706' }}>
                <b>
                  <span style={{ color: r.level === 'high' ? '#dc2626' : '#d97706', marginLeft: 8 }}>
                    {r.level === 'high' ? '● خطر عالي' : '● تحذير'}
                  </span>
                  {r.title}
                </b>
                <p>{r.detail}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty" style={{ background: '#f0fdf4', color: '#166534' }}>
            لا توجد مخاطر عالية الآن. صحة الشركة {health}%
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== TIMELINE ===== */
export function Timeline() {
  const s = useAppStore(s => s);
  const d = s.getTenantData();
  const events = [
    ...d.attendance.map(a => ({ date: a.date, time: a.time, type: 'حضور', text: `${a.employeeName} - ${a.type === 'in' ? 'حضور' : 'انصراف'} - ${a.projectName}`, color: '#059669' })),
    ...d.payroll.map(p => ({ date: p.month, time: '', type: 'بيرول', text: `${p.employeeName} صافي ${p.net.toLocaleString()} ريال`, color: '#2563eb' })),
    ...d.audit.map(a => ({ date: a.date, time: a.time, type: 'Audit', text: `${a.user}: ${a.action}`, color: '#7c3aed' })),
    ...d.notifications.map(n => ({ date: n.date, time: n.time, type: 'إشعار', text: n.title, color: '#d97706' })),
  ].sort((a, b) => (String(b.date) + String(b.time)).localeCompare(String(a.date) + String(a.time))).slice(0, 100);

  return (
    <div className="page-fade">
      <div className="card">
        <h2><History size={22} /> Timeline الشركة</h2>
        {events.length > 0 ? (
          <div className="timeline">
            {events.map((e, i) => (
              <div key={i} className="tl" style={{ borderColor: e.color }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <b><span style={{ color: e.color, marginLeft: 8 }}>{e.type}</span></b>
                  <span className="muted">{e.date} {e.time}</span>
                </div>
                <p>{e.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">لا توجد أحداث بعد. ابدأ بتسجيل الحضور أو إنشاء طلبات.</div>
        )}
      </div>
    </div>
  );
}

/* ===== EMPLOYEES ===== */
export function Employees() {
  const store = useAppStore(s => s);
  const d = store.getTenantData();
  const blank = { name: '', role: '', department: '', projectId: d.projects[0]?.id || '', basicSalary: '', startDate: new Date().toISOString().slice(0, 10), phone: '', nationality: '', iqamaNumber: '', iqamaExpiry: '' };
  const [form, setForm] = useState<typeof blank & { id?: string }>(blank);
  const [search, setSearch] = useState('');

  const save = () => {
    try { store.upsertEmployee({ ...form, basicSalary: Number(form.basicSalary) }); setForm(blank); }
    catch (e) { alert((e as Error).message); }
  };
  const projectName = (id: string) => d.projects.find(p => p.id === id)?.name || 'غير محدد';
  const filtered = d.employees.filter(e => !search || e.name.includes(search) || e.role.includes(search) || e.department.includes(search));

  return (
    <div className="page-fade">
      <div className="card">
        <h2><Users size={22} /> إدارة الموظفين</h2>
        <div className="settingsGrid">
          <label>الاسم<input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="الاسم الكامل" /></label>
          <label>الوظيفة<input className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="المسمى الوظيفي" /></label>
          <label>القسم<input className="input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="القسم" /></label>
          <label>المشروع
            <select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}>
              {d.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label>الراتب الأساسي<input className="input" type="number" value={form.basicSalary} onChange={e => setForm({ ...form, basicSalary: e.target.value })} placeholder="0" /></label>
          <label>تاريخ المباشرة<input className="input" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></label>
          <label>الجوال<input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="05xxxxxxxx" /></label>
          <label>الجنسية<input className="input" value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })} placeholder="سعودي / مصري..." /></label>
          <label>رقم الإقامة<input className="input" value={form.iqamaNumber} onChange={e => setForm({ ...form, iqamaNumber: e.target.value })} placeholder="رقم الإقامة" /></label>
          <label>تاريخ انتهاء الإقامة<input className="input" type="date" value={form.iqamaExpiry} onChange={e => setForm({ ...form, iqamaExpiry: e.target.value })} /></label>
        </div>
        <div className="actions">
          <button className="btn green" onClick={save}>{form.id ? 'حفظ التعديل' : 'إضافة موظف'}</button>
          {form.id && <button className="btn light" onClick={() => setForm(blank)}>إلغاء</button>}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>قائمة الموظفين ({filtered.length})</h2>
          <input className="input" placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200 }} />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr><th>الاسم</th><th>الوظيفة</th><th>القسم</th><th>المشروع</th><th>الراتب</th><th>المباشرة</th><th>الجنسية</th><th>الحالة</th><th>إجراءات</th></tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td><strong>{e.name}</strong></td>
                  <td>{e.role}</td>
                  <td>{e.department}</td>
                  <td>{projectName(e.projectId)}</td>
                  <td>{Number(e.basicSalary).toLocaleString()} ﷼</td>
                  <td>{e.startDate}</td>
                  <td>{e.nationality || '-'}</td>
                  <td><span className={`badge ${e.status === 'active' ? 'green' : 'red'}`}>{e.status === 'active' ? 'فعال' : 'موقف'}</span></td>
                  <td>
                    <button className="btn light" onClick={() => setForm({ ...e, basicSalary: String(e.basicSalary), nationality: e.nationality || '', iqamaNumber: e.iqamaNumber || '', iqamaExpiry: e.iqamaExpiry || '' })}>تعديل</button>
                    {' '}
                    <button className="btn red" onClick={() => store.deleteEmployee(e.id)}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="empty">لا يوجد موظفون</div>}
      </div>
    </div>
  );
}

/* ===== REQUESTS ===== */
export function Requests() {
  const store = useAppStore(s => s);
  const d = store.getTenantData();
  const [form, setForm] = useState({ type: 'طلب إداري', employeeId: '', projectId: '', amount: '', dueDate: '', notes: '' });
  const [filter, setFilter] = useState('');

  const save = () => {
    try {
      const emp = d.employees.find(e => e.id === form.employeeId);
      store.createRequest({ ...form, employeeName: emp?.name || '', amount: Number(form.amount) });
      setForm({ type: 'طلب إداري', employeeId: '', projectId: '', amount: '', dueDate: '', notes: '' });
    } catch (e) { alert((e as Error).message); }
  };

  const filtered = d.requests.filter(r => !filter || r.type.includes(filter) || r.employeeName.includes(filter) || r.status.includes(filter));

  return (
    <div className="page-fade">
      <div className="card">
        <h2><FileText size={22} /> إدارة الطلبات</h2>
        <div className="settingsGrid">
          <label>نوع الطلب
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {['طلب إداري', 'إجازة', 'سلفة', 'إذن', 'طلب شراء', 'صيانة', 'عمل إضافي'].map(t => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label>الموظف
            <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}>
              <option value="">اختر الموظف...</option>
              {d.employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </label>
          <label>المشروع
            <select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}>
              <option value="">اختر المشروع...</option>
              {d.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label>المبلغ<input className="input" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0 إن وجد" /></label>
          <label>موعد الاستحقاق<input className="input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></label>
          <label>ملاحظات<input className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="تفاصيل الطلب..." /></label>
        </div>
        <button className="btn green" onClick={save}><Plus size={16} /> إنشاء طلب</button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>الطلبات ({d.requests.length})</h2>
          <input className="input" placeholder="بحث..." value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 200 }} />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr><th>النوع</th><th>الموظف</th><th>الحالة</th><th>التاريخ</th><th>المبلغ</th><th>إجراءات</th></tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.type}</strong></td>
                  <td>{r.employeeName}</td>
                  <td>
                    <span className={`badge ${r.status === 'approved' ? 'green' : r.status === 'rejected' ? 'red' : r.status === 'sent' ? 'blue' : 'yellow'}`}>
                      {r.status === 'draft' ? 'مسودة' : r.status === 'sent' ? 'مرسل' : r.status === 'approved' ? 'معتمد' : r.status === 'rejected' ? 'مرفوض' : r.status}
                    </span>
                  </td>
                  <td>{r.date}</td>
                  <td>{r.amount > 0 ? `${r.amount.toLocaleString()} ﷼` : '-'}</td>
                  <td style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {r.status === 'draft' && <button className="btn blue" onClick={() => store.sendRequest(r.id)}><Check size={13} /> إرسال</button>}
                    {!['approved', 'rejected'].includes(r.status) && <button className="btn green" onClick={() => store.approveRequest(r.id)}><Check size={13} /> اعتماد</button>}
                    {!['approved', 'rejected'].includes(r.status) && <button className="btn red" onClick={() => store.rejectRequest(r.id)}><X size={13} /> رفض</button>}
                    <button className="btn light" onClick={() => store.deleteRequest(r.id)}><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {d.requests.length === 0 && <div className="empty">لا توجد طلبات</div>}
      </div>
    </div>
  );
}

/* ===== REPORTS ===== */
export function Reports() {
  const s = useAppStore(s => s);
  const d = s.getTenantData();

  const backup = () => {
    const blob = new Blob([s.exportBackup()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'nabny-os-backup.json';
    a.click();
  };

  return (
    <div className="page-fade">
      <div className="card">
        <h2><BarChart3 size={22} /> التقارير التنفيذية</h2>
        <div className="grid">
          <div className="card stat"><h3>الموظفون</h3><h1>{d.employees.length}</h1></div>
          <div className="card stat"><h3>البصمات</h3><h1>{d.attendance.length}</h1></div>
          <div className="card stat"><h3>مسيرات</h3><h1>{d.payroll.length}</h1></div>
          <div className="card stat"><h3>الطلبات</h3><h1>{d.requests.length}</h1></div>
          <div className="card stat"><h3>الموردون</h3><h1>{(d.suppliers || []).length}</h1></div>
          <div className="card stat"><h3>أوامر الشراء</h3><h1>{(d.purchaseOrders || []).length}</h1></div>
          <div className="card stat"><h3>العقود</h3><h1>{(d.contracts || []).length}</h1></div>
          <div className="card stat"><h3>المستندات</h3><h1>{(d.documents || []).length}</h1></div>
        </div>
        <button className="btn green" onClick={backup}><Download size={16} /> تصدير نسخة احتياطية JSON</button>
        {' '}
        <button className="btn light" onClick={() => s.generateDocumentNotifications()}><Bell size={16} /> فحص المستندات وتنبيه</button>
      </div>
    </div>
  );
}

/* ===== NOTIFICATIONS ===== */
export function Notifications() {
  const s = useAppStore(s => s);
  const d = s.getTenantData();
  const unread = d.notifications.filter(n => !n.read);

  return (
    <div className="page-fade">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}><Bell size={22} /> الإشعارات</h2>
          {unread.length > 0 && <span className="badge red">{unread.length} غير مقروء</span>}
        </div>
        {d.notifications.length > 0 ? (
          <div className="timeline">
            {d.notifications.map(n => (
              <div key={n.id} className="tl" style={{ borderColor: n.level === 'danger' ? '#dc2626' : n.level === 'warning' ? '#d97706' : n.level === 'success' ? '#059669' : '#2563eb', opacity: n.read ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <b>{n.title}</b>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="muted">{n.date} {n.time}</span>
                    {!n.read && <button className="btn light" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => s.markNotificationRead(n.id)}>تعليم مقروء</button>}
                  </div>
                </div>
                <p>{n.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">لا توجد إشعارات</div>
        )}
      </div>
    </div>
  );
}

/* ===== SETTINGS ===== */
export function SettingsPage() {
  const s = useAppStore(s => s);
  const settings = s.getSettings();
  const d = s.getTenantData();
  const [project, setProject] = useState({ name: '', lat: '', lng: '', radius: '120', budget: '', description: '' });

  const update = (k: string, v: unknown) => s.setSettings({ [k]: v });
  const file = (k: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => update(k, r.result);
    r.readAsDataURL(f);
  };
  const saveProject = () => {
    try { s.upsertProject({ ...project, lat: Number(project.lat), lng: Number(project.lng), radius: Number(project.radius), budget: Number(project.budget) }); setProject({ name: '', lat: '', lng: '', radius: '120', budget: '', description: '' }); }
    catch (e) { alert((e as Error).message); }
  };

  return (
    <div className="page-fade">
      <div className="card">
        <h2><Settings size={22} /> الإعدادات والهوية</h2>
        <div className="settingsGrid">
          <label>اسم النظام<input className="input" value={settings.systemName} onChange={e => update('systemName', e.target.value)} /></label>
          <label>اسم الشركة<input className="input" value={settings.company} onChange={e => update('company', e.target.value)} /></label>
          <label>بداية الدوام<input className="input" type="time" value={settings.workStart} onChange={e => update('workStart', e.target.value)} /></label>
          <label>نهاية الدوام<input className="input" type="time" value={settings.workEnd} onChange={e => update('workEnd', e.target.value)} /></label>
          <label>سماحية التأخير (دقيقة)<input className="input" type="number" value={settings.graceMinutes} onChange={e => update('graceMinutes', Number(e.target.value))} /></label>
          <label>GPS إجباري
            <select value={settings.requireGps ? '1' : '0'} onChange={e => update('requireGps', e.target.value === '1')}>
              <option value="0">لا - للتجربة</option>
              <option value="1">نعم - إنتاجي</option>
            </select>
          </label>
          <label>اللون الأساسي<input className="input" type="color" value={settings.primaryColor} onChange={e => update('primaryColor', e.target.value)} /></label>
          <label>اللون الثانوي<input className="input" type="color" value={settings.secondaryColor} onChange={e => update('secondaryColor', e.target.value)} /></label>
          <label>لون التمييز<input className="input" type="color" value={settings.accentColor} onChange={e => update('accentColor', e.target.value)} /></label>
          <label>الشعار<input className="input" type="file" accept="image/*" onChange={e => file('logo', e)} /></label>
          <label>صورة الخلفية<input className="input" type="file" accept="image/*" onChange={e => file('backgroundImage', e)} /></label>
        </div>
        <div className="actions">
          <button className="btn light" onClick={() => s.setSettings({ primaryColor: '#0f172a', secondaryColor: '#991b1b', accentColor: '#d97706', logo: '', backgroundImage: '' })}>استرجاع ثيم NABNY</button>
          <button className="btn red" onClick={() => window.confirm('استرجاع البيانات التجريبية؟') && s.resetDemo()}>Reset Demo</button>
        </div>
      </div>

      <div className="card">
        <h2>المشاريع ومواقع GPS</h2>
        <div className="settingsGrid">
          <label>اسم المشروع<input className="input" value={project.name} onChange={e => setProject({ ...project, name: e.target.value })} /></label>
          <label>Latitude<input className="input" value={project.lat} onChange={e => setProject({ ...project, lat: e.target.value })} placeholder="21.5433" /></label>
          <label>Longitude<input className="input" value={project.lng} onChange={e => setProject({ ...project, lng: e.target.value })} placeholder="39.1728" /></label>
          <label>Radius (متر)<input className="input" value={project.radius} onChange={e => setProject({ ...project, radius: e.target.value })} /></label>
          <label>الميزانية<input className="input" type="number" value={project.budget} onChange={e => setProject({ ...project, budget: e.target.value })} /></label>
          <label>الوصف<input className="input" value={project.description} onChange={e => setProject({ ...project, description: e.target.value })} /></label>
        </div>
        <button className="btn green" onClick={saveProject}><Plus size={16} /> إضافة مشروع</button>
        <table className="table" style={{ marginTop: 16 }}>
          <thead><tr><th>المشروع</th><th>الموقع</th><th>Radius</th><th>الميزانية</th><th>التقدم</th></tr></thead>
          <tbody>
            {d.projects.map(p => (
              <tr key={p.id}>
                <td><strong>{p.name}</strong></td>
                <td className="muted">{p.lat}, {p.lng}</td>
                <td>{p.radius}م</td>
                <td>{Number(p.budget).toLocaleString()} ﷼</td>
                <td>
                  <div className="progress-bar" style={{ width: 80 }}>
                    <div className="progress-fill" style={{ width: `${p.progress || 0}%`, background: '#059669' }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===== PROCUREMENT ===== */
export function Procurement() {
  const s = useAppStore(s => s);
  const d = s.getTenantData();
  const blankSup = { name: '', category: '', phone: '', rating: '4', email: '' };
  const blankPO = { projectId: d.projects[0]?.id || '', supplierId: (d.suppliers || [])[0]?.id || '', description: '', amount: '', priority: 'normal' };
  const [supplier, setSupplier] = useState(blankSup);
  const [po, setPo] = useState(blankPO);
  const [tab, setTab] = useState<'suppliers' | 'orders'>('suppliers');

  const saveSup = () => { try { s.upsertSupplier({ ...supplier, rating: Number(supplier.rating) }); setSupplier(blankSup); } catch (e) { alert((e as Error).message); } };
  const savePO = () => { try { s.createPurchaseOrder({ ...po, amount: Number(po.amount) }); setPo(blankPO); } catch (e) { alert((e as Error).message); } };

  return (
    <div className="page-fade">
      <div className="card">
        <h2><ShoppingCart size={22} /> المشتريات الذكية</h2>
        <div className="grid" style={{ marginBottom: 20 }}>
          <div className="card stat"><h3>الموردون</h3><h1>{(d.suppliers || []).length}</h1></div>
          <div className="card stat"><h3>أوامر مفتوحة</h3><h1>{(d.purchaseOrders || []).filter(x => !['closed', 'rejected'].includes(x.status)).length}</h1></div>
          <div className="card stat"><h3>قيمة مفتوحة</h3><h1>{(d.purchaseOrders || []).filter(x => !['closed', 'rejected'].includes(x.status)).reduce((a, b) => a + Number(b.amount || 0), 0).toLocaleString()}</h1><p className="muted">ريال</p></div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button className={`btn ${tab === 'suppliers' ? 'green' : 'light'}`} onClick={() => setTab('suppliers')}>إدارة الموردين</button>
          <button className={`btn ${tab === 'orders' ? 'green' : 'light'}`} onClick={() => setTab('orders')}>أوامر الشراء</button>
        </div>

        {tab === 'suppliers' && (
          <>
            <h3>إضافة مورد</h3>
            <div className="settingsGrid">
              <label>اسم المورد<input className="input" value={supplier.name} onChange={e => setSupplier({ ...supplier, name: e.target.value })} /></label>
              <label>التصنيف<input className="input" value={supplier.category} onChange={e => setSupplier({ ...supplier, category: e.target.value })} placeholder="كهرباء، سباكة..." /></label>
              <label>الجوال<input className="input" value={supplier.phone} onChange={e => setSupplier({ ...supplier, phone: e.target.value })} /></label>
              <label>البريد<input className="input" value={supplier.email} onChange={e => setSupplier({ ...supplier, email: e.target.value })} /></label>
              <label>التقييم (1-5)<input className="input" type="number" min="1" max="5" value={supplier.rating} onChange={e => setSupplier({ ...supplier, rating: e.target.value })} /></label>
            </div>
            <button className="btn green" onClick={saveSup}><Plus size={16} /> حفظ مورد</button>
            <table className="table" style={{ marginTop: 16 }}>
              <thead><tr><th>المورد</th><th>التصنيف</th><th>الجوال</th><th>التقييم</th><th>الحالة</th></tr></thead>
              <tbody>
                {(d.suppliers || []).map(x => (
                  <tr key={x.id}>
                    <td><strong>{x.name}</strong></td>
                    <td>{x.category}</td>
                    <td>{x.phone}</td>
                    <td>{'⭐'.repeat(Math.round(x.rating))}</td>
                    <td><span className={`badge ${x.status === 'active' ? 'green' : 'red'}`}>{x.status === 'active' ? 'فعال' : 'موقف'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {tab === 'orders' && (
          <>
            <h3>إنشاء أمر شراء</h3>
            <div className="settingsGrid">
              <label>المشروع
                <select value={po.projectId} onChange={e => setPo({ ...po, projectId: e.target.value })}>
                  {d.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
              <label>المورد
                <select value={po.supplierId} onChange={e => setPo({ ...po, supplierId: e.target.value })}>
                  {(d.suppliers || []).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </label>
              <label>وصف المواد<input className="input" value={po.description} onChange={e => setPo({ ...po, description: e.target.value })} placeholder="نوع المواد والكمية..." /></label>
              <label>القيمة<input className="input" type="number" value={po.amount} onChange={e => setPo({ ...po, amount: e.target.value })} /></label>
              <label>الأولوية
                <select value={po.priority} onChange={e => setPo({ ...po, priority: e.target.value })}>
                  <option value="normal">عادي</option><option value="high">عاجل</option><option value="critical">حرج</option>
                </select>
              </label>
            </div>
            <button className="btn green" onClick={savePO}><Plus size={16} /> حفظ أمر الشراء</button>
            <table className="table" style={{ marginTop: 16 }}>
              <thead><tr><th>الوصف</th><th>المشروع</th><th>المورد</th><th>القيمة</th><th>الأولوية</th><th>الحالة</th><th>إجراء</th></tr></thead>
              <tbody>
                {(d.purchaseOrders || []).map(x => (
                  <tr key={x.id}>
                    <td>{x.description}</td>
                    <td>{x.projectName}</td>
                    <td>{x.supplierName}</td>
                    <td>{Number(x.amount || 0).toLocaleString()} ﷼</td>
                    <td><span className={`badge ${x.priority === 'critical' ? 'red' : x.priority === 'high' ? 'orange' : 'blue'}`}>{x.priority === 'critical' ? 'حرج' : x.priority === 'high' ? 'عاجل' : 'عادي'}</span></td>
                    <td><span className={`badge ${x.status === 'approved' ? 'green' : x.status === 'closed' ? 'blue' : 'yellow'}`}>{x.status}</span></td>
                    <td>
                      {x.status === 'draft' && <button className="btn green" onClick={() => s.approvePurchaseOrder(x.id)} style={{ marginLeft: 4 }}>اعتماد</button>}
                      <button className="btn light" onClick={() => s.closePurchaseOrder(x.id)}>إغلاق</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

/* ===== CONTRACTS ===== */
export function Contracts() {
  const s = useAppStore(s => s);
  const d = s.getTenantData();
  const blank = { title: '', party: '', type: 'توريد', startDate: new Date().toISOString().slice(0, 10), endDate: '', value: '', notes: '' };
  const [form, setForm] = useState<typeof blank & { id?: string }>(blank);

  const save = () => { try { s.upsertContract({ ...form, value: Number(form.value) }); setForm(blank); } catch (e) { alert((e as Error).message); } };
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="page-fade">
      <div className="card">
        <h2><ClipboardCheck size={22} /> العقود والاتفاقيات</h2>
        <div className="settingsGrid">
          <label>عنوان العقد<input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
          <label>الطرف الآخر<input className="input" value={form.party} onChange={e => setForm({ ...form, party: e.target.value })} /></label>
          <label>نوع العقد
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {['توريد', 'مقاول باطن', 'موظف', 'صيانة', 'إيجار', 'خدمات'].map(t => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label>تاريخ البداية<input className="input" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></label>
          <label>تاريخ النهاية<input className="input" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></label>
          <label>قيمة العقد<input className="input" type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} /></label>
          <label>ملاحظات<input className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
        </div>
        <div className="actions">
          <button className="btn green" onClick={save}>{form.id ? 'حفظ التعديل' : 'إضافة عقد'}</button>
          {form.id && <button className="btn light" onClick={() => setForm(blank)}>إلغاء</button>}
        </div>
      </div>

      <div className="card">
        <h2>قائمة العقود ({(d.contracts || []).length})</h2>
        <table className="table">
          <thead><tr><th>العقد</th><th>الطرف</th><th>النوع</th><th>النهاية</th><th>القيمة</th><th>الحالة</th><th>إجراء</th></tr></thead>
          <tbody>
            {(d.contracts || []).map(c => (
              <tr key={c.id} className={c.endDate && c.endDate <= today ? 'dangerRow' : ''}>
                <td><strong>{c.title}</strong></td>
                <td>{c.party}</td>
                <td>{c.type}</td>
                <td>
                  {c.endDate}
                  {c.endDate && c.endDate <= today && <span className="badge red" style={{ marginRight: 6 }}>منتهي</span>}
                </td>
                <td>{Number(c.value || 0).toLocaleString()} ﷼</td>
                <td><span className={`badge ${c.status === 'active' ? 'green' : 'red'}`}>{c.status}</span></td>
                <td>
                  <button className="btn light" onClick={() => setForm({ ...c, value: String(c.value), notes: c.notes || '' })}>تعديل</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(d.contracts || []).length === 0 && <div className="empty">لا توجد عقود</div>}
      </div>
    </div>
  );
}

/* ===== ASSETS ===== */
export function Assets() {
  const s = useAppStore(s => s);
  const d = s.getTenantData();
  const blank = { name: '', code: '', projectId: d.projects[0]?.id || '', custodian: '', value: '', status: 'active' };
  const [form, setForm] = useState<typeof blank & { id?: string }>(blank);

  const save = () => { try { s.upsertAsset({ ...form, value: Number(form.value) }); setForm(blank); } catch (e) { alert((e as Error).message); } };
  const totalValue = (d.assets || []).reduce((s, a) => s + a.value, 0);

  return (
    <div className="page-fade">
      <div className="card">
        <h2><Package size={22} /> العهد والمعدات</h2>
        <div className="grid" style={{ marginBottom: 16 }}>
          <div className="card stat"><h3>إجمالي العهد</h3><h1>{(d.assets || []).length}</h1></div>
          <div className="card stat"><h3>إجمالي القيمة</h3><h1>{totalValue.toLocaleString()}</h1><p className="muted">ريال</p></div>
          <div className="card stat"><h3>صيانة</h3><h1>{(d.assets || []).filter(a => a.status === 'maintenance').length}</h1></div>
          <div className="card stat"><h3>مفقودة</h3><h1>{(d.assets || []).filter(a => a.status === 'lost').length}</h1></div>
        </div>

        <div className="settingsGrid">
          <label>اسم العهدة<input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
          <label>الكود/QR<input className="input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></label>
          <label>المشروع
            <select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}>
              {d.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label>المستلم<input className="input" value={form.custodian} onChange={e => setForm({ ...form, custodian: e.target.value })} /></label>
          <label>القيمة<input className="input" type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} /></label>
          <label>الحالة
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="active">نشطة</option><option value="maintenance">صيانة</option><option value="lost">مفقودة</option>
            </select>
          </label>
        </div>
        <div className="actions">
          <button className="btn green" onClick={save}>{form.id ? 'حفظ التعديل' : 'إضافة عهدة'}</button>
          {form.id && <button className="btn light" onClick={() => setForm(blank)}>إلغاء</button>}
        </div>

        <table className="table">
          <thead><tr><th>الاسم</th><th>الكود</th><th>المشروع</th><th>المستلم</th><th>القيمة</th><th>الحالة</th><th>إجراء</th></tr></thead>
          <tbody>
            {(d.assets || []).map(a => (
              <tr key={a.id}>
                <td><strong>{a.name}</strong></td>
                <td className="muted">{a.code}</td>
                <td>{a.projectName || d.projects.find(p => p.id === a.projectId)?.name || '-'}</td>
                <td>{a.custodian}</td>
                <td>{Number(a.value || 0).toLocaleString()} ﷼</td>
                <td><span className={`badge ${a.status === 'active' ? 'green' : a.status === 'maintenance' ? 'yellow' : 'red'}`}>{a.status === 'active' ? 'نشطة' : a.status === 'maintenance' ? 'صيانة' : 'مفقودة'}</span></td>
                <td><button className="btn light" onClick={() => setForm({ ...a, value: String(a.value) })}>تعديل</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {(d.assets || []).length === 0 && <div className="empty">لا توجد عهد أو معدات</div>}
      </div>
    </div>
  );
}

/* ===== EXECUTIVE BRIEF ===== */
export function ExecutiveBrief() {
  const s = useAppStore(s => s);
  const d = s.getTenantData();

  const create = () => { try { s.generateExecutiveBrief(); } catch (e) { alert((e as Error).message); } };

  return (
    <div className="page-fade">
      <div className="card">
        <h2><Eye size={22} /> الموجز التنفيذي</h2>
        <p className="muted" style={{ marginBottom: 16 }}>ملخص يومي لصاحب الشركة مبني على الحضور، الطلبات، المشتريات، العقود، والمخاطر.</p>
        <button className="btn green" onClick={create}>توليد موجز اليوم</button>
      </div>

      {(d.executiveBriefs || []).length > 0 ? (
        (d.executiveBriefs || []).map(b => (
          <div key={b.id} className="briefBox">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>{b.date} - صحة الشركة {b.health}%</h3>
              <span className={`badge ${b.health >= 70 ? 'green' : b.health >= 50 ? 'yellow' : 'red'}`}>{b.health}%</span>
            </div>
            <p style={{ marginBottom: 12 }}>{b.summary}</p>
            <ul style={{ paddingRight: 20, display: 'grid', gap: 6 }}>
              {(b.actions || []).map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        ))
      ) : (
        <div className="card">
          <div className="empty">اضغط "توليد موجز اليوم" لبدء سجل التقارير التنفيذية.</div>
        </div>
      )}
    </div>
  );
}
