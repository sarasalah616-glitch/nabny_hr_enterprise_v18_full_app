import { useState, useEffect } from 'react';
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
import {
  Risk, Timeline, Employees, Requests, Reports, Notifications,
  SettingsPage, SaaSAdmin, TenantSwitcher, Procurement, Contracts, Assets, ExecutiveBrief
} from './pages/MorePages';

export default function App() {
  const currentUser = useAppStore(s => s.currentUser);
  const getSettings = useAppStore(s => s.getSettings);
  const getTenant = useAppStore(s => s.getTenant);
  const darkMode = useAppStore(s => s.darkMode);
  const [tab, setTab] = useState('dashboard');
  const settings = getSettings();

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', settings.primaryColor);
    document.documentElement.style.setProperty('--secondary', settings.secondaryColor);
    document.documentElement.style.setProperty('--accent', settings.accentColor);
    if (settings.backgroundImage) {
      document.documentElement.style.setProperty('--bgImage', `url(${settings.backgroundImage})`);
    } else {
      document.documentElement.style.setProperty('--bgImage', 'none');
    }
  }, [settings.primaryColor, settings.secondaryColor, settings.accentColor, settings.backgroundImage]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  if (!currentUser) return <Login settings={settings} />;

  const pages: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    ownerAI: <OwnerAI />,
    aiAssistant: <AIAssistant />,
    liveMap: <LiveMap />,
    risk: <Risk />,
    timeline: <Timeline />,
    employees: <Employees />,
    attendance: <Attendance />,
    payroll: <Payroll />,
    requests: <Requests />,
    procurement: <Procurement />,
    contracts: <Contracts />,
    assets: <Assets />,
    executiveBrief: <ExecutiveBrief />,
    documents: <DocumentsCenter />,
    reports: <Reports />,
    notifications: <Notifications />,
    settings: <SettingsPage />,
    saasAdmin: <SaaSAdmin />,
  };

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <Header />
      <div className="tenantBar">
        <div>
          <strong>{getTenant()?.name}</strong>
          <span className="muted" style={{ marginRight: 10 }}>{getTenant()?.plan} · {getTenant()?.subscriptionStatus}</span>
        </div>
        <TenantSwitcher />
      </div>
      <div className="layout">
        <Sidebar tab={tab} setTab={setTab} />
        <main style={{ minWidth: 0 }}>
          {pages[tab] || <Dashboard />}
        </main>
      </div>
      <div className="watermark">{settings.watermark}</div>
    </div>
  );
}

function Login({ settings }: { settings: ReturnType<ReturnType<typeof useAppStore.getState>['getSettings']> }) {
  const login = useAppStore(s => s.login);
  const tenants = useAppStore(s => s.tenants);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('TEN-NABNY');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      login({ username, password, tenantId });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="login">
      <form className="loginCard" onSubmit={handleSubmit}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, #0f172a, #991b1b)', borderRadius: 18, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: 'white' }}>N</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{settings.systemName}</h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>{settings.company}</p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#991b1b', borderRadius: 10, marginBottom: 14, fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <select value={tenantId} onChange={e => setTenantId(e.target.value)} style={{ marginBottom: 0 }}>
            {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="اسم المستخدم" style={{ marginBottom: 12 }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور" style={{ marginBottom: 20 }} />
        <button type="submit" className="btn green" style={{ width: '100%', padding: '14px', fontSize: 15 }}>دخول</button>

        <div style={{ marginTop: 20, padding: '14px', background: '#f8fafc', borderRadius: 12, fontSize: 12, color: '#64748b', textAlign: 'center' }}>
          <strong>بيانات الدخول التجريبية:</strong><br />
          admin / 123456 | hr / 123456 | manager / 123456<br />
          employee / 123456 | owner / 123456 (لوحة SaaS)
        </div>
      </form>
    </div>
  );
}
