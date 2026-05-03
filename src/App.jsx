import React, { useEffect, useMemo, useState } from 'react';
import {
  Users, Clock, FileText, Workflow, BarChart3, Settings, Mail, ShieldCheck, Plus, Edit,
  Trash2, Save, CheckCircle2, AlertTriangle, Printer, Building2, LogIn, LogOut, Search,
  History, Bell, MapPin, DollarSign, UserCheck, Lock, Smartphone
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const today=()=>new Date().toISOString().slice(0,10);
const month=()=>new Date().toISOString().slice(0,7);
const nowTime=()=>new Date().toTimeString().slice(0,5);
const uid=(p)=>`${p}-${Date.now()}-${Math.floor(Math.random()*9999)}`;

const defaultSettings={
  company:'شركة نبني للمقاولات',
  activity:'مقاولات',
  logo:'',
  watermark:'NABNY',
  hrEmail:'hr@nabny.sa',
  adminEmail:'admin@nabny.sa',
  checkInStart:'07:30',
  checkInEnd:'09:00',
  checkOutStart:'16:30',
  checkOutEnd:'19:00',
  overtimeRate:1.5,
  absenceDeductDays:1,
  emailAlerts:true,
  systemAlerts:true,
  requireGps:true,
  requireDevice:true,
  requireFace:false
};

const defaultUsers=[
  {id:'U-ADMIN', username:'admin', password:'123456', role:'admin', name:'مدير النظام', employeeId:''},
  {id:'U-HR', username:'hr', password:'123456', role:'hr', name:'مسؤول الموارد البشرية', employeeId:''},
  {id:'U-MANAGER', username:'manager', password:'123456', role:'manager', name:'مدير موقع', employeeId:''},
  {id:'U-EMP', username:'employee', password:'123456', role:'employee', name:'موظف تجريبي', employeeId:''}
];

const requestTypes=['طلب إجازة','طلب إذن','طلب سلفة','طلب مهمة عمل','طلب مباشرة عمل','طلب خطاب تعريف','طلب تعديل بيانات'];
const templates={
  leave:'طلب إجازة / إذن',
  advance:'طلب سلفة مالية',
  salary:'خطاب تعريف راتب',
  custody:'نموذج استلام عهدة',
  clearance:'إخلاء طرف',
  warning:'إنذار موظف',
  returnWork:'مباشرة عمل',
  travel:'طلب سفر / مهمة عمل',
  resignation:'طلب استقالة',
  experience:'شهادة خبرة',
  violation:'محضر مخالفة'
};

function load(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
function distMeters(lat1,lon1,lat2,lon2){
  const R=6371000, toRad=x=>x*Math.PI/180;
  const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));
}
function timeMins(t){const [h,m]=(t||'00:00').split(':').map(Number);return h*60+m}

