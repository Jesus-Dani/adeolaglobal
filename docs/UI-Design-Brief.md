# UI Design Brief
## ADEOLA Global Ltd — E-Commerce Platform

**Status:** Locked for build
**Companion documents:** PRD.md, TRD.md

---

## 1. Brand Direction

**Desired feel:** Elegant, modern, professional, creative
**Avoid:** Overly bright/clashing colours, cluttered layouts, childish or flashy design
**Desired customer emotion on arrival:** Confident, welcomed, impressed by quality and professionalism

The design system below translates that brief into concrete typography, color, spacing, and component rules — extending ADEOLA Global's existing Purple/Lilac and Gold palette rather than replacing it.

---

## 2. Typography

| Role | Typeface | Notes |
|---|---|---|
| Display (headlines, hero, section headers, product names) | **Fraunces** | Warm, characterful serif — crafted/boutique feel rather than corporate. Weight 500–600. |
| Body / UI (paragraphs, nav, buttons, forms) | **Satoshi** | Clean geometric sans-serif, highly legible at small sizes |
| Data / prices | **Satoshi**, tabular figures enabled | Keeps numbers aligned in price columns and admin tables |

*(If ADEOLA Global's own brand fonts are provided, they replace Fraunces/Satoshi in these same roles — the type scale and hierarchy below stay the same.)*

### Type Scale (mobile → desktop)

| Token | Size | Weight | Use |
|---|---|---|---|
| Display XL | 32px → 56px | Fraunces 600, tight tracking | Hero headline |
| Display L | 26px → 40px | Fraunces 500 | Section headers |
| Display M | 20px → 28px | Fraunces 500 | Product name (PDP) |
| Body L | 17px → 18px | Satoshi 400 | Descriptions, intro copy |
| Body M | 15px → 16px | Satoshi 400 | Default UI text |
| Body S | 13px → 14px | Satoshi 400/500 | Captions, metadata |
| Price | 18px → 22px | Satoshi 700, tabular | Product prices |
| Button/Label | 14px → 15px | Satoshi 600, uppercase, +0.02em tracking | CTAs, badges |

---

## 3. Color Tokens

| Token | Hex | Use |
|---|---|---|
| Plum | `#6B3FA0` | Primary buttons, links, prices, active states |
| Deep Plum | `#3D2258` | Headings on light backgrounds |
| Gold | `#D4AF37` | Accents only — hairline dividers, badges, star ratings. Never a large fill. |
| Soft Lilac | `#F3EEFA` | Card and section backgrounds |
| Charcoal | `#2B2530` | Body text |
| White | `#FFFFFF` | Base background |

**Rule:** Purple and gold are accents, not dominant fills — avoid large gradient or heavily-tinted blocks, which read as generic/templated. White carries most of the layout; color appears deliberately (buttons, text, small accents, the signature hairline).

---

## 4. Signature Element

A **thin gold hairline rule with a small centered dot**, used to divide major homepage sections and underline the active navigation item. This is the one place gold is decorative — everywhere else it's functional (badges, ratings, icons). Ties back to a ribbon/packaging motif appropriate for a gifting and handmade-goods brand, without being literal.

---

## 5. Shape Language

- Cards, buttons, inputs: 8–12px rounded corners
- Badges/tags: 6px radius (small rounded rectangles — not full pills)
- Buttons: solid Plum fill + white text for primary actions; white background + Plum border for secondary actions; gold reserved for thin borders/underlines on "premium" moments (e.g. a Bestseller badge), never as a button fill

---

## 6. Iconography

Thin outline/line icons (1.5px stroke), not solid/filled — lighter, more boutique feel consistent with minimalist luxury/beauty ecommerce conventions. Used for cart, search, wishlist heart, account, menu, and all utility icons across storefront and admin.

---

## 7. Spacing & Motion

**Spacing:** 8px base unit — 8, 16, 24, 32, 40, 56, 64px — applied consistently to padding and gaps across breakpoints.

**Motion:** Subtle, functional only:
- Cards: 2–4px lift + slight opacity shift on hover
- Buttons: scale to 0.98 on press
- Wishlist heart: quick color-fill transition on tap
- No page-load animations, no scroll-triggered reveals — restraint is part of the "elegant, not AI-generated-template" direction

---

## 8. Layout Patterns

### Homepage
Hero banner → Categories → Featured products → About/brand story → Footer

### Product Listing / Category Pages
Grid of product cards (square 1:1 images), full search bar with filters (price, category, variation) and sort, sticky nav for constant access to search/cart.

### Product Detail Page
Image gallery (large, swipeable on mobile) at top → price + variant selector + Add to Cart grouped together near the top → full description/specs below → reviews section at the bottom.

### Cart
Slide-out drawer (not a separate page) — keeps shopping context intact.

### Checkout
Single page, section-based (cart summary → delivery info → payment), not multi-step/multi-page — reduces drop-off, mobile-friendly.

### Admin Dashboard
KPI overview cards at a glance (Revenue, Orders, Profit, Low Stock, Top Products) on the dashboard home, each linking to a dedicated page for full detail (orders list, inventory, analytics, customers).

---

## 9. Navigation

- **Desktop/mobile:** Sticky top nav, always reachable
- **Mobile menu:** Slide-in drawer (not full-screen overlay) — reuses the same interaction pattern as the cart drawer
- **Structure:** Simple flat nav — Home, Shop, Categories, About, Contact
- **Wishlist heart:** Always visible, top-right corner of the product image on cards (not hover-only — required for mobile/touch)

---

## 10. Component Details

- **Form inputs:** Thin bordered boxes (0.5–1px border, 8px radius, generous padding) — not underline-only. Consistent with the card border language and better for mobile tap targets/clarity.
- **Badges** (Bestseller, New, Out of Stock): Small rounded rectangles, 6px radius, tinted background using the appropriate semantic color (warm gold-tinted for "Bestseller," muted grey for "Out of Stock")
- **Out-of-stock products:** Shown in the grid (not hidden), image greyed/desaturated, Add to Cart disabled, "Out of stock" label

---

## 11. Empty & Loading States

**Empty states** (empty cart, empty wishlist, no search results): a line icon from the same icon system (not a separate illustration style) + short direct copy + a CTA button. No cartoon illustrations or mascots — stays consistent with the minimal, boutique register.

Example: Empty cart → outline bag/heart icon → "Your cart is empty." / "Add something you'll love." → **Shop now** button (Plum).

**Loading states:** Skeleton screens (grey/lilac-tinted placeholder shapes matching the loading content's dimensions), not spinners.

---

## 12. Accessibility

- Full keyboard navigation and visible focus states on all interactive elements
- Screen-reader support via semantic HTML and ARIA labels
- Color contrast validated against WCAG AA minimums for all text/background combinations in the palette above
- `prefers-reduced-motion` respected — all micro-interactions (lift, scale, transitions) disabled for users who request it

---

## 13. Pending Inputs

The system above uses Fraunces/Satoshi and the extended six-color palette as the working design language. When ADEOLA Global provides the logo file and any specific brand font files, they slot into the same roles and scale defined here without requiring a redesign of the system itself.
