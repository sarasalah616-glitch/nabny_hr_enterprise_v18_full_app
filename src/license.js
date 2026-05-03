export function simpleHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0).toString(36).toUpperCase();
}

export function machineId() {
  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone
  ].join("|");
  return "NB-" + simpleHash(raw).slice(0, 10);
}

export function generateActivationCode({ clientName, systemName, machine, plan = "FULL", expiry = "2099-12-31", secret = "NABNY-CHANGE-THIS-SECRET" }) {
  const payload = `${clientName}|${systemName}|${machine}|${plan}|${expiry}|${secret}`;
  const sig = simpleHash(payload);
  return `NABNY-${plan}-${expiry.replaceAll("-", "")}-${sig}`;
}

export function validateActivationCode({ code, clientName, systemName, machine, secret = "NABNY-CHANGE-THIS-SECRET" }) {
  if (!code || !code.startsWith("NABNY-")) return { valid: false, reason: "كود غير صحيح" };
  const parts = code.split("-");
  const plan = parts[1];
  const expiryRaw = parts[2];
  if (!plan || !expiryRaw) return { valid: false, reason: "صيغة الكود غير صحيحة" };
  const expiry = `${expiryRaw.slice(0,4)}-${expiryRaw.slice(4,6)}-${expiryRaw.slice(6,8)}`;
  const expected = generateActivationCode({ clientName, systemName, machine, plan, expiry, secret });
  if (expected !== code) return { valid: false, reason: "كود التفعيل لا يطابق هذه النسخة أو الجهاز" };
  if (new Date(expiry) < new Date()) return { valid: false, reason: "انتهت صلاحية التفعيل" };
  return { valid: true, plan, expiry };
}

export function trialStatus(startDate, days = 14) {
  const start = new Date(startDate);
  const end = new Date(start.getTime() + days * 86400000);
  const left = Math.ceil((end - new Date()) / 86400000);
  return { active: left >= 0, daysLeft: Math.max(0, left), end: end.toISOString().slice(0,10) };
}
