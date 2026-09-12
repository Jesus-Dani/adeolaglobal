import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/supabase/types";

const ORDER_STATUS_MESSAGES: Record<OrderStatus, string> = {
  pending: "Your order has been placed.",
  confirmed: "Your order has been confirmed.",
  out_for_delivery: "Your order is out for delivery.",
  delivered: "Your order has been delivered.",
  payment_failed: "There was a problem with your payment.",
  stock_conflict: "There's an issue with your order. We'll be in touch.",
};

/**
 * Sends a push notification to every subscription a user has registered.
 * Never throws — a notification failure must never break the admin action
 * (order status update) that triggered it. Expired/invalid subscriptions
 * (410/404 from the push service) are deleted as a side effect.
 */
export async function notifyOrderStatusChange(userId: string, orderNumber: string, status: OrderStatus) {
  if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return;

  // Deliberately set here, not at module scope: this module gets imported
  // by routes that run during Next's build-time page-data collection, and
  // web-push validates the key eagerly and throws on an empty/malformed
  // one — a crash-the-whole-build bug when VAPID env vars aren't set in
  // that environment (e.g. a fresh Vercel deploy before they're configured).
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:support@adeolaglobal.example",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );

  const admin = createAdminClient();
  const { data: subscriptions, error } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth_key")
    .eq("user_id", userId);

  if (error || !subscriptions || subscriptions.length === 0) return;

  const payload = JSON.stringify({
    title: `Order ${orderNumber}`,
    body: ORDER_STATUS_MESSAGES[status],
    url: "/account/orders",
  });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
          payload,
        );
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await admin.from("push_subscriptions").delete().eq("id", sub.id);
        } else {
          console.error("[push] failed to send notification:", err);
        }
      }
    }),
  );
}
