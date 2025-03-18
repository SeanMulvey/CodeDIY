import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { getUserProfile, signOut, updateMechanicEmail } from '../../services/authService';
import { auth } from '../../firebase/config';

/**
 * ProfileScreen component - Displays and manages user profile information
 * Allows users to view their account details, update mechanic email, and logout
 */
export default function ProfileScreen() {
  // State management for user data and UI states
  const [user, setUser] = useState(null);        // Stores user profile data
  const [loading, setLoading] = useState(true);  // Controls loading state
  const [savingEmail, setSavingEmail] = useState(false);  // Controls email save button state
  const [mechanicEmail, setMechanicEmail] = useState('');  // Stores mechanic email input
  const router = useRouter();  // Router for navigation

  // Load user profile data when component mounts
  useEffect(() => {
    loadUserProfile();
  }, []);

  /**
   * Fetches the user profile data from Firebase
   * Updates local state with the retrieved information
   */
  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await getUserProfile();
      setUser(userProfile);
      setMechanicEmail(userProfile?.mechanicEmail || '');
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Saves the updated mechanic email to the user's profile
   * Shows success/error alerts based on the operation result
   */
  const handleSaveMechanicEmail = async () => {
    try {
      setSavingEmail(true);
      await updateMechanicEmail(mechanicEmail);
      Alert.alert('Success', 'Mechanic email updated successfully');
    } catch (error) {
      console.error('Error updating mechanic email:', error);
      Alert.alert('Error', 'Failed to update mechanic email');
    } finally {
      setSavingEmail(false);
    }
  };

  /**
   * Handles user logout by directly calling Firebase auth
   * Redirects to login screen on successful logout
   * NOTE: Uses direct Firebase auth.signOut() to avoid issues with auth service
   */
  const directLogout = async () => {
    try {
      console.log('Direct logout attempt');
      await auth.signOut();  // Direct Firebase auth call
      console.log('Direct logout successful');
      router.push('/auth/login');  // Redirect to login screen
    } catch (error) {
      console.error('Direct logout error:', error);
      Alert.alert('Error', 'Logout failed: ' + error.message);
    }
  };

  // Show loading indicator while fetching user data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Main profile screen UI
  return (
    <ScrollView style={styles.container}>
      {/* Header with user info */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <FontAwesome name="user-circle" size={80} color="#fff" />
        </View>
        <Text style={styles.displayName}>{user?.displayName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* User information section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Info</Text>
        <View style={styles.infoItem}>
          <MaterialIcons name="calendar-today" size={20} color="#3498db" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Member since</Text>
            <Text style={styles.infoValue}>
              {new Date(user?.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.infoItem}>
          <MaterialIcons name="directions-car" size={20} color="#3498db" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Vehicles saved</Text>
            <Text style={styles.infoValue}>{user?.vehicles?.length || 0}</Text>
          </View>
        </View>
        <View style={styles.infoItem}>
          <MaterialIcons name="history" size={20} color="#3498db" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Searches made</Text>
            <Text style={styles.infoValue}>{user?.searchHistory?.length || 0}</Text>
          </View>
        </View>
      </View>

      {/* Mechanic contact section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mechanic Contact</Text>
        <Text style={styles.mechanicDescription}>
          Add your mechanic's email to quickly send them information about repairs
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter mechanic's email"
          value={mechanicEmail}
          onChangeText={setMechanicEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveMechanicEmail}
          disabled={savingEmail}
        >
          {savingEmail ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Mechanic Email</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Logout button */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={directLogout}
        activeOpacity={0.7}
      >
        <MaterialIcons name="logout" size={20} color="#fff" />
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>

      {/* App information footer */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>CodeDIY</Text>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

/**
 * Styles for the ProfileScreen component
 * Organized by UI section for better readability
 */
const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#7f8c8d',
  },
  
  // Header styles
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    alignItems: 'center',
  },
  profileImageContainer: {
    marginVertical: 15,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginTop: 5,
  },
  
  // Section styles
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    margin: 15,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  
  // Info item styles
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoContent: {
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  
  // Mechanic email section styles
  mechanicDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  saveButton: {
    height: 50,
    backgroundColor: '#3498db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // App info styles
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  versionText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  
  // Logout button styles
  logoutButton: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 15,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
}); 