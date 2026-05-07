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
import DocumentsCenter from './pages/DocumentsCenter';

export default function App(){
  const currentUser = useAppStore(s=>s.currentUser);
  const getSettings = useAppStore(s=>s.getSettings);
  const getTenant = useAppStore(s=>s.getTenant);
  const [tab,setTab] = useState('dashboard');
  const settings = getSettings();

  if(!currentUser) return <Login settings={settings}/>;

  return <div className="app" style={{'--primary':settings.primaryColor,'--secondary':settings.secondaryColor}}>
    <Header/>

    <div className="tenantBar">
      <b>{getTenant()?.name}</b>
    </div>

    <div className="layout">
      <Sidebar tab={tab} setTab={setTab} />

      <main>
        {tab==='dashboard' && <Dashboard/>}
        {tab==='ownerAI' && <OwnerAI/>}
        {tab==='assistant' && <AIAssistant/>}
        {tab==='attendance' && <Attendance/>}
        {tab==='payroll' && <Payroll/>}
        {tab==='livemap' && <LiveMap/>}
        {tab==='documents' && <DocumentsCenter/>}
      </main>
    </div>
  </div>
}

function Login({settings}){
  const login = useAppStore(s=>s.login);
  const tenants = useAppStore(s=>s.tenants);
  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const [tenantId,setTenantId] = useState(tenants?.[0]?.id || '');

  const handleSubmit = (e)=>{
    e.preventDefault();
    login(username,password,tenantId);
  };

  return <div className="login">
    <form className="loginCard" onSubmit={handleSubmit}>
      <h1>تسجيل الدخول</h1>

      <select value={tenantId} onChange={e=>setTenantId(e.target.value)}>
        {tenants.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="اسم المستخدم" />
      <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="كلمة المرور" type="password" />

      <button type="submit" className="btn green" style={{width:'100%',marginTop:20}}>
        دخول
      </button>
    </form>
  </div>
}