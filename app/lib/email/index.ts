export const EMAIL_CONFIG = {
  from: "MineNote <orders@minenote.in>",
} as const;

export function normalizeEmail(
  email: string
): string {
  return email.trim().toLowerCase();
}

export function orderConfirmationSubject(
  orderId: string
): string {
  return `MineNote Order Confirmed — ${orderId}`;
}

export function orderShippedSubject(
  orderId: string
): string {
  return `MineNote Order Shipped — ${orderId}`;
}

export function orderDeliveredSubject(
  orderId: string
): string {
  return `MineNote Order Delivered — ${orderId}`;
}
