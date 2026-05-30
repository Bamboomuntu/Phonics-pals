
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WordEntry, Team, Topic, TeacherVerdict } from '../types';

// ─── Types ──────────────────────────────────────────────

interface RapidFireProps {
  teams: [Team, Team];
  deck: WordEntry[];
  topic: Topic;
  onFinish: (finalTeams: [Team, Team], stats: RapidStats) => void;
}

export interface RapidStats {
  totalRounds: number;
  correctFirstTry: number;
  correctSteal: number;
  timeouts: number;
  lusogaAnswers: number;
  englishAnswers: number;
  lusogaTeacherVerified: number;
  collectedWords: { english: string; lusogaAttempt: string; corrected?: string; verified: boolean }[];
}

type Direction = 'ENGLISH_TO_LUSOGA' | 'LUSOGA_TO_ENGLISH';

type RapidPhase =
  | 'SHOW_CHALLENGE'     // word + direction revealed
  | 'COUNTDOWN'           // 5...4...3...2...1 kid speaks
  | 'JUDGING'            // waiting for AI/Teacher
  | 'RESULT'             // show correct/incorrect
  | 'STEAL_COUNTDOWN'    // other team gets 3 seconds
  | 'STEAL_JUDGING'      // waiting for steal result
  | 'STEAL_RESULT'       // show steal result
  | 'TURN_COMPLETE'      // between turns
  | 'GAME_COMPLETE';

// ─── Component ──────────────────────────────────────────

