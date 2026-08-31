import {
  REFUND_STATUSES,
} from "@/app/constants";

export function calculateRefundAmount(
  requestedAmount: number | null | undefined,
  orderTotal: number
): number {
  return requestedAmount ?? orderTotal;
}

export function isFullRefund(
  refundAmount: number,
  orderTotal: number
): boolean {
  return refundAmount === orderTotal;
}

export function getFinalRefundStatus(
  refundAmount: number,
  orderTotal: number
) {
  return isFullRefund(refundAmount, orderTotal)
    ? REFUND_STATUSES.PROCESSED
    : REFUND_STATUSES.PARTIAL;
}

export function canStartRefund(
  paymentMethod: string | null,
  paymentStatus: string | null,
  refundStatus: string | null
): boolean {
  return (
    paymentMethod === "Razorpay" &&
    paymentStatus === "paid" &&
    refundStatus !== REFUND_STATUSES.PROCESSED &&
    refundStatus !== REFUND_STATUSES.PENDING
  );
}
