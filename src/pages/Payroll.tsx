import { useState } from 'react';
import { DollarSign, Plus, Calculator, Download } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Payroll() {
  const store = useAppStore(s => s);
  const d = store.getTenantData();
  const [move, setMove] = useState({ employeeId: '', type: 'bonus', amount: '', notes: '' });
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const run = () => {
    store.calculatePayroll(selectedMonth);
    setMsg({ text: `تم احتساب البيرول للشهر ${selectedMonth}`, type: 'success' });
    setTimeout(() => setMsg(null), 3000);
  };

  const add = () => {
    try {
      store.addPayrollMovement({ ...move, amount: Number(move.amount) });
      setMove({ employeeId: '', type: 'bonus', amount: '', notes: '' });
      setMsg({ text: 'تم إضافة الحركة بنجاح', type: 'success' });
    } catch (e) {
      setMsg({ text: (e as Error).message, type: 'error' });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const monthPayroll = d.payroll.filter(p => p.month === selectedMonth);
  const totalNet = monthPayroll.reduce((s, p) => s + p.net, 0);
  const totalBase = monthPayroll.reduce((s, p) => s + p.basicSalary, 0);

  const exportCSV = () => {
    const headers = ['الموظف', 'الأساسي', 'أيام العمل', 'الحضور', 'الغياب', 'خصم غياب', 'خصم تأخير', 'إضافات', 'خصومات', 'الصافي'];
    const rows = monthPayroll.map(p => [p.employeeName, p.basicSalary, p.workDays, p.presentDays, p.absentDays, p.absenceDeduction, p.delayDeduction, p.additions, p.deductions, p.net]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `payroll-${selectedMonth}.csv`;
    a.click();
  };

  return (
    <div className="page-fade">
      <div className="card">
        <h2><DollarSign size={22} /> مسير الرواتب</h2>

        {msg && (
          <div style={{ padding: '12px 16px', borderRadius: 12, marginBottom: 16, background: msg.type === 'success' ? '#dcfce7' : '#fee2e2', color: msg.type === 'success' ? '#166534' : '#991b1b', fontWeight: 600 }}>
            {msg.text}
          </div>
        )}

        <div className="grid" style={{ marginBottom: 16 }}>
          <div className="card stat"><h3>إجمالي الأساسيات</h3><h1>{totalBase.toLocaleString()}</h1><p className="muted">ريال</p></div>
          <div className="card stat"><h3>إجمالي الصافي</h3><h1 style={{ color: '#059669' }}>{totalNet.toLocaleString()}</h1><p className="muted">ريال</p></div>
          <div className="card stat"><h3>عدد الموظفين</h3><h1>{monthPayroll.length}</h1><p className="muted">في هذا الشهر</p></div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
          <input className="input" type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ width: 'auto' }} />
          <button className="btn green" onClick={run}><Calculator size={16} /> احتساب البيرول</button>
          {monthPayroll.length > 0 && <button className="btn light" onClick={exportCSV}><Download size={16} /> تصدير CSV</button>}
        </div>

        <div className="card" style={{ background: '#f8fafc' }}>
          <h3><Plus size={16} /> إضافة حركة بيرول</h3>
          <div className="settingsGrid">
            <label>الموظف
              <select value={move.employeeId} onChange={e => setMove({ ...move, employeeId: e.target.value })}>
                <option value="">اختر الموظف...</option>
                {d.employees.filter(e => e.status === 'active').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </label>
            <label>نوع الحركة
              <select value={move.type} onChange={e => setMove({ ...move, type: e.target.value })}>
                <option value="bonus">مكافأة</option>
                <option value="allowance">بدل</option>
                <option value="overtime">ساعات إضافية</option>
                <option value="deduction">خصم</option>
                <option value="loan">سلفة</option>
                <option value="penalty">جزاء</option>
              </select>
            </label>
            <label>المبلغ<input className="input" type="number" value={move.amount} onChange={e => setMove({ ...move, amount: e.target.value })} placeholder="0" /></label>
            <label>ملاحظات<input className="input" value={move.notes} onChange={e => setMove({ ...move, notes: e.target.value })} placeholder="سبب الحركة..." /></label>
          </div>
          <button className="btn green" onClick={add}><Plus size={16} /> إضافة الحركة</button>
        </div>
      </div>

      {monthPayroll.length > 0 && (
        <div className="card">
          <h2>مسير {selectedMonth}</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>الموظف</th><th>الأساسي</th><th>أيام</th><th>حضور</th><th>غياب</th><th>خصم غياب</th><th>خصم تأخير</th><th>إضافات</th><th>خصومات</th><th>الصافي</th>
                </tr>
              </thead>
              <tbody>
                {monthPayroll.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.employeeName}</strong></td>
                    <td>{p.basicSalary.toLocaleString()}</td>
                    <td>{p.workDays}</td>
                    <td><span className="badge green">{p.presentDays}</span></td>
                    <td>{p.absentDays > 0 ? <span className="badge red">{p.absentDays}</span> : <span>0</span>}</td>
                    <td style={{ color: '#dc2626' }}>{p.absenceDeduction.toFixed(0)}</td>
                    <td style={{ color: '#d97706' }}>{p.delayDeduction.toFixed(0)}</td>
                    <td style={{ color: '#059669' }}>+{p.additions}</td>
                    <td style={{ color: '#dc2626' }}>-{p.deductions}</td>
                    <td><strong style={{ fontSize: 15, color: '#059669' }}>{p.net.toLocaleString()} ﷼</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {d.payrollMovements.length > 0 && (
        <div className="card">
          <h2>آخر الحركات المالية</h2>
          <div className="timeline">
            {d.payrollMovements.slice(0, 10).map(m => (
              <div key={m.id} className="tl">
                <b>{m.employeeName} - {m.type === 'bonus' ? 'مكافأة' : m.type === 'allowance' ? 'بدل' : m.type === 'overtime' ? 'إضافي' : m.type === 'deduction' ? 'خصم' : m.type === 'loan' ? 'سلفة' : 'جزاء'}</b>
                <p>{m.amount.toLocaleString()} ريال | {m.notes} | {m.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
