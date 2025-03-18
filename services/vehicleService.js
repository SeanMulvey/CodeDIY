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
 * Adds a new vehicle to the user's profile
 * @param {Object} vehicle - Vehicle object {year, make, model}
 * @returns {Promise} - Promise that resolves when vehicle is added
 */
export const addVehicle = async (vehicle) => {
  try {
    // Ensure user document exists
    const userDocRef = await ensureUserDocument();
    
    // Add a unique ID to the vehicle object
    const vehicleWithId = {
      ...vehicle,
      id: Date.now().toString(), // Simple unique ID
      addedAt: new Date().toISOString()
    };
    
    // Update user document with new vehicle
    await updateDoc(userDocRef, {
      vehicles: arrayUnion(vehicleWithId)
    });
    
    return vehicleWithId;
  } catch (error) {
    console.error('Error adding vehicle:', error);
    throw error;
  }
};

/**
 * Gets all vehicles for the current user
 * @returns {Promise} - Promise containing an array of vehicles
 */
export const getVehicles = async () => {
  try {
    // Ensure user document exists
    const userDocRef = await ensureUserDocument();
    const userDoc = await getDoc(userDocRef);
    
    return userDoc.data().vehicles || [];
  } catch (error) {
    console.error('Error getting vehicles:', error);
    throw error;
  }
};

/**
 * Updates a vehicle in the user's profile
 * @param {Object} updatedVehicle - Updated vehicle object
 * @returns {Promise} - Promise that resolves when vehicle is updated
 */
export const updateVehicle = async (updatedVehicle) => {
  try {
    // Ensure user document exists
    const userDocRef = await ensureUserDocument();
    
    // Get current vehicles
    const userDoc = await getDoc(userDocRef);
    const vehicles = userDoc.data().vehicles || [];
    
    // Find the vehicle to update
    const oldVehicle = vehicles.find(v => v.id === updatedVehicle.id);
    
    if (!oldVehicle) {
      throw new Error('Vehicle not found');
    }
    
    // Remove old vehicle and add updated one
    await updateDoc(userDocRef, {
      vehicles: arrayRemove(oldVehicle)
    });
    
    await updateDoc(userDocRef, {
      vehicles: arrayUnion(updatedVehicle)
    });
    
    return updatedVehicle;
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
};

/**
 * Deletes a vehicle from the user's profile
 * @param {Object} vehicle - Vehicle object to delete
 * @returns {Promise} - Promise that resolves when vehicle is deleted
 */
export const deleteVehicle = async (vehicle) => {
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
    
    // Find and remove the vehicle
    const currentVehicles = userData.vehicles || [];
    const filteredVehicles = currentVehicles.filter(v => v.id !== vehicle.id);
    
    // If the vehicle wasn't found, nothing to delete
    if (filteredVehicles.length === currentVehicles.length) {
      console.warn('Vehicle not found in user profile:', vehicle.id);
      return false;
    }
    
    // Update with filtered vehicles array
    await updateDoc(userDocRef, {
      vehicles: filteredVehicles
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
}; 