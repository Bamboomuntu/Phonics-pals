/**
 * Offline-First Game Engine
 *
 * Unified bridge between online (Gemini) and offline modes.
 * Online  → Gemini TTS + image gen + AI assessment
 * Offline → Browser SpeechSynthesis (built-in) + SpeechRecognition
 *
 * Detection is automatic via navigator.onLine, but also exposes
 * a manual override for testing.
 */

import { GoogleGenAI, Type, Modality } from '@google/genai';
import { getCachedAudioUrl, isOnline } from './cache-manager';
import { assessPronunciation as offlineAssess, isSpeechRecognitionAvailable } from './offline-scoring';

// ─── Online/Offline Detection ──────────────────────────

let forcedOffline: boolean | null = null;

export function setOfflineForced(value: boolean | null) {
  forcedOffline = value;
}

export function getEffectiveOnline(): boolean {
  if (forcedOffline !== null) return !forcedOffline;
  return isOnline();
}

// ─── TTS (Word Playback) ───────────────────────────────

let outputAudioCtx: AudioContext | null = null;
let currentAudioSource: AudioBufferSourceNode | null = null;
let currentAudioListener: (() => void) | null = null;

export function stopAllSpeech() {
  // Stop Gemini/cached audio
  if (currentAudioSource) {
    try {
      currentAudioSource.stop();
      currentAudioSource.onended = null;
    } catch (_) {}
    currentAudioSource = null;
  }
  if (currentAudioListener) {
    currentAudioListener();
    currentAudioListener = null;
  }
  // Stop browser SpeechSynthesis
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Play a word aloud.
 * Online  → Gemini TTS (high quality)
 * Offline → Browser SpeechSynthesis (built-in, works everywhere)
 * Falls back to cached MP3 if SpeechSynthesis is unavailable.
 * Returns a promise that resolves when playback finishes or fails.
 */
export async function speakWord(
  word: string,
  voice: string = 'Kore'
): Promise<void> {
  stopAllSpeech();

  if (getEffectiveOnline()) {
    // ── Online: Gemini TTS ──
    if (!outputAudioCtx) {
      outputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return speakWithGemini(word, voice, outputAudioCtx);
  } else {
    // ── Offline: browser SpeechSynthesis ──
    return speakWithBrowser(word);
  }
}

async function speakWithGemini(
  text: string,
  voice: string,
  ctx: AudioContext
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const nuancedPrompt = `Instruction: Use a very friendly, excited, and cheerful female tone. Speak with high energy like an encouraging coach. Pitch: 1.2, Rate: 0.9. Say this word clearly: "${text}"`;

      ai.models
        .generateContent({
          model: 'gemini-2.5-flash-preview-tts',
          contents: [{ parts: [{ text: nuancedPrompt }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice },
              },
            },
          },
        })
        .then((response) => {
          const base64Audio =
            response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (!base64Audio) {
            resolve();
            return;
          }

          // Decode and play
          const binaryString = atob(base64Audio);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const dataInt16 = new Int16Array(bytes.buffer);
          const frameCount = dataInt16.length;
          const buffer = ctx.createBuffer(1, frameCount, 24000);
          const channelData = buffer.getChannelData(0);
          for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i] / 32768.0;
          }

          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.onended = () => resolve();
          currentAudioSource = source;
          source.start();
        })
        .catch((err) => {
          console.error('Gemini TTS error:', err);
          resolve(); // fail silently — just don't play
        });
    } catch (err) {
      console.error('Gemini TTS init error:', err);
      resolve();
    }
  });
}

async function playCachedAudio(word: string, ctx: AudioContext): Promise<void> {
  const audioUrl = getCachedAudioUrl(word);

  if (!audioUrl) {
    console.log(`📦 No cached audio for "${word}" — skipping`);
    return;
  }

  try {
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    return new Promise((resolve) => {
      source.onended = () => resolve();
      currentAudioSource = source;
      source.start();
    });
  } catch (err) {
    console.error(`📦 Cached audio error for "${word}":`, err);
  }
}

/**
 * Speak a word using the browser's built-in SpeechSynthesis API.
 * Works 100% offline in Chrome, Edge, Safari, Firefox.
 */
function speakWithBrowser(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      console.warn('SpeechSynthesis not available in this browser');
      resolve(); // fail silently
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1.1;

    // Try to find a good female English voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
    ) || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve(); // don't block on errors

    window.speechSynthesis.speak(utterance);
  });
}

export { speakWithBrowser };

// ─── Image Generation ──────────────────────────────────

