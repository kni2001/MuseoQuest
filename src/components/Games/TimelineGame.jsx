import React, { useState, useEffect } from 'react';
import { Check, ArrowUp, ArrowDown } from 'lucide-react';
import '../Games/Games.css';

const TimelineGame = ({ game, onComplete, onSkip }) => {
  const [events, setEvents] = useState([]);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    // Shuffle events
    const shuffled = [...game.events].sort(() => Math.random() - 0.5);
    setEvents(shuffled);
  }, [game]);

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newEvents = [...events];
    [newEvents[index], newEvents[index - 1]] = [newEvents[index - 1], newEvents[index]];
    setEvents(newEvents);
    setFeedback(null);
  };

  const handleMoveDown = (index) => {
    if (index === events.length - 1) return;
    const newEvents = [...events];
    [newEvents[index], newEvents[index + 1]] = [newEvents[index + 1], newEvents[index]];
    setEvents(newEvents);
    setFeedback(null);
  };

  const checkCorrectOrder = () => {
    const isCorrect = events.every((event, index) => {
      const correctIndex = game.events.findIndex(e => e.id === event.id);
      return correctIndex === index;
    });
    return isCorrect;
  };

  const handleSubmit = () => {
    const isCorrect = checkCorrectOrder();
    if (isCorrect) {
      setFeedback({ type: 'correct', message: '✅ Perfect! Events in correct order!' });
      setTimeout(() => {
        onComplete(1);
      }, 1500);
    } else {
      setFeedback({ type: 'wrong', message: '❌ Not quite right. Try again!' });
    }
  };

  return (
    <div className="game-card timeline-game">
      <div className="game-header">
        <h2>{game.name}</h2>
        <p>Arrange events in chronological order</p>
      </div>

      <div className="timeline-container">
        <div className="events-list">
          {events.map((event, index) => (
            <div key={event.id} className="event-item">
              <div className="event-info">
                <span className="event-number">{index + 1}</span>
                <div className="event-details">
                  <p className="event-text">{event.event}</p>
                </div>
              </div>
              <div className="event-controls">
                <button
                  className="control-btn"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  title="Move up"
                >
                  <ArrowUp size={18} />
                </button>
                <button
                  className="control-btn"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === events.length - 1}
                  title="Move down"
                >
                  <ArrowDown size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {feedback && (
        <div className={`feedback ${feedback.type}`}>
          <p>{feedback.message}</p>
        </div>
      )}

      <div className="game-actions">
        <button 
          className="btn-primary" 
          onClick={handleSubmit}
        >
          <Check size={20} /> Check Order
        </button>
        <button 
          className="btn-secondary" 
          onClick={onSkip}
        >
          Skip Game
        </button>
      </div>
    </div>
  );
};

export default TimelineGame;
