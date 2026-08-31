import { NextResponse } from "next/server";
import { Resend } from "resend";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { createServerSupabaseClient } from "@/app/lib/supabase";
import {
  isValidOrderStatus,
  canTransitionOrderStatus,
} from "@/app/services/orders";
import {
  shouldSetShippedAt,
  shouldSetDeliveredAt,
  getOrderEmailSubject,
} from "@/app/services/orders";
import {
  escapeHtml,
  isValidEmail,
} from "@/app/utils";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ orderId: string }> }
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

    const { orderId } = await context.params;

    if (!orderId?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const status = body.status;

    if (!isValidOrderStatus(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order status.",
        },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const {
      data: existingOrder,
      error: existingOrderError,
    } = await supabase
      .from("orders")
      .select(
        "order_id, name, email, payment_method, payment_status, order_status, total, delivery, shipped_at, delivered_at"
      )
      .eq("order_id", orderId)
      .maybeSingle();

    if (existingOrderError) {
      console.error(
        "ADMIN ORDER STATUS LOAD ERROR:",
        existingOrderError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to load order.",
        },
        { status: 500 }
      );
    }

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    if (existingOrder.order_status === status) {
      return NextResponse.json({
        success: true,
        order: existingOrder,
        emailSent: false,
        message:
          "Order status is already set to this value.",
      });
    }

    if (
      !canTransitionOrderStatus(
        existingOrder.order_status,
        status
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot change order status from "${existingOrder.order_status}" to "${status}".`,
        },
        { status: 400 }
      );
    }

    const updateData: {
      order_status: typeof status;
      shipped_at?: string;
      delivered_at?: string;
    } = {
      order_status: status,
    };

    if (shouldSetShippedAt(status)) {
      updateData.shipped_at =
        existingOrder.shipped_at ??
        new Date().toISOString();
    }

    if (shouldSetDeliveredAt(status)) {
      updateData.delivered_at =
        new Date().toISOString();
    }

    const {
      data: order,
      error,
    } = await supabase
      .from("orders")
      .update(updateData)
      .eq("order_id", orderId)
      .select(
        "order_id, order_status, shipped_at, delivered_at"
      )
      .single();

    if (error) {
      console.error(
        "ADMIN ORDER STATUS ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to update order status.",
        },
        { status: 500 }
      );
    }

    let emailSent = false;

    if (status !== "placed") {
      const resendApiKey =
        process.env.RESEND_API_KEY;

      if (!resendApiKey) {
        console.error(
          "RESEND_API_KEY is not configured. Order status was updated, but email was not sent."
        );
      } else if (!isValidEmail(existingOrder.email)) {
        console.error(
          "Invalid customer email. Order status was updated, but email was not sent.",
          existingOrder.email
        );
      } else {
        const resend = new Resend(
          resendApiKey
        );

        const customerName =
          escapeHtml(existingOrder.name);

        const safeOrderId =
          escapeHtml(existingOrder.order_id);

        const safeStatus =
          escapeHtml(status);

        const safeDelivery =
          escapeHtml(existingOrder.delivery);

        const paymentLabel =
          existingOrder.payment_method ===
          "Razorpay"
            ? "Paid online via Razorpay"
            : "Cash on Delivery";

        const subject =
          getOrderEmailSubject(
            status,
            existingOrder.order_id
          );

        const { error: emailError } =
          await resend.emails.send({
            from:
              "MineNote <orders@minenote.in>",
            to: [
              existingOrder.email.trim(),
            ],
            subject,
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #18181b; max-width: 640px; margin: 0 auto; padding: 24px;">
                <h1 style="margin-bottom: 8px;">
                  MineNote Order Update
                </h1>

                <p>
                  Hi ${customerName},
                </p>

                <p>
                  Your MineNote order status has been updated.
                </p>

                <div style="background: #f4f4f5; padding: 16px; border-radius: 12px; margin: 20px 0;">
                  <p style="margin: 4px 0;">
                    <strong>Order ID:</strong>
                    ${safeOrderId}
                  </p>

                  <p style="margin: 4px 0;">
                    <strong>Status:</strong>
                    ${safeStatus}
                  </p>

                  <p style="margin: 4px 0;">
                    <strong>Payment:</strong>
                    ${paymentLabel}
                  </p>

                  <p style="margin: 4px 0;">
                    <strong>Total:</strong>
                    ₹${Number(existingOrder.total).toLocaleString("en-IN")}
                  </p>

                  <p style="margin: 4px 0;">
                    <strong>Delivery:</strong>
                    ${safeDelivery}
                  </p>
                </div>

                ${
                  status === "shipped"
                    ? `
                      <p>
                        Your order is now on its way. 📦
                      </p>
                    `
                    : ""
                }

                ${
                  status === "delivered"
                    ? `
                      <p>
                        Thank you for choosing MineNote. ❤️
                      </p>
                    `
                    : ""
                }

                <p style="margin-top: 28px;">
                  — Team MineNote ❤️
                </p>
              </div>
            `,
          });

        if (emailError) {
          console.error(
            "RESEND STATUS EMAIL ERROR:",
            emailError
          );
        } else {
          emailSent = true;
        }
      }
    }

    return NextResponse.json({
      success: true,
      order,
      emailSent,
    });
  } catch (error) {
    console.error(
      "ADMIN STATUS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update order status.",
      },
      { status: 500 }
    );
  }
}
