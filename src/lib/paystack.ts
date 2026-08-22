import { createHmac, timingSafeEqual } from "node:crypto";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

interface InitializeTransactionParams {
  email: string;
  /** Naira, converted to kobo internally — Paystack's API works in the currency's smallest unit. */
  amountNaira: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

interface InitializeTransactionResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

/** Server-only — initializes a Paystack transaction and returns the hosted checkout URL to redirect to. */
export async function initializeTransaction(
  params: InitializeTransactionParams,
): Promise<InitializeTransactionResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amountNaira * 100),
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });

  const body = await response.json();

  if (!response.ok || !body.status) {
    throw new Error(`Paystack initialize failed: ${body.message ?? response.statusText}`);
  }

  return {
    authorizationUrl: body.data.authorization_url,
    accessCode: body.data.access_code,
    reference: body.data.reference,
  };
}

/**
 * Verifies a Paystack webhook's `x-paystack-signature` header — HMAC SHA512
 * of the raw request body using the secret key, hex-encoded. Must run
 * against the raw (unparsed) body; verify BEFORE touching the payload as
 * JSON, per TRD.md s5/s6 — a non-negotiable, not a nice-to-have.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey || !signature) return false;

  const expected = createHmac("sha512", secretKey).update(rawBody).digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  if (expectedBuffer.length !== signatureBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, signatureBuffer);
}
