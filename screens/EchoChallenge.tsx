
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WordEntry, Team, Topic, TeacherVerdict } from '../types';
import { dictionary } from '../data/dictionary';

// ─── Types ──────────────────────────────────────────────

interface EchoRecording {
  id: string;
  word: WordEntry;
  blobUrl: string;
  teacherVerdict: TeacherVerdict;
  teacherCorrection: string;
  recordedBy: 0 | 1;
  guessed: boolean;
  guessedCorrectly: boolean | null;
  guessedBy: 0 | 1 | null;
}

interface EchoChallengeProps {
  teams: [Team, Team];
  deck: WordEntry[];
  topic: Topic;
  onFinish: (finalTeams: [Team, Team], stats: EchoStats) => void;
}

export interface EchoStats {
  totalRecordings: number;
  teacherVerified: number;
  peerValidated: number;
  peerRejected: number;
  collectedWords: { english: string; lusogaAttempt: string; verified: boolean }[];
}

type EchoPhase =
  | 'RECORD'           // show word, record Lusoga
  | 'RECORD_TEACHER'   // teacher umpire for recording
  | 'ECHO'             // hear a recording, guess the word
  | 'ECHO_RESULT'      // show if guess was correct
  | 'COMPLETE';

// ─── Constants ─────────────────────────────────────────

const TOPIC_ICONS: Record<string, string> = {
  'Nature & Animals': '🌿',
  'Science & Space': '🚀',
  'History & Adventure': '🏰',
  'Arts & Sports': '🎨',
  'Daily Life': '🏠',
};

// ─── Component ─────────────────────────────────────────

