import React, { useState, useEffect } from 'react';
import { RotateCcw, Check } from 'lucide-react';
import '../Games/Games.css';

const MemoryGame = ({ game, onComplete, onSkip }) => {
  const MAX_MOVES = 10;
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [movesLeft, setMovesLeft] = useState(MAX_MOVES);
  const [isResetting, setIsResetting] = useState(false);

  const initializeGame = () => {
    const shuffled = [...game.cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMovesLeft(MAX_MOVES);
    setIsResetting(false);
  };

  useEffect(() => {
    initializeGame();
  }, [game]);

  const resetGame = () => {
    initializeGame();
  };

  const gameOver = movesLeft === 0 && matched.length !== game.cards.length;

  const handleCardClick = (clickedIndex) => {
    if (gameOver || isResetting) return;

    // Prevent clicking already matched cards
    if (matched.includes(clickedIndex) || flipped.includes(clickedIndex)) {
      return;
    }

    // Prevent flipping more than 2 cards at once
    if (flipped.length >= 2) {
      return;
    }

    const newFlipped = [...flipped, clickedIndex];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const nextMovesLeft = movesLeft - 1;
      setMovesLeft(nextMovesLeft);

      const [firstIdx, secondIdx] = newFlipped;
      const firstCardPair = cards[firstIdx].pair;
      const secondCardPair = cards[secondIdx].pair;

      if (firstCardPair === secondCardPair) {
        // Match found
        const newMatched = [...matched, firstIdx, secondIdx];
        setMatched(newMatched);
        setFlipped([]);

        // Check if all cards are matched
        if (newMatched.length === game.cards.length) {
          setTimeout(() => {
            onComplete(1);
          }, 1000);
          return;
        }

        // No moves left and not completed: restart from beginning.
        if (nextMovesLeft === 0) {
          setIsResetting(true);
          setTimeout(() => {
            initializeGame();
          }, 1000);
        }
      } else {
        // No match, flip back after delay, or restart if moves are exhausted.
        setTimeout(() => {
          if (nextMovesLeft === 0) {
            setIsResetting(true);
            initializeGame();
          } else {
            setFlipped([]);
          }
        }, 1000);
      }
    }
  };

  return (
    <div className="game-card memory-game">
      <div className="game-header">
        <h2>{game.name}</h2>
        <p>Find matching pairs of cards</p>
      </div>

      <div className="memory-stats">
        <div className="stat">
          <span>Moves Left:</span>
          <strong>{movesLeft}</strong>
        </div>
        <div className="stat">
          <span>Matched:</span>
          <strong>{Math.floor(matched.length / 2)} / {Math.floor(game.cards.length / 2)}</strong>
        </div>
      </div>

      <div className="memory-grid">
        {cards.map((card, index) => (
          <button
            key={index}
            className={`memory-card ${flipped.includes(index) || matched.includes(index) ? 'flipped' : ''}`}
            onClick={() => handleCardClick(index)}
            disabled={matched.includes(index) || gameOver || isResetting}
          >
            <div className="card-inner">
              <div className="card-front">?</div>
              <div className="card-back">
                <span className="card-icon">{card.icon}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="memory-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(matched.length / game.cards.length) * 100}%` }}
          />
        </div>
        <p>{matched.length} / {game.cards.length} cards matched</p>
      </div>

      <div className="game-actions">
        <button 
          className="btn-primary" 
          onClick={() => matched.length === game.cards.length ? onComplete(1) : null}
          disabled={matched.length !== game.cards.length}
        >
          <Check size={20} /> Complete
        </button>
        <button 
          className="btn-secondary" 
          onClick={resetGame}
        >
          <RotateCcw size={20} /> Reset
        </button>
        <button 
          className="btn-secondary" 
          onClick={onSkip}
        >
          Skip Game
        </button>
      </div>

      {matched.length === game.cards.length && (
        <div className="feedback correct">
          <p>🎉 All pairs found with {movesLeft} moves left!</p>
        </div>
      )}

      {gameOver && (
        <div className="feedback wrong">
          <p>❌ No moves left. Restarting game...</p>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;
