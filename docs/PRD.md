# Product Requirements Document
## ADEOLA Global Ltd — E-Commerce Platform

**Status:** Locked for build
**Prepared for:** ADEOLA Global Ltd
**Build approach:** Fully custom, no fixed timeline — built with Claude Code

---

## 1. Overview

ADEOLA Global Ltd is a Nigerian multi-category business (hair and skincare, crochet and handmade products, home-care essentials, gifting, and digital/business services) that needs a custom e-commerce platform with two interfaces: a customer-facing storefront and an internal admin dashboard.

**Core message the site must communicate:** ADEOLA Global is a trusted, quality, professional brand — customers should feel confident, inspired, and trustworthy buying from it.

**Primary business goals:**
- Sell products online and reach new customers
- Present the brand as professional and trustworthy
- Reduce manual order-processing overhead
- Make product discovery, purchasing, and repeat buying easy
- Give the business owner visibility into sales, inventory, customers, and on-site behavior

---

## 2. Target Users

**Customers:** Individuals in Nigeria (launch market), varied ages and backgrounds, who value quality, creativity, affordability, and convenience. Predominantly mobile browsers.

**Admin:** A single business owner/operator managing the entire catalog, inventory, orders, and customer relationships — no staff accounts at launch.

---

## 3. Scope: Two Interfaces

### 3.1 Customer Storefront
- Browse and search products across 8 categories (hair-care, skincare, home-care, crochet accessories, handmade crafts, gift boxes, resin products, digital products)
- View detailed product pages with variant selection (size, colour, material, style, quantity)
- Create an account (email/password or Google) or check out as a guest
- Add to cart, save items to a wishlist
- Complete checkout and pay via Paystack (card, bank transfer, USSD)
- Track order status (Pending → Confirmed → Out for delivery → Delivered)
- View order history (account holders)
- Leave verified-purchase product reviews (admin-approved before publishing)
- Contact the business via WhatsApp click-to-chat
- Install the site as a PWA; receive order-status push notifications

### 3.2 Admin Dashboard
- Upload/manage products individually or via CSV bulk import
- Track inventory at the variant level, with low-stock alerts
- View and manage all customer orders, including failed/abandoned payment records
- Monitor revenue and **profit** (via admin-entered cost price per product)
- View customer records and segmentation (spending, order frequency, category preference)
- View a custom-built behavior analytics dashboard (product views, search terms, cart adds, checkout starts, purchases, drop-off — logged-in users only)
- Organize products across categories
- Export orders, sales, and customer data as CSV
- Moderate (approve/reject) product reviews before they go live

---

## 4. Out of Scope (Launch)

Explicitly excluded from this build, by decision:
- Tax/VAT calculation
- Coupon codes or loyalty/rewards programs
- In-system returns/refunds workflow (handled manually/offline by admin)
- International shipping (Nigeria only)
- Multiple admin/staff accounts or permission tiers
- Admin 2FA
- Promotional or marketing emails (only Paystack's automatic payment receipt is sent — no branded order-confirmation email system)
- Delivery fee calculation at checkout (discussed manually with the customer post-order)
- CMS-style editing of homepage/About content (updated via code)

---

## 5. Phased Build Plan

The full build is broken into six layered phases. Each phase is fully functional and testable before the next begins.

**Phase 1 — Foundation**
Project scaffolding, Supabase setup (database, auth, storage), design system implementation (typography, color tokens, component library), base layout (nav, footer), category/product data model, staging environment.

**Phase 2 — Storefront Core**
Product browsing, search and filtering, product detail pages with variant selection, cart (guest + account, localStorage merge on login), wishlist, account creation/login (email + Google), PWA installability.

**Phase 3 — Payments & Orders**
Paystack integration (card, bank transfer, USSD), checkout flow, webhook-driven order confirmation, atomic stock decrement, order tracking and history, failed/abandoned payment handling, Terms of Service acceptance.

**Phase 4 — Admin**
Product management (manual + CSV bulk import), variant-level inventory with low-stock alerts, order management, revenue/profit dashboard, customer records and segmentation, category management, CSV exports.

**Phase 5 — Analytics & Reviews**
Custom event-tracking pipeline (product views, search, cart adds, checkout starts, purchases, drop-off), analytics dashboard, product review submission (verified-purchase only) and admin moderation queue.

**Phase 6 — PWA & Polish**
Push notifications (order status only), rich link previews (Open Graph) for shared products, skeleton loading states, empty-state design, accessibility pass (WCAG), SEO (sitemap, meta tags), Sentry error monitoring wired in throughout, final QA.

---

## 6. Dependencies & Open Items

These are not build decisions — they are inputs required from ADEOLA Global before or during the relevant phase:

| Item | Needed for | Status |
|---|---|---|
| Logo file (source format) | Phase 1 | Pending |
| Brand font files (if different from Fraunces/Satoshi substitutes) | Phase 1 | Pending |
| Full product catalog (beyond the 3 seed items) | Phase 4 | Pending |
| Social media links | Phase 6 | Pending |
| Paystack business verification (KYC via Paystack directly) | Phase 3 | Business-side action, start early |
| Domain name purchase | Recommended before launch (site can run on Vercel subdomain until then) | Pending |

---

## 7. Success Criteria

- Customers can complete a full purchase (browse → cart → checkout → payment → confirmation) without friction on mobile
- Admin can manage the entire catalog and order lifecycle without needing code changes
- Admin has accurate, real-time visibility into revenue, profit, and customer behavior
- Site meets WCAG accessibility standards
- Site is installable as a PWA and receives order-status push notifications
