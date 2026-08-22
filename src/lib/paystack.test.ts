import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { verifyWebhookSignature } from "./paystack";

const SECRET = "sk_test_fake_secret_for_testing_only";

function sign(body: string, secret = SECRET): string {
  return createHmac("sha512", secret).update(body).digest("hex");
}

describe("verifyWebhookSignature", () => {
  const originalSecret = process.env.PAYSTACK_SECRET_KEY;

  beforeEach(() => {
    process.env.PAYSTACK_SECRET_KEY = SECRET;
  });

  afterEach(() => {
    process.env.PAYSTACK_SECRET_KEY = originalSecret;
  });

  it("accepts a correctly signed payload", () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: "abc123" } });
    expect(verifyWebhookSignature(body, sign(body))).toBe(true);
  });

  it("rejects a payload signed with the wrong secret", () => {
    const body = JSON.stringify({ event: "charge.success" });
    expect(verifyWebhookSignature(body, sign(body, "wrong_secret"))).toBe(false);
  });

  it("rejects a tampered body against a signature for the original body", () => {
    const original = JSON.stringify({ event: "charge.success", data: { amount: 1000 } });
    const tampered = JSON.stringify({ event: "charge.success", data: { amount: 999999 } });
    expect(verifyWebhookSignature(tampered, sign(original))).toBe(false);
  });

  it("rejects a missing signature", () => {
    const body = JSON.stringify({ event: "charge.success" });
    expect(verifyWebhookSignature(body, null)).toBe(false);
  });

  it("rejects an empty/garbage signature without throwing", () => {
    const body = JSON.stringify({ event: "charge.success" });
    expect(verifyWebhookSignature(body, "")).toBe(false);
    expect(verifyWebhookSignature(body, "not-hex-at-all")).toBe(false);
  });

  it("returns false rather than throwing when PAYSTACK_SECRET_KEY is unset", () => {
    delete process.env.PAYSTACK_SECRET_KEY;
    const body = JSON.stringify({ event: "charge.success" });
    expect(verifyWebhookSignature(body, sign(body))).toBe(false);
  });
});
