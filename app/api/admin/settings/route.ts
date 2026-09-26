import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { getServerEnv } from "@/app/config";

export async function GET() {
  const auth = await requireAdminApi();

  if (auth.error) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status },
    );
  }

  const env = getServerEnv();

  return NextResponse.json({
    success: true,
    settings: {
      environment: process.env.NODE_ENV ?? "unknown",
      payments: {
        provider: "Razorpay",
        currency: "INR",
        cod_enabled: false,
        razorpay_configured: Boolean(
          env.razorpayKeyId && env.razorpayKeySecret,
        ),
      },
      shipping: {
        provider: "Shipmozo",
        pickup_requires_admin: true,
        tracking_sync_enabled: true,
      },
      automation: {
        final_authority: "Admin",
        destructive_actions_auto_execute: false,
        custom_cover_admin_approval: true,
        production_release_admin_approval: true,
      },
    },
  });
}
