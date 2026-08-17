# Technical Requirements Document
## ADEOLA Global Ltd — E-Commerce Platform

**Status:** Locked for build
**Companion documents:** PRD.md, UI-Design-Brief.md

---

## 1. Architecture Overview

```
Next.js (frontend + API routes, hosted on Vercel)
        │
        ├── Supabase Postgres        (data)
        ├── Supabase Auth            (customer + admin authentication)
        ├── Supabase Storage         (product images)
        └── Supabase RLS             (data-level authorization)
        │
        ├── Paystack API             (payments: card, bank transfer, USSD)
        └── Sentry                   (error monitoring)
```

No separate backend service — Next.js API routes call Supabase directly (server-side, using the service role key where needed) and handle the Paystack webhook.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Frontend framework | Next.js |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| File storage | Supabase Storage |
| Payments | Paystack (card, bank transfer, USSD) |
| Hosting | Vercel (production + automatic preview/staging deployments) |
| Error monitoring | Sentry |
| Search | Postgres full-text search (via Supabase) |
| Testing | Vitest/Jest (unit) + Playwright (end-to-end), targeted at payment/inventory paths only |
| Transactional email | None built — Paystack's automatic payment receipt covers this; Supabase's default service handles auth emails (password reset, verification) |

---

## 3. Authentication & Authorization

**Authentication**
- Supabase Auth for both customers and the admin — no separate login system
- Sign-up/sign-in via email/password or Google OAuth
- Email verification on signup; Supabase-managed password reset flow
- Guest checkout permitted; guest cart/wishlist persist in browser localStorage and merge into the account on login or post-purchase account creation
- Admin account distinguished by a `role = 'admin'` flag — no 2FA (by decision)

**Authorization**
- **Database level:** Supabase Row Level Security (RLS) policies on every table — e.g. customers can only `SELECT`/`UPDATE` rows in `orders` and `wishlists` where `user_id = auth.uid()`; write access to `products`, `categories`, and moderation actions restricted to `role = 'admin'`
- **Route level:** Next.js middleware verifies `role = 'admin'` before rendering or serving any `/admin/*` route or API call, as a second layer on top of RLS

---

## 4. Core Data Model (indicative)

- `users` (extends Supabase auth.users — role, name, contact info)
- `categories`
- `products` (name, description, base price, category, cost_price, images, status)
- `product_variants` (product_id, size, colour, material, style, quantity/pack, stock_count, sku)
- `carts` / `cart_items` (nullable user_id for guest sessions synced from localStorage)
- `wishlists`
- `orders` (order_number: ADG-0001 format, user_id nullable for guest, status, delivery_notes, terms_accepted)
- `order_items` (order_id, variant_id, quantity, price_at_purchase)
- `payments` (order_id, paystack_reference, status, channel, webhook_verified_at)
- `reviews` (product_id, user_id, rating, body, status: pending/approved/rejected — verified-purchase enforced)
- `analytics_events` (user_id, event_type, product_id, metadata, created_at) — logged-in users only
- `low_stock_alerts` (derived/queried, not necessarily a separate table)

---

## 5. Payments (Paystack)

- Checkout initiates a Paystack transaction across all channels: card, bank transfer, USSD
- Order is created in a `pending` state before payment initiation
- **Paystack webhook** is the source of truth for payment confirmation — never trust client-side redirect alone
- Webhook handler verifies the Paystack signature before processing
- On verified success: order status updates, and **stock is decremented atomically** inside the same database transaction (checks current stock, decrements, and fails safely if insufficient — flagged as a stock-conflict order for manual admin resolution in the rare race-condition case)
- Failed or abandoned payments are labeled distinctly ("Payment failed" / "Abandoned") in the admin order list, retained for records and analytics, and filtered out of the default order view after a set window — no stock is ever held against them since decrement only happens on confirmed success
- No delivery fee calculated at checkout — delivery cost is discussed directly with the customer post-order
- Refunds are handled manually by the admin through the Paystack dashboard directly — no in-system refund workflow

---

## 6. Security Requirements

- HTTPS everywhere (default via Vercel)
- Supabase RLS as the primary data-access control, middleware as the secondary check
- Paystack webhook signature verification mandatory before acting on any webhook payload
- Environment variables/secrets never committed to source control; managed via Vercel's environment variable store, separately per environment (production vs. staging)
- Terms of Service acceptance required (checkbox) at checkout and signup
- Rate limiting on auth endpoints (login, signup, password reset) to prevent brute-force/abuse

### Required secrets/keys (obtained by ADEOLA Global, stored as environment variables)

| Service | Keys |
|---|---|
| Supabase | Project URL, anon key, service role key |
| Paystack | Public key, secret key, webhook secret |
| Google OAuth | Client ID, client secret |
| Sentry | DSN |

---

## 7. Environments

- **Production:** Vercel production deployment, production Supabase project
- **Staging:** Vercel automatic preview deployments (per branch/PR) against a separate staging Supabase project, mirroring production schema
- Database migrations version-controlled and applied to staging before production

---

## 8. Testing Strategy

Targeted automated testing, not full coverage, given no fixed timeline but a preference for efficient effort allocation:
- **Unit tests:** cart/pricing calculation logic, stock-decrement logic
- **End-to-end test (Playwright):** full purchase flow — browse → add to cart → checkout → Paystack payment (sandbox) → order confirmation → order appears correctly in admin
- **Webhook test:** signature verification and idempotency (a webhook fired twice must not double-process an order or double-decrement stock)
- Manual testing for general browsing, admin CRUD operations, and UI polish

---

## 9. Performance & Reliability

- Mobile-first, PWA-installable, image-optimized (Next.js Image + Supabase Storage transforms), square (1:1) product photos throughout
- Skeleton loading states for product/image data
- Sentry error monitoring wired into both frontend and API routes from Phase 1 onward
- Supabase default automated daily backups (accepted as sufficient by decision)

---

## 10. Accessibility

Site targets WCAG compliance: full keyboard navigation, screen-reader support (semantic HTML, ARIA labels where needed), sufficient color contrast (validated against the locked palette — Charcoal `#2B2530` on White/Soft Lilac backgrounds, White text on Plum `#6B3FA0` buttons), visible focus states, and reduced-motion support respected for all micro-interactions.

---

## 11. Analytics

Custom-built event pipeline (not Google Analytics/third-party), logging authenticated users only:
- Product views
- Search queries
- Add-to-cart events
- Checkout starts
- Completed purchases
- Funnel drop-off points (derivable from the above sequence per user/session)

Feeds the admin analytics dashboard and customer segmentation (spend, order frequency, category preference).

---

## 12. SEO & Sharing

- Meta tags, sitemap.xml, robots.txt
- Open Graph tags on product pages for rich link previews when shared to WhatsApp/social
- Fast page-load performance as a ranking and UX factor

---

## 13. Compliance

- Cookie/tracking consent banner shown on first visit (required given behavior analytics tracking)
- Privacy Policy, Terms of Service, and Delivery Information pages drafted from scratch, aligned with Nigeria's Data Protection Act (NDPR) given collection of customer PII and payment-related data
