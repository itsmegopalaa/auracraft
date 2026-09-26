import { createSupabaseAdminClient } from "@/app/lib/supabase";

export type AdminAuditSource =
  | "admin"
  | "automation"
  | "webhook"
  | "system";

type AuditValue =
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | null;

type LogAdminActionInput = {
  adminUserId?: string | null;
  source?: AdminAuditSource;
  action: string;
  entityType: string;
  entityId?: string | null;
  beforeData?: AuditValue;
  afterData?: AuditValue;
  metadata?: Record<string, unknown>;
};

function sanitize(value: AuditValue | undefined): AuditValue | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      sanitize(item as AuditValue)
    );
  }

  if (typeof value !== "object") {
    return value;
  }

  const blockedKeys = new Set([
    "password",
    "token",
    "access_token",
    "refresh_token",
    "authorization",
    "cookie",
    "api_key",
    "secret",
    "service_role_key",
    "razorpay_payment_id",
    "razorpay_order_id",
    "razorpay_signature",
    "raw",
  ]);

  const result: Record<string, unknown> = {};

  for (const [key, item] of Object.entries(value)) {
    if (blockedKeys.has(key.toLowerCase())) {
      continue;
    }

    result[key] = sanitize(item as AuditValue);
  }

  return result;
}

export async function logAdminAction(
  input: LogAdminActionInput
): Promise<void> {
  try {
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase
      .from("admin_audit_logs")
      .insert({
        admin_user_id: input.adminUserId ?? null,
        source: input.source ?? "admin",
        action: input.action,
        entity_type: input.entityType,
        entity_id: input.entityId ?? null,
        before_data: sanitize(input.beforeData),
        after_data: sanitize(input.afterData),
        metadata: sanitize(input.metadata ?? {}),
      });

    if (error) {
      console.error("ADMIN AUDIT LOG WRITE ERROR:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
      });
    }
  } catch (error) {
    console.error("ADMIN AUDIT LOGGER ERROR:", error);
  }
}
