
import React, { useState, useEffect, useRef } from 'react';
import { WordEntry, Topic } from '../types';
import { GameButton } from '../components/GameButton';
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';
import { playStarSound, playPop, decodeBase64, decodeAudioData } from '../utils/audio';

interface GameViewProps {
  deck: WordEntry[];
  topic: Topic;
  onFinish: (totalStars: number, struggledWords: WordEntry[]) => void;
}

interface AssessmentResult {
  pronunciationScore: number;
  fluencyScore: number;
  feedback: string;
  coachingTip: string;
}

const VOICES = {
  TEACHER: 'Kore', 
  COACH: 'Kore',  
};

/**
 * Prompt Constructor Function
 * Ensures a consistent, kid-friendly cartoon style across all generated images.
 */
const generateImagePrompt = (word: string, definition: string): string => {
  const fixedStyleBlock = "A cheerful, friendly cartoon illustration in a children's picture book style. Thick outlines, bright primary colors, and simple shapes. The background must be uncluttered and simple so the subject is clear. No realistic photos.";
  
  // Logic for dynamic context based on word/definition
  let sceneContext = `A cute and happy ${word}. ${definition}`;
  
  // Custom logic for trickier abstract words
  const lowercaseWord = word.toLowerCase();
  if (lowercaseWord.includes('archaeologist')) {
    sceneContext = "A cute cartoon archaeologist wearing a big hat, smiling while happily digging up a shiny dinosaur bone in the sand with a small shovel.";
  } else if (lowercaseWord.includes('photosynthesis')) {
    sceneContext = "A happy cartoon flower with a smiling face, soaking up bright yellow sun rays, with little green energy sparkles around its leaves.";
  } else if (lowercaseWord.includes('gravity')) {
    sceneContext = "A funny cartoon apple falling from a tree and bouncing off a cute teddy bear's head.";
  } else if (lowercaseWord.includes('discovery')) {
    sceneContext = "A happy kid explorer finding a shiny golden key hidden behind a colorful bush.";
  } else if (lowercaseWord.includes('rhythm')) {
    sceneContext = "A group of happy musical notes with faces, bouncing and dancing together on a musical staff.";
  } else if (lowercaseWord.includes('nutrition') || lowercaseWord.includes('vitamin')) {
    sceneContext = "Bright and happy anthropomorphic vegetables like a smiling broccoli and carrot wearing tiny hero capes.";
  }

  return `${sceneContext} Style: ${fixedStyleBlock}`;
};

