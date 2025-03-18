import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

/**
 * Ensures the user document exists in Firestore
 * @returns {Promise} - Promise that resolves when document exists
 */
const ensureUserDocument = async () => {
  const user = auth.currentUser;
  
  if (!user) throw new Error('User not authenticated');
  
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (!userDoc.exists()) {
    // Create user document if it doesn't exist
    await setDoc(userDocRef, {
      displayName: user.displayName || '',
      email: user.email,
      createdAt: new Date().toISOString(),
      vehicles: [],
      searchHistory: [],
      mechanicEmail: ''
    });
    console.log('Created user document for', user.uid);
  }
  
  return userDocRef;
};

/**
 * Adds a search to the user's search history
 * @param {Object} search - Search object {vehicle, code, timestamp, results}
 * @returns {Promise} - Promise that resolves when search is added
 */
export const addSearchToHistory = async (search) => {
  try {
    // Ensure user document exists
    const userDocRef = await ensureUserDocument();
    
    // Add a unique ID to the search object
    const searchWithId = {
      ...search,
      id: Date.now().toString(), // Simple unique ID
      timestamp: new Date().toISOString()
    };
    
    // Update user document with new search
    await updateDoc(userDocRef, {
      searchHistory: arrayUnion(searchWithId)
    });
    
    return searchWithId;
  } catch (error) {
    console.error('Error adding search to history:', error);
    throw error;
  }
};

/**
 * Gets the user's search history
 * @returns {Promise} - Promise containing an array of searches
 */
export const getSearchHistory = async () => {
  try {
    // Ensure user document exists
    const userDocRef = await ensureUserDocument();
    const userDoc = await getDoc(userDocRef);
    
    // Sort by timestamp (newest first)
    const history = userDoc.data().searchHistory || [];
    return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Error getting search history:', error);
    throw error;
  }
};

/**
 * Deletes a search from the user's search history
 * @param {Object} search - Search object to delete
 * @returns {Promise} - Promise that resolves when search is deleted
 */
export const deleteSearchFromHistory = async (search) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    // Get direct reference to the user document
    const userDocRef = doc(db, 'users', user.uid);
    
    // Get current user data
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }
    
    // Get current data
    const userData = userDoc.data();
    
    // Find and remove the search
    const currentHistory = userData.searchHistory || [];
    const filteredHistory = currentHistory.filter(s => s.id !== search.id);
    
    // Update with filtered history array
    await updateDoc(userDocRef, {
      searchHistory: filteredHistory
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting search from history:', error);
    throw error;
  }
};

/**
 * Clears the user's search history
 * @returns {Promise} - Promise that resolves when history is cleared
 */
export const clearSearchHistory = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    // Get direct reference to the user document
    const userDocRef = doc(db, 'users', user.uid);
    
    // Get current user data
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }
    
    // Get current data
    const userData = userDoc.data();
    
    // Keep everything except searchHistory, which we'll set to empty array
    await updateDoc(userDocRef, {
      ...userData,
      searchHistory: []
    });
    
    return true;
  } catch (error) {
    console.error('Error clearing search history:', error);
    throw error;
  }
};

/**
 * Rate a video in search results as helpful or not helpful
 * @param {string} searchId - ID of the search
 * @param {string} videoId - ID of the video to rate
 * @param {boolean} isHelpful - Whether the video was helpful
 * @returns {Promise} - Promise that resolves when rating is updated
 */
export const rateVideo = async (searchId, videoId, isHelpful) => {
  try {
    // Ensure user document exists
    const userDocRef = await ensureUserDocument();
    
    // Get user's search history
    const userDoc = await getDoc(userDocRef);
    const searchHistory = userDoc.data().searchHistory || [];
    
    // Find the search to update
    const searchIndex = searchHistory.findIndex(s => s.id === searchId);
    
    if (searchIndex === -1) {
      throw new Error('Search not found');
    }
    
    // Clone the search history
    const updatedHistory = [...searchHistory];
    const search = {...updatedHistory[searchIndex]};
    
    // Find the video to rate
    const results = search.results || [];
    const videoIndex = results.findIndex(v => v.id === videoId);
    
    if (videoIndex === -1) {
      throw new Error('Video not found in search results');
    }
    
    // Update video rating
    const updatedResults = [...results];
    updatedResults[videoIndex] = {
      ...updatedResults[videoIndex],
      rated: true,
      isHelpful
    };
    
    // Update search with rated video
    search.results = updatedResults;
    updatedHistory[searchIndex] = search;
    
    // Update user document with updated search history
    await updateDoc(userDocRef, {
      searchHistory: updatedHistory
    });
  } catch (error) {
    console.error('Error rating video:', error);
    throw error;
  }
}; 