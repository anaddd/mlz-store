export const CDN_IMAGES = {
  hero: "https://d2xsxph8kpxj0f.cloudfront.net/310519663387466116/mCkbkKmFzvSr8f7aSLM9yC/dbd-hero_1b5a7c15.png",
  logo: "https://d2xsxph8kpxj0f.cloudfront.net/310519663387466116/mCkbkKmFzvSr8f7aSLM9yC/dbd-logo_fb529a65.jpg",
  characters: "https://d2xsxph8kpxj0f.cloudfront.net/310519663387466116/mCkbkKmFzvSr8f7aSLM9yC/dbd-characters_c6eebdaa.jpg",
  dark: "https://d2xsxph8kpxj0f.cloudfront.net/310519663387466116/mCkbkKmFzvSr8f7aSLM9yC/dbd-dark_bb5fcb37.jpg",
  logoDark: "https://d2xsxph8kpxj0f.cloudfront.net/310519663387466116/mCkbkKmFzvSr8f7aSLM9yC/dbd-logo-dark_5fe5132a.jpg",
};

export const DISCORD_SERVER = "https://discord.gg/MLZ";
export const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1490663722283307141/WVVYIPsmzhGmG_m0xS_0GPxNwoFL8Q8MVcwX_BuEncWpGKusEA9-uHtT26VbG5UwnD7F";
export const OWNER_DISCORD_ID = "802934285006143508";

export const PAYMENT_METHODS = {
  paypal: {
    name: "PayPal",
    nameAr: "باي بال",
    url: "https://www.paypal.me/3nad",
    icon: "paypal",
  },
  bank: {
    name: "Bank Transfer (Al Rajhi)",
    nameAr: "تحويل بنكي (الراجحي)",
    accountName: "فيصل",
    accountNumber: "545000010006080455915",
    iban: "SA78 8000 0545 6080 1045 5915",
    bankName: "Al Rajhi Bank",
    bankNameAr: "بنك الراجحي",
  },
} as const;

export const ORDER_STATUSES = {
  pending: { label: "قيد الانتظار", labelEn: "Pending", color: "yellow" },
  processing: { label: "قيد المعالجة", labelEn: "Processing", color: "blue" },
  completed: { label: "مكتمل", labelEn: "Completed", color: "green" },
  cancelled: { label: "ملغي", labelEn: "Cancelled", color: "red" },
} as const;

export type OrderStatus = keyof typeof ORDER_STATUSES;
