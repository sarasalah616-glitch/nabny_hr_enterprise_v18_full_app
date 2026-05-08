import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Sparkles, Loader } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const QUICK_PROMPTS = [
  'كيف صحة الشركة اليوم؟',
  'من أكثر موظف تأخر هذا الشهر؟',
  'ما هي المخاطر الحالية؟',
  'ملخص المشتريات والموردين',
  'مستندات قريبة الانتهاء',
  'احسب توقعات الرواتب',
  'تحليل الحضور هذا الشهر',
  'ما العقود القريبة من الانتهاء؟',
];

export default function AIAssistant() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const aiHistory = useAppStore(s => s.aiHistory);
  const addAIMessage = useAppStore(s => s.addAIMessage);
  const clearAIHistory = useAppStore(s => s.clearAIHistory);
  const getTenantData = useAppStore(s => s.getTenantData);
  const getTenant = useAppStore(s => s.getTenant);
  const getCompanyHealth = useAppStore(s => s.getCompanyHealth);
  const getRisks = useAppStore(s => s.getRisks);
  const getDocumentAlerts = useAppStore(s => s.getDocumentAlerts);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiHistory, loading]);

  const buildContext = () => {
    const d = getTenantData();
    const health = getCompanyHealth();
    const risks = getRisks();
    const tenant = getTenant();
    const today = new Date().toISOString().slice(0, 10);
    const m = new Date().toISOString().slice(0, 7);
    const todayIn = d.attendance.filter(a => a.date === today && a.type === 'in');
    const docAlerts = getDocumentAlerts();

    return `أنت مستشار أعمال ذكي لنظام إدارة شركة المقاولات "${tenant?.name}".
لديك البيانات الحية التالية:

- صحة الشركة: ${health}%
- الموظفون الفعالون: ${d.employees.filter(e => e.status === 'active').length}
- حضور اليوم (${today}): ${todayIn.length} موظف
- المتأخرون اليوم: ${todayIn.filter(a => a.delayMinutes > 0).length}
- إجمالي رواتب ${m}: ${d.payroll.filter(p => p.month === m).reduce((s, p) => s + p.net, 0).toLocaleString()} ريال
- الطلبات المفتوحة: ${d.requests.filter(r => !['approved','rejected','closed'].includes(r.status)).length}
- أوامر الشراء المفتوحة: ${(d.purchaseOrders||[]).filter(po => !['closed','rejected'].includes(po.status)).length}
- العقود النشطة: ${(d.contracts||[]).filter(c => c.status === 'active').length}
- العهد والمعدات: ${(d.assets||[]).length} قطعة
- المستندات قريبة الانتهاء (90 يوم): ${docAlerts.length}
- المخاطر: ${risks.map(r => r.title).join(', ') || 'لا توجد مخاطر'}
- المشاريع: ${d.projects.map(p => `${p.name} (${p.progress || 0}%)`).join(', ')}
- الموردون: ${(d.suppliers||[]).length}

أجب باللغة العربية بأسلوب واضح ومهني واختصر وركز على المعلومات المفيدة لصاحب الشركة.`;
  };

  const handleSend = async (message?: string) => {
    const q = message || input.trim();
    if (!q || loading) return;
    setInput('');
    setLoading(true);

    addAIMessage({ role: 'user', content: q });

    try {
      const systemContext = buildContext();
      const messages = [
        { role: 'system' as const, content: systemContext },
        ...aiHistory.slice(-10).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user' as const, content: q },
      ];

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) throw new Error('فشل الاتصال بالذكاء الاصطناعي');
      const data = await response.json();
      addAIMessage({ role: 'assistant', content: data.content || 'لا توجد استجابة' });
    } catch {
      addAIMessage({ role: 'assistant', content: 'عذراً، حدث خطأ في الاتصال. تأكد من تشغيل الخادم.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-fade">
      <div className="card">
        <div className="pageTitle">
          <h2><Sparkles size={22} color="#d97706" /> مستشار الأعمال بالذكاء الاصطناعي</h2>
          <button className="btn light" onClick={clearAIHistory}><Trash2 size={15} /> مسح المحادثة</button>
        </div>
        <p className="muted" style={{ marginBottom: 16 }}>يتصل بالذكاء الاصطناعي ولديه وصول كامل لبيانات الشركة الحية. اسأله عن الحضور، الرواتب، المخاطر، أي شيء.</p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {QUICK_PROMPTS.map(p => (
            <button key={p} className="badge" style={{ cursor: 'pointer', background: '#eef2ff', color: '#3730a3', fontWeight: 600, fontSize: 12, padding: '6px 12px' }} onClick={() => handleSend(p)}>{p}</button>
          ))}
        </div>

        <div className="aiChatBox">
          {aiHistory.length === 0 && (
            <div className="aiMsg assistant" style={{ marginLeft: 0, maxWidth: '100%' }}>
              مرحباً! أنا مستشارك الذكي لشركة المقاولات. يمكنني تحليل بيانات الحضور، الرواتب، المخاطر، العقود، والمستندات. كيف يمكنني مساعدتك اليوم؟
            </div>
          )}
          {aiHistory.map((msg, i) => (
            <div key={i} className={`aiMsg ${msg.role}`}>
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="aiTyping">
              <span /><span /><span />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="اكتب سؤالك هنا... مثال: ما هي أعلى رواتب الشهر الحالي؟"
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={loading}
          />
          <button className="btn green" onClick={() => handleSend()} disabled={loading || !input.trim()}>
            {loading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
