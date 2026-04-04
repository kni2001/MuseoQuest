import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

// Initialize user game progress
export const initializeUserProgress = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId, 'gameProgress', 'stats');
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      await setDoc(userRef, {
        totalScore: 0,
        gamesCompleted: [],
        gamesSkipped: [],
        level: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return docSnap.data();
  } catch (error) {
    console.error('Error initializing user progress:', error);
    throw error;
  }
};

// Get user's current score and level
export const getUserProgress = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId, 'gameProgress', 'stats');
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    
    // If doesn't exist, initialize it
    return await initializeUserProgress(userId);
  } catch (error) {
    console.error('Error getting user progress:', error);
    throw error;
  }
};

// Update score when user completes a game
export const addGameScore = async (userId, gameId, points = 1) => {
  try {
    const userRef = doc(db, 'users', userId, 'gameProgress', 'stats');
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await initializeUserProgress(userId);
    }
    
    const currentData = (await getDoc(userRef)).data();
    const gamesCompleted = currentData?.gamesCompleted || [];
    let newScore = currentData?.totalScore || 0;
    let newLevel = currentData?.level || 1;

    // Only award points and record completion on the first successful attempt
    const firstCompletion = !gamesCompleted.includes(gameId);
    if (firstCompletion && points > 0) {
      newScore += points;
      newLevel = Math.min(newScore, 5); // Max level 5
      gamesCompleted.push(gameId);

      await updateDoc(userRef, {
        totalScore: newScore,
        level: newLevel,
        gamesCompleted: gamesCompleted,
        updatedAt: new Date()
      });
    }
    // if points <= 0 or game already completed, do not modify score or gamesCompleted
    // we still record the individual game document below regardless of points


    // Also store individual game completion
    const gameRef = doc(db, 'users', userId, 'gameProgress', gameId);
    await setDoc(gameRef, {
      gameId,
      completed: true,
      points,
      completedAt: new Date()
    }, { merge: true });

    return { totalScore: newScore, level: newLevel };
  } catch (error) {
    console.error('Error adding game score:', error);
    throw error;
  }
};

// Mark game as skipped
export const skipGame = async (userId, gameId) => {
  try {
    const userRef = doc(db, 'users', userId, 'gameProgress', 'stats');
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await initializeUserProgress(userId);
    }
    
    const currentData = (await getDoc(userRef)).data();
    const gamesSkipped = currentData?.gamesSkipped || [];
    
    if (!gamesSkipped.includes(gameId)) {
      gamesSkipped.push(gameId);
    }
    
    await updateDoc(userRef, {
      gamesSkipped: gamesSkipped,
      updatedAt: new Date()
    });
    
    return gamesSkipped;
  } catch (error) {
    console.error('Error skipping game:', error);
    throw error;
  }
};

// Get user's level based on score
export const getUserLevel = async (userId) => {
  try {
    const progress = await getUserProgress(userId);
    return Math.min(progress.totalScore || 0, 5); // Max level 5
  } catch (error) {
    console.error('Error getting user level:', error);
    return 1;
  }
};

// Reset user progress (for testing/admin)
export const resetUserProgress = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId, 'gameProgress', 'stats');
    await setDoc(userRef, {
      totalScore: 0,
      gamesCompleted: [],
      gamesSkipped: [],
      level: 0,               // start back at level 0 per spec
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error resetting progress:', error);
    throw error;
  }
};

// Get leaderboard data - top users by totalScore
export const getLeaderboard = async (limitCount = 10) => {
  try {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const leaderboard = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      // Get user's game progress
      const progressRef = doc(db, 'users', userId, 'gameProgress', 'stats');
      const progressSnap = await getDoc(progressRef);
      
      if (progressSnap.exists()) {
        const progress = progressSnap.data();
        leaderboard.push({
          userId,
          fullName: userData.fullName || 'Anonymous',
          email: userData.email,
          level: progress.level || 0,
          totalScore: progress.totalScore || 0,
          gamesCompleted: progress.gamesCompleted?.length || 0
        });
      } else {
        // User exists but no progress yet
        leaderboard.push({
          userId,
          fullName: userData.fullName || 'Anonymous',
          email: userData.email,
          level: 0,
          totalScore: 0,
          gamesCompleted: 0
        });
      }
    }
    
    // Sort by totalScore descending, then by level descending
    leaderboard.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      return b.level - a.level;
    });
    
    return leaderboard.slice(0, limitCount);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
};

// Get all users for "see more" functionality
export const getAllUsersLeaderboard = async () => {
  try {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const leaderboard = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      // Get user's game progress
      const progressRef = doc(db, 'users', userId, 'gameProgress', 'stats');
      const progressSnap = await getDoc(progressRef);
      
      if (progressSnap.exists()) {
        const progress = progressSnap.data();
        leaderboard.push({
          userId,
          fullName: userData.fullName || 'Anonymous',
          email: userData.email,
          level: progress.level || 0,
          totalScore: progress.totalScore || 0,
          gamesCompleted: progress.gamesCompleted?.length || 0
        });
      } else {
        leaderboard.push({
          userId,
          fullName: userData.fullName || 'Anonymous',
          email: userData.email,
          level: 0,
          totalScore: 0,
          gamesCompleted: 0
        });
      }
    }
    
    // Sort by totalScore descending, then by level descending
    leaderboard.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      return b.level - a.level;
    });
    
    return leaderboard;
  } catch (error) {
    console.error('Error getting full leaderboard:', error);
    throw error;
  }
};

// Claim reward and generate reference number
export const claimReward = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId, 'gameProgress', 'stats');
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User progress not found');
    }
    
    const currentData = userDoc.data();
    if (currentData.rewardReference) {
      return currentData.rewardReference; // Already claimed
    }

    // Generate unique reference
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let ref = 'MUSEO-';
    for (let i = 0; i < 8; i++) {
        ref += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    await updateDoc(userRef, {
      rewardClaimed: true,
      rewardReference: ref,
      claimedAt: new Date()
    });
    
    return ref;
  } catch (error) {
    console.error('Error claiming reward:', error);
    throw error;
  }
};