export async function generateWordImage(
  word: string,
  definition: string
): Promise<string | null> {
  if (!getEffectiveOnline()) {
    return null; // offline — no image
  }

  const cacheKey = `phonic_pal_img_${word.toLowerCase().replace(/\s/g, '_')}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const fixedStyleBlock =
      "A cheerful, friendly cartoon illustration in a children's picture book style. Thick outlines, bright primary colors, and simple shapes. The background must be uncluttered and simple so the subject is clear. No realistic photos.";

    const wordLower = word.toLowerCase();
    let dynamicContext = '';

    if (wordLower === 'archaeologist') {
      dynamicContext =
        'A cute cartoon archaeologist wearing a big hat, smiling while happily digging up a shiny dinosaur bone in the sand with a small shovel.';
    } else if (wordLower === 'photosynthesis') {
      dynamicContext =
        'A happy cartoon flower with a smiling face, soaking up bright yellow sun rays, with little green energy sparkles around its leaves.';
    } else if (wordLower === 'gravity') {
      dynamicContext =
        "A funny cartoon apple falling from a tree and bouncing off a cute teddy bear's head.";
    } else if (wordLower === 'skeleton') {
      dynamicContext =
        'A friendly, dancing cartoon skeleton with a big smile, making a funny pose.';
    } else if (wordLower === 'galaxy') {
      dynamicContext =
        'A swirling, colorful purple and blue galaxy with happy little stars twinkling and smiling.';
    } else if (
      ['nutrition', 'protein', 'vitamin'].includes(wordLower)
    ) {
      dynamicContext =
        'Strong cartoon vegetables with tiny hero capes and big smiles, looking very healthy and powerful.';
    } else {
      dynamicContext = `A cute and happy cartoon version of ${wordLower}. ${definition}`;
    }

    const prompt = `${dynamicContext} Style: ${fixedStyleBlock}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: '1:1',
        },
      },
    });

    let foundImage: string | null = null;
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        foundImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (foundImage) {
      try {
        localStorage.setItem(cacheKey, foundImage);
      } catch {
        // Clear old cache if quota exceeded
        Object.keys(localStorage)
          .filter((k) => k.startsWith('phonic_pal_img_'))
          .forEach((k) => localStorage.removeItem(k));
        try {
          localStorage.setItem(cacheKey, foundImage);
        } catch {}
      }
    }

    return foundImage;
  } catch (error) {
    console.error('Image Gen Error:', error);
    return null;
  }
}

// ─── Pronunciation Assessment ──────────────────────────

export interface AssessmentResult {
  pronunciationScore: number;
  fluencyScore: number;
  feedback: string;
  coachingTip: string;
}

export async function assessPronunciation(
  word: string,
  audioBlob: Blob
): Promise<AssessmentResult> {
  if (getEffectiveOnline()) {
    try {
      return await onlineAssessment(word, audioBlob);
    } catch (err) {
      console.error('Online assessment failed, falling back to offline:', err);
      // fall through to offline
    }
  }

  return offlineAssessment(word);
}

async function onlineAssessment(
  word: string,
  blob: Blob
): Promise<AssessmentResult> {
  const reader = new FileReader();
  const base64Audio = await new Promise<string>((resolve, reject) => {
    reader.onloadend = () => {
      const result = (reader.result as string).split(',')[1];
      if (result) resolve(result);
      else reject(new Error('Failed to read audio data'));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          text: `Evaluate the child's pronunciation of: "${word}". Be encouraging but precise. Return JSON: { pronunciationScore (0-100), fluencyScore (0-100), feedback (2-3 word enthusiastic phrase), coachingTip (One short, natural tip) }`,
        },
        {
          inlineData: { mimeType: 'audio/webm', data: base64Audio },
        },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          pronunciationScore: { type: Type.NUMBER },
          fluencyScore: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          coachingTip: { type: Type.STRING },
        },
        required: ['pronunciationScore', 'fluencyScore', 'feedback', 'coachingTip'],
      },
    },
  });

  return JSON.parse(response.text || '{}') as AssessmentResult;
}

async function offlineAssessment(word: string): Promise<AssessmentResult> {
  if (!isSpeechRecognitionAvailable()) {
    return {
      pronunciationScore: 0,
      fluencyScore: 0,
      feedback: 'Offline mode',
      coachingTip: 'Speech recognition not available in this browser. Try Chrome.',
    };
  }

  try {
    const score = await offlineAssess(word);

    let feedback: string;
    let coachingTip: string;

    if (score.pronunciationScore >= 90) {
      feedback = 'Excellent!';
      coachingTip = 'Perfect! Try the next word.';
    } else if (score.pronunciationScore >= 75) {
      feedback = 'Great try!';
      coachingTip = `Focus on the sounds: ${word}`;
    } else if (score.pronunciationScore >= 50) {
      feedback = 'Good effort!';
      coachingTip = `Listen to the word and try again: "${word}"`;
    } else {
      feedback = 'Keep practicing!';
      coachingTip = `The word is: "${word}". Break it into parts.`;
    }

    return {
      pronunciationScore: score.pronunciationScore,
      fluencyScore: score.fluencyScore,
      feedback,
      coachingTip,
    };
  } catch (err) {
    return {
      pronunciationScore: 0,
      fluencyScore: 0,
      feedback: 'Error',
      coachingTip: 'Could not analyze speech. Try again.',
    };
  }
}
