import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const pad = n => String(n).padStart(2, '0');
const today = () => new Date().toISOString().slice(0, 10);
const month = () => new Date().toISOString().slice(0, 7);
const uid = (p = 'ID') => `${p}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
const toNum = v => Number.isFinite(Number(v)) ? Number(v) : 0;
const minutesFrom = t => { const [h = 0, m = 0] = String(t || '00:00').split(':').map(Number); return h * 60 + m; };
const dateKey = d => new Date(d).toISOString().slice(0, 10);
const daysInMonth = ym => new Date(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)), 0).getDate();
const monthStart = ym => `${ym}-01`;
const monthEnd = ym => `${ym}-${pad(daysInMonth(ym))}`;

function getWorkDates(ym, settings, emp) {
  const start = emp.startDate && emp.startDate > monthStart(ym) ? emp.startDate : monthStart(ym);
  const end = monthEnd(ym);
  const dates = [];
  for (let d = new Date(start); dateKey(d) <= end; d.setDate(d.getDate() + 1)) {
    if ((settings.workDays || [0,1,2,3,4]).includes(d.getDay())) dates.push(dateKey(d));
  }
  return dates;
}
function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000, rad = x => x * Math.PI / 180;
  const dLat = rad(lat2 - lat1), dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const baseTheme = {
  brandSlogan: 'Operations Intelligence Platform',
  primaryColor: '#0f172a', secondaryColor: '#991b1b', accentColor: '#d97706',
  watermark: 'NABNY', logo: '', backgroundImage: '',
  workStart: '08:00', workEnd: '17:00', graceMinutes: 15,
  workDays: [0,1,2,3,4], payrollBasis: 'workDays', overtimeRate: 1.5, language: 'ar', supportedLanguages: ['ar','en','ur','bn'],
  defaultProjectRadius: 120, requireGps: false,
  whatsappApiUrl: '', whatsappToken: '',
};
const defaultSettings = { systemName: 'NABNY OS v24 Operations Intelligence', company: 'شركة نبني للمقاولات', ...baseTheme };

const roles = {
  owner: ['*'],
  admin: ['*'],
  hr: ['employees:*','attendance:*','payroll:*','requests:*','reports:view','ai:view','settings:view','tenant:view'],
  manager: ['attendance:*','requests:*','reports:view','ai:view','projects:view','tenant:view'],
  employee: ['attendance:self','requests:self','payroll:self','tenant:view']
};
const seedTenants = [
  { id:'TEN-NABNY', name:'شركة نبني للمقاولات', domain:'nabny.local', status:'active', plan:'Enterprise AI', seats:50, subscriptionStatus:'active', renewalDate:'2026-12-31', settings:defaultSettings },
  { id:'TEN-DEMO', name:'شركة تجريبية', domain:'demo.local', status:'trial', plan:'Trial', seats:10, subscriptionStatus:'trial', renewalDate:'2026-06-30', settings:{...defaultSettings, systemName:'Demo Construction OS', company:'شركة تجريبية', primaryColor:'#164e63', secondaryColor:'#0f766e', watermark:'DEMO'} }
];
const seedUsers = [
  { id:'USR-OWNER', tenantId:'PLATFORM', username:'owner', password:'123456', role:'owner', name:'مالك منصة SaaS' },
  { id:'USR-ADMIN', tenantId:'TEN-NABNY', username:'admin', password:'123456', role:'admin', name:'المدير التنفيذي' },
  { id:'USR-HR', tenantId:'TEN-NABNY', username:'hr', password:'123456', role:'hr', name:'مدير الموارد البشرية' },
  { id:'USR-MAN', tenantId:'TEN-NABNY', username:'manager', password:'123456', role:'manager', name:'مدير موقع' },
  { id:'USR-EMP', tenantId:'TEN-NABNY', username:'employee', password:'123456', role:'employee', name:'موظف' },
  { id:'USR-DEMO', tenantId:'TEN-DEMO', username:'demo', password:'123456', role:'admin', name:'مدير الشركة التجريبية' },
];
const seedEmployees = [
  { id:'EMP-1001', tenantId:'TEN-NABNY', name:'أحمد محمد', role:'مشرف موقع', department:'التشغيل', projectId:'PRJ-JED', basicSalary:5000, startDate:today(), status:'active', phone:'0550000001' },
  { id:'EMP-1002', tenantId:'TEN-NABNY', name:'خالد علي', role:'مندوب مشتريات', department:'المشتريات', projectId:'PRJ-JED', basicSalary:4500, startDate:today(), status:'active', phone:'0550000002' },
  { id:'EMP-2001', tenantId:'TEN-DEMO', name:'موظف تجريبي', role:'فني', department:'التشغيل', projectId:'PRJ-DEMO', basicSalary:3500, startDate:today(), status:'active', phone:'0550000099' },
];
const seedProjects = [
  { id:'PRJ-JED', tenantId:'TEN-NABNY', name:'مشروع جدة', lat:21.5433, lng:39.1728, radius:120, budget:250000, spent:0, status:'active' },
  { id:'PRJ-DEMO', tenantId:'TEN-DEMO', name:'مشروع تجريبي', lat:24.7136, lng:46.6753, radius:150, budget:100000, spent:0, status:'active' },
];
const seedSuppliers = [
  { id:'SUP-1001', tenantId:'TEN-NABNY', name:'مورد مواد كهربائية - جدة', category:'كهرباء', phone:'0551111111', rating:4.6, status:'active' },
  { id:'SUP-1002', tenantId:'TEN-NABNY', name:'مورد مواد صحية - جدة', category:'سباكة', phone:'0552222222', rating:4.2, status:'active' },
];
const seedAssets = [
  { id:'AST-1001', tenantId:'TEN-NABNY', name:'عدة موقع جدة', code:'AST-JED-001', projectId:'PRJ-JED', custodian:'أحمد محمد', status:'active', value:8500, lastCheck:today() },
];
const seedContracts = [
  { id:'CON-1001', tenantId:'TEN-NABNY', title:'عقد توريد مواد مشروع جدة', party:'مورد مواد كهربائية - جدة', type:'توريد', startDate:today(), endDate:'2026-12-31', value:75000, status:'active' },
];

const seedDocuments = [
  { id:'DOC-CR-001', tenantId:'TEN-NABNY', ownerType:'company', ownerName:'شركة نبني للمقاولات', documentType:'سجل تجاري', title:'السجل التجاري', issueDate:'2026-01-01', expiryDate:'2026-06-30', status:'active', fileName:'commercial-registration.pdf', fileType:'application/pdf', fileSize:0, fileData:'', notes:'تنبيه قبل التجديد' },
  { id:'DOC-IQ-1001', tenantId:'TEN-NABNY', ownerType:'employee', ownerId:'EMP-1001', ownerName:'أحمد محمد', documentType:'إقامة', title:'إقامة أحمد محمد', issueDate:'2026-01-15', expiryDate:'2026-06-15', status:'active', fileName:'iqama-ahmed.pdf', fileType:'application/pdf', fileSize:0, fileData:'', notes:'' },
  { id:'DOC-VH-001', tenantId:'TEN-NABNY', ownerType:'vehicle', ownerName:'سيارة مشروع جدة', documentType:'استمارة مركبة', title:'استمارة سيارة مشروع جدة', issueDate:'2026-02-01', expiryDate:'2026-05-30', status:'active', fileName:'vehicle-registration.pdf', fileType:'application/pdf', fileSize:0, fileData:'', notes:'' }
];


function healthScore(s) {
  const m = month(), t = today(), tid = s.currentTenantId;
  const active = s.employees.filter(e => e.tenantId === tid && e.status === 'active');
  const present = new Set(s.attendance.filter(a => a.tenantId === tid && a.date === t && a.type === 'in').map(a => a.employeeId)).size;
  const attendanceScore = active.length ? Math.round((present / active.length) * 35) : 35;
  const pending = s.requests.filter(r => r.tenantId === tid && ['draft','sent','pending'].includes(r.status)).length;
  const overdue = s.requests.filter(r => r.tenantId === tid && r.dueDate && r.dueDate < t && !['approved','rejected','closed'].includes(r.status)).length;
  const requestScore = Math.max(0, 25 - pending * 3 - overdue * 6);
  const payrollScore = s.payroll.some(p => p.tenantId === tid && p.month === m) ? 20 : 8;
  const auditScore = s.audit.some(a => a.tenantId === tid) ? 20 : 12;
  return Math.max(0, Math.min(100, attendanceScore + requestScore + payrollScore + auditScore));
}

export const useAppStore = create(persist((set, get) => ({
  platformName:'NABNY OS Operations SaaS Platform',
  roles,
  tenants: seedTenants,
  users: seedUsers,
  currentUser: null,
  currentTenantId: 'TEN-NABNY',
  employees: seedEmployees,
  projects: seedProjects,
  attendance: [], requests: [], payroll: [], payrollMovements: [], suppliers: seedSuppliers, purchaseOrders: [], assets: seedAssets, contracts: seedContracts, documents: seedDocuments, executiveBriefs: [], notifications: [], audit: [], whatsappQueue: [], errors: [],

  getTenant: () => get().tenants.find(t => t.id === get().currentTenantId) || get().tenants[0],
  getSettings: () => get().getTenant()?.settings || defaultSettings,
  getTenantData: () => { const s=get(), tid=s.currentTenantId; return { employees:(s.employees||[]).filter(x=>x.tenantId===tid), projects:(s.projects||[]).filter(x=>x.tenantId===tid), attendance:(s.attendance||[]).filter(x=>x.tenantId===tid), requests:(s.requests||[]).filter(x=>x.tenantId===tid), payroll:(s.payroll||[]).filter(x=>x.tenantId===tid), payrollMovements:(s.payrollMovements||[]).filter(x=>x.tenantId===tid), suppliers:(s.suppliers||[]).filter(x=>x.tenantId===tid), purchaseOrders:(s.purchaseOrders||[]).filter(x=>x.tenantId===tid), assets:(s.assets||[]).filter(x=>x.tenantId===tid), contracts:(s.contracts||[]).filter(x=>x.tenantId===tid), documents:(s.documents||[]).filter(x=>x.tenantId===tid), executiveBriefs:(s.executiveBriefs||[]).filter(x=>x.tenantId===tid), notifications:(s.notifications||[]).filter(x=>x.tenantId===tid), audit:(s.audit||[]).filter(x=>x.tenantId===tid) }; },
  can: (perm) => { const u = get().currentUser; if (!u) return false; const p = roles[u.role] || []; return p.includes('*') || p.includes(perm) || p.some(x => x.endsWith(':*') && perm.startsWith(x.split(':')[0] + ':')); },
  switchTenant: (tenantId) => { const u=get().currentUser; if (u?.role !== 'owner' && u?.tenantId !== tenantId) throw new Error('غير مصرح بالتبديل لهذه الشركة'); set({ currentTenantId:tenantId }); get().addAudit('تبديل الشركة النشطة', { tenantId }); },
  login: ({ username, password, tenantId }) => {
    const user = get().users.find(u => u.username === username && u.password === password && (u.role === 'owner' || !tenantId || u.tenantId === tenantId));
    if (!user) throw new Error('بيانات الدخول غير صحيحة');
    const activeTenant = user.role === 'owner' ? (tenantId || 'TEN-NABNY') : user.tenantId;
    const tenant = get().tenants.find(t => t.id === activeTenant);
    if (user.role !== 'owner' && (!tenant || tenant.status === 'suspended' || tenant.subscriptionStatus === 'suspended')) throw new Error('اشتراك الشركة موقوف');
    set({ currentUser:user, currentTenantId:activeTenant }); get().addAudit('تسجيل دخول', { user:user.name, role:user.role });
  },
  logout: () => { get().addAudit('تسجيل خروج'); set({ currentUser:null }); },
  setSettings: (newSettings) => { const tid=get().currentTenantId; set(s => ({ tenants:s.tenants.map(t => t.id===tid ? {...t, settings:{...t.settings, ...newSettings}} : t) })); get().addAudit('تعديل إعدادات الشركة', newSettings); },
  addTenant: (data) => { if(!data.name?.trim()) throw new Error('اسم الشركة مطلوب'); const rec={ id:uid('TEN'), name:data.name, domain:data.domain||'', status:data.status||'trial', plan:data.plan||'Trial', seats:toNum(data.seats||10), subscriptionStatus:data.subscriptionStatus||'trial', renewalDate:data.renewalDate||monthEnd(month()), settings:{...defaultSettings, company:data.name, systemName:data.systemName||`${data.name} OS`} }; set(s=>({tenants:[rec,...s.tenants]})); get().addAudit('إضافة شركة SaaS', {tenant:rec.name}); return rec; },
  updateTenant: (id, patch) => { set(s=>({tenants:s.tenants.map(t=>t.id===id?{...t,...patch}:t)})); get().addAudit('تعديل شركة SaaS', {id, patch}); },
  createTenantUser: (data) => { if(!data.tenantId||!data.username||!data.password) throw new Error('بيانات المستخدم مطلوبة'); const rec={id:uid('USR'), role:'admin', name:data.name||data.username, ...data}; set(s=>({users:[rec,...s.users]})); get().addAudit('إضافة مستخدم شركة', {user:rec.username, tenantId:rec.tenantId}); },
  addError: (message, meta={}) => set(s => ({ errors: [{ id:uid('ERR'), tenantId:get().currentTenantId, date:today(), time:new Date().toLocaleTimeString('ar-SA'), message, meta }, ...s.errors].slice(0,100) })),
  addAudit: (action, meta={}) => set(s => ({ audit: [{ id:uid('AUD'), tenantId:s.currentTenantId, date:today(), time:new Date().toLocaleTimeString('ar-SA'), user:s.currentUser?.name || meta.user || 'النظام', action, meta }, ...s.audit].slice(0,1000) })),
  addNotification: (n) => set(s => ({ notifications: [{ id:uid('NOT'), tenantId:get().currentTenantId, date:today(), time:new Date().toLocaleTimeString('ar-SA'), read:false, level:'info', ...n }, ...s.notifications] })),
  markNotificationRead: id => set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read:true } : n) })),
  setLanguage: (language) => { get().setSettings({ language }); get().addAudit('تغيير لغة النظام', { language }); },
  upsertDocument: (data) => { const tid=get().currentTenantId; if(!data.title?.trim()) throw new Error('اسم المستند مطلوب'); const rec={ id:data.id||uid('DOC'), tenantId:tid, date:today(), status:'active', ownerType:'company', ownerName:'', documentType:'عام', issueDate:'', expiryDate:'', fileName:'', fileType:'', fileSize:0, fileData:'', notes:'', ...data, tenantId:tid }; set(s=>({ documents:(s.documents||[]).some(x=>x.id===rec.id&&x.tenantId===tid)?(s.documents||[]).map(x=>x.id===rec.id&&x.tenantId===tid?rec:x):[rec,...(s.documents||[])] })); get().addAudit(data.id?'تعديل مستند':'إضافة مستند',{document:rec.title, expiryDate:rec.expiryDate}); return rec; },
  deleteDocument: (id) => { const tid=get().currentTenantId; set(s=>({ documents:(s.documents||[]).filter(d=>!(d.id===id&&d.tenantId===tid)) })); get().addAudit('حذف مستند',{id}); },
  renewDocument: (id, expiryDate) => { const tid=get().currentTenantId; set(s=>({ documents:(s.documents||[]).map(d=>d.id===id&&d.tenantId===tid?{...d, expiryDate, renewedAt:today(), status:'renewed'}:d) })); get().addNotification({title:'تم تجديد مستند', message:`تم تحديث تاريخ انتهاء المستند ${id}`, level:'success'}); get().addAudit('تجديد مستند',{id, expiryDate}); },
  getDocumentAlerts: () => { const s=get(), tid=s.currentTenantId, now=new Date(today()); return (s.documents||[]).filter(d=>d.tenantId===tid&&d.expiryDate).map(d=>{ const days=Math.ceil((new Date(d.expiryDate)-now)/(1000*60*60*24)); const level=days<0?'danger':days<=7?'danger':days<=30?'warning':days<=90?'info':'ok'; return {...d, daysToExpire:days, alertLevel:level}; }).filter(d=>d.daysToExpire<=90).sort((a,b)=>a.daysToExpire-b.daysToExpire); },
  generateDocumentNotifications: () => { const alerts=get().getDocumentAlerts().filter(d=>d.daysToExpire<=30); alerts.forEach(d=>get().addNotification({ title:d.daysToExpire<0?'مستند منتهي':'مستند قريب الانتهاء', message:`${d.title} - ${d.ownerName||d.ownerType} - ${d.daysToExpire} يوم`, level:d.daysToExpire<=7?'danger':'warning'})); get().addAudit('توليد تنبيهات المستندات',{count:alerts.length}); return alerts.length; },

  upsertEmployee: (data) => { const tid=get().currentTenantId; if (!data.name?.trim()) throw new Error('اسم الموظف مطلوب'); if (!data.projectId) throw new Error('ربط الموظف بمشروع مطلوب'); if (toNum(data.basicSalary) <= 0) throw new Error('الراتب الأساسي غير صحيح'); const rec = { tenantId:tid, status:'active', department:'عام', startDate:today(), ...data, tenantId:tid, basicSalary:toNum(data.basicSalary), id: data.id || uid('EMP') }; set(s => ({ employees: s.employees.some(e => e.id === rec.id && e.tenantId===tid) ? s.employees.map(e => e.id === rec.id && e.tenantId===tid ? rec : e) : [rec, ...s.employees] })); get().addAudit(data.id ? 'تعديل موظف' : 'إضافة موظف', { employee:rec.name }); },
  deleteEmployee: (id) => { const tid=get().currentTenantId; set(s => ({ employees: s.employees.map(e => e.id === id && e.tenantId===tid ? { ...e, status:'inactive' } : e) })); get().addAudit('تعطيل موظف', { id }); },
  upsertProject: (data) => { const tid=get().currentTenantId; if (!data.name?.trim()) throw new Error('اسم المشروع مطلوب'); const rec = { tenantId:tid, status:'active', radius:get().getSettings().defaultProjectRadius, budget:0, spent:0, ...data, tenantId:tid, id:data.id || uid('PRJ'), lat:toNum(data.lat), lng:toNum(data.lng), radius:toNum(data.radius || get().getSettings().defaultProjectRadius) }; set(s => ({ projects: s.projects.some(p => p.id === rec.id && p.tenantId===tid) ? s.projects.map(p => p.id === rec.id && p.tenantId===tid ? rec : p) : [rec, ...s.projects] })); get().addAudit(data.id ? 'تعديل مشروع' : 'إضافة مشروع', { project:rec.name }); },
  punchAttendance: async ({ employeeId, type }) => { const s=get(), tid=s.currentTenantId, settings=s.getSettings(); const emp=s.employees.find(e=>e.tenantId===tid&&e.id===employeeId&&e.status==='active'); if(!emp) throw new Error('اختر موظف فعال'); if(emp.startDate && today()<emp.startDate) throw new Error('لا يمكن تسجيل حضور قبل تاريخ المباشرة'); const project=s.projects.find(p=>p.tenantId===tid&&p.id===emp.projectId); if(!project) throw new Error('الموظف غير مربوط بمشروع صحيح'); const existing=s.attendance.find(a=>a.tenantId===tid&&a.employeeId===employeeId&&a.date===today()&&a.type===type); if(existing) throw new Error(`تم تسجيل ${type==='in'?'الحضور':'الانصراف'} مسبقًا`); let pos=null; try{ pos=await new Promise((resolve,reject)=>{ if(!navigator.geolocation) return reject(new Error('GPS غير متاح')); navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:8000,maximumAge:0}); }); }catch(e){ if(settings.requireGps) throw new Error('GPS مطلوب ولا يمكن التسجيل بدونه'); } const lat=pos?.coords?.latitude??project.lat, lng=pos?.coords?.longitude??project.lng, accuracy=pos?.coords?.accuracy??null; const distance=distanceMeters(Number(lat),Number(lng),Number(project.lat),Number(project.lng)); if(distance>Number(project.radius||settings.defaultProjectRadius)) throw new Error(`خارج نطاق المشروع: ${distance} متر`); const now=new Date(), currentMinutes=now.getHours()*60+now.getMinutes(); const delayMinutes=type==='in'?Math.max(0,currentMinutes-minutesFrom(settings.workStart)-toNum(settings.graceMinutes)):0; const earlyLeaveMinutes=type==='out'?Math.max(0,minutesFrom(settings.workEnd)-currentMinutes):0; const rec={id:uid('ATT'),tenantId:tid,employeeId,employeeName:emp.name,projectId:project.id,projectName:project.name,date:today(),month:month(),time:now.toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit'}),type,status:'accepted',lat,lng,accuracy,distance,delayMinutes,earlyLeaveMinutes}; set({attendance:[rec,...s.attendance]}); get().addAudit(`تسجيل ${type==='in'?'حضور':'انصراف'}`,{employee:emp.name,distance}); if(delayMinutes>0)get().addNotification({title:'تأخير موظف',message:`${emp.name} تأخر ${delayMinutes} دقيقة`,level:'warning'}); return rec; },

  createRequest: (data) => { const tid=get().currentTenantId; if(!data.type) throw new Error('نوع الطلب مطلوب'); const rec={id:uid('REQ'),tenantId:tid,type:data.type,employeeId:data.employeeId||'',employeeName:data.employeeName||'',projectId:data.projectId||'',status:'draft',date:today(),dueDate:data.dueDate||'',notes:data.notes||'',amount:toNum(data.amount),history:[{date:today(),action:'إنشاء'}]}; set(s=>({requests:[rec,...s.requests]})); get().addAudit('إنشاء طلب',{type:rec.type}); return rec; },
  updateRequest: (id, patch) => { const tid=get().currentTenantId; set(s=>({requests:s.requests.map(r=>r.id===id&&r.tenantId===tid?{...r,...patch,history:[...(r.history||[]),{date:today(),action:'تعديل'}]}:r)})); get().addAudit('تعديل طلب',{id}); },
  sendRequest: id => { get().updateRequest(id,{status:'sent'}); get().addNotification({title:'طلب جديد بانتظار الاعتماد',message:`الطلب ${id} تم إرساله`,level:'info'}); },
  approveRequest: id => { get().updateRequest(id,{status:'approved',approvedAt:today()}); get().addNotification({title:'تم اعتماد الطلب',message:`تم اعتماد الطلب ${id}`,level:'success'}); },
  rejectRequest: id => { get().updateRequest(id,{status:'rejected',rejectedAt:today()}); get().addNotification({title:'تم رفض الطلب',message:`تم رفض الطلب ${id}`,level:'warning'}); },
  deleteRequest: id => { const tid=get().currentTenantId; set(s=>({requests:s.requests.filter(r=>!(r.id===id&&r.tenantId===tid))})); get().addAudit('حذف طلب',{id}); },
  addPayrollMovement: (data) => { const tid=get().currentTenantId; if(!data.employeeId) throw new Error('اختر الموظف'); if(!data.type) throw new Error('نوع الحركة مطلوب'); if(toNum(data.amount)<=0) throw new Error('المبلغ غير صحيح'); const emp=get().employees.find(e=>e.tenantId===tid&&e.id===data.employeeId); const rec={id:uid('MOV'),tenantId:tid,month:month(),date:today(),...data,employeeName:emp?.name||'',amount:toNum(data.amount)}; set(s=>({payrollMovements:[rec,...s.payrollMovements]})); get().addAudit('إضافة حركة بيرول',rec); },
  calculatePayroll: (ym=month()) => { const s=get(), tid=s.currentTenantId, settings=s.getSettings(); const active=s.employees.filter(e=>e.tenantId===tid&&e.status==='active'&&(!e.startDate||e.startDate<=monthEnd(ym))); const rows=active.map(emp=>{ const workDates=getWorkDates(ym,settings,emp); const empAtt=s.attendance.filter(a=>a.tenantId===tid&&a.employeeId===emp.id&&a.month===ym&&a.type==='in'); const presentSet=new Set(empAtt.map(a=>a.date)); const presentDays=workDates.filter(d=>presentSet.has(d)).length; const absentDays=Math.max(0,workDates.length-presentDays); const basisDays=settings.payrollBasis==='calendar30'?30:Math.max(1,workDates.length); const dayRate=toNum(emp.basicSalary)/basisDays; const absenceDeduction=absentDays*dayRate; const delayDeduction=empAtt.reduce((sum,a)=>sum+(toNum(a.delayMinutes)/60)*(dayRate/8),0); const moves=s.payrollMovements.filter(x=>x.tenantId===tid&&x.employeeId===emp.id&&x.month===ym); const additions=moves.filter(x=>['bonus','allowance','overtime'].includes(x.type)).reduce((sum,x)=>sum+toNum(x.amount),0); const deductions=moves.filter(x=>['deduction','loan','penalty'].includes(x.type)).reduce((sum,x)=>sum+toNum(x.amount),0); const net=Math.max(0,Math.round((toNum(emp.basicSalary)+additions-deductions-absenceDeduction-delayDeduction)*100)/100); return {id:uid('PAY'),tenantId:tid,employeeId:emp.id,employeeName:emp.name,basicSalary:toNum(emp.basicSalary),workDays:workDates.length,presentDays,absentDays,additions,deductions,absenceDeduction:Math.round(absenceDeduction*100)/100,delayDeduction:Math.round(delayDeduction*100)/100,net,month:ym}; }); set({payroll:[...rows,...s.payroll.filter(p=>!(p.tenantId===tid&&p.month===ym))]}); get().addAudit('احتساب البيرول',{month:ym,rows:rows.length}); return rows; },

  upsertSupplier: (data) => { const tid=get().currentTenantId; if(!data.name?.trim()) throw new Error('اسم المورد مطلوب'); const rec={id:data.id||uid('SUP'),tenantId:tid,status:'active',category:'عام',rating:0,...data,tenantId:tid,rating:toNum(data.rating||0)}; set(s=>({suppliers:(s.suppliers||[]).some(x=>x.id===rec.id&&x.tenantId===tid)?(s.suppliers||[]).map(x=>x.id===rec.id&&x.tenantId===tid?rec:x):[rec,...(s.suppliers||[])]})); get().addAudit(data.id?'تعديل مورد':'إضافة مورد',{supplier:rec.name}); return rec; },
  createPurchaseOrder: (data) => { const tid=get().currentTenantId; if(!data.projectId) throw new Error('اختر المشروع'); if(!data.supplierId) throw new Error('اختر المورد'); if(!data.description?.trim()) throw new Error('وصف الطلب مطلوب'); const supplier=(get().suppliers||[]).find(x=>x.id===data.supplierId&&x.tenantId===tid); const project=(get().projects||[]).find(x=>x.id===data.projectId&&x.tenantId===tid); const rec={id:uid('PO'),tenantId:tid,date:today(),status:'draft',supplierName:supplier?.name||'',projectName:project?.name||'',amount:toNum(data.amount),priority:data.priority||'normal',items:[],history:[{date:today(),action:'إنشاء'}],...data}; set(s=>({purchaseOrders:[rec,...(s.purchaseOrders||[])]})); get().addAudit('إنشاء أمر شراء',{po:rec.id,amount:rec.amount}); return rec; },
  updatePurchaseOrder: (id, patch) => { const tid=get().currentTenantId; set(s=>({purchaseOrders:(s.purchaseOrders||[]).map(po=>po.id===id&&po.tenantId===tid?{...po,...patch,history:[...(po.history||[]),{date:today(),action:patch.status||'تعديل'}]}:po)})); get().addAudit('تعديل أمر شراء',{id,patch}); },
  approvePurchaseOrder: (id) => { get().updatePurchaseOrder(id,{status:'approved',approvedAt:today()}); get().addNotification({title:'تم اعتماد أمر شراء',message:`أمر الشراء ${id} تم اعتماده`,level:'success'}); },
  closePurchaseOrder: (id) => { get().updatePurchaseOrder(id,{status:'closed',closedAt:today()}); },
  upsertAsset: (data) => { const tid=get().currentTenantId; if(!data.name?.trim()) throw new Error('اسم العهدة/المعدة مطلوب'); const project=(get().projects||[]).find(x=>x.id===data.projectId&&x.tenantId===tid); const rec={id:data.id||uid('AST'),tenantId:tid,status:'active',lastCheck:today(),...data,tenantId:tid,projectName:project?.name||'',value:toNum(data.value)}; set(s=>({assets:(s.assets||[]).some(x=>x.id===rec.id&&x.tenantId===tid)?(s.assets||[]).map(x=>x.id===rec.id&&x.tenantId===tid?rec:x):[rec,...(s.assets||[])]})); get().addAudit(data.id?'تعديل عهدة':'إضافة عهدة',{asset:rec.name}); return rec; },
  upsertContract: (data) => { const tid=get().currentTenantId; if(!data.title?.trim()) throw new Error('عنوان العقد مطلوب'); const rec={id:data.id||uid('CON'),tenantId:tid,status:'active',type:'عام',startDate:today(),...data,tenantId:tid,value:toNum(data.value)}; set(s=>({contracts:(s.contracts||[]).some(x=>x.id===rec.id&&x.tenantId===tid)?(s.contracts||[]).map(x=>x.id===rec.id&&x.tenantId===tid?rec:x):[rec,...(s.contracts||[])]})); get().addAudit(data.id?'تعديل عقد':'إضافة عقد',{contract:rec.title}); return rec; },
  generateExecutiveBrief: () => { const s=get(), d=s.getTenantData(), risks=s.getRisks(), health=s.getCompanyHealth(); const openPO=(d.purchaseOrders||[]).filter(x=>!['closed','rejected'].includes(x.status)); const expiring=(d.contracts||[]).filter(c=>c.endDate && c.endDate <= monthEnd(month())); const brief={id:uid('BRF'),tenantId:s.currentTenantId,date:today(),health,risks:risks.length,summary:`صحة الشركة ${health}%. الطلبات المفتوحة ${(d.requests||[]).filter(r=>!['approved','rejected','closed'].includes(r.status)).length}. أوامر الشراء المفتوحة ${openPO.length}. العقود القريبة من الانتهاء ${expiring.length}.`,actions:[risks[0]?.title||'لا توجد مخاطر عالية', openPO.length?'مراجعة أوامر الشراء المفتوحة':'المشتريات مستقرة', expiring.length?'تجديد أو إغلاق العقود القريبة':'العقود مستقرة']}; set(st=>({executiveBriefs:[brief,...(st.executiveBriefs||[])]})); get().addAudit('توليد موجز تنفيذي AI',{health}); return brief; },
  getCompanyHealth: () => healthScore(get()),
  getRisks: () => { const s=get(), tid=s.currentTenantId, t=today(), risks=[]; const active=s.employees.filter(e=>e.tenantId===tid&&e.status==='active'); const present=new Set(s.attendance.filter(a=>a.tenantId===tid&&a.date===t&&a.type==='in').map(a=>a.employeeId)).size; if(active.length&&present/active.length<0.7)risks.push({level:'high',title:'انخفاض حضور اليوم',detail:`الحضور ${present}/${active.length}`}); const pending=s.requests.filter(r=>r.tenantId===tid&&['draft','sent','pending'].includes(r.status)).length; if(pending>3)risks.push({level:'medium',title:'طلبات معلقة كثيرة',detail:`عدد الطلبات ${pending}`}); if(!s.payroll.some(p=>p.tenantId===tid&&p.month===month()))risks.push({level:'medium',title:'البيرول غير محسوب للشهر الحالي',detail:'يفضل احتسابه ومراجعته'}); const openPO=(s.purchaseOrders||[]).filter(po=>po.tenantId===tid&&!['closed','rejected'].includes(po.status)); if(openPO.length>5)risks.push({level:'medium',title:'أوامر شراء مفتوحة كثيرة',detail:`عدد أوامر الشراء المفتوحة ${openPO.length}`}); const expiring=(s.contracts||[]).filter(c=>c.tenantId===tid&&c.endDate&&c.endDate<=monthEnd(month())); if(expiring.length)risks.push({level:'high',title:'عقود قريبة من الانتهاء',detail:`عدد العقود ${expiring.length}`}); const docAlerts=(s.documents||[]).filter(d=>d.tenantId===tid&&d.expiryDate&&Math.ceil((new Date(d.expiryDate)-new Date(t))/(1000*60*60*24))<=30); if(docAlerts.length)risks.push({level:'high',title:'مستندات تحتاج تجديد',detail:`عدد المستندات ${docAlerts.length}`}); return risks; },
  askAI: async (question) => { const s=get(), d=s.getTenantData(), q=question.toLowerCase(), risks=s.getRisks(), health=s.getCompanyHealth(); const todayIn=d.attendance.filter(a=>a.date===today()&&a.type==='in'); const late=todayIn.filter(a=>toNum(a.delayMinutes)>0).sort((a,b)=>toNum(b.delayMinutes)-toNum(a.delayMinutes)); const totalPayroll=d.payroll.filter(p=>p.month===month()).reduce((sum,p)=>sum+toNum(p.net),0); if(q.includes('شركة')&&q.includes('عدد'))return `الشركات على المنصة: ${s.tenants.length}. النشطة: ${s.tenants.filter(t=>t.status==='active').length}.`; if(q.includes('أكثر')&&q.includes('تأخر'))return late[0]?`أكثر موظف تأخرًا اليوم: ${late[0].employeeName} (${late[0].delayMinutes} دقيقة).`:'لا يوجد تأخير مسجل اليوم.'; if(q.includes('حضور')||q.includes('غياب'))return `حضور اليوم ${todayIn.length} من ${d.employees.filter(e=>e.status==='active').length}. المتأخرون ${late.length}.`; if(q.includes('بيرول')||q.includes('راتب'))return `إجمالي بيرول ${month()} هو ${totalPayroll.toLocaleString()} ريال. المسيرات المحسوبة ${d.payroll.filter(p=>p.month===month()).length}.`; if(q.includes('خطر')||q.includes('مشكلة'))return risks.length?risks.map(r=>`• ${r.title}: ${r.detail}`).join('\n'):`لا توجد مخاطر عالية الآن. صحة الشركة ${health}%.`; if(q.includes('مشتريات')||q.includes('شراء')||q.includes('مورد'))return `الموردون ${(d.suppliers||[]).length}. أوامر الشراء المفتوحة ${(d.purchaseOrders||[]).filter(po=>!['closed','rejected'].includes(po.status)).length}. إجمالي المفتوح ${(d.purchaseOrders||[]).filter(po=>!['closed','rejected'].includes(po.status)).reduce((sum,po)=>sum+toNum(po.amount),0).toLocaleString()} ريال.`; if(q.includes('عقد')||q.includes('عقود'))return `العقود ${(d.contracts||[]).length}. القريبة من الانتهاء ${(d.contracts||[]).filter(c=>c.endDate&&c.endDate<=monthEnd(month())).length}.`; if(q.includes('عهد')||q.includes('معدات')||q.includes('أصول'))return `العهد والمعدات ${(d.assets||[]).length}. إجمالي القيمة ${(d.assets||[]).reduce((sum,a)=>sum+toNum(a.value),0).toLocaleString()} ريال.`; if(q.includes('مستند')||q.includes('وثيقة')||q.includes('انتهاء')||q.includes('اقامة')||q.includes('إقامة')){ const alerts=s.getDocumentAlerts(); return alerts.length?alerts.map(d=>`• ${d.title}: ${d.daysToExpire<0?'منتهي منذ '+Math.abs(d.daysToExpire):'متبقي '+d.daysToExpire} يوم`).join('\n'):'لا توجد مستندات قريبة الانتهاء خلال 90 يوم.'; }; if(q.includes('موجز')||q.includes('ملخص'))return s.generateExecutiveBrief().summary; if(q.includes('مشروع'))return d.projects.map(p=>`${p.name}: ميزانية ${toNum(p.budget).toLocaleString()}، نطاق GPS ${p.radius}م`).join('\n'); return `قراءة تنفيذية لشركة ${s.getTenant()?.name}: صحة الشركة ${health}%. الموظفون ${d.employees.length}، بصمات اليوم ${todayIn.length}، الطلبات المفتوحة ${d.requests.filter(r=>!['approved','rejected','closed'].includes(r.status)).length}، أوامر الشراء المفتوحة ${((d.purchaseOrders||[]).filter(po=>!['closed','rejected'].includes(po.status))).length}.`; },
  exportBackup: () => { const s=get(); const safe={...s}; delete safe.currentUser; return JSON.stringify(safe,null,2); },
  resetDemo: () => set({ tenants:seedTenants, users:seedUsers, currentTenantId:'TEN-NABNY', employees:seedEmployees, projects:seedProjects, attendance:[], requests:[], payroll:[], payrollMovements:[], suppliers:seedSuppliers, purchaseOrders:[], assets:seedAssets, contracts:seedContracts, documents:seedDocuments, executiveBriefs:[], notifications:[], audit:[], whatsappQueue:[], errors:[] })
}), { name:'nabny-v24-operations-intelligence' }));
