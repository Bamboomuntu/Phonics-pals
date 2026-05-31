/**
 * Offline Image Cache
 *
 * Stores generated word images in the Cache API for offline use.
 * The Cache API is backed by the PWA service worker — persistent,
 * large capacity (hundreds of MB), survives browser restarts.
 *
 * Two-tier cache:
 *   1. localStorage — fast access, limited (~5MB)
 *   2. Cache API   — slow access, unlimited (for offline serving)
 *
 * On write: stores in both.
 * On read: checks localStorage first, then Cache API.
 */

const CACHE_NAME = 'phonic-pals-images-v1';

function imageStorageKey(word: string): string {
  return `phonic_pal_img_${word.toLowerCase().replace(/\s/g, '_')}`;
}

// ─── Public API ─────────────────────────────────────────

/**
 * Try to get a cached image for a word.
 * Checks localStorage first (fast), then Cache API (persistent).
 * Returns null if not cached anywhere.
 */
export async function getCachedImage(word: string): Promise<string | null> {
  const key = imageStorageKey(word);

  // 1. localStorage — fast path
  try {
    const local = localStorage.getItem(key);
    if (local) return local;
  } catch {
    // localStorage might be full or disabled
  }

  // 2. Cache API — persistent path
  try {
    if (typeof caches === 'undefined') return null;
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(key);
    if (response) {
      const dataUrl = await response.text();
      // Populate localStorage for next time
      try { localStorage.setItem(key, dataUrl); } catch {}
      return dataUrl;
    }
  } catch (err) {
    console.warn('Cache API read failed:', err);
  }

  return null;
}

/**
 * Save a data URL image to both localStorage and Cache API.
 */
export async function cacheImage(word: string, dataUrl: string): Promise<void> {
  const key = imageStorageKey(word);

  // Save to localStorage
  try {
    localStorage.setItem(key, dataUrl);
  } catch {
    // localStorage full — clear old cached images
    clearLocalImageCache();
    try { localStorage.setItem(key, dataUrl); } catch {}
  }

  // Save to Cache API
  try {
    if (typeof caches === 'undefined') return;
    const cache = await caches.open(CACHE_NAME);
    await cache.put(key, new Response(dataUrl, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    }));
  } catch (err) {
    console.warn('Cache API write failed:', err);
  }
}

/**
 * Get all words that have cached images.
 */
export async function getCachedImageWords(): Promise<string[]> {
  const words: Set<string> = new Set();

  // From localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('phonic_pal_img_')) {
        words.add(key.replace('phonic_pal_img_', '').replace(/_/g, ' '));
      }
    }
  } catch {}

  return Array.from(words).sort();
}

/**
 * Count of cached images.
 */
export async function getCachedImageCount(): Promise<number> {
  let count = 0;

  try {
    // Count from Cache API (more accurate)
    if (typeof caches !== 'undefined') {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      count = keys.length;
    } else {
      // Fallback to localStorage count
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('phonic_pal_img_')) count++;
      }
    }
  } catch {}

  return count;
}

/**
 * Estimate storage used by cached images.
 */
export async function getCacheSize(): Promise<string> {
  let totalBytes = 0;

  try {
    // From Cache API
    if (typeof caches !== 'undefined') {
      const cache = await caches.open(CACHE_NAME);
      const requests = await cache.keys();
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalBytes += blob.size;
        }
      }
    }

    // From localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('phonic_pal_img_')) {
        const val = localStorage.getItem(key);
        if (val) totalBytes += val.length * 2; // UTF-16
      }
    }
  } catch {}

  if (totalBytes === 0) return '0 KB';
  return totalBytes < 1024 * 1024
    ? `${(totalBytes / 1024).toFixed(0)} KB`
    : `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Clear all cached images from both storage layers.
 */
export async function clearImageCache(): Promise<void> {
  clearLocalImageCache();
  try {
    if (typeof caches !== 'undefined') {
      await caches.delete(CACHE_NAME);
    }
  } catch {}
}

// ─── Internal ───────────────────────────────────────────

function clearLocalImageCache() {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith('phonic_pal_img_'))
      .forEach(k => localStorage.removeItem(k));
  } catch {}
}
