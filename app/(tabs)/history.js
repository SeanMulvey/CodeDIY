import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, AntDesign, FontAwesome } from '@expo/vector-icons';
import { getSearchHistory, deleteSearchFromHistory, clearSearchHistory } from '../../services/searchHistoryService';

export default function HistoryScreen() {
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      setLoading(true);
      const history = await getSearchHistory();
      setSearchHistory(history);
    } catch (error) {
      console.error('Error loading search history:', error);
      Alert.alert('Error', 'Failed to load search history');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (searchHistory.length === 0) {
      Alert.alert('History Empty', 'You have no search history to clear.');
      return;
    }

    Alert.alert(
      'Clear History',
      'Are you sure you want to clear your entire search history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              console.log('Attempting to clear search history...');
              await clearSearchHistory();
              console.log('Search history cleared successfully');
              
              // Force reload from the server to verify items were cleared
              const updatedHistory = await getSearchHistory();
              console.log('Reloaded history length:', updatedHistory.length);
              
              setSearchHistory([]);
              Alert.alert('Success', 'Search history cleared');
            } catch (error) {
              console.error('Error clearing search history:', error);
              Alert.alert('Error', 'Failed to clear search history: ' + error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteSearch = (search) => {
    Alert.alert(
      'Delete Search',
      `Are you sure you want to delete this search?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // Make a copy of the search to ensure it matches exactly
              const searchCopy = JSON.parse(JSON.stringify(search));
              
              // Delete the search and get fresh data
              await deleteSearchFromHistory(searchCopy);
              
              // Update local state without waiting for a reload
              const updatedHistory = searchHistory.filter(s => s.id !== search.id);
              setSearchHistory(updatedHistory);
              
              if (updatedHistory.length === 0) {
                // If we just deleted the last item, show empty state immediately
                Alert.alert('Success', 'Search removed and history is now empty');
              } else {
                Alert.alert('Success', 'Search removed from history');
              }
            } catch (error) {
              console.error('Error deleting search:', error);
              Alert.alert('Error', 'Failed to delete search: ' + error.message);
              
              // If there was an error, reload all history to ensure UI is in sync
              await loadSearchHistory();
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const navigateToSearchResults = (searchId) => {
    router.push(`/search-results/${searchId}`);
  };

  const renderItem = ({ item }) => {
    // Calculate how many videos were rated helpful
    const ratedVideos = item.results.filter(video => video.rated);
    const helpfulVideos = ratedVideos.filter(video => video.isHelpful);
    
    return (
      <TouchableOpacity
        style={styles.searchItem}
        onPress={() => navigateToSearchResults(item.id)}
      >
        <View style={styles.searchHeader}>
          <View style={styles.vehicleInfo}>
            <MaterialCommunityIcons name="car" size={20} color="#3498db" />
            <Text style={styles.vehicleText}>
              {item.vehicle.year} {item.vehicle.make} {item.vehicle.model}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteSearch(item)}
          >
            <AntDesign name="close" size={18} color="#e74c3c" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Code:</Text>
          <Text style={styles.codeText}>{item.code}</Text>
        </View>
        
        <View style={styles.searchFooter}>
          <Text style={styles.dateText}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
          
          {ratedVideos.length > 0 && (
            <View style={styles.ratingInfo}>
              <FontAwesome 
                name="thumbs-up" 
                size={14} 
                color="#2ecc71" 
              />
              <Text style={styles.ratingText}>
                {helpfulVideos.length}/{ratedVideos.length} videos rated helpful
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search History</Text>
        <Text style={styles.subtitle}>Review your previous searches</Text>
      </View>
      
      {loading && searchHistory.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading search history...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={searchHistory}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="history"
                  size={60}
                  color="#bdc3c7"
                />
                <Text style={styles.emptyText}>
                  You haven't made any searches yet
                </Text>
                <Text style={styles.emptySubtext}>
                  Your search history will appear here
                </Text>
              </View>
            }
          />
          
          {searchHistory.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearHistory}
            >
              <AntDesign name="delete" size={18} color="#fff" />
              <Text style={styles.clearButtonText}>Clear All History</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
  },
  title: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#7f8c8d',
  },
  list: {
    padding: 15,
    paddingBottom: 80, // Add padding for the clear button
  },
  searchItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
    color: '#2c3e50',
  },
  deleteButton: {
    padding: 5,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  codeLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 5,
  },
  codeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  searchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 5,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 5,
    textAlign: 'center',
  },
  clearButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#e74c3c',
    height: 50,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
}); 