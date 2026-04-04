import React, { useState, useEffect } from 'react';
import { RotateCcw, Check } from 'lucide-react';
import '../Games/Games.css';

const PuzzleGame = ({ game, onComplete, onSkip }) => {
  const [puzzleData] = useState(() => 
    game.images[Math.floor(Math.random() * game.images.length)]
  );
  const gridSize = puzzleData.gridSize;
  const totalPieces = gridSize * gridSize;

  const getBackgroundPosition = (pieceIndex) => {
    const col = pieceIndex % gridSize;
    const row = Math.floor(pieceIndex / gridSize);

    if (gridSize === 1) return '0% 0%';

    // For background-size > 100%, correct slice alignment uses 0..100 over (gridSize - 1) steps.
    const x = (col / (gridSize - 1)) * 100;
    const y = (row / (gridSize - 1)) * 100;
    return `${x}% ${y}%`;
  };

  const [pieces, setPieces] = useState([]);
  const [placed, setPlaced] = useState([]);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    // Initialize puzzle pieces in random order
    const initialPieces = Array.from({ length: totalPieces }, (_, i) => i);
    setPieces(initialPieces.sort(() => Math.random() - 0.5));
    setPlaced(Array(totalPieces).fill(-1));
  }, [totalPieces]);

  const handlePieceDragStart = (e, pieceIndex) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('pieceIndex', pieceIndex);
  };

  const handleDropZoneDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropZoneDrop = (e, slotIndex) => {
    e.preventDefault();
    const pieceIndex = parseInt(e.dataTransfer.getData('pieceIndex'));

    // Check if piece already placed
    if (placed.includes(pieceIndex)) return;

    // Check if slot already has a piece
    if (placed[slotIndex] !== -1) return;

    const newPlaced = [...placed];
    newPlaced[slotIndex] = pieceIndex;
    setPlaced(newPlaced);
  };

  const handleReset = () => {
    const initialPieces = Array.from({ length: totalPieces }, (_, i) => i);
    setPieces(initialPieces.sort(() => Math.random() - 0.5));
    setPlaced(Array(totalPieces).fill(-1));
  };

  const isComplete = placed.every((piece, index) => piece === index);

  const handleSubmit = () => {
    if (isComplete) {
      const timeTaken = (Date.now() - startTime) / 1000;
      onComplete(1, { timeTaken, difficulty: gridSize });
    }
  };

  return (
    <div className="game-card puzzle-game">
      <div className="game-header">
        <h2>{game.name}</h2>
        <p className="puzzle-title">{puzzleData.title}</p>
      </div>

      <div className="puzzle-container">
        <div className="puzzle-board">
          <div className="puzzle-grid" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
            {Array.from({ length: totalPieces }).map((_, slotIndex) => (
              <div
                key={slotIndex}
                className={`puzzle-slot ${placed[slotIndex] !== -1 ? 'filled' : ''}`}
                onDragOver={handleDropZoneDragOver}
                onDrop={(e) => handleDropZoneDrop(e, slotIndex)}
                style={{
                  backgroundImage: placed[slotIndex] !== -1 
                    ? `url(${new URL(`../../images/${puzzleData.url}.webp`, import.meta.url).href})` 
                    : 'none',
                  backgroundPosition: placed[slotIndex] !== -1 ? getBackgroundPosition(placed[slotIndex]) : '0% 0%',
                  backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                  backgroundRepeat: 'no-repeat'
                }}
              >
                
              </div>
            ))}
          </div>
        </div>

        <div className="puzzle-pieces">
          <h3>Puzzle Pieces</h3>
          <div className="pieces-container">
            {pieces.map((pieceIndex) => (
              !placed.includes(pieceIndex) && (
                <div
                  key={pieceIndex}
                  className="puzzle-piece"
                  draggable
                  onDragStart={(e) => handlePieceDragStart(e, pieceIndex)}
                  style={{
                    backgroundImage: `url(${new URL(`../../images/${puzzleData.url}.webp`, import.meta.url).href})`,
                    backgroundPosition: getBackgroundPosition(pieceIndex),
                    backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      <div className="puzzle-progress">
        <p>Placed: {placed.filter(p => p !== -1).length} / {totalPieces}</p>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(placed.filter(p => p !== -1).length / totalPieces) * 100}%` }}
          />
        </div>
      </div>

      <div className="game-actions">
        <button 
          className="btn-primary" 
          onClick={handleSubmit}
          disabled={!isComplete}
        >
          <Check size={20} /> Complete
        </button>
        <button 
          className="btn-secondary" 
          onClick={handleReset}
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

      {isComplete && (
        <div className="feedback correct">
          <p>🎉 Perfect! Puzzle completed!</p>
        </div>
      )}
    </div>
  );
};

export default PuzzleGame;
