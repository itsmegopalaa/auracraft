export const config = {
  app: {
    name: "MineNote",
    company: "AuraCraft",
    url:
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://minenote.in",
  },

  razorpay: {
    publicKey:
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      "",
  },

  delivery: {
    estimate: "3-5 Working Days",
  },
} as const;

export function getServerEnv() {
  return {
    razorpayKeyId:
      process.env.RAZORPAY_KEY_ID || "",
    razorpayKeySecret:
      process.env.RAZORPAY_KEY_SECRET || "",
    razorpayWebhookSecret:
      process.env.RAZORPAY_WEBHOOK_SECRET || "",
    resendApiKey:
      process.env.RESEND_API_KEY || "",
  } as const;
}
