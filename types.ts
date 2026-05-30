
// ─── Screen Navigation ──────────────────────────────────

export type Screen = 
  | 'LANDING' 
  | 'MODE_SELECT'
  | 'PARENT_DASHBOARD' 
  | 'TOPIC_SELECTION' 
  | 'PRE_GAME' 
  | 'GAME_VIEW' 
  | 'GAME_FINISH'
  | 'TEAM_SETUP'
  | 'ARENA_BATTLE'
  | 'TEACHER_UMPIRE'
  | 'ARENA_FINISH'
  | 'RAPID_FIRE'
  | 'ECHO_CHALLENGE';

export type GameMode = 'SOLO' | 'ARENA';

// ─── Age, Topic, and Word Types ─────────────────────────

export enum AgeGroup {
  PRESCHOOL = 'Preschool',
  GRADE_1 = 'Grade 1',
  GRADE_2 = 'Grade 2',
  GRADE_3 = 'Grade 3',
  GRADE_4 = 'Grade 4',
  GRADE_5 = 'Grade 5',
  GRADE_6 = 'Grade 6'
}

export type Topic = 
  | 'Nature & Animals' 
  | 'Science & Space' 
  | 'History & Adventure' 
  | 'Arts & Sports' 
  | 'Daily Life';

/** A single word with bilingual support */
export interface WordEntry {
  wordId: string;
  word: string;
  definition: string;
  level: AgeGroup;
  topic: Topic;
  /** Lusoga translation — empty string means not yet collected */
  lusoga: string;
  /** Whether a teacher has verified the Lusoga translation */
  lusogaVerified: boolean;
}

// ─── Solo Game State ────────────────────────────────────

export interface AppState {
  currentScreen: Screen;
  selectedAgeGroup?: AgeGroup;
  selectedTopic?: Topic;
  wordDeck: WordEntry[];
  totalStars?: number;
  gameMode?: GameMode;
}

// ─── Arena / Team Game Types ────────────────────────────

export interface Team {
  id: 0 | 1;
  name: string;
  score: number;
  color: string;   // tailwind color class
  emoji: string;
}

export type TeacherVerdict = 'pending' | 'correct' | 'incorrect';

export interface TeamRound {
  word: WordEntry;
  englishScore: number | null;       // Gemini score (0-100), null = not yet played
  lusogaRecording: boolean;           // Did the kid record?
  lusogaVerdict: TeacherVerdict;      // Teacher's call on Lusoga
  lusogaCorrectedWord?: string;       // If incorrect, teacher can type the correct one
}

export interface ArenaRound {
  teamARound: TeamRound;
  teamBRound: TeamRound;
  roundNumber: number;
  complete: boolean;
}

export interface ArenaState {
  teams: [Team, Team];
  currentRound: number;
  currentTurn: 0 | 1;           // Which team is currently playing
  rounds: ArenaRound[];
  phase: 'TEAM_A_ENGLISH' | 'TEAM_A_LUSOGA' | 'TEAM_B_ENGLISH' | 'TEAM_B_LUSOGA' | 'UMPIRE' | 'COMPLETE';
  topic: Topic;
  ageGroup: AgeGroup;
  deck: WordEntry[];
}

// ─── Data Pipeline Types (for export) ────────────────────

export interface LusogaRecording {
  wordId: string;
  english: string;
  lusogaAttempt: string;
  lusogaCorrected?: string;
  verifiedByTeacher: boolean;
  recordedByTeam: number;
  timestamp: number;
  /** Not storing actual audio blobs in types — that's IndexedDB */
}
