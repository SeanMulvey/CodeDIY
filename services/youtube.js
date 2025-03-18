import axios from 'axios';

// Base URL for YouTube Data API
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// YouTube API key
// Note: For a production app, this should be stored in environment variables
const YOUTUBE_API_KEY = "AIzaSyAcE8wtrymBRKa5Pz8ox_Bq8AM0r3w4Mdo";

/**
 * Check if the API key is valid
 * @param {string} apiKey - The API key to validate
 * @returns {boolean} - Whether the API key is valid
 */
const isValidApiKey = (apiKey) => {
  return typeof apiKey === 'string' && apiKey.length > 10;
};

/**
 * Search for videos on YouTube based on a query
 * @param {string} query - The search term
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise} - Promise containing search results
 */
export const searchVideos = async (query, maxResults = 10) => {
  // Validate API key
  if (!isValidApiKey(YOUTUBE_API_KEY)) {
    console.error('Invalid YouTube API key:', YOUTUBE_API_KEY);
    throw new Error('Invalid YouTube API key. Please check your configuration.');
  }

  // Validate query
  if (!query || typeof query !== 'string' || query.trim() === '') {
    console.error('Invalid search query:', query);
    throw new Error('Search query cannot be empty');
  }

  try {
    console.log('Making YouTube API request:', { 
      baseUrl: YOUTUBE_API_BASE_URL,
      endpoint: '/search',
      query,
      maxResults,
      apiKeyValid: isValidApiKey(YOUTUBE_API_KEY)
    });
    
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults,
        q: query,
        type: 'video',
        relevanceLanguage: 'en',
        key: YOUTUBE_API_KEY
      }
    });
    
    // Check if response has expected structure
    if (!response.data || !response.data.items || !Array.isArray(response.data.items)) {
      console.error('Invalid YouTube API response:', response.data);
      throw new Error('Invalid response from YouTube API');
    }
    
    console.log(`Found ${response.data.items.length} videos for query: "${query}"`);
    
    // Map to simplified format
    return response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    }));
  } catch (error) {
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('YouTube API Error Response:', {
        status: error.response.status,
        data: error.response.data
      });
      
      if (error.response.status === 403) {
        throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
      } else if (error.response.status === 400) {
        throw new Error('Invalid request to YouTube API. Please check your search parameters.');
      }
    }
    
    console.error('Error searching YouTube videos:', error);
    throw error;
  }
};

/**
 * Get details about a specific video by ID
 * @param {string} videoId - The YouTube video ID
 * @returns {Promise} - Promise containing video details
 */
export const getVideoDetails = async (videoId) => {
  // Validate API key
  if (!isValidApiKey(YOUTUBE_API_KEY)) {
    throw new Error('Invalid YouTube API key. Please check your configuration.');
  }

  // Validate video ID
  if (!videoId || typeof videoId !== 'string' || videoId.trim() === '') {
    throw new Error('Video ID cannot be empty');
  }

  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: 'snippet,statistics',
        id: videoId,
        key: YOUTUBE_API_KEY
      }
    });
    
    if (!response.data || !response.data.items || !Array.isArray(response.data.items)) {
      throw new Error('Invalid response from YouTube API');
    }
    
    if (response.data.items.length === 0) {
      throw new Error('Video not found');
    }
    
    const item = response.data.items[0];
    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      viewCount: item.statistics.viewCount,
      likeCount: item.statistics.likeCount
    };
  } catch (error) {
    console.error('Error getting video details:', error);
    throw error;
  }
}; 