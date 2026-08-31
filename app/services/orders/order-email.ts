import { Resend } from "resend";
import type { OrderItem } from "@/app/types";
import { getOrderEmailSubject } from "@/app/services/orders";

interface SendOrderConfirmationEmailInput {
  orderId: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  paymentMethod: string;
  orderStatus: string;
  total: number;
  items: OrderItem[];
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendOrderConfirmationEmail(
  input: SendOrderConfirmationEmailInput
): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.error(
      "RESEND_API_KEY is not configured."
    );
    return false;
  }

  const resend = new Resend(resendApiKey);

  const paymentLabel =
    input.paymentMethod === "Razorpay"
      ? "Paid online via Razorpay"
      : "Cash on Delivery";

  const safeName = escapeHtml(input.name);
  const safeAddress = escapeHtml(input.address);
  const safeCity = escapeHtml(input.city);
  const safeState = escapeHtml(input.state);
  const safePin = escapeHtml(input.pin);
  const safeOrderId = escapeHtml(input.orderId);
  const safeStatus = escapeHtml(input.orderStatus);

  const safeItems = input.items.map((item) => ({
    ...item,
    safeName: escapeHtml(item.name),
  }));

  const { error } = await resend.emails.send({
    from: "MineNote <orders@minenote.in>",
    to: [input.email.trim()],
    subject: getOrderEmailSubject(
      input.orderStatus,
      input.orderId
    ),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #18181b; max-width: 640px; margin: 0 auto; padding: 24px;">
        <h1 style="margin-bottom: 8px;">
          Order Confirmed 🎉
        </h1>

        <p>
          Hi ${safeName},
        </p>

        <p>
          Thank you for ordering from
          <strong>MineNote</strong>.
          Your order has been successfully placed.
        </p>

        <div style="background: #f4f4f5; padding: 16px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 4px 0;">
            <strong>Order ID:</strong>
            ${safeOrderId}
          </p>

          <p style="margin: 4px 0;">
            <strong>Payment:</strong>
            ${paymentLabel}
          </p>

          <p style="margin: 4px 0;">
            <strong>Status:</strong>
            ${safeStatus}
          </p>

          <p style="margin: 4px 0;">
            <strong>Total:</strong>
            ₹${input.total}
          </p>

          <p style="margin: 4px 0;">
            <strong>Delivery:</strong>
            3-5 Working Days
          </p>
        </div>

        <h2>Items</h2>

        <ul>
          ${safeItems
            .map(
              (item) =>
                `<li>${item.safeName} × ${item.quantity} — ₹${item.price * item.quantity}</li>`
            )
            .join("")}
        </ul>

        <h2>Delivery Address</h2>

        <p>
          ${safeAddress}<br />
          ${safeCity}, ${safeState}<br />
          PIN: ${safePin}
        </p>

        <p style="margin-top: 28px;">
          We’ll keep you updated about your order.
        </p>

        <p>
          — Team MineNote ❤️
        </p>
      </div>
    `,
  });

  if (error) {
    console.error(
      "RESEND ORDER EMAIL ERROR:",
      error
    );
    return false;
  }

  return true;
}
