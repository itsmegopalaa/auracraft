import { getServerEnv } from "@/app/config";

import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/app/lib/supabase";
import { Resend } from "resend";

const supabaseAdmin = createSupabaseAdminClient();

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const message = String(body.message ?? "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "Please fill in your name, email and message.",
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Name is too long.",
        },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is too long.",
        },
        { status: 400 }
      );
    }

    const { error: databaseError } = await supabaseAdmin
      .from("contact_messages")
      .insert({
        name,
        email,
        message,
      });

    if (databaseError) {
      console.error("CONTACT DATABASE ERROR:", databaseError);

      return NextResponse.json(
        {
          success: false,
          error: "Unable to save your message right now.",
        },
        { status: 500 }
      );
    }

    const resendApiKey = getServerEnv().resendApiKey;

    if (!resendApiKey) {
      console.error(
        "RESEND_API_KEY is not configured. Contact message was saved to inbox."
      );

      return NextResponse.json({
        success: true,
        message:
          "Your message has been received successfully. We’ll get back to you soon.",
        emailNotificationSent: false,
      });
    }

    const resend = new Resend(resendApiKey);

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

    const { error: emailError } = await resend.emails.send({
      from: "MineNote <orders@minenote.in>",
      to: ["minenote.test2026@gmail.com"],
      replyTo: email,
      subject: `New Contact Message — ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #18181b; max-width: 640px; margin: 0 auto; padding: 24px;">
          <h1 style="margin-bottom: 8px;">
            New Contact Message 📩
          </h1>

          <div style="background: #f4f4f5; padding: 16px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 4px 0;">
              <strong>Name:</strong> ${safeName}
            </p>

            <p style="margin: 4px 0;">
              <strong>Email:</strong> ${safeEmail}
            </p>
          </div>

          <h2>Message</h2>

          <p>
            ${safeMessage}
          </p>

          <p style="margin-top: 28px; color: #71717a;">
            Reply directly to this email to respond to the customer.
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error(
        "RESEND CONTACT EMAIL ERROR: Message was saved to inbox.",
        emailError
      );

      return NextResponse.json({
        success: true,
        message:
          "Your message has been received successfully. We’ll get back to you soon.",
        emailNotificationSent: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully.",
      emailNotificationSent: true,
    });
  } catch (error) {
    console.error("CONTACT API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to send your message right now.",
      },
      { status: 500 }
    );
  }
}
