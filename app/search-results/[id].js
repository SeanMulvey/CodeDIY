import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Share,
  Linking,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import VideoPlayer, { openYouTubeVideo } from '../../components/VideoPlayer';
import { getSearchHistory, rateVideo } from '../../services/searchHistoryService';
import { emailMechanic } from '../../services/emailService';
import { getUserProfile } from '../../services/authService';

export default function SearchResultsScreen() {
  const { id } = useLocalSearchParams();
  const [search, setSearch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [mechanicEmail, setMechanicEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get search history
        const history = await getSearchHistory();
        const foundSearch = history.find(item => item.id === id);
        
        if (!foundSearch) {
          Alert.alert('Error', 'Search not found');
          router.back();
          return;
        }
        
        setSearch(foundSearch);
        
        // Get user profile for mechanic email
        const userProfile = await getUserProfile();
        setMechanicEmail(userProfile?.mechanicEmail || '');
      } catch (error) {
        console.error('Error loading search results:', error);
        Alert.alert('Error', 'Failed to load search results');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  const handleVideoPress = (video) => {
    setSelectedVideo(video);
  };

  const handleVideoClose = () => {
    setSelectedVideo(null);
  };

  const handleRateVideo = async (videoId, isHelpful) => {
    try {
      await rateVideo(id, videoId, isHelpful);
      
      // Update local state
      setSearch(prevSearch => {
        const updatedResults = prevSearch.results.map(video => {
          if (video.id === videoId) {
            return {
              ...video,
              rated: true,
              isHelpful
            };
          }
          return video;
        });
        
        return {
          ...prevSearch,
          results: updatedResults
        };
      });
      
      Alert.alert(
        'Thank You', 
        `You rated this video as ${isHelpful ? 'helpful' : 'not helpful'}.`
      );
    } catch (error) {
      console.error('Error rating video:', error);
      Alert.alert('Error', 'Failed to rate video');
    }
  };

  const handleShareVideo = async (video) => {
    try {
      const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
      await Share.share({
        message: `Check out this repair video for ${search.vehicle.year} ${search.vehicle.make} ${search.vehicle.model} - Code ${search.code}: ${videoUrl}`,
        url: videoUrl
      });
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  };

  const handleEmailMechanic = async () => {
    try {
      if (!mechanicEmail) {
        Alert.alert(
          'No Mechanic Email',
          'You haven\'t set a mechanic email yet. Would you like to set one now?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Set Email', onPress: () => router.push('/profile') }
          ]
        );
        return;
      }
      
      await emailMechanic(
        mechanicEmail,
        search.vehicle,
        search.code,
        search.results
      );
    } catch (error) {
      console.error('Error emailing mechanic:', error);
      Alert.alert('Error', 'Failed to send email');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading search results...</Text>
      </View>
    );
  }

  if (selectedVideo) {
    return (
      <View style={styles.videoContainer}>
        <View style={styles.videoHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={handleVideoClose}>
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.videoHeaderTitle} numberOfLines={1}>
            {selectedVideo.title}
          </Text>
        </View>
        
        <VideoPlayer 
          videoId={selectedVideo.id}
          title={selectedVideo.title}
          style={styles.videoPlayer}
        />
        
        {Platform.OS === 'web' && (
          <TouchableOpacity
            style={styles.openExternalButton}
            onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${selectedVideo.id}`)}
          >
            <MaterialIcons name="open-in-new" size={16} color="#fff" />
            <Text style={styles.openExternalText}>Open in YouTube</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{selectedVideo.title}</Text>
          <Text style={styles.channelName}>{selectedVideo.channelTitle}</Text>
          <Text style={styles.videoDescription} numberOfLines={3}>
            {selectedVideo.description}
          </Text>
          
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingTitle}>Was this video helpful?</Text>
            <View style={styles.ratingButtons}>
              <TouchableOpacity 
                style={[styles.ratingButton, styles.helpfulButton]}
                onPress={() => handleRateVideo(selectedVideo.id, true)}
                disabled={selectedVideo.rated}
              >
                <FontAwesome name="thumbs-up" size={18} color="#fff" />
                <Text style={styles.ratingButtonText}>Helpful</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.ratingButton, styles.notHelpfulButton]}
                onPress={() => handleRateVideo(selectedVideo.id, false)}
                disabled={selectedVideo.rated}
              >
                <FontAwesome name="thumbs-down" size={18} color="#fff" />
                <Text style={styles.ratingButtonText}>Not Helpful</Text>
              </TouchableOpacity>
            </View>
            
            {selectedVideo.rated && (
              <Text style={styles.ratedText}>
                You rated this video as {selectedVideo.isHelpful ? 'helpful' : 'not helpful'}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Search Results</Text>
          <Text style={styles.subtitle}>
            {search.vehicle.year} {search.vehicle.make} {search.vehicle.model} - Code {search.code}
          </Text>
        </View>
      </View>
      
      <View style={styles.toolsSection}>
        <Text style={styles.toolsTitle}>Common Tools Needed</Text>
        <View style={styles.toolsList}>
          <View style={styles.toolItem}>
            <MaterialIcons name="build" size={20} color="#3498db" />
            <Text style={styles.toolText}>OBD-II Scanner</Text>
          </View>
          <View style={styles.toolItem}>
            <MaterialIcons name="build" size={20} color="#3498db" />
            <Text style={styles.toolText}>Socket Set</Text>
          </View>
          <View style={styles.toolItem}>
            <MaterialIcons name="build" size={20} color="#3498db" />
            <Text style={styles.toolText}>Screwdriver Set</Text>
          </View>
          <View style={styles.toolItem}>
            <MaterialIcons name="build" size={20} color="#3498db" />
            <Text style={styles.toolText}>Multimeter</Text>
          </View>
        </View>
      </View>
      
      <FlatList
        data={search.results}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.videoItem}
            onPress={() => handleVideoPress(item)}
          >
            <Image 
              source={{ uri: item.thumbnail }} 
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <View style={styles.videoDetails}>
              <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.channelName}>{item.channelTitle}</Text>
              
              <View style={styles.videoActions}>
                {item.rated && (
                  <View style={[
                    styles.ratingBadge, 
                    item.isHelpful ? styles.helpfulBadge : styles.notHelpfulBadge
                  ]}>
                    <FontAwesome 
                      name={item.isHelpful ? "thumbs-up" : "thumbs-down"} 
                      size={12} 
                      color="#fff" 
                    />
                    <Text style={styles.ratingBadgeText}>
                      {item.isHelpful ? 'Helpful' : 'Not Helpful'}
                    </Text>
                  </View>
                )}
                
                <TouchableOpacity 
                  style={styles.shareButton}
                  onPress={() => handleShareVideo(item)}
                >
                  <FontAwesome name="share" size={14} color="#3498db" />
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <Text style={styles.resultsCount}>
            Found {search.results.length} videos for this code
          </Text>
        }
        ListFooterComponent={
          <TouchableOpacity 
            style={styles.mechanicButton}
            onPress={handleEmailMechanic}
          >
            <MaterialIcons name="email" size={20} color="#fff" />
            <Text style={styles.mechanicButtonText}>
              Email a Mechanic About This Issue
            </Text>
          </TouchableOpacity>
        }
        ListFooterComponentStyle={styles.footer}
      />
    </View>
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
  loadingText: {
    marginTop: 10,
    color: '#7f8c8d',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
  },
  headerContent: {
    paddingTop: 5,
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
  toolsSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  toolsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  toolsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  toolText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#2c3e50',
  },
  resultsCount: {
    padding: 15,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  videoItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbnail: {
    width: 120,
    height: 90,
  },
  videoDetails: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  channelName: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 3,
  },
  videoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  helpfulBadge: {
    backgroundColor: '#2ecc71',
  },
  notHelpfulBadge: {
    backgroundColor: '#e74c3c',
  },
  ratingBadgeText: {
    color: '#fff',
    fontSize: 10,
    marginLeft: 3,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#3498db',
    fontSize: 12,
    marginLeft: 4,
  },
  footer: {
    padding: 20,
  },
  mechanicButton: {
    flexDirection: 'row',
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mechanicButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    padding: 10,
  },
  closeButton: {
    padding: 5,
  },
  videoHeaderTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  videoPlayer: {
    width: '100%',
    height: 240,
  },
  videoInfo: {
    backgroundColor: '#fff',
    padding: 15,
  },
  videoDescription: {
    marginTop: 10,
    color: '#7f8c8d',
    fontSize: 14,
  },
  ratingContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ratingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  helpfulButton: {
    backgroundColor: '#2ecc71',
  },
  notHelpfulButton: {
    backgroundColor: '#e74c3c',
  },
  ratingButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  ratedText: {
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
    color: '#7f8c8d',
  },
  openExternalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff0000',
    padding: 8,
    marginTop: 8,
  },
  openExternalText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
}); 