export const EchoChallenge: React.FC<EchoChallengeProps> = ({ teams: initialTeams, deck, topic, onFinish }) => {
  const [teams, setTeams] = useState<[Team, Team]>(initialTeams);
  const [currentTeamIdx, setCurrentTeamIdx] = useState<0 | 1>(0);
  const [recordIndex, setRecordIndex] = useState(0);
  const [phase, setPhase] = useState<EchoPhase>('RECORD');
  const [phaseLabel, setPhaseLabel] = useState('');
  const [roundType, setRoundType] = useState<'RECORD' | 'ECHO'>('RECORD');

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [micError, setMicError] = useState(false);
  const [teacherVerdict, setTeacherVerdict] = useState<TeacherVerdict>('pending');
  const [showCorrection, setShowCorrection] = useState(false);
  const [correctionText, setCorrectionText] = useState('');

  // Echo state
  const [currentEcho, setCurrentEcho] = useState<EchoRecording | null>(null);
  const [echoChoices, setEchoChoices] = useState<{ word: string; correct: boolean }[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  // Recordings pool (persists across rounds)
  const [recordings, setRecordings] = useState<EchoRecording[]>([]);
  const [pairsCompleted, setPairsCompleted] = useState(0);
  const [scores, setScores] = useState<number[]>([0, 0]);

  // Recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentBlobUrlRef = useRef<string | null>(null);

  const currentWord = deck[recordIndex] || deck[0];
  const maxRounds = Math.min(deck.length, 10);
  const totalPairs = Math.floor(maxRounds / 2);

  // ─── Recording ──────────────────────────────────────

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
    setIsAnalyzing(true);

    // Create blob URL from recording
    const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    currentBlobUrlRef.current = url;

    // Create recording entry (pending teacher verdict)
    const newRecording: EchoRecording = {
      id: `rec_${Date.now()}`,
      word: currentWord,
      blobUrl: url,
      teacherVerdict: 'pending',
      teacherCorrection: '',
      recordedBy: currentTeamIdx,
      guessed: false,
      guessedCorrectly: null,
      guessedBy: null,
    };

    setRecordings(prev => [...prev, newRecording]);
    setIsAnalyzing(false);

    // Go to teacher umpire
    setPhase('RECORD_TEACHER');
  };

  // ─── Teacher Umpire ──────────────────────────────────

  const handleTeacherCorrect = () => {
    setTeacherVerdict('correct');
    setPhase('ECHO');
    setPhaseLabel(`Now ${teams[currentTeamIdx === 0 ? 1 : 0].name} will guess!`);
    // Update the recording
    setRecordings(prev => prev.map((r, i) =>
      i === prev.length - 1 ? { ...r, teacherVerdict: 'correct' as TeacherVerdict } : r
    ));
    // Award points to recording team
    setScores(prev => {
      const updated = [...prev] as number[];
      updated[currentTeamIdx] += 5;
      return updated;
    });
    prepareEchoRound();
  };

  const handleTeacherIncorrect = () => {
    setTeacherVerdict('incorrect');
    setShowCorrection(true);
  };

  const submitCorrection = () => {
    setRecordings(prev => prev.map((r, i) =>
      i === prev.length - 1 ? { ...r, teacherVerdict: 'incorrect' as TeacherVerdict, teacherCorrection: correctionText } : r
    ));
    setShowCorrection(false);
    setPhase('ECHO');
    setPhaseLabel(`${teams[currentTeamIdx === 0 ? 1 : 0].name}, listen and guess!`);
    // Still award half points for effort
    setScores(prev => {
      const updated = [...prev] as number[];
      updated[currentTeamIdx] += 2;
      return updated;
    });
    prepareEchoRound();
  };

  // ─── Prepare Echo Round ──────────────────────────────

  const prepareEchoRound = () => {
    // Pick the most recent recording that hasn't been guessed yet
    const unguessed = recordings.filter(r => !r.guessed);
    // Use the teacher-verified one if available, otherwise the latest
    const target = unguessed[unguessed.length - 1] || recordings[recordings.length - 1];
    setCurrentEcho(target);

    // Generate choices: 1 correct + 3 wrong from same topic
    const sameTopicWords = dictionary
      .filter(w => w.topic === topic && w.word !== target.word.word)
      .map(w => w.word);

    // Pick 3 random distractors
    const distractors: string[] = [];
    const shuffled = [...sameTopicWords].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(3, shuffled.length); i++) {
      distractors.push(shuffled[i]);
    }

    // If we don't have enough distractors, add some from the deck
    while (distractors.length < 3) {
      const extra = deck.filter(w => !distractors.includes(w.word) && w.word !== target.word.word);
      if (extra.length > 0) distractors.push(extra[Math.floor(Math.random() * extra.length)].word);
      else break;
    }

    const choices = [
      { word: target.word.word, correct: true },
      ...distractors.map(w => ({ word: w, correct: false })),
    ].sort(() => Math.random() - 0.5);

    setEchoChoices(choices);
    setSelectedChoice(null);
    setPhase('ECHO');
  };

  // ─── Echo Guess ──────────────────────────────────────

  const handleChoice = (index: number) => {
    setSelectedChoice(index);
    const isCorrect = echoChoices[index].correct;

    // Update recording
    setRecordings(prev => prev.map(r =>
      r.id === currentEcho?.id ? {
        ...r,
        guessed: true,
        guessedCorrectly: isCorrect,
        guessedBy: currentTeamIdx === 0 ? 1 : 0, // other team guesses
      } : r
    ));

    // Award points to guessing team
    if (isCorrect) {
      setScores(prev => {
        const updated = [...prev] as number[];
        const guesserIdx = currentTeamIdx === 0 ? 1 : 0;
        updated[guesserIdx] += 3;
        return updated;
      });
    }

    setPhase('ECHO_RESULT');
  };

  // ─── Advance ─────────────────────────────────────────

  const advanceRound = () => {
    const nextPair = pairsCompleted + 1;

    if (nextPair >= totalPairs) {
      setPhase('COMPLETE');
      const stats: EchoStats = {
        totalRecordings: recordings.length,
        teacherVerified: recordings.filter(r => r.teacherVerdict === 'correct').length,
        peerValidated: recordings.filter(r => r.guessedCorrectly === true).length,
        peerRejected: recordings.filter(r => r.guessedCorrectly === false).length,
        collectedWords: recordings.map(r => ({
          english: r.word.word,
          lusogaAttempt: r.word.lusoga || r.teacherCorrection || 'unknown',
          verified: r.teacherVerdict === 'correct' || r.guessedCorrectly === true,
        })),
      };
      setTeams(prev => [
        { ...prev[0], score: scores[0] },
        { ...prev[1], score: scores[1] },
      ] as [Team, Team]);
      setTimeout(() => onFinish(teams, stats), 1500);
      return;
    }

    setPairsCompleted(nextPair);
    setRecordIndex(prev => prev + 2); // skip 2 words per pair
    setTeacherVerdict('pending');
    setCorrectionText('');
    setShowCorrection(false);
    setCurrentEcho(null);
    setPhaseLabel('');

    // Alternate which team records first
    setCurrentTeamIdx(nextPair % 2 === 0 ? 0 : 1);
    setPhase('RECORD');
    setRoundType('RECORD');
  };

  // ─── Keyboard ─────────────────────────────────────────

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        if (phase === 'RECORD' && !isRecording) startRecording();
        else if (phase === 'RECORD' && isRecording) stopRecording();
      }
      // Teacher umpire shortcuts
      if (phase === 'RECORD_TEACHER') {
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
  }, [phase, isRecording, showCorrection]);

  // ─── Cleanup blob URLs ───────────────────────────────

  useEffect(() => {
    return () => {
      recordings.forEach(r => URL.revokeObjectURL(r.blobUrl));
      if (currentBlobUrlRef.current) URL.revokeObjectURL(currentBlobUrlRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // ─── RENDER ──────────────────────────────────────────

  const currentTeam = teams[currentTeamIdx];
  const guesserTeam = teams[currentTeamIdx === 0 ? 1 : 0];
  const currentIcon = TOPIC_ICONS[topic] || '📚';

  // ── COMPLETE ──
  if (phase === 'COMPLETE') {
    const winner = scores[0] > scores[1] ? teams[0] : scores[1] > scores[0] ? teams[1] : null;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-indigo-50 p-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
          <div className="text-8xl mb-4">📊</div>
          <h2 className="text-4xl font-black text-blue-900 mb-2">Echo Session Complete!</h2>
          <div className="grid grid-cols-2 gap-4 my-6 max-w-sm mx-auto">
            <div className="bg-purple-500 text-white rounded-[2rem] p-4">
              <div className="text-2xl">{teams[0].emoji}</div>
              <div className="font-black text-lg">{teams[0].name}: {scores[0]} pts</div>
            </div>
            <div className="bg-indigo-500 text-white rounded-[2rem] p-4">
              <div className="text-2xl">{teams[1].emoji}</div>
              <div className="font-black text-lg">{teams[1].name}: {scores[1]} pts</div>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] p-6 shadow-xl max-w-sm mx-auto">
            <div className="font-black text-lg text-blue-900 mb-3">📈 Data Collected</div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-2xl font-black text-purple-600">{recordings.length}</div>
                <div className="text-[10px] font-bold text-blue-900/40">Recordings</div>
              </div>
              <div>
                <div className="text-2xl font-black text-green-600">{recordings.filter(r => r.teacherVerdict === 'correct' || r.guessedCorrectly).length}</div>
                <div className="text-[10px] font-bold text-blue-900/40">Verified</div>
              </div>
              <div>
                <div className="text-2xl font-black text-amber-600">{recordings.filter(r => r.teacherVerdict === 'incorrect' && !r.guessedCorrectly).length}</div>
                <div className="text-[10px] font-bold text-blue-900/40">Need Review</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── TEACHER UMPIRE ──
  if (phase === 'RECORD_TEACHER') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-yellow-50 p-6">
        <div className="max-w-lg w-full text-center">
          <div className="text-2xl font-black text-amber-600 uppercase tracking-widest mb-2">👩‍🏫 Verify Recording</div>
          <div className="bg-white rounded-[3rem] p-8 border-b-8 border-amber-200 shadow-xl mb-8">
            <div className="text-5xl mb-3">{currentIcon}</div>
            <div className="text-4xl font-black text-blue-900">{currentWord.word}</div>
            <p className="text-blue-900/40 font-bold text-sm mt-1">{currentWord.definition}</p>
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
            <div className="mt-3 text-sm text-blue-900/50">{currentTeam.emoji} {currentTeam.name} recorded</div>

            {/* Playback button */}
            {currentBlobUrlRef.current && (
              <button
                onClick={() => {
                  const audio = new Audio(currentBlobUrlRef.current!);
                  audio.play();
                }}
                className="mt-4 bg-blue-100 text-blue-700 px-6 py-3 rounded-2xl font-black text-sm border-b-4 border-blue-200 active:translate-y-1"
              >
                🔉 PLAY RECORDING
              </button>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            <button onClick={handleTeacherCorrect}
              className="bg-green-500 text-white px-10 py-6 rounded-[2rem] border-b-8 border-green-700 active:translate-y-2 shadow-xl">
              <div className="text-4xl mb-1">✅</div>
              <div className="font-black text-lg">CORRECT</div>
              <div className="text-xs opacity-70 mt-1">Press Y</div>
            </button>
            <button onClick={handleTeacherIncorrect}
              className="bg-red-500 text-white px-10 py-6 rounded-[2rem] border-b-8 border-red-700 active:translate-y-2 shadow-xl">
              <div className="text-4xl mb-1">❌</div>
              <div className="font-black text-lg">INCORRECT</div>
              <div className="text-xs opacity-70 mt-1">Press N</div>
            </button>
          </div>

          {showCorrection && (
            <div className="mt-6 bg-white rounded-[2rem] p-6 shadow-xl">
              <h3 className="font-black text-lg text-blue-900 mb-3">Correct Lusoga word?</h3>
              <input type="text" value={correctionText}
                onChange={(e) => setCorrectionText(e.target.value)}
                className="w-full text-xl text-center font-bold text-blue-900 bg-blue-50 rounded-2xl p-3 border-2 border-blue-200 outline-none mb-3"
                placeholder="Type correction..." autoFocus />
              <button onClick={submitCorrection} disabled={!correctionText.trim()}
                className="bg-blue-500 text-white px-8 py-3 rounded-2xl font-black disabled:opacity-40">SUBMIT</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── ECHO RESULT ──
  if (phase === 'ECHO_RESULT') {
    const isCorrect = selectedChoice !== null && echoChoices[selectedChoice]?.correct;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-purple-50 p-6">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center max-w-lg">
          <div className="text-7xl mb-4">{isCorrect ? '🎯' : '❌'}</div>
          <h2 className={`text-4xl font-black mb-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? 'CORRECT!' : 'Not quite...'}
          </h2>
          <p className="text-blue-900/60 font-bold text-lg mb-2">
            {isCorrect
              ? `${guesserTeam.name} identified the word! Data validated!`
              : `The word was "${currentEcho?.word.word}"`}
          </p>
          <div className="bg-white rounded-[2rem] p-6 shadow-xl mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-blue-900"><span className="text-purple-500">{teams[0].emoji}</span> {teams[0].name}: {scores[0]}</span>
              <span className="font-bold text-blue-900"><span className="text-indigo-500">{teams[1].emoji}</span> {teams[1].name}: {scores[1]}</span>
            </div>
            <div className="text-xs text-blue-900/30 font-bold">
              Pair {pairsCompleted + 1}/{totalPairs} • {recordings.filter(r => r.guessed).length} recordings validated
            </div>
          </div>
          <button onClick={advanceRound}
            className="bg-purple-500 text-white px-10 py-4 rounded-[2rem] font-black text-xl border-b-4 border-purple-700 active:translate-y-1 shadow-xl">
            {pairsCompleted + 1 >= totalPairs ? 'FINISH SESSION' : 'NEXT ROUND →'}
          </button>
        </motion.div>
      </div>
    );
  }

  // ── ECHO (Guess) ──
  if (phase === 'ECHO') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-purple-50 p-6">
        <div className="max-w-lg w-full text-center">
          <div className="text-2xl font-black text-purple-600 uppercase tracking-widest mb-2">🔊 Echo Challenge</div>
          <p className="text-blue-900/50 font-bold text-sm mb-6">
            {guesserTeam.emoji} {guesserTeam.name} — what word is this?
          </p>

          {/* Play button */}
          <div className="bg-white rounded-[3rem] p-8 border-b-8 border-purple-200 shadow-xl mb-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <button
                onClick={() => {
                  if (currentEcho) {
                    const audio = new Audio(currentEcho.blobUrl);
                    audio.play();
                  }
                }}
                className="w-32 h-32 md:w-40 md:h-40 bg-purple-100 rounded-full flex items-center justify-center mx-auto shadow-xl border-b-8 border-purple-300 active:translate-y-2 transition-all hover:bg-purple-200"
              >
                <span className="text-5xl md:text-6xl">🔊</span>
              </button>
            </motion.div>
            <p className="text-blue-900/40 font-bold text-sm mt-4">
              Tap the speaker to hear the Lusoga recording
            </p>
            {currentEcho && currentEcho.word.lusoga && (
              <div className="mt-3 bg-gray-50 rounded-xl p-2 border border-gray-200">
                <span className="text-xs font-black text-gray-500">Hint: The English word starts with </span>
                <span className="text-lg font-black text-blue-600">{currentEcho.word.word[0]}...</span>
              </div>
            )}
          </div>

          {/* Choices Grid */}
          <div className="grid grid-cols-2 gap-3">
            {echoChoices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleChoice(i)}
                disabled={selectedChoice !== null}
                className={`bg-white rounded-[2rem] p-6 border-b-6 shadow-lg font-black text-xl text-blue-900
                  active:translate-y-1 active:border-b-0 transition-all
                  ${selectedChoice === i ? 'ring-4 ring-purple-400' : 'hover:scale-105 border-gray-200'}
                  disabled:opacity-60`}
              >
                {choice.word}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── RECORD ──
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-6">
      {/* Scoreboard */}
      <div className="fixed top-4 left-4 right-4 flex justify-between">
        <div className="bg-blue-500 text-white rounded-2xl px-4 py-2 shadow-lg flex items-center gap-2">
          <span className="text-xl">{teams[0].emoji}</span>
          <span className="font-black">{teams[0].name}: {scores[0]}</span>
        </div>
        <div className="bg-purple-500 text-white rounded-2xl px-4 py-2 shadow-lg flex items-center gap-2">
          <span>{pairsCompleted}/{totalPairs} pairs</span>
        </div>
        <div className="bg-orange-500 text-white rounded-2xl px-4 py-2 shadow-lg flex items-center gap-2">
          <span className="text-xl">{teams[1].emoji}</span>
          <span className="font-black">{teams[1].name}: {scores[1]}</span>
        </div>
      </div>

      <div className="text-center max-w-sm w-full mt-16">
        <div className="text-2xl font-black text-blue-600 mb-1">{currentTeam.emoji} {currentTeam.name}</div>
        <p className="text-blue-900/40 font-bold text-sm mb-6 uppercase tracking-wider">Say it in Lusoga!</p>

        <div className="bg-white rounded-[3rem] p-8 border-b-8 border-gray-100 shadow-xl mb-8">
          <div className="text-6xl mb-4">{currentIcon}</div>
          <h2 className="text-5xl font-black text-blue-900 uppercase mb-1">{currentWord.word}</h2>
          <p className="text-blue-900/40 font-bold text-sm mb-4">{currentWord.definition}</p>

          {currentWord.lusoga && (
            <div className="bg-green-50 rounded-2xl p-3 border-2 border-green-200">
              <span className="text-xs font-black text-green-700">Reference: </span>
              <span className="text-lg font-bold text-green-800">{currentWord.lusoga}</span>
            </div>
          )}
          {!currentWord.lusoga && (
            <div className="bg-yellow-50 rounded-2xl p-3 border-2 border-dashed border-yellow-300">
              <span className="text-xs font-black text-yellow-700">No known translation — you teach the AI!</span>
            </div>
          )}
        </div>

        {/* Mic */}
        <AnimatePresence>
          {micError && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="bg-white rounded-[2rem] p-8 text-center shadow-2xl max-w-xs">
                <div className="text-6xl mb-4">🎙️</div>
                <h3 className="text-2xl font-black text-blue-900 mb-2">Mic Error</h3>
                <button onClick={() => setMicError(false)}
                  className="bg-blue-500 text-white px-10 py-4 rounded-2xl font-black">RETRY</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isRecording && !isAnalyzing && (
          <button onClick={startRecording}
            className="bg-red-500 text-white w-28 h-28 rounded-full border-b-8 border-red-700 shadow-2xl active:translate-y-2 active:border-b-0 transition-all hover:bg-red-400 flex flex-col items-center justify-center mx-auto"
          >
            <div className="text-4xl">🎤</div>
            <div className="font-black text-xs mt-1">RECORD</div>
          </button>
        )}

        {isRecording && (
          <button onClick={stopRecording}
            className="bg-red-500 text-white w-28 h-28 rounded-full border-b-8 border-red-700 shadow-2xl animate-pulse flex flex-col items-center justify-center mx-auto"
          >
            <div className="text-4xl">⏹️</div>
            <div className="font-black text-xs mt-1">STOP</div>
          </button>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
              <motion.div animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full" />
            </div>
            <p className="font-bold text-blue-900/50 text-sm">Processing...</p>
          </div>
        )}

        {!isRecording && !isAnalyzing && (
          <p className="text-blue-900/30 font-bold text-xs mt-4">Press SPACE or tap to record</p>
        )}
      </div>
    </div>
  );
};
