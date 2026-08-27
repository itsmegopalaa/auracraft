import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ messageId: string }> }
) {
  try {
    const adminAuth = await requireAdminApi();

    if (adminAuth.error) {
      return NextResponse.json(
        {
          success: false,
          error: adminAuth.error,
        },
        { status: adminAuth.status }
      );
    }

    const { messageId } = await context.params;
    const body = await request.json();

    if (!messageId) {
      return NextResponse.json(
        {
          success: false,
          error: "Message ID is required.",
        },
        { status: 400 }
      );
    }

    if (typeof body.is_read !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: "is_read must be a boolean.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const updateData = body.is_read
      ? {
          is_read: true,
          read_at: new Date().toISOString(),
        }
      : {
          is_read: false,
          read_at: null,
        };

    const { data, error } = await supabase
      .from("contact_messages")
      .update(updateData)
      .eq("id", messageId)
      .select("id, is_read, read_at")
      .single();

    if (error) {
      console.error("ADMIN INBOX UPDATE ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Unable to update message.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: data,
    });
  } catch (error) {
    console.error("ADMIN INBOX API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to update message.",
      },
      { status: 500 }
    );
  }
}
