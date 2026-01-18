
export type Screen = 'LANDING' | 'PARENT_DASHBOARD' | 'TOPIC_SELECTION' | 'PRE_GAME' | 'GAME_VIEW' | 'GAME_FINISH';

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

export interface WordEntry {
  word: string;
  definition: string;
  level: AgeGroup;
  topic: Topic;
}

export interface AppState {
  currentScreen: Screen;
  selectedAgeGroup?: AgeGroup;
  selectedTopic?: Topic;
  wordDeck: WordEntry[];
  totalStars?: number;
}
