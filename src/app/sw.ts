import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";

// The project's tsconfig only loads the "dom" lib (not "webworker"), so
// ServiceWorkerGlobalScope/PushEvent/NotificationEvent/Clients aren't
// ambiently available here. Rather than add "webworker" globally (which
// would conflict with "dom"'s own `self`/`postMessage` typings across the
// rest of the app), these are minimal hand-typed shapes for exactly what
// this file uses.
interface MinimalPushEvent {
  data: { json(): unknown } | null;
  waitUntil(promise: Promise<unknown>): void;
}

interface MinimalNotificationEvent {
  notification: { close(): void; data: unknown };
  waitUntil(promise: Promise<unknown>): void;
}

interface MinimalWindowClient {
  url: string;
  focus(): Promise<unknown>;
}

interface WorkerGlobalScope extends SerwistGlobalConfig {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  registration: ServiceWorkerRegistration;
  clients: {
    matchAll(options?: { type?: string; includeUncontrolled?: boolean }): Promise<MinimalWindowClient[]>;
    openWindow(url: string): Promise<unknown>;
  };
  addEventListener(type: "push", listener: (event: MinimalPushEvent) => void): void;
  addEventListener(type: "notificationclick", listener: (event: MinimalNotificationEvent) => void): void;
}

declare const self: WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload: PushPayload;
  try {
    payload = event.data.json() as PushPayload;
  } catch {
    return;
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      data: { url: payload.url ?? "/account/orders" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string } | undefined)?.url ?? "/account/orders";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url === url) return client.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
