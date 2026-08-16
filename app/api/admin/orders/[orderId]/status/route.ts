import { NextResponse } from "next/server";
import { Resend } from "resend";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { createClient } from "@/utils/supabase/server";

const ALLOWED_STATUSES = [
  "placed",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

type Status = (typeof ALLOWED_STATUSES)[number];

const STATUS_EMAILS: Record<
  Exclude<Status, "placed">,
  {
    subject: string;
    title: string;
    message: string;
  }
> = {
  confirmed: {
    subject: "Your MineNote order is confirmed ✅",
    title: "Order Confirmed ✅",
    message:
      "Your order has been confirmed and will now be prepared for dispatch.",
  },
  processing: {
    subject: "Your MineNote order is being prepared ⚙️",
    title: "Order Being Prepared ⚙️",
    message:
      "We’re preparing your personalized MineNote order for dispatch.",
  },
  shipped: {
    subject: "Your MineNote order has shipped 📦",
    title: "Order Shipped 📦",
    message:
      "Your order is on its way. We’ll see you soon!",
  },
  delivered: {
    subject: "Your MineNote order has been delivered 🎉",
    title: "Order Delivered 🎉",
    message:
      "Your MineNote order has been delivered. We hope you love it!",
  },
  cancelled: {
    subject: "Your MineNote order has been cancelled",
    title: "Order Cancelled",
    message:
      "Your MineNote order has been cancelled. If you believe this was unexpected, please contact us.",
  },
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidEmail(value: unknown) {
  return (
    typeof value === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  );
}

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
    const body = await request.json();
    const status = body.status as Status;

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order status.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: existingOrder, error: existingOrderError } =
      await supabase
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
        message: "Order status is already set to this value.",
      });
    }

    const allowedTransitions: Record<Status, readonly Status[]> = {
      placed: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    };

    const currentStatus = existingOrder.order_status as Status;
    const allowedNextStatuses = allowedTransitions[currentStatus] ?? [];

    if (!allowedNextStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot change order status from "${currentStatus}" to "${status}".`,
        },
        { status: 400 }
      );
    }

    const updateData: {
      order_status: Status;
      shipped_at?: string;
      delivered_at?: string;
    } = {
      order_status: status,
    };

    if (status === "shipped") {
      updateData.shipped_at = new Date().toISOString();
    }

    if (status === "delivered") {
      updateData.shipped_at =
        existingOrder.shipped_at ?? new Date().toISOString();

      updateData.delivered_at = new Date().toISOString();
    }

    const { data: order, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("order_id", orderId)
      .select("order_id, order_status, shipped_at, delivered_at")
      .single();



    if (error) {
      console.error("ADMIN ORDER STATUS ERROR:", error);

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
      const resendApiKey = process.env.RESEND_API_KEY;

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
        const resend = new Resend(resendApiKey);
        const emailContent = STATUS_EMAILS[status];

        const customerName = escapeHtml(existingOrder.name);
        const safeOrderId = escapeHtml(existingOrder.order_id);
        const safeStatus = escapeHtml(status);
        const safeDelivery = escapeHtml(existingOrder.delivery);

        const paymentLabel =
          existingOrder.payment_method === "Razorpay"
            ? "Paid online via Razorpay"
            : "Cash on Delivery";

        const { error: emailError } = await resend.emails.send({
          from: "MineNote <orders@minenote.in>",
          to: [existingOrder.email.trim()],
          subject: emailContent.subject,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #18181b; max-width: 640px; margin: 0 auto; padding: 24px;">
              <h1 style="margin-bottom: 8px;">
                ${escapeHtml(emailContent.title)}
              </h1>

              <p>
                Hi ${customerName},
              </p>

              <p>
                ${escapeHtml(emailContent.message)}
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
    console.error("ADMIN STATUS API ERROR:", error);

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
