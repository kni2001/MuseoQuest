import React, { useState, useEffect } from 'react';
import { Search, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { getUserProgress, addGameScore, resetUserProgress } from '../../lib/userScoring';
import { GAME_LIST } from '../../data/games';
import Navbar from '../../components/Navbar/Navbar';
import GameWrapper from '../../components/Games/GameWrapper';
import './ExplorePage.css';
import Footer from '../../components/Footer/Footer';
import { exhibits } from '../../data/exhibits';

const getRandomGamesForExplore = (games) => {
  // Shuffle and select all 5 games
  return [...games].sort(() => Math.random() - 0.5);
};

const ExplorePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(false);
  const [showAllExhibits, setShowAllExhibits] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [showGameModal, setShowGameModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [completedGames, setCompletedGames] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [availableGames] = useState(getRandomGamesForExplore(GAME_LIST));

  const exhibitRef = React.useRef(null);
  const audioRef = React.useRef(null);
  const hasVisitedExploreInitially = React.useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    if (id) {
      const timer = window.setTimeout(() => {
        exhibitRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);

      return () => window.clearTimeout(timer);
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    // Keep the URL and current exhibit in sync.
    // If an id is present in the URL, show that exhibit.
    // Otherwise stay on the default explore layout (no redirect).
    if (id) {
      const parsedId = parseInt(id, 10);
      const exhibitIndex = exhibits.findIndex((ex) => ex.id === parsedId);
      if (exhibitIndex !== -1) {
        setCurrentAudioIndex(exhibitIndex);
        return;
      }
    }

    // No valid `id` present: show the first exhibit in the UI, but keep URL as `/explore`.
    setCurrentAudioIndex(0);
  }, [id]);

  useEffect(() => {
    // Do not auto-prompt a game on the initial visit to Explore.
    if (!hasVisitedExploreInitially.current) {
      hasVisitedExploreInitially.current = true;
      return;
    }

    // Do not auto-prompt a game for the first exhibit.
    if (currentAudioIndex === 0) {
      return;
    }

    // Check if current exhibit has an uncompleted game and show it randomly
    const currentGame = availableGames[currentAudioIndex % availableGames.length];
    
    // Only show game automatically if it hasn't been completed
    if (currentGame && !completedGames.includes(currentGame.id)) {
      // Randomly decide whether to show the game (70% chance)
      if (Math.random() < 0.7) {
        setSelectedGame(currentGame);
        setShowGameModal(true);
      }
    }
  }, [currentAudioIndex]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const progress = await getUserProgress(user.uid);
          setUserProgress(progress);
          setCompletedGames(progress.gamesCompleted || []);
        } catch (error) {
          console.error('Error loading user progress:', error);
        }
      }
    });

    return unsubscribe;
  }, []);

  const goToPreviousAudio = () => {
    const prevIndex = currentAudioIndex === 0 ? exhibits.length - 1 : currentAudioIndex - 1;
    const nextId = exhibits[prevIndex]?.id;
    if (typeof nextId !== 'undefined') {
      navigate(`/explore/${nextId}`);
    }
  };

  const goToNextAudio = () => {
    const nextIndex = currentAudioIndex === exhibits.length - 1 ? 0 : currentAudioIndex + 1;
    const nextId = exhibits[nextIndex]?.id;
    if (typeof nextId !== 'undefined') {
      navigate(`/explore/${nextId}`);
    }
  };

  const currentExhibit = exhibits[currentAudioIndex];

  useEffect(() => {
    if (!isAutoPlayEnabled || !currentExhibit?.audio || !audioRef.current) {
      return;
    }

    const playPromise = audioRef.current.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Ignore blocked autoplay errors and keep manual controls available.
      });
    }
  }, [currentExhibit?.id, isAutoPlayEnabled]);

  const handleAutoPlayToggle = (event) => {
    const enabled = event.target.checked;
    setIsAutoPlayEnabled(enabled);

    if (!enabled && audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleGameComplete = async (points) => {
    const user = auth.currentUser;
    if (user && selectedGame) {
      try {
        if (points > 0) {
          const newProgress = await addGameScore(user.uid, selectedGame.id, points);
          setUserProgress(newProgress);
          setCompletedGames((prevCompletedGames) => [...prevCompletedGames, selectedGame.id]);
          window.dispatchEvent(new CustomEvent('progressUpdated', { detail: newProgress }));

          // Show success message
          alert(`🎉 Game completed! You earned ${points} point(s)!\nYour new level: ${newProgress.level}`);
        } else {
          alert('😕 You did not earn a mark. Try the full challenge to earn it!');
        }
        setShowGameModal(false);
        setSelectedGame(null);
      } catch (error) {
        console.error('Error saving game score:', error);
      }
    }
  };

  const handleResetMarks = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await resetUserProgress(user.uid);
        const progress = await getUserProgress(user.uid);
        setUserProgress(progress);
        setCompletedGames([]);
        window.dispatchEvent(new CustomEvent('progressUpdated', { detail: progress }));
        alert('✅ Your marks have been reset. Start playing again!');
      } catch (error) {
        console.error('Error resetting marks:', error);
        alert('Failed to reset marks. Please try again later.');
      }
    }
  };

  const handleSkipGame = () => {
    setShowGameModal(false);
    setSelectedGame(null);
  };

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredExhibits = exhibits.filter((exhibit) => {
    if (!normalizedSearchQuery) {
      return true;
    }

    return [exhibit.title, exhibit.era, exhibit.description]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(normalizedSearchQuery));
  });

  // Show only 6 exhibits initially unless search is active.
  const displayedExhibits = normalizedSearchQuery
    ? filteredExhibits
    : showAllExhibits
      ? filteredExhibits
      : filteredExhibits.slice(0, 6);

  const isGameCompleted = (gameId) => completedGames.includes(gameId);

  return (
    <div className="explore-container">
      <Navbar />

      {/* Game Modal */}
      {showGameModal && selectedGame && (
        <div className="game-modal-overlay">
          <div className={`game-modal-content ${selectedGame.type === 'puzzle' ? 'is-puzzle-modal' : ''}`}>
            <button 
              className="modal-close"
              onClick={handleSkipGame}
            >
              ✕
            </button>
            <GameWrapper
              game={selectedGame}
              onComplete={handleGameComplete}
              onSkip={handleSkipGame}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="explore-content">
        {/* Header and Search */}
        <header className="explore-header">
          <div className="header-text">
            <h1>Discover Historical Wonders</h1>
            <p>Explore ancient artifacts and play games to learn about history and earn rewards!</p>
          </div>
          <div className="search-bar-container glass">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search for artifacts, galleries, or eras..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search exhibits"
            />
            <button className="filter-btn">
              <Search size={18} /><span>Search</span>
            </button>
          </div>
        </header>

       

        {/* Featured Exhibits */}
        <section className="discover-grid-section">
          <h2>Featured Exhibits</h2>
          {normalizedSearchQuery && (
            <p className="games-subtitle">Showing {filteredExhibits.length} result(s) for "{searchQuery}".</p>
          )}
          <div className="discover-grid">
            {displayedExhibits.map((exhibit) => (
              <Link
                key={exhibit.id}
                to={`/explore/${exhibit.id}`}
                className="discover-card glass-card"
              >
                <img
                  src={exhibit.image}
                  alt={exhibit.title}
                  className="discover-img"
                  loading="lazy"
                  crossOrigin="anonymous"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop'; }}
                />
                <div className="discover-card-content">
                  <h3>{exhibit.title}</h3>
                  <p className="era">{exhibit.era}</p>
                </div>
              </Link>
            ))}
          </div>

          {filteredExhibits.length === 0 && (
            <p className="games-subtitle">No exhibits found. Try a different keyword.</p>
          )}

          {!normalizedSearchQuery && !showAllExhibits && filteredExhibits.length > 6 && (
            <div className="see-more-container">
              <button className="see-more-btn" onClick={() => setShowAllExhibits(true)}>See More</button>
            </div>
          )}
          {!normalizedSearchQuery && showAllExhibits && filteredExhibits.length > 6 && (
            <div className="see-more-container">
              <button className="see-more-btn" onClick={() => setShowAllExhibits(false)}>Show Less</button>
            </div>
          )}
        </section>

        {/* Main Exhibit Navigation */}
        <section ref={exhibitRef} className="main-exhibit-navigation glass-card">
          <div className="main-nav-image-container">
            <img
              src={currentExhibit.image}
              alt={currentExhibit.title}
              className="main-nav-image"
              crossOrigin="anonymous"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop'; }}
            />
          </div>
          <div className="main-nav-info">
            <div className="nav-info-header">
              <span className="nav-era">{currentExhibit.era}</span>
              <h2>{currentExhibit.title}</h2>
            </div>
            <p className="nav-description">{currentExhibit.description}</p>

            <div className="audio-guide-container">
              <h3 className="audio-title"><Volume2 size={20} /> Audio Guide Navigation</h3>
              <div className="auto-play-toggle-row">
                <span className="auto-play-label">Auto Play</span>
                <label className="auto-play-switch" htmlFor="auto-play-switch">
                  <input
                    id="auto-play-switch"
                    type="checkbox"
                    checked={isAutoPlayEnabled}
                    onChange={handleAutoPlayToggle}
                  />
                  <span className="auto-play-slider" />
                </label>
              </div>
              <audio
                key={currentExhibit.id}
                ref={audioRef}
                controls
                preload="metadata"
                src={currentExhibit.audio}
                className="main-audio-player"
              >
                Your browser does not support the audio element.
              </audio>
              <div className="audio-nav-actions">
                <button onClick={goToPreviousAudio} className="audio-nav-btn"><SkipBack size={20} /> Previous</button>
                <div className="exhibit-counter">{currentAudioIndex + 1} / {exhibits.length}</div>
                <button onClick={goToNextAudio} className="audio-nav-btn">Next <SkipForward size={20} /></button>
              </div>
            </div>
          </div>
        </section>

         {/* Game Challenge Section */}
        <section className="game-challenge-section">
          <div className="games-header">
            <h2>🎮 Available Games on This Page</h2>
            <button className="btn-reset small" onClick={handleResetMarks}>🔄 Reset My Marks</button>
          </div>
          <p className="games-subtitle">Play any of these games as you explore. You must fully complete a game (all questions/puzzles correct) to earn its mark.</p>
          <div className="games-preview-grid">
            {availableGames.map((game) => (
              <div 
                key={game.id}
                className={`game-preview-card ${isGameCompleted(game.id) ? 'completed' : ''}`}
              >
                <div className="game-preview-header">
                  <span className="game-preview-icon">{game.icon}</span>
                  <span className="mark-label">{game.marks} Mark</span>
                </div>
                <h4>{game.name}</h4>
                <p className="game-preview-desc">{game.description}</p>
                {isGameCompleted(game.id) && (
                  <div className="completed-checkmark">✓</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="cta-section">
          <div className="cta-content">
            <h2>Want to Play More Games?</h2>
            <p>Visit the Game Center to play all games anytime and level up faster!</p>
            <button className="cta-button" onClick={() => navigate('/play')}>
              Go to Game Center →
            </button>
          </div>
        </section>
      </main>

      <div className="score-box">
        {userProgress && (
          <>
            <span>Progress: Level {userProgress.level} • Score: {userProgress.totalScore}/5</span>
          </>
        )}
      </div>
      <Footer />

      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
    </div>
  );
};

export default ExplorePage;