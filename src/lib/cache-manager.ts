/**
 * Offline Cache Manager
 * 
 * Loads pre-cached audio assets for offline play.
 * Falls back to browser SpeechRecognition when Gemini is unavailable.
 */

export interface CacheManifest {
  version: number;
  generatedAt: string;
  totalWords: number;
  words: CacheWord[];
}

export interface CacheWord {
  wordId: string;
  word: string;
  hasAudio: boolean;
  audioFile: string;
}

// ─── State ──────────────────────────────────────────────

let manifest: CacheManifest | null = null;
let isLoaded = false;

// ─── Load Manifest ──────────────────────────────────────

export async function loadCacheManifest(): Promise<CacheManifest | null> {
  if (isLoaded) return manifest;
  
  try {
    const response = await fetch('/assets/cache/manifest.json');
    if (!response.ok) throw new Error('No cache manifest found');
    manifest = await response.json();
    isLoaded = true;
    console.log(`📦 Cache loaded: ${manifest.words.filter(w => w.hasAudio).length}/${manifest.totalWords} words`);
    return manifest;
  } catch {
    console.log('📦 No offline cache found — will use live API');
    return null;
  }
}

// ─── Get Audio URL ──────────────────────────────────────

export function getCachedAudioUrl(word: string): string | null {
  if (!manifest) return null;
  
  const slug = word.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const entry = manifest.words.find(w => {
    const entrySlug = w.word.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    return entrySlug === slug;
  });
  
  if (entry && entry.hasAudio) {
    return `/assets/cache/${entry.audioFile}`;
  }
  
  return null;
}

// ─── Check Online Status ───────────────────────────────

export function isOnline(): boolean {
  return navigator.onLine;
}

export function onOnlineChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
