// Best-effort browser cache clear for the admin "Clear Cache" action.
// Browsers do not expose a JS API to purge the generic HTTP disk cache, so we
// clear what IS scriptable — the Cache Storage API and registered service
// workers — then force a reload so the browser re-fetches the latest assets.
export async function clearBrowserCache() {
  const cleared = [];

  // 1. Cache Storage API
  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      if (keys.length) cleared.push(`${keys.length} cache store(s)`);
    } catch (_) { /* ignore */ }
  }

  // 2. Service workers
  if ('serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
      if (regs.length) cleared.push(`${regs.length} service worker(s)`);
    } catch (_) { /* ignore */ }
  }

  return cleared;
}
