import { getServerEnv } from "@/app/config";

export function getRazorpayAuth() {
  const { razorpayKeyId, razorpayKeySecret } = getServerEnv();

  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new Error(
      "Razorpay server credentials are not configured."
    );
  }

  return Buffer.from(
    `${razorpayKeyId}:${razorpayKeySecret}`
  ).toString("base64");
}
