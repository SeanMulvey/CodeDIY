import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

/**
 * Registers a new user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {string} displayName - User's display name
 * @returns {Promise} - Promise containing user credential
 */
export const registerUser = async (email, password, displayName) => {
  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      displayName,
      email,
      createdAt: new Date().toISOString(),
      vehicles: [],
      searchHistory: [],
      mechanicEmail: ''
    });
    
    return userCredential;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Signs in a user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise} - Promise containing user credential
 */
export const signIn = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

/**
 * Signs out the current user
 * @returns {Promise} - Promise that resolves when sign out is complete
 * 
 * NOTE: This function may not work reliably in some situations.
 * For direct logout, consider using the Firebase auth.signOut() method directly:
 * import { auth } from '../firebase/config';
 * await auth.signOut();
 */
export const signOut = async () => {
  try {
    return await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Sends a password reset email to the user
 * @param {string} email - User's email address
 * @returns {Promise} - Promise that resolves when email is sent
 */
export const resetPassword = async (email) => {
  try {
    return await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

/**
 * Gets the current user's profile data
 * @returns {Promise} - Promise containing user profile data
 */
export const getUserProfile = async () => {
  const user = auth.currentUser;
  
  if (!user) return null;
  
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        ...userDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Updates the mechanic's email address for the current user
 * @param {string} mechanicEmail - Mechanic's email address
 * @returns {Promise} - Promise that resolves when update is complete
 */
export const updateMechanicEmail = async (mechanicEmail) => {
  const user = auth.currentUser;
  
  if (!user) throw new Error('User not authenticated');
  
  try {
    await updateDoc(doc(db, 'users', user.uid), {
      mechanicEmail
    });
  } catch (error) {
    console.error('Error updating mechanic email:', error);
    throw error;
  }
};

/**
 * Listens for auth state changes and calls the provided callback
 * @param {Function} callback - Callback function to call when auth state changes
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
}; 