export const GameView: React.FC<GameViewProps> = ({ deck, topic, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [sessionStars, setSessionStars] = useState<number>(0);
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set());
  const [struggledWords, setStruggledWords] = useState<WordEntry[]>([]);
  const [micError, setMicError] = useState(false);
  const [showDefinition, setShowDefinition] = useState(false);
  const [isStartingMic, setIsStartingMic] = useState(false);
  
  // Image Generation States
  const [wordImage, setWordImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  const currentWord = deck[currentIndex];

  const calculateStars = (score: number) => {
    if (score >= 94) return 3;
    if (score >= 88) return 2.5;
    if (score >= 78) return 2;
    return 1;
  };

  const stopAllSpeech = () => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
        currentSourceRef.current.onended = null;
      } catch(e) {}
      currentSourceRef.current = null;
    }
    setIsSpeaking(false);
  };

  const fetchWordImage = async (word: string, definition: string) => {
    const cacheKey = `phonic_pal_img_${word.toLowerCase().replace(/\s/g, '_')}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      setWordImage(cached);
      return;
    }

    setIsGeneratingImage(true);
    setWordImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = generateImagePrompt(word, definition);
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      let foundImage = null;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          foundImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (foundImage) {
        setWordImage(foundImage);
        try {
          localStorage.setItem(cacheKey, foundImage);
        } catch (e) {
          // If storage is full, clear it and try again or just skip caching
          console.warn("Storage full, clearing Phonic Pal cache...");
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('phonic_pal_img_')) localStorage.removeItem(key);
          });
          localStorage.setItem(cacheKey, foundImage);
        }
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const speakWithAI = async (text: string, instruction: string = "Speak clearly", voice: string = VOICES.TEACHER) => {
    stopAllSpeech();
    setIsSpeaking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const nuancedPrompt = `Instruction: Use a very friendly, excited, and cheerful female tone. Speak with high energy like an encouraging coach. Pitch: 1.2, Rate: 0.9. ${instruction}: "${text}"`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: nuancedPrompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!outputAudioCtxRef.current) {
          outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = outputAudioCtxRef.current;
        const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsSpeaking(false);
        currentSourceRef.current = source;
        source.start();
      } else {
        setIsSpeaking(false);
      }
    } catch (e) {
      console.error("Gemini TTS Error:", e);
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    if (currentWord) {
      setResult(null);
      setShowDefinition(false);
      stopAllSpeech();
      
      // Fetch visual context
      fetchWordImage(currentWord.word, currentWord.definition);

      const timer = setTimeout(() => {
        speakWithAI(currentWord.word, "Say this word clearly with an excited, warm female coach's voice");
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (result) {
      const starsCount = calculateStars(result.pronunciationScore);
      for (let i = 0; i < Math.ceil(starsCount); i++) {
        setTimeout(() => playStarSound(i), i * 120 + 200);
      }
      const spokenFeedback = `${result.feedback}. ${result.coachingTip}`;
      setTimeout(() => speakWithAI(spokenFeedback, "Give this feedback with a super excited and encouraging female coach's voice", VOICES.COACH), 800);
    }
  }, [result]);

  const startRecording = async () => {
    if (isStartingMic || isRecording || isAnalyzing) return;
    setIsStartingMic(true);
    stopAllSpeech();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        analyzePronunciation(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      setMicError(false);
      setIsRecording(true);
      setIsStartingMic(false);
      setRecordingTime(3);
      setResult(null);
      mediaRecorder.start();
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setMicError(true);
      setIsStartingMic(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  const analyzePronunciation = async (blob: Blob) => {
    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { text: `Evaluate the child's pronunciation of: "${currentWord.word}". Be encouraging but precise. Return JSON: { pronunciationScore (0-100), fluencyScore (0-100), feedback (2-3 word enthusiastic phrase), coachingTip (One short, natural tip) }` },
              { inlineData: { mimeType: 'audio/webm', data: base64Audio } }
            ]
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                pronunciationScore: { type: Type.NUMBER },
                fluencyScore: { type: Type.NUMBER },
                feedback: { type: Type.STRING },
                coachingTip: { type: Type.STRING }
              },
              required: ['pronunciationScore', 'fluencyScore', 'feedback', 'coachingTip']
            }
          }
        });
        const data = JSON.parse(response.text || '{}') as AssessmentResult;
        setResult(data);
        setIsAnalyzing(false);
      };
    } catch (err) {
      setIsAnalyzing(false);
    }
  };

  const handleNextWord = () => {
    const score = result ? result.pronunciationScore : 0;
    const stars = calculateStars(score);
    if (score < 88) setStruggledWords(prev => [...prev, currentWord]);
    const nextStarsTotal = sessionStars + stars;
    setSessionStars(nextStarsTotal);
    setCompletedWords(prev => new Set(prev).add(currentIndex));
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish(nextStarsTotal, score < 88 ? [...struggledWords, currentWord] : struggledWords);
    }
  };

  const colors = (() => {
    switch(topic) {
        case 'Nature & Animals': return { bg: 'bg-emerald-500', text: 'text-emerald-900', light: 'bg-emerald-50', border: 'border-emerald-700', iconBg: 'bg-emerald-100' };
        case 'Science & Space': return { bg: 'bg-indigo-500', text: 'text-indigo-900', light: 'bg-indigo-50', border: 'border-indigo-700', iconBg: 'bg-indigo-100' };
        case 'Arts & Sports': return { bg: 'bg-pink-500', text: 'text-pink-900', light: 'bg-pink-50', border: 'border-pink-700', iconBg: 'bg-pink-100' };
        case 'History & Adventure': return { bg: 'bg-orange-500', text: 'text-orange-900', light: 'bg-orange-50', border: 'border-orange-700', iconBg: 'bg-orange-100' };
        case 'Daily Life': return { bg: 'bg-amber-500', text: 'text-amber-900', light: 'bg-amber-50', border: 'border-amber-700', iconBg: 'bg-amber-100' };
        default: return { bg: 'bg-blue-500', text: 'text-blue-900', light: 'bg-blue-50', border: 'border-blue-700', iconBg: 'bg-blue-100' };
    }
  })();

  if (!currentWord) return null;

  return (
    <div className="w-full h-full max-w-6xl flex flex-col items-center px-4 md:px-8 overflow-y-auto min-h-screen py-4 scrollbar-hide">
      <AnimatePresence>
        {micError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6">
            <div className="bg-white rounded-[3rem] p-10 max-w-md text-center shadow-2xl border-b-[12px] border-blue-100">
                <div className="text-8xl mb-6">🎙️</div>
                <h3 className="text-3xl font-black text-blue-900 mb-6 uppercase tracking-tight">Mic Error</h3>
                <p className="mb-8 text-blue-900/60 font-bold">Please allow microphone access to start playing!</p>
                <GameButton color="blue" onClick={() => setMicError(false)}>RETRY</GameButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar */}
      <div className="w-full shrink-0 flex items-center justify-between px-2 gap-8 mb-6 mt-2">
        <div className="flex-1 flex flex-col gap-1.5 max-w-sm">
            <div className="flex justify-between items-center px-1">
                <span className="font-black text-blue-900/20 uppercase tracking-[0.2em] text-[10px]">Challenge Progress</span>
                <span className="font-black text-blue-900/40 text-[10px] tracking-tight">{completedWords.size} / {deck.length}</span>
            </div>
            <div className="w-full h-2.5 bg-white rounded-full border border-blue-50 shadow-inner overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(completedWords.size / deck.length) * 100}%` }} className={`h-full ${colors.bg} transition-all duration-700 ease-out`} />
            </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-blue-50 shadow-sm">
                <span className="text-xl">⭐</span>
                <span className="font-black text-blue-900 text-xl tracking-tighter">{sessionStars}</span>
            </div>
            <button onClick={() => onFinish(sessionStars, struggledWords)} className="text-blue-900/30 font-black hover:text-blue-900/50 transition-colors uppercase text-[10px] tracking-[0.2em] ml-2">Quit</button>
        </div>
      </div>

      {/* Main Experience Arena */}
      <div className="relative w-full flex-1 flex flex-col items-center justify-start gap-8 mb-8">
        
        {/* The Card */}
        <div className={`w-full max-w-4xl min-h-[500px] md:min-h-[600px] ${colors.light} rounded-[3rem] md:rounded-[4rem] border-b-[12px] md:border-b-[16px] ${colors.border} shadow-2xl flex flex-col items-center justify-between p-6 md:p-10 text-center relative overflow-hidden transition-colors duration-500`}>
          
          {/* Top: Word, Image & Definition Area */}
          <div className="flex flex-col items-center justify-center flex-1 w-full gap-4 relative z-10">
            
            {/* Visual Flashcard Image */}
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-[2.5rem] bg-white shadow-lg border-4 border-white overflow-hidden relative mb-4">
              <AnimatePresence mode="wait">
                {isGeneratingImage ? (
                  <motion.div 
                    key="spinner"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50/30 p-4"
                  >
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4" />
                    <span className="text-blue-900/40 font-black text-[10px] uppercase tracking-widest animate-pulse">Drawing word...</span>
                  </motion.div>
                ) : wordImage ? (
                  <motion.img 
                    key="image"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={wordImage}
                    alt={currentWord.word}
                    className="w-full h-full object-cover select-none"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <span className="text-6xl grayscale opacity-20">🎨</span>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col items-center gap-4 w-full">
                <motion.h3 
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`text-6xl md:text-8xl font-black ${colors.text} tracking-tight uppercase leading-none break-words w-full px-4 drop-shadow-sm select-none`}
                >
                {currentWord.word}
                </motion.h3>
                
                <div className="flex gap-4 items-center">
                  <button 
                      onClick={() => { setShowDefinition(!showDefinition); playPop(); }} 
                      className={`bg-white w-12 h-12 rounded-full shadow-lg border-b-4 border-gray-100 flex items-center justify-center hover:scale-110 active:scale-95 transition-all ${showDefinition ? 'ring-4 ring-yellow-400 bg-yellow-50' : ''}`}
                  >
                      <span className="text-xl">📖</span>
                  </button>
                  <button 
                      onClick={() => speakWithAI(currentWord.word, "Say this word clearly like a cheerful female coach")} 
                      disabled={isSpeaking || isRecording} 
                      className={`bg-white w-16 h-16 rounded-full shadow-xl border-b-4 border-gray-100 flex items-center justify-center hover:scale-110 active:scale-95 transition-all ${isSpeaking ? 'animate-pulse ring-4 ring-pink-300' : ''}`}
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${colors.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                  </button>
                  <button 
                      onClick={() => speakWithAI(currentWord.word, "Say this word very slowly and clearly", VOICES.TEACHER)} 
                      disabled={isSpeaking || isRecording} 
                      className={`bg-white w-12 h-12 rounded-full shadow-lg border-b-4 border-gray-100 flex items-center justify-center hover:scale-110 active:scale-95 transition-all ${isSpeaking ? 'opacity-50' : ''}`}
                  >
                      <span className="text-xl">🐢</span>
                  </button>
                </div>
            </div>

            <AnimatePresence>
              {showDefinition && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 15 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.9, y: 15 }} 
                    className="w-full max-w-sm"
                >
                  <div className="bg-white p-4 rounded-[1.5rem] shadow-xl border-2 border-blue-50 relative">
                    <p className="text-blue-900/70 text-sm font-bold italic leading-relaxed">"{currentWord.definition}"</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom: Recording & Feedback */}
          <div className="w-full flex flex-col items-center gap-4 relative z-10 shrink-0 mt-4">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div key="controls" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-4">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isAnalyzing || isStartingMic}
                    className={`
                      relative w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center transition-all duration-75
                      ${isRecording ? 'bg-red-600 scale-105 shadow-[0_0_60px_rgba(239,68,68,0.4)]' : 'bg-red-500 hover:bg-red-400'}
                      border-b-[10px] md:border-b-[16px] border-red-800 shadow-2xl active:border-b-0 active:translate-y-2 
                      ${isAnalyzing || isStartingMic ? 'opacity-50 cursor-wait' : ''}
                    `}
                  >
                    <AnimatePresence>
                        {isRecording && <motion.div initial={{ opacity: 0, scale: 1 }} animate={{ opacity: [0.4, 0], scale: 2.2 }} transition={{ duration: 1, repeat: Infinity }} className="absolute inset-0 rounded-full border-4 border-red-400/50" />}
                    </AnimatePresence>
                    
                    {isRecording ? (
                      <div className="flex items-center justify-center gap-2 h-14">
                        {[0, 1, 2, 3, 4].map((i) => <motion.div key={i} animate={{ height: [12, 54, 18, 44, 12] }} transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.08 }} className="w-2.5 bg-white rounded-full" />)}
                      </div>
                    ) : isStartingMic || isAnalyzing ? (
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>
                    )}
                    {isRecording && <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-lg border-4 border-white">{recordingTime}</div>}
                  </button>
                  <span className={`font-black uppercase tracking-[0.3em] text-[10px] ${isRecording ? 'text-red-600 animate-pulse' : 'text-blue-900/30'}`}>
                    {isRecording ? 'Now Listening...' : isAnalyzing ? 'Coach is Thinking...' : 'Tap To Practice'}
                  </span>
                </motion.div>
              ) : (
                <motion.div key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4 w-full max-w-2xl px-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex gap-1.5">
                        {Array.from({length: 3}).map((_, i) => (
                            <span key={i} className="text-3xl md:text-4xl">{calculateStars(result.pronunciationScore) >= i + 1 ? '⭐' : '☆'}</span>
                        ))}
                    </div>
                    <h4 className={`text-xl font-black uppercase tracking-tight ${result.pronunciationScore >= 88 ? 'text-green-600' : 'text-blue-600'}`}>{result.feedback}</h4>
                  </div>

                  <div className="bg-white/80 px-6 py-4 rounded-[2rem] border-2 border-dashed border-blue-100 shadow-sm w-full flex items-start gap-4">
                      <span className="text-2xl animate-bounce shrink-0 mt-1">💬</span>
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-black text-blue-900/30 uppercase tracking-[0.2em] mb-1">Coach Tip</span>
                        <p className="text-sm font-black text-blue-900 italic leading-snug">"{result.coachingTip}"</p>
                      </div>
                  </div>

                  <div className="flex gap-4 w-full">
                    <button onClick={() => setResult(null)} className="flex-1 bg-white py-4 rounded-[1.5rem] border-b-8 border-gray-100 font-black text-lg text-blue-600 active:translate-y-2 active:border-b-0 transition-all shadow-lg uppercase tracking-wider">Retry</button>
                    <button onClick={handleNextWord} className={`flex-1 ${result.pronunciationScore >= 88 ? 'bg-green-500 border-green-700' : 'bg-blue-500 border-blue-700'} py-4 rounded-[1.5rem] border-b-8 font-black text-lg text-white active:translate-y-2 active:border-b-0 transition-all shadow-lg uppercase tracking-widest`}>
                      {currentIndex === deck.length - 1 ? 'Finish' : 'Got it!'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Abstract Decorations */}
          <div className="absolute top-[-50%] left-[-20%] w-[140%] h-[140%] bg-white/5 rounded-full blur-[100px] pointer-events-none select-none"></div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex gap-4 w-full max-w-4xl shrink-0 pb-6 mt-auto relative z-20">
        <button onClick={() => { if (currentIndex > 0) setCurrentIndex(prev => prev - 1); }} disabled={currentIndex === 0 || isRecording || isAnalyzing} className={`flex-1 py-4 rounded-[2rem] font-black text-sm transition-all ${currentIndex === 0 || isRecording || isAnalyzing ? 'bg-gray-100 text-gray-300 border-b-4 border-gray-200' : 'bg-white text-blue-600 border-b-4 border-blue-50 hover:bg-blue-50 active:translate-y-1 active:border-b-0 shadow-md uppercase tracking-widest'}`}>Previous</button>
        <button onClick={() => { if (currentIndex < deck.length - 1) setCurrentIndex(prev => prev + 1); else onFinish(sessionStars, struggledWords); }} disabled={isRecording || isAnalyzing} className={`flex-1 py-4 rounded-[2rem] font-black text-sm transition-all bg-blue-500 text-white border-b-4 border-blue-700 hover:bg-blue-600 active:translate-y-1 active:border-b-0 shadow-md uppercase tracking-widest ${isRecording || isAnalyzing ? 'opacity-50 pointer-events-none' : ''}`}>
          {currentIndex === deck.length - 1 ? 'End Lesson' : 'Skip Word'}
        </button>
      </div>
    </div>
  );
};
