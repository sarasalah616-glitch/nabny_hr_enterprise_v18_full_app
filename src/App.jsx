import React,{useState}from'react';
import { useAppStore } from './store/useAppStore';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import OwnerAI from './pages/OwnerAI';
import AIAssistant from './pages/AIAssistant';
import Attendance from './pages/Attendance';
import Payroll from './pages/Payroll';
import LiveMap from './pages/LiveMap';
import { Risk, Timeline, Employees, Requests, Reports, Notifications, SettingsPage, SaaSAdmin, TenantSwitcher, Procurement, Contracts, Assets, ExecutiveBrief, Documents } from './pages/MorePages';

export default function App(){
  const currentUser=useAppStore(s=>s.currentUser);
  const getSettings=useAppStore(s=>s.getSettings);
  const getTenant=useAppStore(s=>s.getTenant);
  const [tab,setTab]=useState('dashboard');
  const settings=getSettings();
  if(!currentUser)return <Login settings={settings}/>;
  return <div className="app" style={{'--primary':settings.primaryColor,'--secondary':settings.secondaryColor,'--accent':settings.accentColor,'--bgImage':settings.backgroundImage?`url(${settings.backgroundImage})`:'none'}}>
    <Header/>
    <div className="tenantBar"><b>{getTenant()?.name}</b><span>{getTenant()?.plan} - {getTenant()?.subscriptionStatus}</span><TenantSwitcher/></div>
    <div className="layout"><Sidebar tab={tab} setTab={setTab}/><main>
      {tab==='dashboard'&&<Dashboard/>}{tab==='ownerAI'&&<OwnerAI/>}{tab==='aiAssistant'&&<AIAssistant/>}{tab==='liveMap'&&<LiveMap/>}{tab==='risk'&&<Risk/>}{tab==='timeline'&&<Timeline/>}{tab==='employees'&&<Employees/>}{tab==='documents'&&<Documents/>}{tab==='attendance'&&<Attendance/>}{tab==='payroll'&&<Payroll/>}{tab==='requests'&&<Requests/>}{tab==='procurement'&&<Procurement/>}{tab==='contracts'&&<Contracts/>}{tab==='assets'&&<Assets/>}{tab==='executiveBrief'&&<ExecutiveBrief/>}{tab==='reports'&&<Reports/>}{tab==='notifications'&&<Notifications/>}{tab==='settings'&&<SettingsPage/>}{tab==='saasAdmin'&&<SaaSAdmin/>}
    </main></div><div className="watermark">{settings.watermark}</div></div>
}
function Login({settings}){
  const login=useAppStore(s=>s.login); const tenants=useAppStore(s=>s.tenants);
  const [username,setUsername]=useState('');const[password,setPassword]=useState('');const[tenantId,setTenantId]=useState('TEN-NABNY');
  const handleSubmit=e=>{e.preventDefault();try{login({username,password,tenantId})}catch(err){alert(err.message)}};
  return <div className="login"><form className="loginCard" onSubmit={handleSubmit}><h1>{settings.systemName}</h1><p>{settings.company} - SaaS Core</p>
    <select value={tenantId} onChange={e=>setTenantId(e.target.value)}>{tenants.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>
    <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="اسم المستخدم"/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="كلمة المرور"/>
    <button type="submit" className="btn green" style={{width:'100%',marginTop:20}}>دخول</button><p className="muted">admin / 123456 أو owner / 123456 للوحة SaaS</p></form></div>
}
