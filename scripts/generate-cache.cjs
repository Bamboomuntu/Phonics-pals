/**
 * Pre-cache Asset Generator
 * 
 * Run ONCE from a machine with internet before deploying to USB / offline schools.
 * Generates TTS audio files for every word in the dictionary.
 * 
 * Usage:
 *   GEMINI_API_KEY=your_key node scripts/generate-cache.js
 * 
 * Optional flags:
 *   --skip-tts     Skip TTS generation (just update manifest)
 *   --force        Regenerate all files even if they exist
 */

const fs = require('fs');
const path = require('path');

// ─── Config ─────────────────────────────────────────────

const DICTIONARY_PATH = path.join(__dirname, '..', 'data', 'dictionary.ts');
const CACHE_DIR = path.join(__dirname, '..', 'public', 'assets', 'cache');
const AUDIO_DIR = path.join(CACHE_DIR, 'audio');
const MANIFEST_PATH = path.join(CACHE_DIR, 'manifest.json');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Parse args
const args = process.argv.slice(2);
const SKIP_TTS = args.includes('--skip-tts');
const FORCE = args.includes('--force');

// ─── Helpers ────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function extractDictionary() {
  // Read the dictionary.ts file and extract word entries
  const content = fs.readFileSync(DICTIONARY_PATH, 'utf-8');
  
  // Match WordEntry objects: { wordId, word, definition, ... lusoga }
  const entries = [];
  const regex = /\{ wordId:\s*'([^']+)',\s*word:\s*'([^']+)',\s*definition:\s*'([^']+)',[^}]+lusoga:\s*'([^']*)'/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    entries.push({
      wordId: match[1],
      word: match[2],
      definition: match[3],
      lusoga: match[4] || '',
    });
  }
  
  if (entries.length === 0) {
    console.error('ERROR: Could not parse dictionary.ts. Check the regex pattern.');
    process.exit(1);
  }
  
  console.log(`📖 Parsed ${entries.length} words from dictionary`);
  return entries;
}

function getCachedFiles(entries) {
  return entries.map(entry => {
    const slug = slugify(entry.word);
    return {
      ...entry,
      audioFile: `audio/${slug}.mp3`,
      audioPath: path.join(AUDIO_DIR, `${slug}.mp3`),
      exists: fs.existsSync(path.join(AUDIO_DIR, `${slug}.mp3`)),
    };
  });
}

async function generateTTS(word, text, language) {
  if (!GEMINI_API_KEY) {
    console.log(`  ⚠️  No GEMINI_API_KEY set. Skipping TTS for "${word}"`);
    return false;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`;
  
  const payload = {
    contents: [{ parts: [{ text: `Say the word clearly: "${text}"` }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`  ❌ HTTP ${response.status} for "${word}": ${err.slice(0, 100)}`);
      return false;
    }

    const data = await response.json();
    const audioPart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    
    if (!audioPart) {
      console.error(`  ❌ No audio in response for "${word}"`);
      return false;
    }

    // Decode base64 audio and save
    const audioBuffer = Buffer.from(audioPart.inlineData.data, 'base64');
    const slug = slugify(word);
    const outputPath = path.join(AUDIO_DIR, `${slug}.mp3`);
    fs.writeFileSync(outputPath, audioBuffer);
    
    console.log(`  ✅ "${word}" → ${(audioBuffer.length / 1024).toFixed(1)} KB`);
    return true;
  } catch (err) {
    console.error(`  ❌ Network error for "${word}": ${err.message}`);
    return false;
  }
}

async function buildManifest(words) {
  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    totalWords: words.length,
    words: words.map(w => ({
      wordId: w.wordId,
      word: w.word,
      hasAudio: w.exists,
      audioFile: w.audioFile,
    })),
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\n📋 Manifest written: ${MANIFEST_PATH}`);
  return manifest;
}

// ─── Main ───────────────────────────────────────────────

async function main() {
  console.log('🎵 Phonic Pals — Pre-cache Asset Generator\n');
  console.log(`Dictionary: ${DICTIONARY_PATH}`);
  console.log(`Cache dir:  ${CACHE_DIR}`);
  console.log(`Skip TTS:   ${SKIP_TTS}`);
  console.log(`Force:      ${FORCE}\n`);

  // Ensure directories exist
  fs.mkdirSync(AUDIO_DIR, { recursive: true });

  // Parse dictionary
  const entries = extractDictionary();
  const words = getCachedFiles(entries);

  // Count existing
  const existing = words.filter(w => w.exists).length;
  const missing = words.filter(w => !w.exists).length;
  console.log(`🎯 ${existing} cached, ${missing} missing\n`);

  // Generate TTS for missing words
  if (!SKIP_TTS) {
    const toGenerate = FORCE ? words : words.filter(w => !w.exists);
    
    if (toGenerate.length === 0) {
      console.log('✅ All words already cached. Use --force to regenerate.\n');
    } else {
      console.log(`🎤 Generating TTS for ${toGenerate.length} words...\n`);
      
      // Process in batches to avoid rate limits
      const BATCH_SIZE = 3;
      let success = 0;
      let fail = 0;
      
      for (let i = 0; i < toGenerate.length; i += BATCH_SIZE) {
        const batch = toGenerate.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
          batch.map(w => generateTTS(w.word, w.word, 'en'))
        );
        
        results.forEach(r => {
          if (r.status === 'fulfilled' && r.value) success++;
          else fail++;
        });
        
        console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(toGenerate.length / BATCH_SIZE)} complete`);
        
        // Brief pause between batches
        if (i + BATCH_SIZE < toGenerate.length) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }
      
      console.log(`\n📊 TTS: ${success} generated, ${fail} failed`);
    }
  }

  // Refresh file list and build manifest
  const finalWords = getCachedFiles(entries);
  await buildManifest(finalWords);

  const cached = finalWords.filter(w => w.exists).length;
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 FINAL: ${cached}/${finalWords.length} words cached`);
  console.log(`📁 Audio: ${AUDIO_DIR}`);
  console.log(`📋 Manifest: ${MANIFEST_PATH}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  if (cached < finalWords.length) {
    console.log('⚠️  Some words are missing audio. Run again with a GEMINI_API_KEY to generate them.\n');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