export default function App(){
  const [settings,setSettings]=useState(()=>load('v184_settings',defaultSettings));
  const [employees,setEmployees]=useState(()=>load('v184_employees',[]));
  const [users,setUsers]=useState(()=>load('v184_users',defaultUsers));
  const [locations,setLocations]=useState(()=>load('v184_locations',[]));
  const [attendance,setAttendance]=useState(()=>load('v184_attendance',[]));
  const [requests,setRequests]=useState(()=>load('v184_requests',[]));
  const [notifications,setNotifications]=useState(()=>load('v184_notifications',[]));
  const [emails,setEmails]=useState(()=>load('v184_emails',[]));
  const [forms,setForms]=useState(()=>load('v184_forms',[]));
  const [audit,setAudit]=useState(()=>load('v184_audit',[]));
  const [payroll,setPayroll]=useState(()=>load('v184_payroll',[]));
  const [current,setCurrent]=useState(()=>load('v184_current',null));
  const [tab,setTab]=useState('dashboard');

  useEffect(()=>save('v184_settings',settings),[settings]);
  useEffect(()=>save('v184_employees',employees),[employees]);
  useEffect(()=>save('v184_users',users),[users]);
  useEffect(()=>save('v184_locations',locations),[locations]);
  useEffect(()=>save('v184_attendance',attendance),[attendance]);
  useEffect(()=>save('v184_requests',requests),[requests]);
  useEffect(()=>save('v184_notifications',notifications),[notifications]);
  useEffect(()=>save('v184_emails',emails),[emails]);
  useEffect(()=>save('v184_forms',forms),[forms]);
  useEffect(()=>save('v184_audit',audit),[audit]);
  useEffect(()=>save('v184_payroll',payroll),[payroll]);
  useEffect(()=>save('v184_current',current),[current]);

  function addAudit(action, actor=current?.name||'النظام', risk='low'){setAudit(p=>[{id:uid('LOG'),date:today(),time:nowTime(),actor,action,risk},...p])}
  function notify({toRole,toUserId,toEmployeeId,title,message,type='system'}){
    const n={id:uid('NOT'),date:today(),time:nowTime(),toRole,toUserId,toEmployeeId,title,message,type,read:false};
    setNotifications(p=>[n,...p]);
    if(settings.emailAlerts){
      const recipient = toUserId ? users.find(u=>u.id===toUserId) : null;
      const emp = toEmployeeId ? employees.find(e=>e.id===toEmployeeId) : null;
      const emailTo = recipient?.email || emp?.email || (toRole==='hr'?settings.hrEmail:settings.adminEmail);
      setEmails(p=>[{id:uid('MAIL'),to:emailTo,subject:title,body:message,status:'queued',date:today(),time:nowTime()},...p]);
    }
  }

  if(!current) return <Login users={users} setCurrent={setCurrent}/>;

  const isEmployee=current.role==='employee';
  const visibleTabs=isEmployee?['employeeHome','employeeAttendance','employeeRequests','employeeForms','employeeNotifications']:['dashboard','employees','users','locations','attendance','requests','forms','payroll','reports','notifications','email','security','settings'];

  return <div className="app">
    <Header settings={settings} current={current} logout={()=>setCurrent(null)}/>
    <div className="layout">
      <aside className="sidebar">
        {visibleTabs.includes('dashboard')&&<Nav id="dashboard" label="الرئيسية" icon={BarChart3} tab={tab} setTab={setTab}/>}
        {visibleTabs.includes('employeeHome')&&<Nav id="employeeHome" label="واجهة الموظف" icon={UserCheck} tab={tab} setTab={setTab}/>}
        {visibleTabs.includes('employeeAttendance')&&<Nav id="employeeAttendance" label="بصمة الموظف" icon={Clock} tab={tab} setTab={setTab}/>}
        {visibleTabs.includes('employeeRequests')&&<Nav id="employeeRequests" label="طلباتي" icon={Workflow} tab={tab} setTab={setTab}/>}
        {visibleTabs.includes('employeeForms')&&<Nav id="employeeForms" label="نماذجي" icon={FileText} tab={tab} setTab={setTab}/>}
        {visibleTabs.includes('employeeNotifications')&&<Nav id="employeeNotifications" label="إشعاراتي" icon={Bell} tab={tab} setTab={setTab}/>}
        {visibleTabs.includes('employees')&&<Nav id="employees" label="الموظفون" icon={Users} tab={tab} setTab={setTab}/>}
        {visibleTabs.includes('users')&&<Nav id="users" label="المستخدمون والصلاحيات" icon={Lock} tab={tab} setTab={setTab}/>}
        {visibleTabs.includes('locations')&&<Nav id="locations" label="مواقع العمل" icon={MapPin} tab={tab} setTab={setTab}/>}
        {visibleTabs.includes('attendance')&&<Nav id="attendance" label="الحضور GPS" icon={Clock} tab={tab} setTab={setTab}/>}
        {visibleTabs.includes('requests')&&<Nav id="requests" label="الطلبات" icon={Workflow} tab={tab} setTab={setTab}/>}
        {visibleTabs.includes('forms')&&<Nav id="forms" label="النماذج الذكية" icon={FileText} tab={tab} setTab={setTab}/>}
        {visibleTabs.includes('payroll')&&<Nav id="payroll" label="البيرول" icon={DollarSign} tab={tab} setTab={setTab}/>}
        {visibleTabs.includes('reports')&&<Nav id="reports" label="التقارير" icon={BarChart3} tab={tab} setTab={setTab}/>}
        {visibleTabs.includes('notifications')&&<Nav id="notifications" label="الإشعارات" icon={Bell} tab={tab} setTab={setTab}/>}
        {visibleTabs.includes('email')&&<Nav id="email" label="الإيميل" icon={Mail} tab={tab} setTab={setTab}/>}
        {visibleTabs.includes('security')&&<Nav id="security" label="الأمان" icon={ShieldCheck} tab={tab} setTab={setTab}/>}
        {visibleTabs.includes('settings')&&<Nav id="settings" label="الإعدادات" icon={Settings} tab={tab} setTab={setTab}/>}
      </aside>
      <main>
        {tab==='dashboard'&&<Dashboard employees={employees} attendance={attendance} requests={requests} notifications={notifications} payroll={payroll}/>}
        {tab==='employeeHome'&&<EmployeeHome current={current} employees={employees} attendance={attendance} requests={requests} notifications={notifications}/>}
        {tab==='employeeAttendance'&&<EmployeeAttendance current={current} employees={employees} locations={locations} attendance={attendance} setAttendance={setAttendance} settings={settings} addAudit={addAudit} notify={notify}/>}
        {tab==='employeeRequests'&&<Requests employeeMode current={current} employees={employees} requests={requests} setRequests={setRequests} addAudit={addAudit} notify={notify}/>}
        {tab==='employeeForms'&&<Forms employeeMode current={current} settings={settings} employees={employees} forms={forms} setForms={setForms} addAudit={addAudit}/>}
        {tab==='employeeNotifications'&&<Notifications current={current} notifications={notifications} setNotifications={setNotifications}/>}
        {tab==='employees'&&<Employees employees={employees} setEmployees={setEmployees} users={users} setUsers={setUsers} addAudit={addAudit}/>}
        {tab==='users'&&<UsersAdmin employees={employees} users={users} setUsers={setUsers} addAudit={addAudit}/>}
        {tab==='locations'&&<Locations locations={locations} setLocations={setLocations} addAudit={addAudit}/>}
        {tab==='attendance'&&<AttendanceAdmin employees={employees} locations={locations} attendance={attendance}/>}
        {tab==='requests'&&<Requests employees={employees} requests={requests} setRequests={setRequests} addAudit={addAudit} notify={notify}/>}
        {tab==='forms'&&<Forms settings={settings} employees={employees} forms={forms} setForms={setForms} addAudit={addAudit}/>}
        {tab==='payroll'&&<Payroll employees={employees} attendance={attendance} payroll={payroll} setPayroll={setPayroll} settings={settings} addAudit={addAudit}/>}
        {tab==='reports'&&<Reports employees={employees} attendance={attendance} requests={requests} payroll={payroll}/>}
        {tab==='notifications'&&<Notifications current={current} notifications={notifications} setNotifications={setNotifications} admin/>}
        {tab==='email'&&<Email emails={emails} setEmails={setEmails}/>}
        {tab==='security'&&<Security settings={settings} audit={audit}/>}
        {tab==='settings'&&<SystemSettings settings={settings} setSettings={setSettings} addAudit={addAudit}/>}
      </main>
    </div>
  </div>
}

