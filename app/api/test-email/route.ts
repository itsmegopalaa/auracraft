import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const { data, error } = await resend.emails.send({
      from: "MineNote <orders@minenote.in>",
      to: ["gopalyaduwanshi2@gmail.com"],
      subject: "MineNote Email Test 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h1>MineNote Email Test 🎉</h1>
          <p>Your Resend integration is working.</p>
          <p><strong>Domain:</strong> minenote.in</p>
          <p><strong>Sender:</strong> orders@minenote.in</p>
        </div>
      `,
    });

    if (error) {
      console.error("RESEND TEST EMAIL ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully.",
      data,
    });
  } catch (error) {
    console.error("RESEND TEST EMAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to send test email.",
      },
      { status: 500 }
    );
  }
}
