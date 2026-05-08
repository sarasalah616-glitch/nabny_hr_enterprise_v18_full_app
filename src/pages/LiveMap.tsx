import { MapPin, Clock, Workflow, Users } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function LiveMap() {
  const d = useAppStore(s => s.getTenantData());
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="page-fade">
      <div className="card">
        <h2><MapPin size={22} /> الخريطة الحية للتشغيل</h2>
        <div className="grid" style={{ marginBottom: 20 }}>
          <div className="card stat"><Clock size={22} /><h3>بصمات اليوم</h3><h1>{d.attendance.filter(a => a.date === today).length}</h1></div>
          <div className="card stat"><Workflow size={22} /><h3>الطلبات المفتوحة</h3><h1>{d.requests.filter(r => !['approved', 'rejected', 'closed'].includes(r.status)).length}</h1></div>
          <div className="card stat"><MapPin size={22} /><h3>المواقع النشطة</h3><h1>{d.projects.filter(p => p.status === 'active').length}</h1></div>
          <div className="card stat"><Users size={22} /><h3>الموظفون</h3><h1>{d.employees.filter(e => e.status === 'active').length}</h1></div>
        </div>
      </div>

      {d.projects.map(p => (
        <div key={p.id} className="card">
          <h3><MapPin size={16} /> {p.name}</h3>
          <div className="mapBox">
            <iframe
              title={`map-${p.id}`}
              src={`https://maps.google.com/maps?q=${p.lat},${p.lng}&z=15&output=embed`}
              loading="lazy"
            />
            <div className="radiusCard">
              <strong>{p.name}</strong>
              <span className="muted">Radius: {p.radius} متر</span>
              <span className="muted">
                حضور اليوم: {d.attendance.filter(a => a.date === today && a.type === 'in' && a.projectId === p.id).length} موظف
              </span>
              <span className="muted">الميزانية: {Number(p.budget).toLocaleString()} ﷼</span>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge blue">Lat: {p.lat}</span>
              <span className="badge blue">Lng: {p.lng}</span>
              <span className="badge">نطاق {p.radius}م</span>
              <span className={`badge ${p.status === 'active' ? 'green' : 'orange'}`}>{p.status === 'active' ? 'نشط' : 'متوقف'}</span>
            </div>
          </div>
        </div>
      ))}

      {d.projects.length === 0 && (
        <div className="card">
          <div className="empty">لا توجد مشاريع مسجلة. أضف مشاريع من الإعدادات.</div>
        </div>
      )}
    </div>
  );
}