function Login({users,setCurrent}){
  const [username,setUsername]=useState('admin'),[password,setPassword]=useState('123456');
  function submit(e){e.preventDefault(); const u=users.find(x=>x.username===username&&x.password===password); if(!u)return alert('بيانات الدخول غير صحيحة'); setCurrent(u)}
  return <div className="login"><form className="loginCard" onSubmit={submit}>
    <h1>دخول Nabny HR Enterprise</h1><p className="muted">تجربة أولية: admin / 123456 أو hr / 123456 أو employee / 123456</p>
    <label>اسم المستخدم</label><input value={username} onChange={e=>setUsername(e.target.value)}/>
    <label>كلمة المرور</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
    <br/><br/><button className="btn green" style={{width:'100%'}}>دخول</button>
  </form></div>
}

function Header({settings,current,logout}){return <header className="header"><div className="brand"><div className="logo">{settings.logo?<img src={settings.logo}/>: 'N'}</div><div><h1>Nabny HR Enterprise V18.4 Final</h1><p>{settings.company} — نشاط {settings.activity} — المستخدم: {current.name} / {current.role}</p></div></div><div className="badges"><span className="badge green">GPS Attendance</span><span className="badge blue">Employee App</span><span className="badge purple">Payroll Engine</span><button className="btn red" onClick={logout}>خروج</button></div></header>}
function Nav({id,label,icon:Icon,tab,setTab}){return <button className={`nav ${tab===id?'active':''}`} onClick={()=>setTab(id)}><Icon size={19}/>{label}</button>}
function Card({title,icon:Icon,actions,children}){return <section className="card"><div className="title"><h2>{Icon&&<Icon size={21} style={{verticalAlign:'middle',marginLeft:8}}/>}{title}</h2><div className="noPrint">{actions}</div></div>{children}</section>}
function Stat({title,value,icon:Icon,tone,note}){return <div className="card stat"><span className={`badge ${tone}`}><Icon size={22}/></span><div className="muted">{title}</div><div className="num">{value}</div><div className="muted">{note}</div></div>}
function Input({label,value,onChange,type='text'}){return <div><label>{label}</label><input type={type} value={value||''} onChange={e=>onChange(e.target.value)}/></div>}
function Table({headers,rows}){return <div className="tableWrap"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody></table></div>}
function Badge({children,tone='blue'}){return <span className={`badge ${tone}`}>{children}</span>}
function Risk({risk}){return <Badge tone={risk==='high'?'red':risk==='medium'?'yellow':'green'}>{risk==='high'?'مرتفع':risk==='medium'?'متوسط':'منخفض'}</Badge>}

function Dashboard({employees,attendance,requests,notifications,payroll}){
  const todayAtt=attendance.filter(a=>a.date===today());
  const data=[{name:'حضور',value:todayAtt.filter(a=>a.checkIn).length},{name:'تأخير',value:todayAtt.filter(a=>a.status==='late').length},{name:'طلبات',value:requests.length},{name:'إشعارات',value:notifications.length}];
  return <><div className="grid4"><Stat title="الموظفون" value={employees.length} icon={Users} tone="blue" note="فعلي"/><Stat title="حضور اليوم" value={data[0].value} icon={Clock} tone="green" note="GPS"/><Stat title="طلبات معلقة" value={requests.filter(r=>r.status==='pending').length} icon={Workflow} tone="yellow" note="Workflow"/><Stat title="مسيرات محفوظة" value={payroll.length} icon={DollarSign} tone="purple" note="Payroll"/></div>
  <Card title="مؤشرات اليوم" icon={BarChart3}><div style={{height:300}}><ResponsiveContainer><BarChart data={data}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="value"/></BarChart></ResponsiveContainer></div></Card></>
}

