import React from 'react';
import QuizTrioGame from './QuizTrioGame';
import PuzzleGame from './PuzzleGame';
import TimelineGame from './TimelineGame';
import TrueFalseGame from './TrueFalseGame';
import MemoryGame from './MemoryGame';

const GameWrapper = ({ game, onComplete, onSkip }) => {
  const renderGame = () => {
    switch (game.type) {
      case 'quiz':
        return <QuizTrioGame game={game} onComplete={onComplete} onSkip={onSkip} />;
      case 'puzzle':
        return <PuzzleGame game={game} onComplete={onComplete} onSkip={onSkip} />;
      case 'timeline':
        return <TimelineGame game={game} onComplete={onComplete} onSkip={onSkip} />;
      case 'true_false':
        return <TrueFalseGame game={game} onComplete={onComplete} onSkip={onSkip} />;
      case 'memory':
        return <MemoryGame game={game} onComplete={onComplete} onSkip={onSkip} />;
      default:
        return <div>Unknown game type</div>;
    }
  };

  return renderGame();
};

export default GameWrapper;
