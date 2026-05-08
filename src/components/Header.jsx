import React from 'react';
import { LogOut } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
export default function Header(){const getSettings=useAppStore(s=>s.getSettings);const currentUser=useAppStore(s=>s.currentUser);const logout=useAppStore(s=>s.logout);const settings=getSettings();return <header className="header"><div className="brand">{settings.logo?<img src={settings.logo} alt="logo"/>:<div style={{fontSize:28,fontWeight:900}}>N</div>}<div><b>{settings.systemName}</b><div style={{opacity:.85,fontSize:13}}>{settings.company} - {settings.brandSlogan}</div></div></div><div className="actions"><span>{currentUser?.name}</span><button className="btn light" onClick={logout}><LogOut size={18}/> خروج</button></div></header>}
