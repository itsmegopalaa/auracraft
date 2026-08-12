import crypto from "crypto";

export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    throw new Error(
      "Razorpay server secret is not configured."
    );
  }

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const generatedBuffer = Buffer.from(
    generatedSignature,
    "utf8"
  );

  const receivedBuffer = Buffer.from(
    String(signature),
    "utf8"
  );

  return (
    generatedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(
      generatedBuffer,
      receivedBuffer
    )
  );
}
