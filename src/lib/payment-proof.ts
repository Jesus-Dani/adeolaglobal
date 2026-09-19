import { createAdminClient } from "@/lib/supabase/server";

const SIGNED_URL_TTL_SECONDS = 60 * 10; // Long enough for one page view, short enough not to matter if it leaks.

/**
 * The "payment-proofs" bucket is private (no public URL, no bucket-level
 * RLS policy), so viewing an uploaded proof always goes through a
 * short-lived signed URL generated server-side with the service-role
 * client — same reasoning as every other admin-gated storage write in this
 * app, just for a read instead.
 */
export async function getPaymentProofUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from("payment-proofs").createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error || !data) return null;
  return data.signedUrl;
}
