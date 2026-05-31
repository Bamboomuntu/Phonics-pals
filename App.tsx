
import React, { useState, useCallback } from 'react';
import { LandingPage } from './screens/LandingPage';
import { ParentDashboard } from './screens/ParentDashboard';
import { TopicSelection } from './screens/TopicSelection';
import { PreGame } from './screens/PreGame';
import { GameView } from './screens/GameView';
import { GameFinish } from './screens/GameFinish';
import { ModeSelection } from './screens/ModeSelection';
import { TeamSetup } from './screens/TeamSetup';
import { ArenaBattle } from './screens/ArenaBattle';
import { ArenaFinish } from './screens/ArenaFinish';
import { RapidFire, RapidStats } from './screens/RapidFire';
import { EchoChallenge, EchoStats } from './screens/EchoChallenge';
import { OfflineIndicator } from './components/OfflineIndicator';
import { loadCacheManifest } from './src/lib/cache-manager';
import { Screen, AgeGroup, Topic, WordEntry, Team, ArenaRound } from './types';
import { dictionary } from './data/dictionary';

const App: React.FC = () => {
  // ─── Common State ────────────────────────────────────
  const [currentScreen, setCurrentScreen] = useState<Screen>('LANDING');
  const [selectedTopic, setSelectedTopic] = useState<Topic | undefined>();
  const [wordDeck, setWordDeck] = useState<WordEntry[]>([]);
  const [activeMode, setActiveMode] = useState<'SOLO' | 'ARENA' | 'RAPID' | 'ECHO'>('SOLO');
  const [teamNames, setTeamNames] = useState<[Team, Team] | null>(null);

  // ─── Solomode State ──────────────────────────────────
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | undefined>();
  const [struggledWords, setStruggledWords] = useState<WordEntry[]>([]);
  const [totalStars, setTotalStars] = useState(0);

  // ─── Arena State ─────────────────────────────────────
  const [arenaRounds, setArenaRounds] = useState<ArenaRound[]>([]);

  // ─── Rapid Fire State ────────────────────────────────
  const [rapidStats, setRapidStats] = useState<RapidStats | null>(null);

  // ─── Init offline cache on mount ─────────────────────
  React.useEffect(() => {
    loadCacheManifest();
  }, []);

  const navigateTo = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
  }, []);

  // ─── Solomode Handlers ───────────────────────────────

  const handleAgeSelect = useCallback((age: AgeGroup) => {
    setSelectedAgeGroup(age);
    setActiveMode('SOLO');
    navigateTo('TOPIC_SELECTION');
  }, [navigateTo]);

  const handleTopicSelect = useCallback((topic: Topic) => {
    setSelectedTopic(topic);
    let filteredWords: WordEntry[];

    switch (activeMode) {
      case 'SOLO':
        filteredWords = dictionary.filter(
          item => item.level === selectedAgeGroup && item.topic === topic
        );
        break;
      case 'ARENA':
        filteredWords = dictionary.filter(item => item.topic === topic);
        break;
      case 'RAPID':
        filteredWords = dictionary.filter(item => item.topic === topic);
        break;
      case 'ECHO':
        filteredWords = dictionary.filter(item => item.topic === topic);
        break;
      default:
        filteredWords = [];
    }

    const shuffled = [...filteredWords].sort(() => Math.random() - 0.5);
    setWordDeck(shuffled);

    if (activeMode === 'SOLO') {
      setStruggledWords([]);
      navigateTo('PRE_GAME');
    } else if (activeMode === 'ARENA') {
      navigateTo('ARENA_BATTLE');
    } else if (activeMode === 'RAPID') {
      navigateTo('RAPID_FIRE');
    } else if (activeMode === 'ECHO') {
      navigateTo('ECHO_CHALLENGE');
    }
  }, [selectedAgeGroup, activeMode, navigateTo]);

  const handleGameFinish = useCallback((stars: number, sessionStruggleWords: WordEntry[]) => {
    setTotalStars(stars);
    setStruggledWords(sessionStruggleWords);
    navigateTo('GAME_FINISH');
  }, [navigateTo]);

  const startReviewSession = useCallback(() => {
    setWordDeck([...struggledWords]);
    setStruggledWords([]);
    setTotalStars(0);
    navigateTo('PRE_GAME');
  }, [struggledWords, navigateTo]);

  // ─── Team & Arena Handlers ───────────────────────────

  const handleTeamsConfirm = useCallback((teams: [Team, Team]) => {
    setTeamNames(teams);
    navigateTo('TOPIC_SELECTION');
  }, [navigateTo]);

  const handleArenaTopicSelect = useCallback((topic: Topic) => {
    setActiveMode('ARENA');
    setSelectedTopic(topic);
    const filteredWords = dictionary.filter(item => item.topic === topic);
    const shuffled = [...filteredWords].sort(() => Math.random() - 0.5).slice(0, 8);
    setWordDeck(shuffled);
    navigateTo('ARENA_BATTLE');
  }, [navigateTo]);

  const handleArenaFinish = useCallback((finalTeams: [Team, Team], rounds: ArenaRound[]) => {
    setTeamNames(finalTeams);
    setArenaRounds(rounds);
    navigateTo('ARENA_FINISH');
  }, [navigateTo]);

  // ─── Rapid Fire Handlers ─────────────────────────────

  const handleRapidSetup = useCallback(() => {
    setActiveMode('RAPID');
    navigateTo('TEAM_SETUP');
  }, [navigateTo]);

  const handleRapidFinish = useCallback((finalTeams: [Team, Team], stats: RapidStats) => {
    setTeamNames(finalTeams);
    setRapidStats(stats);
    // For now, navigate to main menu after rapid fire
    navigateTo('MODE_SELECT');
  }, [navigateTo]);

  // ─── Echo Handlers ──────────────────────────────────

  const handleEchoSetup = useCallback(() => {
    setActiveMode('ECHO');
    navigateTo('TEAM_SETUP');
  }, [navigateTo]);

  const handleEchoFinish = useCallback((finalTeams: [Team, Team], stats: EchoStats) => {
    setTeamNames(finalTeams);
    navigateTo('MODE_SELECT');
  }, [navigateTo]);

  // ─── Flow Routing ─────────────────────────────────────

  const handleLandingStart = useCallback(() => {
    navigateTo('MODE_SELECT');
  }, [navigateTo]);

  const handleModeSelectSolo = useCallback(() => {
    navigateTo('PARENT_DASHBOARD');
  }, [navigateTo]);

  const handleModeSelectArena = useCallback(() => {
    setActiveMode('ARENA');
    navigateTo('TEAM_SETUP');
  }, [navigateTo]);

  const handlePlayAgain = useCallback(() => {
    navigateTo('MODE_SELECT');
  }, [navigateTo]);

  const handleMainMenu = useCallback(() => {
    setCurrentScreen('LANDING');
  }, []);

  // ─── Render ───────────────────────────────────────────

  const renderScreen = () => {
    switch (currentScreen) {
      // ── Landing ──
      case 'LANDING':
        return <LandingPage onStart={handleLandingStart} />;

      // ── Mode Select ──
      case 'MODE_SELECT':
        return (
          <ModeSelection
            onSelectSolo={handleModeSelectSolo}
            onSelectArena={handleModeSelectArena}
            onSelectRapidFire={handleRapidSetup}
            onSelectEcho={handleEchoSetup}
          />
        );

      // ── Solo Flow ──
      case 'PARENT_DASHBOARD':
        return (
          <ParentDashboard
            onSelectAge={handleAgeSelect}
            onBack={() => navigateTo('MODE_SELECT')}
          />
        );

      case 'TOPIC_SELECTION':
        return (
          <TopicSelection
            selectedAge={activeMode === 'SOLO' ? selectedAgeGroup : undefined}
            onSelectTopic={handleTopicSelect}
            onBack={() => {
              if (activeMode === 'SOLO') navigateTo('PARENT_DASHBOARD');
              else navigateTo('TEAM_SETUP');
            }}
          />
        );

      case 'PRE_GAME':
        return (
          <PreGame
            topic={selectedTopic!}
            wordCount={wordDeck.length}
            wordDeck={wordDeck}
            onStart={() => navigateTo('GAME_VIEW')}
            onBack={() => navigateTo('TOPIC_SELECTION')}
          />
        );

      case 'GAME_VIEW':
        return (
          <GameView
            deck={wordDeck}
            topic={selectedTopic!}
            onFinish={handleGameFinish}
          />
        );

      case 'GAME_FINISH':
        return (
          <GameFinish
            topic={selectedTopic!}
            stars={totalStars}
            totalPossibleStars={wordDeck.length * 3}
            onRestart={() => navigateTo('TOPIC_SELECTION')}
            struggledWords={struggledWords}
            onReview={startReviewSession}
          />
        );

      // ── Team Setup (shared by Arena + Rapid) ──
      case 'TEAM_SETUP':
        return (
          <TeamSetup
            onConfirm={handleTeamsConfirm}
            onBack={() => navigateTo('MODE_SELECT')}
          />
        );

      // ── Arena Flow ──
      case 'ARENA_BATTLE':
        return (
          <ArenaBattle
            teams={teamNames!}
            deck={wordDeck}
            topic={selectedTopic!}
            onFinish={handleArenaFinish}
          />
        );

      case 'ARENA_FINISH':
        return (
          <ArenaFinish
            teams={teamNames!}
            rounds={arenaRounds}
            onPlayAgain={handlePlayAgain}
            onMainMenu={handleMainMenu}
          />
        );

      // ── Rapid Fire Flow ──
      case 'RAPID_FIRE':
        return (
          <RapidFire
            teams={teamNames!}
            deck={wordDeck}
            topic={selectedTopic!}
            onFinish={handleRapidFinish}
          />
        );

      // ── Echo Challenge Flow ──
      case 'ECHO_CHALLENGE':
        return (
          <EchoChallenge
            teams={teamNames!}
            deck={wordDeck}
            topic={selectedTopic!}
            onFinish={handleEchoFinish}
          />
        );

      default:
        return <LandingPage onStart={handleLandingStart} />;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500 bg-emerald-50 overflow-x-hidden">
      {renderScreen()}
      <OfflineIndicator />
    </div>
  );
};

export default App;
