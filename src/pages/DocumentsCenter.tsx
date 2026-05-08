import { useState, useMemo } from 'react';
import { Upload, FileText, Bell, CheckCircle, Trash2, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const ownerTypes = ['company', 'employee', 'vehicle', 'equipment', 'project', 'supplier', 'contract'];
const docTypes = ['سجل تجاري', 'إقامة', 'جواز', 'رخصة عمل', 'تأمين طبي', 'عقد', 'استمارة مركبة', 'تأمين مركبة', 'فحص دوري', 'شهادة محتوى محلي', 'رخصة بلدية', 'زكاة وضريبة', 'ملف هندسي', 'فاتورة', 'أخرى'];

function alertClass(days: number) {
  if (days < 0) return 'badge red';
  if (days <= 7) return 'badge red';
  if (days <= 30) return 'badge yellow';
  if (days <= 90) return 'badge blue';
  return 'badge green';
}

function readFile(file: File): Promise<{ fileName: string; fileType: string; fileSize: number; fileData: string }> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve({ fileName: file.name, fileType: file.type || 'unknown', fileSize: file.size, fileData: r.result as string });
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function DocumentsCenter() {
  const s = useAppStore(s => s);
  const d = s.getTenantData();
  const alerts = s.getDocumentAlerts();
  const [form, setForm] = useState({ ownerType: 'company', ownerName: '', documentType: 'إقامة', title: '', issueDate: '', expiryDate: '', notes: '' });
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('');
  const [renewId, setRenewId] = useState<string | null>(null);
  const [renewDate, setRenewDate] = useState('');

  const stats = useMemo(() => ({
    total: (d.documents || []).length,
    alerts: alerts.length,
    expired: alerts.filter(x => (x.daysToExpire || 0) < 0).length,
    critical: alerts.filter(x => (x.daysToExpire || 0) >= 0 && (x.daysToExpire || 0) <= 7).length,
  }), [d.documents, alerts]);

  const save = async () => {
    try {
      setBusy(true);
      const fileEl = document.getElementById('document-file') as HTMLInputElement;
      const file = fileEl?.files?.[0];
      const fileMeta = file ? await readFile(file) : {};
      s.upsertDocument({ ...form, ...fileMeta });
      setForm({ ownerType: 'company', ownerName: '', documentType: 'إقامة', title: '', issueDate: '', expiryDate: '', notes: '' });
      if (fileEl) fileEl.value = '';
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const filtered = (d.documents || []).filter(doc =>
    !filter || doc.title.includes(filter) || doc.ownerName.includes(filter) || doc.documentType.includes(filter)
  );

  return (
    <div className="page-fade">
      <div className="card">
        <h2><FileText size={22} /> مركز المستندات والملفات</h2>

        <div className="grid" style={{ marginBottom: 20 }}>
          <div className="card stat"><FileText size={22} /><h3>إجمالي المستندات</h3><h1>{stats.total}</h1></div>
          <div className="card stat"><AlertTriangle size={22} color="#d97706" /><h3>تنبيهات (90 يوم)</h3><h1>{stats.alerts}</h1></div>
          <div className="card stat"><AlertTriangle size={22} color="#dc2626" /><h3>حرجة (7 أيام)</h3><h1>{stats.critical}</h1></div>
          <div className="card stat"><AlertTriangle size={22} color="#991b1b" /><h3>منتهية</h3><h1>{stats.expired}</h1></div>
        </div>

        {alerts.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3><Bell size={16} /> تنبيهات الانتهاء</h3>
            <div className="timeline">
              {alerts.slice(0, 10).map(a => (
                <div key={a.id} className="tl" style={{ borderColor: (a.daysToExpire || 0) < 0 ? '#dc2626' : (a.daysToExpire || 0) <= 7 ? '#dc2626' : '#d97706' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b>{a.title}</b>
                    <span className={alertClass(a.daysToExpire || 0)}>
                      {(a.daysToExpire || 0) < 0 ? `منتهي منذ ${Math.abs(a.daysToExpire || 0)}` : `متبقي ${a.daysToExpire} يوم`}
                    </span>
                  </div>
                  <p>{a.documentType} - {a.ownerName} - ينتهي {a.expiryDate}</p>
                </div>
              ))}
            </div>
            <button className="btn light" style={{ marginTop: 8 }} onClick={() => s.generateDocumentNotifications()}>
              <Bell size={15} /> توليد إشعارات
            </button>
          </div>
        )}

        <h3><Upload size={16} /> رفع مستند جديد</h3>
        <div className="settingsGrid">
          <label>الجهة
            <select value={form.ownerType} onChange={e => setForm({ ...form, ownerType: e.target.value })}>
              {ownerTypes.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </label>
          <label>اسم الجهة
            <input className="input" value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} placeholder="اسم الشركة أو الموظف..." />
          </label>
          <label>نوع المستند
            <select value={form.documentType} onChange={e => setForm({ ...form, documentType: e.target.value })}>
              {docTypes.map(x => <option key={x}>{x}</option>)}
            </select>
          </label>
          <label>اسم المستند
            <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="عنوان المستند..." />
          </label>
          <label>تاريخ الإصدار
            <input className="input" type="date" value={form.issueDate} onChange={e => setForm({ ...form, issueDate: e.target.value })} />
          </label>
          <label>تاريخ الانتهاء
            <input className="input" type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
          </label>
          <label>الملف
            <input id="document-file" className="input" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.txt" />
          </label>
          <label>ملاحظات
            <input className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="أي ملاحظات..." />
          </label>
        </div>
        <button className="btn green" disabled={busy} onClick={save}>
          <Upload size={15} /> {busy ? 'جاري الحفظ...' : 'حفظ المستند'}
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>كل المستندات</h2>
          <input className="input" placeholder="بحث..." value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 220 }} />
        </div>

        {renewId && (
          <div style={{ padding: 16, background: '#fffbeb', borderRadius: 14, marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            <span>تجديد المستند:</span>
            <input className="input" type="date" value={renewDate} onChange={e => setRenewDate(e.target.value)} style={{ width: 'auto' }} />
            <button className="btn green" onClick={() => { if (renewDate) { s.renewDocument(renewId, renewDate); setRenewId(null); setRenewDate(''); } }}>تأكيد التجديد</button>
            <button className="btn light" onClick={() => setRenewId(null)}>إلغاء</button>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr><th>المستند</th><th>الجهة</th><th>النوع</th><th>الانتهاء</th><th>الحالة</th><th>الملف</th><th>إجراءات</th></tr>
            </thead>
            <tbody>
              {filtered.map(doc => {
                const days = doc.expiryDate ? Math.ceil((new Date(doc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
                return (
                  <tr key={doc.id} className={days !== null && days < 0 ? 'dangerRow' : ''}>
                    <td><strong>{doc.title}</strong></td>
                    <td>{doc.ownerName}</td>
                    <td>{doc.documentType}</td>
                    <td>
                      {doc.expiryDate}
                      {days !== null && <span className={alertClass(days)} style={{ marginRight: 6, fontSize: 11 }}>
                        {days < 0 ? `منتهي` : `${days}د`}
                      </span>}
                    </td>
                    <td><span className={`badge ${doc.status === 'active' ? 'green' : doc.status === 'renewed' ? 'blue' : 'orange'}`}>{doc.status}</span></td>
                    <td>{doc.fileData ? <a href={doc.fileData} download={doc.fileName}>{doc.fileName?.slice(0, 20)}</a> : <span className="muted">لا يوجد</span>}</td>
                    <td>
                      <button className="btn light" style={{ marginLeft: 4 }} onClick={() => { setRenewId(doc.id); setRenewDate(doc.expiryDate || ''); }}>
                        <CheckCircle size={14} /> تجديد
                      </button>
                      <button className="btn red" onClick={() => window.confirm('حذف المستند؟') && s.deleteDocument(doc.id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="empty">لا توجد مستندات</div>}
      </div>
    </div>
  );
}
