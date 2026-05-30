
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WordEntry, Team, ArenaRound, TeacherVerdict, Topic } from '../types';

// ─── Props ──────────────────────────────────────────────

interface ArenaBattleProps {
  teams: [Team, Team];
  deck: WordEntry[];
  topic: Topic;
  onFinish: (finalTeams: [Team, Team], rounds: ArenaRound[]) => void;
}

type BattlePhase = 
  | 'TEAM_A_ENGLISH' 
  | 'TEAM_A_LUSOGA' 
  | 'TEAM_B_ENGLISH' 
  | 'TEAM_B_LUSOGA' 
  | 'UMPIRE' 
  | 'ROUND_TRANSITION'
  | 'COMPLETE';

interface RoundData {
  word: WordEntry;
  teamAEnglishScore: number | null;
  teamALusogaRecording: boolean;
  teamALusogaVerdict: TeacherVerdict;
  teamALusogaCorrection: string;
  teamBEnglishScore: number | null;
  teamBLusogaRecording: boolean;
  teamBLusogaVerdict: TeacherVerdict;
  teamBLusogaCorrection: string;
}

// ─── Component ──────────────────────────────────────────

export const ArenaBattle: React.FC<ArenaBattleProps> = ({ teams: initialTeams, deck, topic, onFinish }) => {
  const [teams, setTeams] = useState<[Team, Team]>(initialTeams);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [phase, setPhase] = useState<BattlePhase>('TEAM_A_ENGLISH');
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [roundNumber, setRoundNumber] = useState(1);

  // Scoring
  const [englishScore, setEnglishScore] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMicError, setIsMicError] = useState(false);

  // Umpire state
  const [teacherVerdict, setTeacherVerdict] = useState<TeacherVerdict>('pending');
  const [correctionText, setCorrectionText] = useState('');
  const [showCorrectionInput, setShowCorrectionInput] = useState(false);

  // Timing
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);

  // Audio state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentBlobUrlRef = useRef<string | null>(null);
  const listenerRef = useRef<((e: Event) => void) | null>(null);

  const currentWord = deck[currentWordIndex];
  const currentPhaseTeam = phase.startsWith('TEAM_A') ? teams[0] : teams[1];
  const isLusogaPhase = phase === 'TEAM_A_LUSOGA' || phase === 'TEAM_B_LUSOGA';
  const totalRounds = deck.length;

  // ─── Advance Phase Machine ────────────────────────────

  const advancePhase = useCallback(() => {
    setEnglishScore(null);
    setTeacherVerdict('pending');
    setCorrectionText('');
    setShowCorrectionInput(false);

    switch (phase) {
      case 'TEAM_A_ENGLISH':
        setPhase('TEAM_A_LUSOGA');
        break;
      case 'TEAM_A_LUSOGA':
        setPhase('TEAM_B_ENGLISH');
        break;
      case 'TEAM_B_ENGLISH':
        setPhase('TEAM_B_LUSOGA');
        break;
      case 'TEAM_B_LUSOGA':
        setPhase('UMPIRE');
        break;
      case 'UMPIRE':
        // Save round and move on
        setPhase('ROUND_TRANSITION');
        break;
    }
  }, [phase]);

  // ─── Complete Round ───────────────────────────────────

  const completeRound = useCallback(() => {
    // Find or create current round data
    const existing = [...rounds];
    const currentRound: RoundData = {
      word: currentWord,
      teamAEnglishScore: existing[currentWordIndex]?.teamAEnglishScore ?? null,
      teamALusogaRecording: existing[currentWordIndex]?.teamALusogaRecording ?? false,
      teamALusogaVerdict: existing[currentWordIndex]?.teamALusogaVerdict ?? 'pending',
      teamALusogaCorrection: existing[currentWordIndex]?.teamALusogaCorrection ?? '',
      teamBEnglishScore: existing[currentWordIndex]?.teamBEnglishScore ?? null,
      teamBLusogaRecording: existing[currentWordIndex]?.teamBLusogaRecording ?? false,
      teamBLusogaVerdict: existing[currentWordIndex]?.teamBLusogaVerdict ?? 'pending',
      teamBLusogaCorrection: existing[currentWordIndex]?.teamBLusogaCorrection ?? '',
    };
    existing[currentWordIndex] = currentRound;
    setRounds(existing);

    // Calculate scores for this round
    const teamAPoints = (currentRound.teamAEnglishScore !== null && currentRound.teamAEnglishScore >= 70 ? 3 : 
                         currentRound.teamAEnglishScore !== null && currentRound.teamAEnglishScore >= 50 ? 2 : 
                         currentRound.teamAEnglishScore !== null && currentRound.teamAEnglishScore >= 30 ? 1 : 0) 
                       + (currentRound.teamALusogaVerdict === 'correct' ? 3 : 0);
    const teamBPoints = (currentRound.teamBEnglishScore !== null && currentRound.teamBEnglishScore >= 70 ? 3 : 
                         currentRound.teamBEnglishScore !== null && currentRound.teamBEnglishScore >= 50 ? 2 : 
                         currentRound.teamBEnglishScore !== null && currentRound.teamBEnglishScore >= 30 ? 1 : 0) 
                       + (currentRound.teamBLusogaVerdict === 'correct' ? 3 : 0);

    setTeams(prev => [
      { ...prev[0], score: prev[0].score + teamAPoints },
      { ...prev[1], score: prev[1].score + teamBPoints },
    ]);

    // Next round or finish
    if (currentWordIndex < deck.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setRoundNumber(prev => prev + 1);
      // Show countdown then start
      setShowCountdown(true);
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowCountdown(false);
            setPhase('TEAM_A_ENGLISH');
            return 0;
          }
          return prev - 1;
        });
      }, 800);
    } else {
      setPhase('COMPLETE');
      setTimeout(() => {
        onFinish(teams, existing.map((r, idx) => ({
          word: r.word,
          teamARound: {
            word: r.word,
            englishScore: r.teamAEnglishScore,
            lusogaRecording: r.teamALusogaRecording,
            lusogaVerdict: r.teamALusogaVerdict,
            lusogaCorrectedWord: r.teamALusogaCorrection || undefined,
          },
          teamBRound: {
            word: r.word,
            englishScore: r.teamBEnglishScore,
            lusogaRecording: r.teamBLusogaRecording,
            lusogaVerdict: r.teamBLusogaVerdict,
            lusogaCorrectedWord: r.teamBLusogaCorrection || undefined,
          },
          roundNumber: idx + 1,
          complete: true,
        })));
      }, 1500);
    }
  }, [currentWordIndex, deck.length, phase, rounds, teams, currentWord, onFinish]);

  // ─── Scoring Helpers ──────────────────────────────────

  const getEnglishStars = (score: number | null) => {
    if (score === null) return { stars: 0, label: '' };
    if (score >= 80) return { stars: 3, label: 'Perfect!' };
    if (score >= 60) return { stars: 2, label: 'Good!' };
    if (score >= 40) return { stars: 1, label: 'Keep trying!' };
    return { stars: 0, label: 'Try again' };
  };

  const simulateEnglishScore = () => {
    // For scrap tech / offline mode: random score between 30-100
    // Real Gemini integration will replace this
    setIsAnalyzing(true);
    setTimeout(() => {
      const score = Math.floor(Math.random() * 60) + 40; // 40-100
      setEnglishScore(score);
      setIsAnalyzing(false);

      // Save to round data
      const existing = [...rounds];
      if (!existing[currentWordIndex]) {
        existing[currentWordIndex] = {
          word: currentWord,
          teamAEnglishScore: null, teamALusogaRecording: false, teamALusogaVerdict: 'pending', teamALusogaCorrection: '',
          teamBEnglishScore: null, teamBLusogaRecording: false, teamBLusogaVerdict: 'pending', teamBLusogaCorrection: '',
        };
      }
      if (phase === 'TEAM_A_ENGLISH') existing[currentWordIndex].teamAEnglishScore = score;
      else existing[currentWordIndex].teamBEnglishScore = score;
      setRounds(existing);
    }, 1500);
  };

  // ─── Recording ────────────────────────────────────────

  const startRecording = async () => {
    if (isRecording || isAnalyzing) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
      };
      setIsMicError(false);
      setIsRecording(true);
      recorder.start();
    } catch {
      setIsMicError(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);

    // Create blob URL for umpire playback
    if (audioChunksRef.current.length > 0) {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      currentBlobUrlRef.current = URL.createObjectURL(blob);
    }

    // Mark Lusoga as recorded
    const existing = [...rounds];
    if (!existing[currentWordIndex]) {
      existing[currentWordIndex] = {
        word: currentWord,
        teamAEnglishScore: null, teamALusogaRecording: false, teamALusogaVerdict: 'pending', teamALusogaCorrection: '',
        teamBEnglishScore: null, teamBLusogaRecording: false, teamBLusogaVerdict: 'pending', teamBLusogaCorrection: '',
      };
    }
    if (phase === 'TEAM_A_LUSOGA') existing[currentWordIndex].teamALusogaRecording = true;
    else if (phase === 'TEAM_B_LUSOGA') existing[currentWordIndex].teamBLusogaRecording = true;
    setRounds(existing);
  };

  // ─── Umpire Actions ───────────────────────────────────

  const handleUmpireCorrect = () => {
    setTeacherVerdict('correct');
  };

  const handleUmpireIncorrect = () => {
    setTeacherVerdict('incorrect');
    setShowCorrectionInput(true);
  };

  const submitCorrection = () => {
    const existing = [...rounds];
    if (!existing[currentWordIndex]) return;
    if (phase === 'UMPIRE') {
      existing[currentWordIndex].teamALusogaVerdict = teacherVerdict;
      existing[currentWordIndex].teamALusogaCorrection = correctionText;
    }
    setRounds(existing);
    // Move to round transition
    setPhase('ROUND_TRANSITION');
    setTimeout(completeRound, 800);
  };

  // ─── Keyboard Navigation (scrap tech) ─────────────────

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        if (!isRecording && !isAnalyzing && !isLusogaPhase) {
          startRecording();
        }
      }
      if (e.key === 'Enter' && !isRecording && englishScore !== null) {
        advancePhase();
      }
      // Teacher umpire shortcuts
      if (phase === 'UMPIRE') {
        if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          handleUmpireCorrect();
        }
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          if (!showCorrectionInput) handleUmpireIncorrect();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isRecording, isAnalyzing, isLusogaPhase, englishScore, advancePhase, phase, showCorrectionInput]);

  // ─── Cleanup ──────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (currentBlobUrlRef.current) URL.revokeObjectURL(currentBlobUrlRef.current);
    };
  }, []);

  // ─── Render: Countdown ────────────────────────────────

  if (showCountdown) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-yellow-50 to-orange-50">
        <motion.div
          key={countdown}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="text-9xl font-black text-blue-900"
        >
          {countdown}
        </motion.div>
        <p className="text-2xl font-bold text-blue-900/50 mt-4">Next word coming...</p>
      </div>
    );
  }

  // ─── Render: Umpire View ──────────────────────────────

  if (phase === 'UMPIRE') {
    const r = rounds[currentWordIndex];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-yellow-50">
        <div className="max-w-2xl w-full text-center">
          <div className="text-2xl font-black text-amber-600 uppercase tracking-widest mb-2">👩‍🏫 Teacher Umpire</div>
          <h2 className="text-3xl font-black text-blue-900 mb-2">Verify the Lusoga!</h2>
          <p className="text-blue-900/50 font-bold mb-8">Listen to each team. Is their Lusoga correct?</p>

          {/* Word + picture */}
          <div className="bg-white rounded-[3rem] p-8 border-b-8 border-amber-200 shadow-xl mb-8">
            <div className="text-7xl mb-4">🖼️</div>
            <div className="text-5xl font-black text-blue-900">{currentWord.word}</div>
            <div className="text-blue-900/40 font-bold text-lg mt-1">{currentWord.definition}</div>
            {currentWord.lusoga && (
              <div className="mt-4 bg-green-50 rounded-2xl p-4 border-2 border-green-200">
                <span className="text-sm font-black text-green-700 uppercase tracking-wider">Known Lusoga: </span>
                <span className="text-2xl font-bold text-green-800">{currentWord.lusoga}</span>
              </div>
            )}
            {!currentWord.lusoga && (
              <div className="mt-4 bg-yellow-50 rounded-2xl p-4 border-2 border-dashed border-yellow-300">
                <span className="text-sm font-black text-yellow-700 uppercase tracking-wider">No Lusoga on record — you decide!</span>
              </div>
            )}
          </div>

          {/* Team Attempts */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 rounded-[2rem] p-6 border-b-4 border-blue-200">
              <div className="text-3xl mb-2">{teams[0].emoji}</div>
              <div className="font-black text-blue-900 text-lg">{teams[0].name}</div>
              <div className="text-sm text-blue-900/50">
                English: {r?.teamAEnglishScore !== undefined && r?.teamAEnglishScore !== null ? `${r.teamAEnglishScore}%` : '—'}
              </div>
              <div className="text-sm text-blue-900/50">
                Lusoga: {r?.teamALusogaRecording ? '🎙️ Recorded' : '—'}
              </div>
            </div>
            <div className="bg-orange-50 rounded-[2rem] p-6 border-b-4 border-orange-200">
              <div className="text-3xl mb-2">{teams[1].emoji}</div>
              <div className="font-black text-blue-900 text-lg">{teams[1].name}</div>
              <div className="text-sm text-blue-900/50">
                English: {r?.teamBEnglishScore !== undefined && r?.teamBEnglishScore !== null ? `${r.teamBEnglishScore}%` : '—'}
              </div>
              <div className="text-sm text-blue-900/50">
                Lusoga: {r?.teamBLusogaRecording ? '🎙️ Recorded' : '—'}
              </div>
            </div>
          </div>

          {/* Playback button */}
          {currentBlobUrlRef.current && (
            <button
              onClick={() => {
                const audio = new Audio(currentBlobUrlRef.current!);
                audio.play();
              }}
              className="mb-6 bg-blue-100 hover:bg-blue-200 text-blue-700 px-8 py-4 rounded-[2rem] font-black text-lg border-b-4 border-blue-300 active:translate-y-1 transition-all shadow-md"
            >
              🔉 PLAY RECORDING
            </button>
          )}

          {/* Verdict Buttons */}
          {!showCorrectionInput ? (
            <div className="flex gap-6 justify-center">
              <button
                onClick={handleUmpireCorrect}
                className="bg-green-500 text-white px-12 py-8 rounded-[2rem] border-b-8 border-green-700 active:translate-y-2 active:border-b-0 transition-all shadow-xl hover:bg-green-400"
              >
                <div className="text-5xl mb-2">✅</div>
                <div className="font-black text-xl">CORRECT</div>
                <div className="text-sm opacity-70">Press Y</div>
              </button>
              <button
                onClick={handleUmpireIncorrect}
                className="bg-red-500 text-white px-12 py-8 rounded-[2rem] border-b-8 border-red-700 active:translate-y-2 active:border-b-0 transition-all shadow-xl hover:bg-red-400"
              >
                <div className="text-5xl mb-2">❌</div>
                <div className="font-black text-xl">INCORRECT</div>
                <div className="text-sm opacity-70">Press N</div>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] p-6 shadow-xl border-b-4 border-gray-200">
              <h3 className="font-black text-lg text-blue-900 mb-4">What was the correct Lusoga word?</h3>
              <input
                type="text"
                value={correctionText}
                onChange={(e) => setCorrectionText(e.target.value)}
                className="w-full text-2xl text-center font-bold text-blue-900 bg-blue-50 rounded-2xl p-4 border-2 border-blue-200 focus:border-blue-400 outline-none mb-4"
                placeholder="Type the correct Lusoga word..."
                autoFocus
              />
              <button
                onClick={submitCorrection}
                disabled={!correctionText.trim()}
                className="bg-blue-500 text-white px-10 py-4 rounded-2xl font-black text-xl active:translate-y-1 transition-all shadow-lg disabled:opacity-40"
              >
                SUBMIT & CONTINUE
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Render: Game In Progress ─────────────────────────

  const stars = getEnglishStars(englishScore);
  const isTeamA = phase.startsWith('TEAM_A');

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 bg-gradient-to-b from-blue-50 to-white">
      {/* Scoreboard Header */}
      <div className="grid grid-cols-3 gap-4 mb-6 shrink-0">
        <div className="bg-blue-500 text-white rounded-[2rem] p-4 text-center shadow-lg border-b-4 border-blue-700">
          <div className="text-2xl">{teams[0].emoji}</div>
          <div className="font-black text-sm md:text-lg truncate">{teams[0].name}</div>
          <div className="text-2xl md:text-3xl font-black mt-1">{teams[0].score}</div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="text-sm font-black text-blue-900/40 uppercase tracking-widest">Round</div>
          <div className="text-3xl font-black text-blue-900">{roundNumber}/{totalRounds}</div>
        </div>
        <div className="bg-orange-500 text-white rounded-[2rem] p-4 text-center shadow-lg border-b-4 border-orange-700">
          <div className="text-2xl">{teams[1].emoji}</div>
          <div className="font-black text-sm md:text-lg truncate">{teams[1].name}</div>
          <div className="text-2xl md:text-3xl font-black mt-1">{teams[1].score}</div>
        </div>
      </div>

      {/* Current Turn Banner */}
      <div className={`text-center mb-4 shrink-0 ${isTeamA ? 'text-blue-600' : 'text-orange-600'}`}>
        <div className="text-lg font-black uppercase tracking-widest">
          {isTeamA ? `${teams[0].emoji} ${teams[0].name}'s Turn` : `${teams[1].emoji} ${teams[1].name}'s Turn`}
        </div>
        <div className="text-sm font-bold opacity-50">
          {isLusogaPhase ? '🌍 Say it in Lusoga!' : '🔊 Say it in English!'}
        </div>
      </div>

      {/* Word Card */}
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          key={currentWordIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] p-6 md:p-10 border-b-8 border-gray-100 shadow-xl text-center max-w-lg w-full"
        >
          {/* Placeholder image */}
          <div className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-4 bg-blue-50 rounded-[2rem] flex items-center justify-center shadow-inner">
            <span className="text-6xl md:text-7xl opacity-60">
              {topic === 'Nature & Animals' ? '🌿' :
               topic === 'Science & Space' ? '🚀' :
               topic === 'History & Adventure' ? '🏰' :
               topic === 'Arts & Sports' ? '🎨' : '🏠'}
            </span>
          </div>

          <h2 className="text-5xl md:text-7xl font-black text-blue-900 tracking-tight uppercase leading-none mb-2">
            {currentWord.word}
          </h2>
          <p className="text-blue-900/40 font-bold text-sm mb-4">{currentWord.definition}</p>

          {/* Lusoga hint */}
          {isLusogaPhase && currentWord.lusoga && (
            <div className="bg-green-50 rounded-2xl p-3 border border-green-200 mb-4">
              <span className="text-xs font-black text-green-700 uppercase tracking-wider">Hint: </span>
              <span className="text-lg font-bold text-green-800">{currentWord.lusoga}</span>
              <span className="text-xs text-green-600 block">(But say it in your own words!)</span>
            </div>
          )}
          {isLusogaPhase && !currentWord.lusoga && (
            <div className="bg-yellow-50 rounded-2xl p-3 border-2 border-dashed border-yellow-300 mb-4">
              <span className="text-xs font-black text-yellow-700 uppercase tracking-wider">No known translation — you teach the AI!</span>
            </div>
          )}

          {/* Score Display */}
          {englishScore !== null && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-4"
            >
              <div className="text-4xl mb-1">
                {Array.from({ length: stars.stars }).map((_, i) => (
                  <span key={i}>⭐</span>
                ))}
              </div>
              <div className="text-lg font-black text-blue-900">{englishScore}%</div>
              <div className="text-sm font-bold text-blue-900/50">{stars.label}</div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Action Area */}
      <div className="shrink-0 mt-4 flex flex-col items-center gap-3">
        {/* Mic Error Modal */}
        <AnimatePresence>
          {isMicError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            >
              <div className="bg-white rounded-[2rem] p-8 max-w-sm text-center shadow-2xl">
                <div className="text-6xl mb-4">🎙️</div>
                <h3 className="text-2xl font-black text-blue-900 mb-2">Mic Error</h3>
                <p className="text-blue-900/60 font-bold mb-6">Please allow microphone access!</p>
                <button
                  onClick={() => setIsMicError(false)}
                  className="bg-blue-500 text-white px-10 py-4 rounded-2xl font-black"
                >
                  RETRY
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recording / Analyzing / Score states */}
        {isRecording && (
          <div className="text-center">
            <button
              onClick={stopRecording}
              className="bg-red-500 text-white w-28 h-28 md:w-36 md:h-36 rounded-full border-b-8 border-red-700 shadow-2xl active:translate-y-2 active:border-b-0 transition-all flex flex-col items-center justify-center animate-pulse"
            >
              <div className="text-4xl">⏹️</div>
              <div className="font-black text-sm mt-1">STOP</div>
            </button>
            <p className="text-red-500 font-bold mt-2">Recording... Press Space or tap to stop</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-blue-100 border-b-4 border-blue-300 flex items-center justify-center mx-auto">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="w-12 h-12 border-4 border-blue-400 border-t-blue-600 rounded-full"
              />
            </div>
            <p className="font-bold text-blue-900/50 mt-2">Analyzing pronunciation...</p>
          </div>
        )}

        {!isRecording && !isAnalyzing && englishScore === null && (
          <div className="text-center">
            <button
              onClick={isLusogaPhase ? startRecording : startRecording}
              className="bg-red-500 text-white w-28 h-28 md:w-36 md:h-36 rounded-full border-b-8 border-red-700 shadow-2xl active:translate-y-2 active:border-b-0 transition-all hover:bg-red-400 flex flex-col items-center justify-center"
            >
              <div className="text-4xl">🎤</div>
              <div className="font-black text-sm mt-1">
                {isLusogaPhase ? 'SAY IN LUSOGA' : 'SAY WORD'}
              </div>
            </button>
            <p className="text-blue-900/40 font-bold text-sm mt-2">Press SPACE or tap to record</p>
          </div>
        )}

        {englishScore !== null && (
          <button
            onClick={advancePhase}
            className="bg-blue-500 text-white px-10 py-4 rounded-2xl font-black text-xl border-b-4 border-blue-700 active:translate-y-1 shadow-lg hover:bg-blue-400 transition-all"
          >
            {isLusogaPhase ? 'NEXT →' : 'NEXT → LUSOGA'}
          </button>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 mt-4 shrink-0">
        {deck.slice(0, 8).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors ${
              i < currentWordIndex ? 'bg-blue-400' :
              i === currentWordIndex ? 'bg-blue-600 scale-125' :
              'bg-gray-200'
            }`}
          />
        ))}
        {deck.length > 8 && <span className="text-xs font-bold text-blue-900/30 ml-1">+{deck.length - 8}</span>}
      </div>
    </div>
  );
};
