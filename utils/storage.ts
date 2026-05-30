/**
 * Phonic Pals — IndexedDB Storage Layer
 * Stores all approved local-language recordings with full metadata.
 * Exports as JSON manifest for data pipeline.
 */

const DB_NAME = 'PhonicPals';
const DB_VERSION = 1;
const RECORDINGS_STORE = 'recordings';
const SESSIONS_STORE = 'sessions';

let db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) { resolve(db); return; }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const d = (event.target as IDBOpenDBRequest).result;
      if (!d.objectStoreNames.contains(RECORDINGS_STORE)) {
        const store = d.createObjectStore(RECORDINGS_STORE, { keyPath: 'id' });
        store.createIndex('language', 'language', { unique: false });
        store.createIndex('sessionDate', 'sessionDate', { unique: false });
        store.createIndex('englishWord', 'englishWord', { unique: false });
      }
      if (!d.objectStoreNames.contains(SESSIONS_STORE)) {
        const s = d.createObjectStore(SESSIONS_STORE, { keyPath: 'id' });
        s.createIndex('date', 'date', { unique: false });
        s.createIndex('language', 'language', { unique: false });
      }
    };
    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db!);
    };
    request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
  });
}

export interface RecordingData {
  id: string;
  englishWord: string;
  translation: string;
  language: string;
  audioBase64: string;
  speakerAge: string;
  speakerGender?: string;
  school?: string;
  district?: string;
  sessionDate: string;
  approvedBy: string;
  stars: number;
}

export interface SessionData {
  id: string;
  date: string;
  topic: string;
  language: string;
  wordCount: number;
  englishStars: number;
  recordings: number;
  totalTime: number;
}

export async function saveRecording(recording: RecordingData): Promise<void> {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(RECORDINGS_STORE, 'readwrite');
    tx.objectStore(RECORDINGS_STORE).put(recording);
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject((e.target as IDBTransaction).error);
  });
}

export async function saveSession(session: SessionData): Promise<void> {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(SESSIONS_STORE, 'readwrite');
    tx.objectStore(SESSIONS_STORE).put(session);
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject((e.target as IDBTransaction).error);
  });
}

export async function getAllRecordings(): Promise<RecordingData[]> {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(RECORDINGS_STORE, 'readonly');
    const request = tx.objectStore(RECORDINGS_STORE).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject((e.target as IDBRequest).error);
  });
}

export async function getAllSessions(): Promise<SessionData[]> {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(SESSIONS_STORE, 'readonly');
    const request = tx.objectStore(SESSIONS_STORE).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject((e.target as IDBRequest).error);
  });
}

export async function getRecordingsByLanguage(language: string): Promise<RecordingData[]> {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(RECORDINGS_STORE, 'readonly');
    const index = tx.objectStore(RECORDINGS_STORE).index('language');
    const request = index.getAll(language);
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject((e.target as IDBRequest).error);
  });
}

export async function getTotalRecordingCount(): Promise<number> {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(RECORDINGS_STORE, 'readonly');
    const request = tx.objectStore(RECORDINGS_STORE).count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject((e.target as IDBRequest).error);
  });
}

export async function exportDataAsJson(): Promise<string> {
  const [recordings, sessions] = await Promise.all([
    getAllRecordings(),
    getAllSessions()
  ]);
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    appVersion: 'PhonicPals v1.0',
    totalRecordings: recordings.length,
    totalSessions: sessions.length,
    recordings,
    sessions
  }, null, 2);
}

export async function downloadExport(): Promise<void> {
  const json = await exportDataAsJson();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `phonic-pals-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function getCorpusStats(): Promise<{
  totalRecordings: number;
  totalSessions: number;
  uniqueLanguages: string[];
  uniqueWords: number;
  lastSessionDate: string | null;
}> {
  const [recordings, sessions] = await Promise.all([
    getAllRecordings(),
    getAllSessions()
  ]);
  const languages = new Set(recordings.map(r => r.language));
  const words = new Set(recordings.map(r => r.englishWord));
  const dates = sessions.map(s => s.date).sort();
  return {
    totalRecordings: recordings.length,
    totalSessions: sessions.length,
    uniqueLanguages: Array.from(languages),
    uniqueWords: words.size,
    lastSessionDate: dates.length > 0 ? dates[dates.length - 1] : null
  };
}
