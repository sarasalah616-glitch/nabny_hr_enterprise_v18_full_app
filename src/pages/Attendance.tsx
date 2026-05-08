import { useState } from 'react';
import { Clock, MapPin, CheckCircle, XCircle, Plus } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Attendance() {
  const store = useAppStore(s => s);
  const d = store.getTenantData();
  const [selectedEmp, setSelectedEmp] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [manualForm, setManualForm] = useState({ employeeId: '', type: 'in' as 'in' | 'out', date: new Date().toISOString().slice(0, 10), time: '08:00' });
  const [showManual, setShowManual] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));

  const active = d.employees.filter(e => e.status === 'active');
  const projectName = (id: string) => d.projects.find(p => p.id === id)?.name || 'غير محدد';

  const handlePunch = async (type: 'in' | 'out') => {
    try {
      if (!selectedEmp) return setMsg({ text: 'اختر موظف أولاً', type: 'error' });
      setLoading(true);
      await store.punchAttendance({ employeeId: selectedEmp, type });
      setMsg({ text: `تم تسجيل ${type === 'in' ? 'الحضور' : 'الانصراف'} بنجاح`, type: 'success' });
    } catch (e) {
      setMsg({ text: (e as Error).message, type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 4000);
    }
  };

  const handleManual = () => {
    try {
      store.manualAttendance(manualForm);
      setMsg({ text: 'تم التسجيل اليدوي بنجاح', type: 'success' });
      setShowManual(false);
    } catch (e) {
      setMsg({ text: (e as Error).message, type: 'error' });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const filtered = d.attendance.filter(a => !filterDate || a.date === filterDate).slice(0, 50);
  const today = new Date().toISOString().slice(0, 10);
  const todayStats = {
    total: d.attendance.filter(a => a.date === today && a.type === 'in').length,
    late: d.attendance.filter(a => a.date === today && a.type === 'in' && a.delayMinutes > 0).length,
    out: d.attendance.filter(a => a.date === today && a.type === 'out').length,
  };

  return (
    <div className="page-fade">
      <div className="card">
        <h2><Clock size={22} /> الحضور GPS</h2>
        <div className="grid" style={{ marginBottom: 20 }}>
          <div className="card stat"><Clock size={22} /><h3>حضور اليوم</h3><h1>{todayStats.total}</h1></div>
          <div className="card stat" style={{ '--score': 0 } as React.CSSProperties}><XCircle size={22} color="#d97706" /><h3>متأخرون</h3><h1>{todayStats.late}</h1></div>
          <div className="card stat"><CheckCircle size={22} color="#059669" /><h3>انصرافات</h3><h1>{todayStats.out}</h1></div>
        </div>

        {msg && (
          <div style={{ padding: '12px 16px', borderRadius: 12, marginBottom: 16, background: msg.type === 'success' ? '#dcfce7' : '#fee2e2', color: msg.type === 'success' ? '#166534' : '#991b1b', fontWeight: 600 }}>
            {msg.text}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, marginBottom: 16 }}>
          <select value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)}>
            <option value="">اختر الموظف...</option>
            {active.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name} - {projectName(emp.projectId)}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <button className="btn green" style={{ padding: '16px', fontSize: 15 }} disabled={loading || !selectedEmp} onClick={() => handlePunch('in')}>
            <CheckCircle size={20} /> {loading ? 'جاري التسجيل...' : 'تسجيل حضور GPS'}
          </button>
          <button className="btn red" style={{ padding: '16px', fontSize: 15 }} disabled={loading || !selectedEmp} onClick={() => handlePunch('out')}>
            <XCircle size={20} /> {loading ? 'جاري التسجيل...' : 'تسجيل انصراف GPS'}
          </button>
        </div>

        <button className="btn light" onClick={() => setShowManual(!showManual)}>
          <Plus size={16} /> تسجيل يدوي
        </button>

        {showManual && (
          <div className="card" style={{ marginTop: 16, background: '#f8fafc' }}>
            <h3>التسجيل اليدوي</h3>
            <div className="settingsGrid">
              <label>الموظف
                <select value={manualForm.employeeId} onChange={e => setManualForm({ ...manualForm, employeeId: e.target.value })}>
                  <option value="">اختر...</option>
                  {active.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </label>
              <label>النوع
                <select value={manualForm.type} onChange={e => setManualForm({ ...manualForm, type: e.target.value as 'in' | 'out' })}>
                  <option value="in">حضور</option>
                  <option value="out">انصراف</option>
                </select>
              </label>
              <label>التاريخ<input className="input" type="date" value={manualForm.date} onChange={e => setManualForm({ ...manualForm, date: e.target.value })} /></label>
              <label>الوقت<input className="input" type="time" value={manualForm.time} onChange={e => setManualForm({ ...manualForm, time: e.target.value })} /></label>
            </div>
            <button className="btn green" onClick={handleManual}>حفظ</button>
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}><MapPin size={20} /> سجل البصمات</h2>
          <input className="input" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ width: 'auto' }} />
        </div>
        {filtered.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>الموظف</th><th>النوع</th><th>التاريخ</th><th>الوقت</th><th>المشروع</th><th>المسافة</th><th>التأخير</th><th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(rec => (
                <tr key={rec.id}>
                  <td><strong>{rec.employeeName}</strong></td>
                  <td><span className={`badge ${rec.type === 'in' ? 'green' : 'blue'}`}>{rec.type === 'in' ? 'حضور' : 'انصراف'}</span></td>
                  <td>{rec.date}</td>
                  <td>{rec.time}</td>
                  <td>{rec.projectName}</td>
                  <td>{rec.distance}م</td>
                  <td>{rec.delayMinutes > 0 ? <span className="badge yellow">{rec.delayMinutes}د</span> : <span className="badge green">في الوقت</span>}</td>
                  <td><span className={`badge ${rec.status === 'manual' ? 'orange' : 'green'}`}>{rec.status === 'manual' ? 'يدوي' : 'GPS'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">لا توجد بصمات في هذا التاريخ</div>
        )}
      </div>
    </div>
  );
}
