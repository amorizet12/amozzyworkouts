"use client";

/**
 * Forces the app to fetch the latest Vercel deployment: unregisters the
 * service worker, clears the CacheStorage it built up, and does a
 * cache-busted reload. Your logged data lives in localStorage, which this
 * never touches.
 */
export async function refreshApp(): Promise<void> {
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } finally {
    const url = new URL(window.location.href);
    url.searchParams.set("_refresh", Date.now().toString());
    window.location.replace(url.toString());
  }
}
