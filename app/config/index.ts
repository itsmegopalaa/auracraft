export const config = {
  app: {
    name: "MineNote",
    company: "AuraCraft",
    url:
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://minenote.in",
  },

  razorpay: {
    keyId:
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      "",
  },

  delivery: {
    estimate: "3-5 Working Days",
  },
} as const;
