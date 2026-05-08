import { LogOut, Languages, Moon, Sun, Bell } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Header() {
  const getSettings = useAppStore(s => s.getSettings);
  const currentUser = useAppStore(s => s.currentUser);
  const logout = useAppStore(s => s.logout);
  const setLanguage = useAppStore(s => s.setLanguage);
  const darkMode = useAppStore(s => s.darkMode);
  const toggleDarkMode = useAppStore(s => s.toggleDarkMode);
  const notifications = useAppStore(s => s.notifications);
  const currentTenantId = useAppStore(s => s.currentTenantId);
  const unread = notifications.filter(n => !n.read && n.tenantId === currentTenantId).length;
  const settings = getSettings();
  const langs: [string, string][] = [['ar', 'ع'], ['en', 'EN'], ['ur', 'اردو'], ['bn', 'বাং']];

  return (
    <header className="header">
      <div className="brand">
        {settings.logo
          ? <img src={settings.logo} alt="logo" />
          : <div className="brand-logo-placeholder">N</div>
        }
        <div>
          <div className="brand-title">{settings.systemName}</div>
          <div className="brand-sub">{settings.company} · {settings.brandSlogan}</div>
        </div>
      </div>
      <div className="header-actions">
        <div className="langSwitch">
          <Languages size={14} />
          {langs.map(([code, label]) => (
            <button key={code} className={`miniLang ${settings.language === code ? 'active' : ''}`} onClick={() => setLanguage(code)}>{label}</button>
          ))}
        </div>
        <button className="btn icon light" onClick={toggleDarkMode} style={{ position: 'relative', background: 'rgba(255,255,255,.2)', color: 'white', border: 'none' }}>
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div style={{ position: 'relative' }}>
          <Bell size={18} style={{ cursor: 'pointer', opacity: .85 }} />
          {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#dc2626', color: 'white', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{unread > 9 ? '9+' : unread}</span>}
        </div>
        <span className="header-user">{currentUser?.name}</span>
        <button className="btn light" style={{ background: 'rgba(255,255,255,.2)', color: 'white', border: 'none' }} onClick={logout}>
          <LogOut size={15} /> خروج
        </button>
      </div>
    </header>
  );
}
