// Values ADEOLA Global hasn't provided yet — see docs/PRD.md s6 "Dependencies
// & Open Items". Swap these once real values arrive; nothing else needs to
// change since components read from here.
export const siteConfig = {
  name: "ADEOLA Global Ltd",
  tagline: "Nature. Beauty. Creativity.",
  /** Placeholder — replace with the real business WhatsApp number (E.164, no +). */
  whatsappNumber: "2348000000000",
  socialLinks: {
    instagram: null as string | null,
    facebook: null as string | null,
    tiktok: null as string | null,
  },
};

export function whatsappHref(message = "Hi ADEOLA Global, I have a question about your products.") {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
