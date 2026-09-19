export const siteConfig = {
  name: "ADEOLA Global Ltd",
  tagline: "Nature. Beauty. Creativity.",
  /** E.164, no +. Local format 08128517589. */
  whatsappNumber: "2348128517589",
  socialLinks: {
    instagram: null as string | null,
    facebook: null as string | null,
    tiktok: null as string | null,
  },
  bankTransfer: {
    bankName: "Zenith Bank",
    accountName: "Toluwani Ogunkoya",
    accountNumber: "2522014178",
  },
};

export function whatsappHref(message = "Hi ADEOLA Global, I have a question about your products.") {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
