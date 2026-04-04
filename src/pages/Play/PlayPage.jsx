import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { getUserProgress, addGameScore, resetUserProgress, getLeaderboard, getAllUsersLeaderboard, claimReward } from '../../lib/userScoring';
import { GAME_LIST } from '../../data/games';
import Navbar from '../../components/Navbar/Navbar';
import GameWrapper from '../../components/Games/GameWrapper';
import Footer from '../../components/Footer/Footer';
import './PlayPage.css';

const PlayPage = () => {
  const navigate = useNavigate();
  const [games] = useState(GAME_LIST);
  const [selectedGame, setSelectedGame] = useState(null);
  const [completedGames, setCompletedGames] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);
  const [allLeaderboard, setAllLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [showTreasurePopup, setShowTreasurePopup] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const progress = await getUserProgress(user.uid);
          setUserProgress(progress);
          setCompletedGames(progress.gamesCompleted || []);
          if (progress.rewardReference) {
            setReferenceNumber(progress.rewardReference);
          }
        } catch (error) {
          console.error('Error loading user progress:', error);
        }
      }
    });

    return unsubscribe;
  }, []);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const topUsers = await getLeaderboard(10);
        setLeaderboard(topUsers);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      }
    };

    fetchLeaderboard();
  }, []);

  const handleGameSelect = (game) => {
    setSelectedGame(game);
    setShowGameModal(true);
  };

  const handleGameComplete = async (points) => {
    const user = auth.currentUser;
    if (user) {
      try {
        if (points > 0) {
          const newProgress = await addGameScore(user.uid, selectedGame.id, points);
          setUserProgress(newProgress);
          const newCompletedGames = [...completedGames, selectedGame.id];
          setCompletedGames(newCompletedGames);
          window.dispatchEvent(new CustomEvent('progressUpdated', { detail: newProgress }));

          const justCompletedAll = games.every((game) => newCompletedGames.includes(game.id));
          if (justCompletedAll && !allGamesCompleted) {
            setShowTreasurePopup(true);
          } else {
            // Show success animation
            alert(`🎉 Game completed! You earned ${points} point(s)!\nYour new level: ${newProgress.level}`);
          }
        } else {
          // allow retry
          alert('😕 You did not earn a mark. Try completing the full game correctly to earn it!');
        }

        // Close modal regardless
        setShowGameModal(false);
        setSelectedGame(null);
      } catch (error) {
        console.error('Error saving game score:', error);
      }
    }
  };

  const handleSkipGame = () => {
    setShowGameModal(false);
    setSelectedGame(null);
  };

  const handleResetMarks = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await resetUserProgress(user.uid);
        const progress = await getUserProgress(user.uid);
        setUserProgress(progress);
        setCompletedGames([]);
        setReferenceNumber(null);
        // notify navbars/other listeners
        window.dispatchEvent(new CustomEvent('progressUpdated', { detail: progress }));
        alert('✅ Your marks have been reset. Start playing again!');
      } catch (error) {
        console.error('Error resetting marks:', error);
        alert('Failed to reset marks. Please try again later.');
      }
    }
  };

  const handleClaimRewards = async () => {
    if (!allGamesCompleted) {
      alert('Complete all games to unlock rewards.');
      return;
    }
    const user = auth.currentUser;
    if (user) {
      setIsClaiming(true);
      try {
        const ref = await claimReward(user.uid);
        const progress = await getUserProgress(user.uid);
        setUserProgress(progress);
        setReferenceNumber(ref);
        setShowTreasurePopup(true); // Ensure it stays open to view ticket
      } catch (error) {
        console.error('Error claiming reward:', error);
        alert('Failed to claim reward. Please try again.');
      } finally {
        setIsClaiming(false);
      }
    }
  };

  const handleDownloadReference = () => {
    if (!referenceNumber) return;
    const content = `🏆 MUSEUM TREASURE HUNT - REWARD TICKET 🏆\n\nCongratulations! You have successfully completed all games and unlocked the hidden treasure.\n\n==========================================\nYOUR UNIQUE REFERENCE NUMBER:\n${referenceNumber}\n==========================================\n\nPlease present this code to the museum staff at the Main Office to collect your real-world reward.\nThank you for playing!`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Museum_Reward_${referenceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSeeMore = async () => {
    if (!showAllLeaderboard) {
      setLoadingLeaderboard(true);
      try {
        const allUsers = await getAllUsersLeaderboard();
        setAllLeaderboard(allUsers);
        setShowAllLeaderboard(true);
      } catch (error) {
        console.error('Error loading full leaderboard:', error);
        alert('Failed to load full leaderboard. Please try again.');
      } finally {
        setLoadingLeaderboard(false);
      }
    } else {
      setShowAllLeaderboard(false);
    }
  };

  const isGameCompleted = (gameId) => completedGames.includes(gameId);
  const allGamesCompleted = games.every((game) => completedGames.includes(game.id));

  return (
    <div className="play-page-container">
      <Navbar />

      <main className="play-content">
        <section className="play-header">
          <h1>🎮 Game Center</h1>
          <p>Select any game to play and earn points to level up!</p>
          {userProgress && (
            <div className="player-stats">
              <div className="stat-box">
                <span className="stat-label">Current Level</span>
                <span className="stat-value">{userProgress.level}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Total Score</span>
                <span className="stat-value">{userProgress.totalScore}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Games Completed</span>
                <span className="stat-value">{completedGames.length}</span>
              </div>
              <div className="stat-box reset-box">
                <button className="btn-reset" onClick={handleResetMarks}>
                  🔄 Reset My Marks
                </button>
                <button
                  className={`btn-rewards ${allGamesCompleted ? 'active' : 'locked'}`}
                  onClick={referenceNumber ? () => setShowTreasurePopup(true) : handleClaimRewards}
                  disabled={!allGamesCompleted || isClaiming}
                >
                  {isClaiming ? '⌛ Claiming...' : referenceNumber ? '🎫 View Ticket' : '🎁 Claim Rewards'}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="games-gallery">
          <div className="games-grid">
            {games.map((game) => {
              const isCompleted = isGameCompleted(game.id);
              return (
                <div
                  key={game.id}
                  className={`game-card-selector ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="game-card-content">
                    <div className="game-icon">{game.icon}</div>
                    <h3>{game.name}</h3>
                    <p className="game-description">{game.description}</p>
                    <div className="game-meta">
                      <span className="mark-badge">{game.marks} Mark</span>
                      <span className="type-badge">{game.type}</span>
                    </div>
                  </div>

                  {isCompleted ? (
                    <div className="completed-badge">
                      <span>✓ Completed</span>
                    </div>
                  ) : null}

                  <button
                    className={`play-btn ${isCompleted ? 'replay' : ''}`}
                    onClick={() => handleGameSelect(game)}
                  >
                    {isCompleted ? '🔄 Replay' : '▶ Play'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="leaderboard-section">
          <h2>🏆 Leaderboard</h2>
          <p>See how you rank against other players!</p>
          
          <div className="leaderboard-container">
            <div className="leaderboard-header">
              <span className="rank-header">Rank</span>
              <span className="player-header">Player</span>
              <span className="level-header">Level</span>
              <span className="score-header">Score</span>
              <span className="games-header">Games</span>
            </div>
            
            <div className="leaderboard-list">
              {(showAllLeaderboard ? allLeaderboard : leaderboard).map((user, index) => (
                <div 
                  key={user.userId} 
                  className={`leaderboard-item ${user.level === 5 ? 'gold-user' : ''} ${user.userId === auth.currentUser?.uid ? 'current-user' : ''}`}
                >
                  <span className="rank">#{index + 1}</span>
                  <span className="player-name">{user.fullName}</span>
                  <span className="level">Level {user.level}</span>
                  <span className="score">{user.totalScore}</span>
                  <span className="games">{user.gamesCompleted}</span>
                </div>
              ))}
            </div>
            
            <div className="leaderboard-actions">
              <button 
                className="btn-see-more" 
                onClick={handleSeeMore}
                disabled={loadingLeaderboard}
              >
                {loadingLeaderboard ? 'Loading...' : (showAllLeaderboard ? 'Show Top 10' : 'See More Players')}
              </button>
            </div>
          </div>
        </section>

        <section className="game-info">
          <h2>How to Play</h2>
          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon">1️⃣</div>
              <h4>Select a Game</h4>
              <p>Choose any game from the gallery above. You can play games in any order!</p>
            </div>
            <div className="info-card">
              <div className="info-icon">2️⃣</div>
              <h4>Complete the Challenge</h4>
              <p>Finish the entire game correctly to earn its mark. Partial progress won’t count.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">3️⃣</div>
              <h4>Level Up</h4>
              <p>Earn up to 5 marks to reach Level 5! Your level is displayed in the navbar.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">🔄</div>
              <h4>Replay Anytime</h4>
              <p>You can replay completed games to improve your performance.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Game Modal */}
      {showGameModal && selectedGame && (
        <div className="game-modal-overlay">
          <div className="game-modal">
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

      {/* Treasure Found Popup */}
      {showTreasurePopup && (
        <div className="treasure-popup-overlay">
          <div className="treasure-popup">
            <div className="treasure-icon">💎</div>
            <h2>{referenceNumber ? 'Your Reward Ticket' : 'Treasure Found!'}</h2>
            
            {referenceNumber ? (
              <div className="ticket-container">
                <p>Present this reference number at the main office to collect your reward.</p>
                <div className="reference-box">
                  <span className="ref-label">REFERENCE NUMBER</span>
                  <span className="ref-value">{referenceNumber}</span>
                </div>
                <div className="treasure-actions">
                  <button className="btn-claim-treasure" onClick={handleDownloadReference}>
                    📥 Download Ticket
                  </button>
                  <button className="btn-close-treasure" onClick={() => setShowTreasurePopup(false)}>
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p>Congratulations! You have completed all games and discovered the hidden museum treasure!</p>
                <div className="treasure-actions">
                  <button className="btn-claim-treasure" onClick={handleClaimRewards} disabled={isClaiming}>
                    {isClaiming ? '⌛ Generating Ticket...' : '🎁 Claim Rewards'}
                  </button>
                  <button className="btn-close-treasure" onClick={() => setShowTreasurePopup(false)}>
                    Maybe Later
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />

      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
    </div>
  );
};

export default PlayPage;
