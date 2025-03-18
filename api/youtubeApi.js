// YouTube API service
import axios from 'axios';
import Constants from 'expo-constants';

// Load the API key from .env via Expo Constants
// This way, the API key is not stored in the code repository
const YOUTUBE_API_KEY = Constants.expoConfig?.extra?.youtubeApiKey || 'YOUTUBE_API_KEY_PLACEHOLDER';

// Base URL for YouTube API
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Searches YouTube for videos related to vehicle repairs based on make, model, year, and code
 * @param {string} make - Vehicle make (e.g., 'Honda')
 * @param {string} model - Vehicle model (e.g., 'Civic')
 * @param {string} year - Vehicle year (e.g., '2001')
 * @param {string} code - Diagnostic trouble code (e.g., 'P0300')
 * @returns {Promise} - Promise containing search results
 */
export const searchRepairVideos = async (make, model, year, code) => {
  try {
    // Construct search query for YouTube API
    const searchQuery = `${year} ${make} ${model} ${code} repair causes fix`;
    
    // Make request to YouTube API
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        key: YOUTUBE_API_KEY,
        part: 'snippet',
        maxResults: 5, // Top 5 videos
        q: searchQuery,
        type: 'video',
        videoEmbeddable: true,
        relevanceLanguage: 'en',
      }
    });
    
    // Process the response
    const videos = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
    }));
    
    return videos;
  } catch (error) {
    console.error('Error searching YouTube:', error);
    throw error;
  }
};

/**
 * Gets additional details about a specific video
 * @param {string} videoId - The YouTube video ID
 * @returns {Promise} - Promise containing video details
 */
export const getVideoDetails = async (videoId) => {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        key: YOUTUBE_API_KEY,
        part: 'snippet,statistics',
        id: videoId,
      }
    });
    
    const videoData = response.data.items[0];
    return {
      id: videoData.id,
      title: videoData.snippet.title,
      description: videoData.snippet.description,
      views: videoData.statistics.viewCount,
      likes: videoData.statistics.likeCount,
      channelTitle: videoData.snippet.channelTitle,
    };
  } catch (error) {
    console.error('Error getting video details:', error);
    throw error;
  }
}; 