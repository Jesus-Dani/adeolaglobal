"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}

export function PushNotificationToggle() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        setSupported(true);
        setSubscribed(subscription !== null);
      })
      .catch(() => {});
  }, []);

  async function handleEnable() {
    setLoading(true);
    setError(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Notification permission was not granted.");
        setLoading(false);
        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error("Push notifications aren't configured.");

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!response.ok) throw new Error((await response.json()).error ?? "Failed to subscribe.");

      setSubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    setLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!supported) return null;

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        disabled={loading}
        onClick={subscribed ? handleDisable : handleEnable}
        className="self-start uppercase text-label tracking-wide"
      >
        {loading ? "Working..." : subscribed ? "Disable order updates" : "Enable order updates"}
      </Button>
      {error && (
        <p role="alert" className="text-body-s text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
