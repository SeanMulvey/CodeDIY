import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { getUserProfile } from '../../services/authService';
import { getVehicles } from '../../services/vehicleService';
import { getSearchHistory } from '../../services/searchHistoryService';

export default function DashboardScreen() {
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user profile
        const userProfile = await getUserProfile();
        setUser(userProfile);

        // Load vehicles
        const userVehicles = await getVehicles();
        setVehicles(userVehicles);

        // Load recent searches
        const searchHistory = await getSearchHistory();
        setRecentSearches(searchHistory.slice(0, 3)); // Get most recent 3 searches
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const navigateToSearch = () => {
    router.push('/search');
  };

  const navigateToVehicles = () => {
    router.push('/vehicles');
  };

  const navigateToHistory = () => {
    router.push('/history');
  };

  const navigateToProfile = () => {
    router.push('/profile');
  };

  const navigateToSearchResults = (searchId) => {
    router.push(`/search-results/${searchId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome, {user?.displayName}</Text>
        <Text style={styles.subtitle}>What would you like to do today?</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={navigateToSearch}>
          <View style={[styles.iconBackground, { backgroundColor: '#3498db' }]}>
            <FontAwesome name="search" size={24} color="#fff" />
          </View>
          <Text style={styles.actionButtonText}>New Search</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={navigateToVehicles}>
          <View style={[styles.iconBackground, { backgroundColor: '#2ecc71' }]}>
            <MaterialCommunityIcons name="car" size={24} color="#fff" />
          </View>
          <Text style={styles.actionButtonText}>My Vehicles</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={navigateToHistory}>
          <View style={[styles.iconBackground, { backgroundColor: '#e74c3c' }]}>
            <MaterialIcons name="history" size={24} color="#fff" />
          </View>
          <Text style={styles.actionButtonText}>Search History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={navigateToProfile}>
          <View style={[styles.iconBackground, { backgroundColor: '#9b59b6' }]}>
            <FontAwesome name="user" size={24} color="#fff" />
          </View>
          <Text style={styles.actionButtonText}>My Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Searches */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          <TouchableOpacity onPress={navigateToHistory}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentSearches.length > 0 ? (
          recentSearches.map((search) => (
            <TouchableOpacity
              key={search.id}
              style={styles.searchItem}
              onPress={() => navigateToSearchResults(search.id)}
            >
              <View style={styles.searchInfo}>
                <Text style={styles.searchVehicle}>
                  {search.vehicle.year} {search.vehicle.make} {search.vehicle.model}
                </Text>
                <Text style={styles.searchCode}>Code: {search.code}</Text>
              </View>
              <Text style={styles.searchDate}>
                {new Date(search.timestamp).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent searches found.</Text>
        )}
      </View>

      {/* My Vehicles */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Vehicles</Text>
          <TouchableOpacity onPress={navigateToVehicles}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {vehicles.length > 0 ? (
          vehicles.slice(0, 2).map((vehicle) => (
            <View key={vehicle.id} style={styles.vehicleItem}>
              <MaterialCommunityIcons name="car" size={24} color="#3498db" />
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No vehicles added yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#3498db',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconBackground: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  seeAllText: {
    color: '#3498db',
    fontSize: 14,
  },
  searchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  searchInfo: {
    flex: 1,
  },
  searchVehicle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2c3e50',
  },
  searchCode: {
    color: '#7f8c8d',
    marginTop: 2,
  },
  searchDate: {
    color: '#7f8c8d',
    fontSize: 12,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  vehicleInfo: {
    marginLeft: 10,
  },
  vehicleName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2c3e50',
  },
  emptyText: {
    color: '#7f8c8d',
    textAlign: 'center',
    paddingVertical: 15,
    fontStyle: 'italic',
  },
}); 