function Employees({employees,setEmployees,users,setUsers,addAudit}){
 const empty={employeeCode:'',name:'',iqama:'',role:'',department:'',project:'',branch:'',locationId:'',email:'',phone:'',basicSalary:'4000',housing:'0',transport:'0',status:'active'};
 const [form,setForm]=useState(empty),[editing,setEditing]=useState(null),[q,setQ]=useState('');
 function submit(e){e.preventDefault(); if(!form.employeeCode||!form.name)return alert('الكود والاسم مطلوبان'); if(editing){setEmployees(p=>p.map(x=>x.id===editing?{...x,...form}:x));addAudit('تعديل موظف',form.name)}else{const emp={id:uid('EMP'),...form,createdAt:today()};setEmployees(p=>[emp,...p]);addAudit('إضافة موظف',form.name)} setForm(empty);setEditing(null)}
 function createUser(emp){const username=emp.employeeCode; if(users.some(u=>u.username===username))return alert('يوجد مستخدم لهذا الموظف'); setUsers(p=>[...p,{id:uid('U'),username,password:'123456',role:'employee',name:emp.name,employeeId:emp.id,email:emp.email}]); alert(`تم إنشاء المستخدم: ${username} / 123456`)}
 const filtered=employees.filter(e=>!q||[e.name,e.employeeCode,e.project,e.role].join(' ').includes(q));
 return <><Card title={editing?'تعديل موظف':'إضافة موظف'} icon={Plus}><form onSubmit={submit} className="formGrid">{Object.entries({employeeCode:'كود الموظف',name:'اسم الموظف',iqama:'رقم الإقامة',role:'الوظيفة',department:'القسم',project:'المشروع',branch:'الفرع',email:'الإيميل',phone:'الجوال',basicSalary:'الراتب الأساسي',housing:'بدل السكن',transport:'بدل النقل'}).map(([k,l])=><Input key={k} label={l} value={form[k]} onChange={v=>setForm({...form,[k]:v})}/>)}<button className="btn green"><Save size={17}/>{editing?'حفظ':'إضافة'}</button></form></Card>
 <Card title="قائمة الموظفين" icon={Users} actions={<input placeholder="بحث" value={q} onChange={e=>setQ(e.target.value)} style={{width:260}}/>}>{filtered.length?<Table headers={['الكود','الاسم','الوظيفة','المشروع','الإيميل','الراتب','إجراءات']} rows={filtered.map(e=>[e.employeeCode,e.name,e.role,e.project,e.email,e.basicSalary,<div className="badges"><button className="btn light" onClick={()=>{setEditing(e.id);setForm(e)}}><Edit size={15}/>تعديل</button><button className="btn yellow" onClick={()=>createUser(e)}><Lock size={15}/>مستخدم</button><button className="btn red" onClick={()=>setEmployees(p=>p.filter(x=>x.id!==e.id))}><Trash2 size={15}/>حذف</button></div>])}/>:<div className="empty">لا يوجد موظفون. أضف أول موظف.</div>}</Card></>
}

