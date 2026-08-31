import type { ID } from "@/app/types";
import type { RefundStatus } from "@/app/constants";

export interface RefundRequest {
  orderId: ID;
  amount?: number;
}

export interface RefundResult {
  id: string;
  amount: number;
  status?: string | null;
}

export interface RefundRecord {
  orderId: ID;
  refundStatus: RefundStatus | string | null;
  refundId: string | null;
  refundAmount: number | null;
  refundProcessedAt: string | null;
}
