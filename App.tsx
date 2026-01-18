
import React, { useState } from 'react';
import { LandingPage } from './screens/LandingPage';
import { ParentDashboard } from './screens/ParentDashboard';
import { TopicSelection } from './screens/TopicSelection';
import { PreGame } from './screens/PreGame';
import { GameView } from './screens/GameView';
import { GameFinish } from './screens/GameFinish';
import { Screen, AgeGroup, Topic, WordEntry } from './types';
import { dictionary } from './data/dictionary';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('LANDING');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | undefined>();
  const [selectedTopic, setSelectedTopic] = useState<Topic | undefined>();
  const [wordDeck, setWordDeck] = useState<WordEntry[]>([]);
  const [struggledWords, setStruggledWords] = useState<WordEntry[]>([]);
  const [totalStars, setTotalStars] = useState(0);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleAgeSelect = (age: AgeGroup) => {
    setSelectedAgeGroup(age);
    navigateTo('TOPIC_SELECTION');
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    const filteredWords = dictionary.filter(
      item => item.level === selectedAgeGroup && item.topic === topic
    );
    // Shuffle deck for variety
    const shuffled = [...filteredWords].sort(() => Math.random() - 0.5);
    setWordDeck(shuffled);
    setStruggledWords([]);
    navigateTo('PRE_GAME');
  };

  const handleGameFinish = (stars: number, sessionStruggleWords: WordEntry[]) => {
    setTotalStars(stars);
    setStruggledWords(sessionStruggleWords);
    navigateTo('GAME_FINISH');
  };

  const startReviewSession = () => {
    setWordDeck([...struggledWords]);
    setStruggledWords([]);
    setTotalStars(0);
    navigateTo('PRE_GAME');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'LANDING':
        return <LandingPage onStart={() => navigateTo('PARENT_DASHBOARD')} />;
      case 'PARENT_DASHBOARD':
        return (
          <ParentDashboard 
            onSelectAge={handleAgeSelect} 
            onBack={() => navigateTo('LANDING')} 
          />
        );
      case 'TOPIC_SELECTION':
        return (
          <TopicSelection 
            selectedAge={selectedAgeGroup}
            onSelectTopic={handleTopicSelect}
            onBack={() => navigateTo('PARENT_DASHBOARD')}
          />
        );
      case 'PRE_GAME':
        return (
          <PreGame 
            topic={selectedTopic!}
            wordCount={wordDeck.length}
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
      default:
        return <LandingPage onStart={() => navigateTo('PARENT_DASHBOARD')} />;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500 bg-emerald-50 overflow-x-hidden">
      {renderScreen()}
    </div>
  );
};

export default App;