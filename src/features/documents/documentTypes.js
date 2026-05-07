export const DOCUMENT_OWNERS = [
  { value: "company", label: "الشركة" },
  { value: "employee", label: "الموظفين" },
  { value: "vehicle", label: "السيارات" },
  { value: "equipment", label: "المعدات" },
  { value: "project", label: "المشاريع" },
];

export const DOCUMENT_STATUS = {
  VALID: "valid",
  WARNING: "warning",
  CRITICAL: "critical",
  EXPIRED: "expired",
  RENEWED: "renewed",
};

export const ALERT_DAYS = [90, 60, 30, 15, 7, 1, 0];

export function getDocumentStatus(expiryDate) {
  if (!expiryDate) return DOCUMENT_STATUS.VALID;

  const today = new Date();
  const expiry = new Date(expiryDate);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return DOCUMENT_STATUS.EXPIRED;
  if (diffDays <= 7) return DOCUMENT_STATUS.CRITICAL;
  if (diffDays <= 30) return DOCUMENT_STATUS.WARNING;

  return DOCUMENT_STATUS.VALID;
}

export function getDaysToExpiry(expiryDate) {
  if (!expiryDate) return null;

  const today = new Date();
  const expiry = new Date(expiryDate);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}