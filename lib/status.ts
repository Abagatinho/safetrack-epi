import type { ExpiryStatus } from "./types";

const ALERT_DAYS = 30;

export function calculateStatus(
  expiryDate: string,
  today: Date,
  returnDate?: string
): ExpiryStatus {
  if (returnDate) return "ok";

  const expiry = new Date(expiryDate);
  const diffMs = expiry.getTime() - today.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return "expired";
  if (diffDays <= ALERT_DAYS) return "expiringSoon";
  return "ok";
}

export function calculateExpiryDate(startDate: string, validityMonths: number): string {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + validityMonths);
  return date.toISOString().slice(0, 10);
}
