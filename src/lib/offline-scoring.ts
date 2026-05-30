/**
 * Offline Scoring Engine
 * 
 * Uses the browser's built-in Web Speech API (SpeechRecognition) as a 
 * pronunciation assessment fallback when Gemini is unavailable.
 * 
 * How it works:
 * 1. Kid says the word into the microphone
 * 2. Browser's SpeechRecognition transcribes what it hears
 * 3. We compare the transcription to the expected word
 * 4. Score based on phonetic similarity (Levenshtein distance)
 * 
 * Less accurate than Gemini but works 100% offline.
 */

export interface OfflineScore {
  pronunciationScore: number;
  fluencyScore: number;
  feedback: string;
  coachingTip: string;
  transcribed: string;
}

// ─── Levenshtein Distance for phonetic comparison ──────

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,  // substitution
          matrix[i][j - 1] + 1,       // insertion
          matrix[i - 1][j] + 1        // deletion
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

function similarityScore(expected: string, actual: string): number {
  const dist = levenshteinDistance(
    expected.toLowerCase().trim(),
    actual.toLowerCase().trim()
  );
  const maxLen = Math.max(expected.length, actual.length);
  if (maxLen === 0) return 100;
  return Math.max(0, Math.round((1 - dist / maxLen) * 100));
}

// ─── Check if SpeechRecognition is available ───────────

export function isSpeechRecognitionAvailable(): boolean {
  const SpeechRecognition = (window as any).SpeechRecognition || 
                             (window as any).webkitSpeechRecognition;
  return !!SpeechRecognition;
}

// ─── Offline Pronunciation Assessment ──────────────────

export function assessPronunciation(expectedWord: string): Promise<OfflineScore> {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = (window as any).SpeechRecognition || 
                               (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      reject(new Error('SpeechRecognition not available in this browser'));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    recognition.onresult = (event: any) => {
      if (timeoutId) clearTimeout(timeoutId);
      
      const alternatives = event.results[0];
      const topResult = alternatives[0].transcript.trim();
      
      // Score based on similarity to expected word
      const score = similarityScore(expectedWord, topResult);
      
      let feedback: string;
      let coachingTip: string;
      
      if (score >= 90) {
        feedback = 'Excellent!';
        coachingTip = 'Perfect! Try the next word.';
      } else if (score >= 75) {
        feedback = 'Great try!';
        coachingTip = `Focus on the sounds: ${expectedWord}`;
      } else if (score >= 50) {
        feedback = 'Good effort!';
        coachingTip = `Listen to the word and try again: "${expectedWord}"`;
      } else {
        feedback = 'Keep practicing!';
        coachingTip = `The word is: "${expectedWord}". Break it into parts.`;
      }
      
      resolve({
        pronunciationScore: score,
        fluencyScore: Math.min(score + 5, 100),
        feedback,
        coachingTip,
        transcribed: topResult,
      });
    };

    recognition.onerror = (event: any) => {
      if (timeoutId) clearTimeout(timeoutId);
      
      if (event.error === 'no-speech') {
        resolve({
          pronunciationScore: 0,
          fluencyScore: 0,
          feedback: 'No speech detected',
          coachingTip: 'Speak clearly into the microphone',
          transcribed: '',
        });
      } else {
        reject(new Error(`SpeechRecognition error: ${event.error}`));
      }
    };

    recognition.onend = () => {
      if (timeoutId) clearTimeout(timeoutId);
    };

    // Safety timeout (shouldn't happen with no-speech handler, but just in case)
    timeoutId = setTimeout(() => {
      recognition.stop();
      resolve({
        pronunciationScore: 0,
        fluencyScore: 0,
        feedback: 'Timed out',
        coachingTip: 'Speak clearly into the microphone',
        transcribed: '',
      });
    }, 10000);

    recognition.start();
  });
}