function UsersAdmin({employees,users,setUsers,addAudit}){
 const [f,setF]=useState({username:'',password:'123456',role:'employee',name:'',employeeId:'',email:''});
 function add(){if(!f.username||!f.password)return alert('اسم المستخدم وكلمة المرور مطلوبان');setUsers(p=>[...p,{id:uid('U'),...f}]);addAudit('إنشاء مستخدم',f.username);setF({username:'',password:'123456',role:'employee',name:'',employeeId:'',email:''})}
 return <><Card title="إنشاء مستخدم وصلاحية" icon={Lock}><div className="formGrid"><Input label="اسم المستخدم" value={f.username} onChange={v=>setF({...f,username:v})}/><Input label="كلمة المرور" value={f.password} onChange={v=>setF({...f,password:v})}/><div><label>الصلاحية</label><select value={f.role} onChange={e=>setF({...f,role:e.target.value})}>{['admin','hr','manager','employee'].map(r=><option key={r}>{r}</option>)}</select></div><div><label>ربط بموظف</label><select value={f.employeeId} onChange={e=>setF({...f,employeeId:e.target.value,name:employees.find(x=>x.id===e.target.value)?.name||f.name})}><option value="">بدون</option>{employees.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></div><Input label="الاسم" value={f.name} onChange={v=>setF({...f,name:v})}/><Input label="الإيميل" value={f.email} onChange={v=>setF({...f,email:v})}/><button className="btn green" onClick={add}>إضافة مستخدم</button></div></Card><Card title="المستخدمون" icon={Users}><Table headers={['Username','الاسم','الصلاحية','موظف','إجراء']} rows={users.map(u=>[u.username,u.name,u.role,u.employeeId||'-',<button className="btn red" onClick={()=>setUsers(p=>p.filter(x=>x.id!==u.id))}>حذف</button>])}/></Card></>
}

function Locations({locations,setLocations,addAudit}){
 const [f,setF]=useState({name:'',lat:'',lng:'',radius:'100'});
 function useCurrent(){navigator.geolocation?.getCurrentPosition(pos=>setF({...f,lat:String(pos.coords.latitude),lng:String(pos.coords.longitude)}),()=>alert('لم يتم السماح بالموقع'))}
 function add(){if(!f.name||!f.lat||!f.lng)return alert('اسم الموقع والإحداثيات مطلوبة');setLocations(p=>[...p,{id:uid('LOC'),...f,radius:Number(f.radius)}]);addAudit('إضافة موقع عمل',f.name);setF({name:'',lat:'',lng:'',radius:'100'})}
 return <><Card title="إضافة موقع عمل وتحديد مسافة البصمة" icon={MapPin} actions={<button className="btn light" onClick={useCurrent}>استخدم موقعي الحالي</button>}><div className="formGrid"><Input label="اسم الموقع" value={f.name} onChange={v=>setF({...f,name:v})}/><Input label="Latitude" value={f.lat} onChange={v=>setF({...f,lat:v})}/><Input label="Longitude" value={f.lng} onChange={v=>setF({...f,lng:v})}/><Input label="المسافة المسموحة بالمتر" value={f.radius} onChange={v=>setF({...f,radius:v})}/><button className="btn green" onClick={add}>حفظ الموقع</button></div></Card><Card title="مواقع العمل" icon={Building2}>{locations.length?<Table headers={['الموقع','Latitude','Longitude','المسافة','إجراء']} rows={locations.map(l=>[l.name,l.lat,l.lng,`${l.radius} متر`,<button className="btn red" onClick={()=>setLocations(p=>p.filter(x=>x.id!==l.id))}>حذف</button>])}/>:<div className="empty">أضف مواقع العمل أولاً حتى تعمل بصمة GPS.</div>}</Card></>
}

function EmployeeAttendance(props){return <AttendanceCore {...props} employeeMode/>}
function AttendanceCore({current,employees,locations,attendance,setAttendance,settings,addAudit,notify,employeeMode}){
 const emp=employeeMode?employees.find(e=>e.id===current.employeeId):employees[0];
 const [employeeId,setEmployeeId]=useState(emp?.id||''), [locationId,setLocationId]=useState('');
 const employee=employeeMode?emp:employees.find(e=>e.id===employeeId);
 const loc=locations.find(l=>l.id===locationId) || locations[0];
 const rec=employee?attendance.find(a=>a.employeeId===employee.id&&a.date===today()):null;
 function mark(type){
  if(!employee)return alert('اختر موظفاً');
  if(!loc)return alert('لا يوجد موقع عمل محدد');
  navigator.geolocation?.getCurrentPosition(pos=>{
    const d=distMeters(pos.coords.latitude,pos.coords.longitude,Number(loc.lat),Number(loc.lng));
    if(settings.requireGps && d>Number(loc.radius)){addAudit(`رفض بصمة خارج النطاق ${d} متر`,employee.name,'high');return alert(`خارج نطاق البصمة: المسافة ${d} متر والمسموح ${loc.radius} متر`)}
    if(type==='in'){
      if(rec?.checkIn)return alert('تم تسجيل الحضور اليوم بالفعل');
      const late=nowTime()>settings.checkInEnd;
      const row={id:uid('ATT'),employeeId:employee.id,employeeName:employee.name,locationId:loc.id,locationName:loc.name,date:today(),month:month(),checkIn:nowTime(),checkOut:'',status:late?'late':'present',delayMinutes:late?Math.max(0,timeMins(nowTime())-timeMins(settings.checkInEnd)):0,distance:d,gpsStatus:'inside',deviceStatus:settings.requireDevice?'verified':'not_required',faceStatus:settings.requireFace?'pending':'not_required'};
      setAttendance(p=>[row,...p]); addAudit(late?'حضور متأخر GPS':'حضور GPS',employee.name,late?'medium':'low'); if(late)notify({toRole:'hr',title:'تنبيه تأخير موظف',message:`الموظف ${employee.name} سجل حضور متأخر`,type:'attendance'});
    }else{
      if(!rec?.checkIn)return alert('لا يوجد حضور اليوم'); if(rec.checkOut)return alert('تم تسجيل الانصراف');
      setAttendance(p=>p.map(a=>a.id===rec.id?{...a,checkOut:nowTime()}:a)); addAudit('انصراف GPS',employee.name);
    }
  },()=>alert('يجب السماح باستخدام الموقع GPS'));
 }
 return <><Card title={employeeMode?'بصمة الموظف حسب موقع العمل':'بصمة GPS'} icon={Clock} actions={<div className="badges"><button className="btn green" onClick={()=>mark('in')}><LogIn size={17}/>حضور</button><button className="btn red" onClick={()=>mark('out')}><LogOut size={17}/>انصراف</button></div>}>
  <div className="grid3">{!employeeMode&&<div><label>الموظف</label><select value={employeeId} onChange={e=>setEmployeeId(e.target.value)}><option value="">اختر</option>{employees.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></div>}<div><label>موقع الدوام</label><select value={locationId} onChange={e=>setLocationId(e.target.value)}><option value="">أول موقع محفوظ</option>{locations.map(l=><option key={l.id} value={l.id}>{l.name} - {l.radius}م</option>)}</select></div><Info title="حالة اليوم" value={rec?.checkIn?`حضور ${rec.checkIn} / انصراف ${rec.checkOut||'--'}`:'لم يسجل حضور'}/><Info title="المسافة" value={loc?`${loc.radius} متر`:'لا يوجد موقع'}/></div>
 </Card><Card title="سجل البصمات" icon={History}>{attendance.filter(a=>employeeMode?a.employeeId===current.employeeId:true).length?<Table headers={['التاريخ','الموظف','الموقع','حضور','انصراف','الحالة','التأخير','المسافة']} rows={attendance.filter(a=>employeeMode?a.employeeId===current.employeeId:true).map(a=>[a.date,a.employeeName,a.locationName,a.checkIn,a.checkOut||'--',a.status==='late'?<Badge tone="yellow">متأخر</Badge>:<Badge tone="green">حاضر</Badge>,`${a.delayMinutes} دقيقة`,`${a.distance}م`])}/>:<div className="empty">لا توجد بصمات.</div>}</Card></>
}
function AttendanceAdmin(p){return <AttendanceCore {...p}/>}

function Requests({employeeMode,current,employees,requests,setRequests,addAudit,notify}){
 const [f,setF]=useState({employeeId:employeeMode?current.employeeId:'',type:'طلب إجازة',notes:'',from:'',to:'',amount:''});
 const list=requests.filter(r=>employeeMode?r.employeeId===current.employeeId:true);
 function create(){const emp=employees.find(e=>e.id===f.employeeId); if(!emp)return alert('اختر موظف'); const r={id:uid('REQ'),...f,employeeName:emp.name,status:'pending',step:'HR',createdAt:today()}; setRequests(p=>[r,...p]); addAudit(`إنشاء ${f.type}`,emp.name); notify({toRole:'hr',title:'طلب جديد',message:`${emp.name} أرسل ${f.type}`,type:'request'});}
 function decide(id,status){const r=requests.find(x=>x.id===id); setRequests(p=>p.map(x=>x.id===id?{...x,status,step:'Done'}:x)); addAudit(`${status==='approved'?'اعتماد':'رفض'} طلب`,r?.employeeName); notify({toEmployeeId:r.employeeId,title:'تحديث على طلبك',message:`تم ${status==='approved'?'اعتماد':'رفض'} ${r.type}`,type:'request'});}
 return <><Card title={employeeMode?'إرسال طلب للموارد البشرية':'إنشاء طلب'} icon={Workflow}><div className="formGrid">{!employeeMode&&<div><label>الموظف</label><select value={f.employeeId} onChange={e=>setF({...f,employeeId:e.target.value})}><option value="">اختر</option>{employees.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></div>}<div><label>نوع الطلب</label><select value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{requestTypes.map(x=><option key={x}>{x}</option>)}</select></div><Input label="من تاريخ" type="date" value={f.from} onChange={v=>setF({...f,from:v})}/><Input label="إلى تاريخ" type="date" value={f.to} onChange={v=>setF({...f,to:v})}/><Input label="المبلغ إن وجد" value={f.amount} onChange={v=>setF({...f,amount:v})}/><div style={{gridColumn:'1/-1'}}><label>ملاحظات</label><textarea value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/></div><button className="btn green" onClick={create}>إرسال الطلب</button></div></Card>
 <Card title={employeeMode?'طلباتي':'كل الطلبات'} icon={Workflow}>{list.length?<Table headers={['رقم','الموظف','النوع','الحالة','التاريخ','ملاحظات','إجراءات']} rows={list.map(r=>[r.id,r.employeeName,r.type,<Badge tone={r.status==='approved'?'green':r.status==='rejected'?'red':'yellow'}>{r.status}</Badge>,r.createdAt,r.notes,!employeeMode&&r.status==='pending'?<div className="badges"><button className="btn green" onClick={()=>decide(r.id,'approved')}>اعتماد</button><button className="btn red" onClick={()=>decide(r.id,'rejected')}>رفض</button></div>:'-'])}/>:<div className="empty">لا توجد طلبات.</div>}</Card></>
}

function Payroll({employees,attendance,payroll,setPayroll,settings,addAudit}){
 const [period,setPeriod]=useState(month());
 function calc(){
  const rows=employees.map(e=>{
    const basic=Number(e.basicSalary||0), housing=Number(e.housing||0), transport=Number(e.transport||0);
    const att=attendance.filter(a=>a.employeeId===e.id&&a.month===period);
    const lateMins=att.reduce((s,a)=>s+Number(a.delayMinutes||0),0);
    const presentDays=new Set(att.map(a=>a.date)).size;
    const workingDays=26;
    const absent=Math.max(0,workingDays-presentDays);
    const dayRate=basic/30, minuteRate=basic/30/8/60;
    const absenceDeduction=absent*dayRate*Number(settings.absenceDeductDays||1);
    const lateDeduction=lateMins*minuteRate;
    const overtime=0;
    const gross=basic+housing+transport+overtime;
    const net=Math.max(0,gross-absenceDeduction-lateDeduction);
    return {id:uid('PAY'),period,employeeId:e.id,employeeName:e.name,basic,housing,transport,presentDays,absent,lateMins,absenceDeduction:round(absenceDeduction),lateDeduction:round(lateDeduction),overtime,net:round(net),createdAt:today()};
  });
  setPayroll(p=>[...rows,...p.filter(x=>x.period!==period)]); addAudit(`احتساب بيرول ${period}`,'Payroll');
 }
 return <><Card title="Payroll Engine - احتساب الرواتب" icon={DollarSign} actions={<button className="btn green" onClick={calc}>احتساب الشهر</button>}><div className="grid3"><Input label="الشهر" type="month" value={period} onChange={setPeriod}/><Info title="معادلة التأخير" value="الراتب / 30 / 8 / 60"/><Info title="خصم الغياب" value="أجر يوم لكل يوم غياب"/></div></Card><Card title="مسير الرواتب" icon={DollarSign}>{payroll.filter(p=>p.period===period).length?<Table headers={['الموظف','الأساسي','السكن','النقل','حضور','غياب','تأخير','خصم الغياب','خصم التأخير','الصافي']} rows={payroll.filter(p=>p.period===period).map(p=>[p.employeeName,p.basic,p.housing,p.transport,p.presentDays,p.absent,p.lateMins,p.absenceDeduction,p.lateDeduction,p.net])}/>:<div className="empty">اضغط احتساب الشهر لإنشاء المسير.</div>}</Card></>
}
function round(n){return Math.round(n*100)/100}

function Forms({employeeMode,current,settings,employees,forms,setForms,addAudit}){
 const empList=employeeMode?employees.filter(e=>e.id===current.employeeId):employees;
 const [employeeId,setEmployeeId]=useState(empList[0]?.id||''),[type,setType]=useState('salary');
 const employee=empList.find(e=>e.id===employeeId);
 function saveForm(){if(!employee)return alert('اختر موظف'); const f={id:uid('FORM'),employeeId:employee.id,employeeName:employee.name,title:templates[type],createdAt:today()}; setForms(p=>[f,...p]); addAudit(`حفظ نموذج ${templates[type]}`,employee.name)}
 return <><div className="grid2"><Card title="النماذج الذكية لشركة نبني" icon={FileText} actions={<div className="badges"><button className="btn green" onClick={saveForm}>حفظ</button><button className="btn" onClick={()=>window.print()}><Printer size={17}/>PDF / طباعة</button></div>}><div className="formGrid"><div><label>الموظف</label><select value={employeeId} onChange={e=>setEmployeeId(e.target.value)}>{empList.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></div><div><label>النموذج</label><select value={type} onChange={e=>setType(e.target.value)}>{Object.entries(templates).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div></div></Card><Paper settings={settings} employee={employee} title={templates[type]}/></div><Card title="أرشيف النماذج" icon={History}><Table headers={['رقم','الموظف','النموذج','التاريخ']} rows={forms.filter(f=>employeeMode?f.employeeId===current.employeeId:true).map(f=>[f.id,f.employeeName,f.title,f.createdAt])}/></Card></>
}
function Paper({settings,employee,title}){return <div className="paper"><div className="watermark">{settings.watermark}</div><div className="paperHeader"><div className="paperLogo">{settings.logo?<img src={settings.logo}/>: 'N'}</div><div style={{textAlign:'center'}}><h2>{settings.company}</h2><div className="muted">نشاط الشركة: {settings.activity}</div></div><div className="muted" dir="ltr">Kingdom of Saudi Arabia<br/>Tabuk<br/>info@nabny.sa</div></div><h1 style={{textAlign:'center'}}>{title}</h1>{employee?<><div className="meta"><Meta label="اسم الموظف" value={employee.name}/><Meta label="كود الموظف" value={employee.employeeCode}/><Meta label="رقم الإقامة" value={employee.iqama||'-'}/><Meta label="الوظيفة" value={employee.role||'-'}/><Meta label="القسم" value={employee.department||'-'}/><Meta label="المشروع" value={employee.project||'-'}/></div><div className="bodyText">تشهد {settings.company} بأن بيانات الموظف الموضحة أعلاه صحيحة حسب سجلات الشركة، وقد تم إصدار هذا النموذج بناءً على طلب الموظف أو الإدارة المختصة، دون أدنى مسؤولية خارج الغرض الصادر من أجله.</div><div className="signatures"><div className="sig">توقيع الموظف</div><div className="sig">مسؤول الموارد البشرية</div><div className="sig">اعتماد الإدارة</div></div></>:<div className="empty">اختر موظفاً.</div>}</div>}
function Meta({label,value}){return <div className="metaBox"><span className="muted">{label}: </span><b>{value}</b></div>}

function Notifications({current,notifications,setNotifications,admin}){const list=admin?notifications:notifications.filter(n=>n.toUserId===current.id||n.toEmployeeId===current.employeeId||n.toRole===current.role);return <Card title={admin?'كل الإشعارات':'إشعاراتي'} icon={Bell}>{list.length?<Table headers={['التاريخ','الوقت','العنوان','الرسالة','النوع']} rows={list.map(n=>[n.date,n.time,n.title,n.message,n.type])}/>:<div className="empty">لا توجد إشعارات.</div>}</Card>}
function Email({emails,setEmails}){return <Card title="Queue الإيميلات" icon={Mail} actions={<button className="btn light" onClick={()=>alert('الإرسال الحقيقي يتم عبر Supabase Edge Function / SMTP لاحقاً')}>اختبار SMTP</button>}>{emails.length?<Table headers={['إلى','العنوان','الحالة','التاريخ','الوقت']} rows={emails.map(e=>[e.to,e.subject,<Badge tone="yellow">{e.status}</Badge>,e.date,e.time])}/>:<div className="empty">لا توجد إيميلات في الانتظار.</div>}</Card>}
function Security({settings,audit}){return <><div className="grid4"><Info title="GPS" value={settings.requireGps?'مفعل':'متوقف'}/><Info title="Device Binding" value={settings.requireDevice?'مفعل':'متوقف'}/><Info title="Face Verification" value={settings.requireFace?'مفعل':'متوقف'}/><Info title="Audit Log" value={`${audit.length} حركة`}/></div><Card title="Audit Log" icon={ShieldCheck}><Table headers={['التاريخ','الوقت','المستخدم','الحركة','المخاطر']} rows={audit.map(a=>[a.date,a.time,a.actor,a.action,<Risk risk={a.risk}/>])}/></Card></>}
function Reports({employees,attendance,requests,payroll}){return <><div className="grid4"><Stat title="الموظفون" value={employees.length} icon={Users} tone="blue" note="فعلي"/><Stat title="البصمات" value={attendance.length} icon={Clock} tone="green" note="GPS"/><Stat title="الطلبات" value={requests.length} icon={Workflow} tone="yellow" note="Workflow"/><Stat title="مسيرات الرواتب" value={payroll.length} icon={DollarSign} tone="purple" note="Payroll"/></div></>}
function EmployeeHome({current,employees,attendance,requests,notifications}){const emp=employees.find(e=>e.id===current.employeeId);return <><Card title="مرحباً بك في تطبيق الموظف" icon={UserCheck}>{emp?<div className="grid3"><Info title="الموظف" value={emp.name}/><Info title="الوظيفة" value={emp.role||'-'}/><Info title="المشروع" value={emp.project||'-'}/></div>:<div className="empty">هذا المستخدم غير مربوط بموظف. اربطه من تبويب المستخدمين.</div>}</Card><div className="grid3"><Stat title="بصماتي" value={attendance.filter(a=>a.employeeId===current.employeeId).length} icon={Clock} tone="green" note="سجل الحضور"/><Stat title="طلباتي" value={requests.filter(r=>r.employeeId===current.employeeId).length} icon={Workflow} tone="yellow" note="Workflow"/><Stat title="إشعاراتي" value={notifications.filter(n=>n.toEmployeeId===current.employeeId).length} icon={Bell} tone="purple" note="System"/></div></>}
function SystemSettings({settings,setSettings,addAudit}){function logo(e){const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{setSettings({...settings,logo:reader.result});addAudit('تحديث شعار الشركة')};reader.readAsDataURL(file)}return <Card title="إعدادات شركة نبني" icon={Settings}><div className="formGrid"><Input label="اسم الشركة" value={settings.company} onChange={v=>setSettings({...settings,company:v})}/><Input label="النشاط" value={settings.activity} onChange={v=>setSettings({...settings,activity:v})}/><Input label="الخلفية المائية" value={settings.watermark} onChange={v=>setSettings({...settings,watermark:v})}/><Input label="إيميل HR" value={settings.hrEmail} onChange={v=>setSettings({...settings,hrEmail:v})}/><Input label="إيميل الإدارة" value={settings.adminEmail} onChange={v=>setSettings({...settings,adminEmail:v})}/><Input label="بداية الحضور" value={settings.checkInStart} onChange={v=>setSettings({...settings,checkInStart:v})}/><Input label="نهاية الحضور" value={settings.checkInEnd} onChange={v=>setSettings({...settings,checkInEnd:v})}/><Input label="معدل الإضافي" value={settings.overtimeRate} onChange={v=>setSettings({...settings,overtimeRate:v})}/><div><label>رفع لوجو نبني</label><input type="file" accept="image/*" onChange={logo}/></div></div></Card>}
function Info({title,value}){return <div className="card"><div className="muted">{title}</div><b>{value}</b></div>}
