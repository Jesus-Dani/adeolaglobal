import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionToken, verifySessionToken, verifyPassword } from "./admin-session";

const PASSWORD = "correct horse battery staple";

describe("admin-session", () => {
  const originalPassword = process.env.ADMIN_PASSWORD;

  beforeEach(() => {
    process.env.ADMIN_PASSWORD = PASSWORD;
    vi.useRealTimers();
  });

  afterEach(() => {
    process.env.ADMIN_PASSWORD = originalPassword;
    vi.useRealTimers();
  });

  describe("verifyPassword", () => {
    it("accepts the correct password", () => {
      expect(verifyPassword(PASSWORD)).toBe(true);
    });

    it("rejects an incorrect password", () => {
      expect(verifyPassword("wrong password")).toBe(false);
    });

    it("returns false rather than throwing when ADMIN_PASSWORD is unset", () => {
      delete process.env.ADMIN_PASSWORD;
      expect(verifyPassword(PASSWORD)).toBe(false);
    });
  });

  describe("createSessionToken / verifySessionToken", () => {
    it("accepts a freshly created token", () => {
      expect(verifySessionToken(createSessionToken())).toBe(true);
    });

    it("rejects a tampered signature", () => {
      const token = createSessionToken();
      const [timestamp] = token.split(".");
      expect(verifySessionToken(`${timestamp}.deadbeef`)).toBe(false);
    });

    it("rejects a token signed under a different password", () => {
      const token = createSessionToken();
      process.env.ADMIN_PASSWORD = "a different password";
      expect(verifySessionToken(token)).toBe(false);
    });

    it("rejects malformed tokens", () => {
      expect(verifySessionToken("")).toBe(false);
      expect(verifySessionToken("no-dot-here")).toBe(false);
      expect(verifySessionToken(null)).toBe(false);
      expect(verifySessionToken(undefined)).toBe(false);
    });

    it("rejects an expired token", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
      const token = createSessionToken();

      vi.setSystemTime(new Date("2026-01-09T00:00:00Z")); // 8 days later
      expect(verifySessionToken(token)).toBe(false);
    });

    it("accepts a token just under the expiry window", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
      const token = createSessionToken();

      vi.setSystemTime(new Date("2026-01-07T00:00:00Z")); // 6 days later
      expect(verifySessionToken(token)).toBe(true);
    });
  });
});