export const RapidFire: React.FC<RapidFireProps> = ({ teams: initialTeams, deck, topic, onFinish }) => {
  const [teams, setTeams] = useState<[Team, Team]>(initialTeams);
  const [currentTeamIdx, setCurrentTeamIdx] = useState<0 | 1>(0);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [direction, setDirection] = useState<Direction>('ENGLISH_TO_LUSOGA');
  const [phase, setPhase] = useState<RapidPhase>('SHOW_CHALLENGE');
  const [countdown, setCountdown] = useState(5);
  const [countdownActive, setCountdownActive] = useState(false);

  // Answers
  const [englishScore, setEnglishScore] = useState<number | null>(null);
  const [lusogaVerdict, setLusogaVerdict] = useState<TeacherVerdict>('pending');
  const [lusogaCorrection, setLusogaCorrection] = useState('');
  const [showCorrection, setShowCorrection] = useState(false);
  const [stealActive, setStealActive] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [roundPoints, setRoundPoints] = useState(0);

  // Recording
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [micError, setMicError] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentBlobUrlRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownBarRef = useRef<HTMLDivElement>(null);

  // Stats
  const [stats, setStats] = useState<RapidStats>({
    totalRounds: 0, correctFirstTry: 0, correctSteal: 0, timeouts: 0,
    lusogaAnswers: 0, englishAnswers: 0, lusogaTeacherVerified: 0,
    collectedWords: [],
  });

  const currentWord = deck[currentWordIdx] || deck[0];
  const currentTeam = teams[currentTeamIdx];
  const otherTeam = teams[currentTeamIdx === 0 ? 1 : 0];
  const totalWords = Math.min(deck.length, 12); // max 12 rounds

  // ─── Challenge Generation ────────────────────────────

  const generateChallenge = useCallback(() => {
    // Random direction — 50/50
    const dir: Direction = Math.random() < 0.5 ? 'ENGLISH_TO_LUSOGA' : 'LUSOGA_TO_ENGLISH';
    setDirection(dir);
    setPhase('SHOW_CHALLENGE');
    setEnglishScore(null);
    setLusogaVerdict('pending');
    setLusogaCorrection('');
    setShowCorrection(false);
    setStealActive(false);
    setResultMessage('');
    setRoundPoints(0);
    setCountdown(5);
    setCountdownActive(false);
    setIsRecording(false);
    setIsAnalyzing(false);
  }, []);

  // ─── Start Countdown ─────────────────────────────────

  const startTurn = useCallback(() => {
    setPhase('COUNTDOWN');
    setCountdown(5);
    setCountdownActive(true);
  }, []);

  // ─── Countdown Timer ─────────────────────────────────

  useEffect(() => {
    if (!countdownActive) return;
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCountdownActive(false);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [countdownActive]);

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
      setMicError(false);
      setIsRecording(true);
      recorder.start();
    } catch {
      setMicError(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdownActive(false);

    // Go to judging phase
    setPhase('JUDGING');
    setIsAnalyzing(true);

    if (direction === 'LUSOGA_TO_ENGLISH') {
      // English — AI scores (simulated for now)
      setTimeout(() => {
        const score = Math.floor(Math.random() * 60) + 40;
        setEnglishScore(score);

        const correct = score >= 60;
        const pts = correct ? 5 + (score >= 80 ? 2 : 0) : 0;
        setRoundPoints(pts);
        setResultMessage(correct ? `${score}% — Great English!` : `${score}% — Keep trying!`);

        if (!correct && !stealActive) {
          // Trigger steal opportunity
          setPhase('RESULT');
        } else if (!correct && stealActive) {
          setPhase('STEAL_RESULT');
        } else {
          awardPoints(pts);
          setPhase('TURN_COMPLETE');
        }
        setIsAnalyzing(false);
        setStats(prev => ({ ...prev, englishAnswers: prev.englishAnswers + 1 }));
      }, 1200);
    } else {
      // Lusoga — teacher judges
      setIsAnalyzing(false);
      // Create blob URL for teacher playback
      if (audioChunksRef.current.length > 0) {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        currentBlobUrlRef.current = URL.createObjectURL(blob);
      }
      // Teacher umpire UI shows
    }
  };

  // ─── Timeout ─────────────────────────────────────────

  const handleTimeout = () => {
    setCountdownActive(false);
    setIsRecording(false);
    setResultMessage('⏰ Time\'s up!');
    setStats(prev => ({ ...prev, timeouts: prev.timeouts + 1 }));

    if (!stealActive) {
      // Other team can steal
      setPhase('RESULT');
    } else {
      setPhase('STEAL_RESULT');
    }
  };

  // ─── Teacher Umpire Actions ──────────────────────────

  const handleTeacherCorrect = () => {
    setLusogaVerdict('correct');
    const pts = stealActive ? 2 : 5;
    setRoundPoints(pts);
    setResultMessage('✅ Correct Lusoga! +' + pts + ' pts');
    awardPoints(pts);
    setStats(prev => ({
      ...prev,
      lusogaAnswers: prev.lusogaAnswers + 1,
      lusogaTeacherVerified: prev.lusogaTeacherVerified + 1,
      collectedWords: [
        ...prev.collectedWords,
        {
          english: currentWord.word,
          lusogaAttempt: currentWord.lusoga || '',
          verified: true,
        }
      ],
    }));
    setPhase('TURN_COMPLETE');
  };

  const handleTeacherIncorrect = () => {
    setLusogaVerdict('incorrect');
    setShowCorrection(true);
  };

  const submitCorrection = () => {
    setStats(prev => ({
      ...prev,
      lusogaAnswers: prev.lusogaAnswers + 1,
      collectedWords: [
        ...prev.collectedWords,
        {
          english: currentWord.word,
          lusogaAttempt: currentWord.lusoga || '',
          corrected: lusogaCorrection || undefined,
          verified: lusogaCorrection ? false : true,
        }
      ],
    }));
    setPhase('TURN_COMPLETE');
  };

  // ─── Steal Logic ─────────────────────────────────────

  const triggerSteal = () => {
    setStealActive(true);
    setPhase('STEAL_COUNTDOWN');
    setCountdown(3);
    setCountdownActive(true);
    setEnglishScore(null);
    setLusogaVerdict('pending');
    setResultMessage(`⚡ ${otherTeam.name} — STEAL!`);
  };

  const skipSteal = () => {
    setPhase('TURN_COMPLETE');
  };

  // On result phase, when there's a wrong answer but steal not yet triggered
  useEffect(() => {
    if (phase === 'RESULT' && !stealActive && roundPoints === 0 && resultMessage) {
      // Auto-trigger steal after showing result for 2 seconds
      const t = setTimeout(triggerSteal, 2000);
      return () => clearTimeout(t);
    }
  }, [phase, stealActive, roundPoints, resultMessage]);

  // ─── Scoring ─────────────────────────────────────────

  const awardPoints = (pts: number) => {
    setTeams(prev => {
      const updated = [...prev] as [Team, Team];
      if (!stealActive) {
        updated[currentTeamIdx] = { ...updated[currentTeamIdx], score: updated[currentTeamIdx].score + pts };
      } else {
        // Steal — points go to the OTHER team
        const stealTeamIdx = currentTeamIdx === 0 ? 1 : 0;
        updated[stealTeamIdx] = { ...updated[stealTeamIdx], score: updated[stealTeamIdx].score + pts };
      }
      return updated;
    });

    setStats(prev => ({
      ...prev,
      totalRounds: prev.totalRounds + 1,
      correctFirstTry: (!stealActive && pts > 0) ? prev.correctFirstTry + 1 : prev.correctFirstTry,
      correctSteal: (stealActive && pts > 0) ? prev.correctSteal + 1 : prev.correctSteal,
    }));
  };

  // ─── Turn Management ─────────────────────────────────

  const advanceTurn = () => {
    const nextTeamIdx = currentTeamIdx === 0 ? 1 : 0;

    if (currentWordIdx >= totalWords - 1 && nextTeamIdx === 1) {
      // Game over — both teams played the last word
      setPhase('GAME_COMPLETE');
      setTimeout(() => {
        onFinish(teams, stats);
      }, 1500);
      return;
    }

    if (nextTeamIdx === 0) {
      // Both teams played this word — move to next word
      setCurrentWordIdx(prev => prev + 1);
    }

    setCurrentTeamIdx(nextTeamIdx);
    setStealActive(false);

    // Short delay then new challenge
    setTimeout(() => {
      generateChallenge();
    }, 500);
  };

  // ─── Derived flags ──────────────────────────────────

  const isEnglishTurn = direction === 'LUSOGA_TO_ENGLISH';
  const isLusogaTurn = direction === 'ENGLISH_TO_LUSOGA';

  // ─── Keyboard Shortcuts ──────────────────────────────

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        if (phase === 'SHOW_CHALLENGE') startTurn();
        else if (!isRecording && !isAnalyzing && phase === 'COUNTDOWN') startRecording();
        else if (isRecording) stopRecording();
      }
      if (e.key === 'Enter') {
        if (phase === 'TURN_COMPLETE') advanceTurn();
      }
      // Teacher umpire shortcuts
      if (phase === 'JUDGING' && isLusogaTurn && !isAnalyzing) {
        if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          handleTeacherCorrect();
        }
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          if (!showCorrection) handleTeacherIncorrect();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, isRecording, isAnalyzing, showCorrection, direction]);

  // ─── Init ────────────────────────────────────────────

  useEffect(() => {
    generateChallenge();
  }, []);

  // ─── Cleanup ─────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (currentBlobUrlRef.current) URL.revokeObjectURL(currentBlobUrlRef.current);
    };
  }, []);

  // ─── Phase Rendering ─────────────────────────────────

  const countdownPercent = (countdown / 5) * 100;
  const timerColor = countdown <= 2 ? 'bg-red-500' : countdown <= 3 ? 'bg-yellow-500' : 'bg-green-500';

  // ─── GAME OVER ───────────────────────────────────────

  if (phase === 'GAME_COMPLETE') {
    const winner = teams[0].score > teams[1].score ? teams[0] : teams[1].score > teams[0].score ? teams[1] : null;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-50 to-orange-50 p-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
          <div className="text-8xl mb-4">{winner ? '🏆' : '🤝'}</div>
          <h2 className="text-5xl font-black text-blue-900 mb-2">
            {winner ? `${winner.emoji} ${winner.name} Wins!` : "It's a Tie!"}
          </h2>
          <div className="grid grid-cols-2 gap-6 my-8 max-w-md mx-auto">
            <div className="bg-blue-500 text-white rounded-[2rem] p-6">
              <div className="text-3xl">{teams[0].emoji}</div>
              <div className="font-black text-xl">{teams[0].name}</div>
              <div className="text-4xl font-black">{teams[0].score}</div>
            </div>
            <div className="bg-orange-500 text-white rounded-[2rem] p-6">
              <div className="text-3xl">{teams[1].emoji}</div>
              <div className="font-black text-xl">{teams[1].name}</div>
              <div className="text-4xl font-black">{teams[1].score}</div>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] p-4 text-sm font-bold text-blue-900/60 max-w-sm mx-auto">
            {stats.totalRounds} rounds • {stats.correctFirstTry} first-try • {stats.correctSteal} steals
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── UMPIRE VIEW ─────────────────────────────────────

  if (phase === 'JUDGING' && isLusogaTurn && !isAnalyzing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-yellow-50">
        <div className="max-w-lg w-full text-center">
          <div className="text-2xl font-black text-amber-600 uppercase tracking-widest mb-2">👩‍🏫 Umpire</div>
          <h2 className="text-3xl font-black text-blue-900 mb-2">Is the Lusoga correct?</h2>

          <div className="bg-white rounded-[3rem] p-8 border-b-8 border-amber-200 shadow-xl mb-8">
            <div className="text-5xl mb-3">🖼️</div>
            <div className="text-4xl font-black text-blue-900">{currentWord.word}</div>
            {currentWord.lusoga && (
              <div className="mt-3 bg-green-50 rounded-2xl p-3 border-2 border-green-200">
                <span className="text-xs font-black text-green-700">Reference: </span>
                <span className="text-xl font-bold text-green-800">{currentWord.lusoga}</span>
              </div>
            )}
            {!currentWord.lusoga && (
              <div className="mt-3 bg-yellow-50 rounded-2xl p-3 border-2 border-dashed border-yellow-300">
                <span className="text-xs font-black text-yellow-700">No reference — you decide!</span>
              </div>
            )}
            <div className="mt-3 text-sm text-blue-900/50">
              {stealActive ? `⚡ Steal attempt by ${otherTeam.name}` : `${currentTeam.emoji} ${currentTeam.name}'s answer`}
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

          <div className="flex gap-4 justify-center">
            <button onClick={handleTeacherCorrect}
              className="bg-green-500 text-white px-10 py-6 rounded-[2rem] border-b-8 border-green-700 active:translate-y-2 active:border-b-0 transition-all shadow-xl"
            >
              <div className="text-4xl mb-1">✅</div>
              <div className="font-black text-lg">CORRECT</div>
              <div className="text-xs opacity-70 mt-1">Press Y</div>
            </button>
            <button onClick={handleTeacherIncorrect}
              className="bg-red-500 text-white px-10 py-6 rounded-[2rem] border-b-8 border-red-700 active:translate-y-2 active:border-b-0 transition-all shadow-xl"
            >
              <div className="text-4xl mb-1">❌</div>
              <div className="font-black text-lg">INCORRECT</div>
              <div className="text-xs opacity-70 mt-1">Press N</div>
            </button>
          </div>

          {showCorrection && (
            <div className="mt-6 bg-white rounded-[2rem] p-6 shadow-xl">
              <h3 className="font-black text-lg text-blue-900 mb-3">Correct Lusoga word?</h3>
              <input
                type="text"
                value={lusogaCorrection}
                onChange={(e) => setLusogaCorrection(e.target.value)}
                className="w-full text-xl text-center font-bold text-blue-900 bg-blue-50 rounded-2xl p-3 border-2 border-blue-200 outline-none mb-3"
                placeholder="Type correction..."
                autoFocus
              />
              <button onClick={submitCorrection}
                disabled={!lusogaCorrection.trim()}
                className="bg-blue-500 text-white px-8 py-3 rounded-2xl font-black disabled:opacity-40"
              >
                SUBMIT
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── STEAL COUNTDOWN ─────────────────────────────────

  if (phase === 'STEAL_COUNTDOWN') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-50 to-orange-50 p-6">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
          <div className="text-7xl mb-4">⚡</div>
          <h2 className="text-4xl font-black text-blue-900 mb-2">STEAL!</h2>
          <p className="text-xl font-bold text-blue-900/60 mb-6">{otherTeam.emoji} {otherTeam.name}, your turn!</p>
          <div className="text-8xl font-black text-red-500 mb-6">{countdown}</div>
          <div className="w-48 h-3 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className={`h-full ${timerColor} rounded-full transition-all duration-1000`}
              style={{ width: `${(countdown / 3) * 100}%` }} />
          </div>
          <p className="mt-6 text-blue-900/40 font-bold">Say it — English or Lusoga!</p>
          <button
            onClick={startRecording}
            className="mt-4 bg-red-500 text-white px-8 py-4 rounded-[2rem] font-black text-xl border-b-4 border-red-700 active:translate-y-1 shadow-xl"
          >
            🎤 RECORD
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── MAIN GAME VIEW ──────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Scoreboard */}
      <div className="grid grid-cols-3 gap-3 p-4 shrink-0">
        <div className="bg-blue-500 text-white rounded-[2rem] p-3 text-center shadow-lg border-b-4 border-blue-700">
          <div className="text-2xl">{teams[0].emoji}</div>
          <div className="font-black text-sm truncate">{teams[0].name}</div>
          <div className="text-2xl font-black">{teams[0].score}</div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="text-xs font-black text-blue-900/40 uppercase tracking-widest">Round</div>
          <div className="text-2xl font-black text-blue-900">{currentWordIdx + 1}/{totalWords}</div>
          {stealActive && <div className="text-xs font-black text-red-500 animate-pulse">STEAL</div>}
        </div>
        <div className="bg-orange-500 text-white rounded-[2rem] p-3 text-center shadow-lg border-b-4 border-orange-700">
          <div className="text-2xl">{teams[1].emoji}</div>
          <div className="font-black text-sm truncate">{teams[1].name}</div>
          <div className="text-2xl font-black">{teams[1].score}</div>
        </div>
      </div>

      {/* Team Turn Banner */}
      <div className={`text-center mb-2 shrink-0 ${currentTeamIdx === 0 ? 'text-blue-600' : 'text-orange-600'}`}>
        <div className="text-lg font-black uppercase tracking-widest">
          {stealActive
            ? `⚡ ${otherTeam.emoji} ${otherTeam.name} — STEAL!`
            : `${currentTeam.emoji} ${currentTeam.name}'s Turn`}
        </div>
      </div>

      {/* Word Card */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-[3rem] p-6 border-b-8 border-gray-100 shadow-xl text-center max-w-sm w-full">
          {/* Direction Badge */}
          <div className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 ${
            isEnglishTurn ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {isEnglishTurn ? '🔊 Say in English' : '🌍 Say in Lusoga'}
          </div>

          {/* Display Word */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWordIdx + direction}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-24 h-24 mx-auto mb-3 bg-blue-50 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                <span className="text-4xl opacity-60">💬</span>
              </div>

              {/* The challenge word */}
              <h2 className="text-4xl md:text-5xl font-black text-blue-900 uppercase leading-none mb-1">
                {isEnglishTurn ? currentWord.word : (currentWord.lusoga || currentWord.word)}
              </h2>
              <p className="text-blue-900/40 font-bold text-xs mb-2">
                {isEnglishTurn ? currentWord.definition : 'Say the English word'}
              </p>

              {/* Hint for Lusoga direction */}
              {isLusogaTurn && currentWord.lusoga && (
                <div className="bg-green-50 rounded-xl p-2 border border-green-200 mb-3">
                  <span className="text-xs font-black text-green-700">English: </span>
                  <span className="text-base font-bold text-green-800">{currentWord.word}</span>
                </div>
              )}
              {isLusogaTurn && !currentWord.lusoga && (
                <div className="bg-yellow-50 rounded-xl p-2 border-2 border-dashed border-yellow-300 mb-3">
                  <span className="text-xs font-black text-yellow-700">No known translation — you teach the AI!</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Result area */}
          {englishScore !== null && (
            <div className="mt-3">
              <div className="text-2xl">{englishScore >= 70 ? '⭐'.repeat(3) : englishScore >= 50 ? '⭐'.repeat(2) : '⭐'}</div>
              <div className="font-bold text-blue-900 text-lg">{englishScore}%</div>
            </div>
          )}

          {resultMessage && !englishScore && lusogaVerdict === 'pending' && (
            <div className="mt-3 font-bold text-lg text-blue-900/60">{resultMessage}</div>
          )}
        </div>
      </div>

      {/* Timer Bar + Actions */}
      <div className="shrink-0 px-4 pb-6 flex flex-col items-center gap-3">
        {/* Timer Bar */}
        {countdownActive && (
          <div className="w-full max-w-sm h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              ref={countdownBarRef}
              className={`h-full ${timerColor} rounded-full`}
              animate={{ width: `${countdownPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Mic Error */}
        <AnimatePresence>
          {micError && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="bg-white rounded-[2rem] p-8 text-center shadow-2xl max-w-xs">
                <div className="text-6xl mb-4">🎙️</div>
                <h3 className="text-2xl font-black text-blue-900 mb-2">Mic Error</h3>
                <p className="text-blue-900/60 font-bold mb-6">Please allow microphone access!</p>
                <button onClick={() => setMicError(false)}
                  className="bg-blue-500 text-white px-10 py-4 rounded-2xl font-black">RETRY</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        {phase === 'SHOW_CHALLENGE' && (
          <button onClick={startTurn}
            className="bg-blue-500 text-white px-10 py-4 rounded-[2rem] font-black text-xl border-b-4 border-blue-700 active:translate-y-1 shadow-xl"
          >
            PRESS SPACE TO START
          </button>
        )}

        {phase === 'COUNTDOWN' && !isRecording && (
          <button onClick={startRecording}
            className="bg-red-500 text-white w-24 h-24 rounded-full border-b-8 border-red-700 shadow-2xl active:translate-y-2 active:border-b-0 transition-all flex flex-col items-center justify-center hover:bg-red-400"
          >
            <div className="text-3xl">🎤</div>
            <div className="font-black text-xs">SAY IT</div>
          </button>
        )}

        {phase === 'COUNTDOWN' && isRecording && (
          <button onClick={stopRecording}
            className="bg-red-500 text-white w-24 h-24 rounded-full border-b-8 border-red-700 shadow-2xl animate-pulse flex flex-col items-center justify-center"
          >
            <div className="text-3xl">⏹️</div>
            <div className="font-black text-xs">STOP</div>
          </button>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <motion.div animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full" />
            </div>
            <p className="font-bold text-blue-900/50 text-sm">Analyzing...</p>
          </div>
        )}

        {(phase === 'RESULT' || phase === 'STEAL_RESULT') && !countdownActive && !isAnalyzing && !showCorrection && (
          <div className="flex flex-col items-center gap-2">
            {roundPoints > 0 && (
              <div className="text-2xl font-black text-green-600">+{roundPoints} pts! ✅</div>
            )}
            {roundPoints === 0 && phase === 'RESULT' && !stealActive && (
              <div className="text-sm text-blue-900/40 font-bold">Other team can steal in a moment...</div>
            )}
            {roundPoints === 0 && phase === 'STEAL_RESULT' && (
              <div className="text-sm text-blue-900/40 font-bold">No points this round</div>
            )}
          </div>
        )}

        {phase === 'TURN_COMPLETE' && (
          <button onClick={advanceTurn}
            className="bg-blue-500 text-white px-8 py-3 rounded-2xl font-black text-lg border-b-4 border-blue-700 active:translate-y-1 shadow-lg"
          >
            NEXT ROUND →
          </button>
        )}

        {/* Skip steal */}
        {phase === 'RESULT' && resultMessage && roundPoints === 0 && !stealActive && (
          <button onClick={skipSteal}
            className="text-blue-900/30 font-bold text-xs underline mt-1"
          >
            Skip steal →
          </button>
        )}
      </div>
    </div>
  );
};
