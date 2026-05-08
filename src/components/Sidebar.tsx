import {
  BarChart3, ShieldCheck, Workflow, Clock, DollarSign, MapPin, AlertTriangle,
  History, Settings, Users, FileText, Bell, Building2, ShoppingCart,
  ClipboardCheck, Package, Eye, FolderArchive, MessageSquare
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  section?: string;
}

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: 'القيادة والذكاء',
    items: [
      { id: 'dashboard', label: 'لوحة التحكم', icon: BarChart3 },
      { id: 'ownerAI', label: 'مركز القيادة', icon: ShieldCheck },
      { id: 'aiAssistant', label: 'مستشار AI', icon: MessageSquare },
      { id: 'executiveBrief', label: 'موجز المالك', icon: Eye },
    ]
  },
  {
    title: 'الموارد البشرية',
    items: [
      { id: 'employees', label: 'الموظفون', icon: Users },
      { id: 'attendance', label: 'الحضور GPS', icon: Clock },
      { id: 'payroll', label: 'مسير الرواتب', icon: DollarSign },
      { id: 'requests', label: 'الطلبات', icon: FileText },
    ]
  },
  {
    title: 'العمليات',
    items: [
      { id: 'liveMap', label: 'الخريطة الحية', icon: MapPin },
      { id: 'procurement', label: 'المشتريات', icon: ShoppingCart },
      { id: 'contracts', label: 'العقود', icon: ClipboardCheck },
      { id: 'assets', label: 'العهد والمعدات', icon: Package },
      { id: 'documents', label: 'المستندات', icon: FolderArchive },
    ]
  },
  {
    title: 'التقارير والإشراف',
    items: [
      { id: 'risk', label: 'مؤشر المخاطر', icon: AlertTriangle },
      { id: 'timeline', label: 'Timeline الشركة', icon: History },
      { id: 'reports', label: 'التقارير', icon: BarChart3 },
      { id: 'notifications', label: 'الإشعارات', icon: Bell },
      { id: 'settings', label: 'الإعدادات', icon: Settings },
    ]
  },
];

const ownerSection: NavItem = { id: 'saasAdmin', label: 'لوحة SaaS', icon: Building2 };

interface SidebarProps {
  tab: string;
  setTab: (t: string) => void;
}

export default function Sidebar({ tab, setTab }: SidebarProps) {
  const role = useAppStore(s => s.currentUser?.role);
  const notifications = useAppStore(s => s.notifications);
  const currentTenantId = useAppStore(s => s.currentTenantId);
  const unread = notifications.filter(n => !n.read && n.tenantId === currentTenantId).length;

  return (
    <aside className="sidebar">
      {role === 'owner' && (
        <>
          <div className="sidebar-section-title">المنصة</div>
          <button
            className={`nav ${tab === ownerSection.id ? 'active' : ''}`}
            onClick={() => setTab(ownerSection.id)}
          >
            <ownerSection.icon size={18} />
            {ownerSection.label}
          </button>
        </>
      )}
      {sections.map(section => (
        <div key={section.title}>
          <div className="sidebar-section-title">{section.title}</div>
          {section.items.map(item => {
            const Icon = item.icon;
            const isNotif = item.id === 'notifications' && unread > 0;
            return (
              <button
                key={item.id}
                className={`nav ${tab === item.id ? 'active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                <Icon size={18} />
                {item.label}
                {isNotif && (
                  <span style={{
                    marginRight: 'auto', background: '#dc2626', color: 'white',
                    borderRadius: '999px', padding: '1px 7px', fontSize: 11, fontWeight: 700
                  }}>{unread}</span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
