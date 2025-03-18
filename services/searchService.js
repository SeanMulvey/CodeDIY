import { searchVideos } from './youtube';
import { addSearchToHistory } from './searchHistoryService';

/**
 * Search for repair videos based on vehicle information and diagnostic code
 * @param {string} make - Vehicle make
 * @param {string} model - Vehicle model
 * @param {string} year - Vehicle year
 * @param {string} code - Diagnostic trouble code
 * @returns {Promise} - Promise containing search results
 */
export const searchRepairVideos = async (make, model, year, code) => {
  try {
    // Normalize inputs
    const normalizedMake = make.trim();
    const normalizedModel = model.trim();
    const normalizedYear = year.toString().trim();
    const normalizedCode = code.trim().toUpperCase();
    
    // Construct search query
    // Format: "[CODE] [YEAR] [MAKE] [MODEL] repair"
    const query = `${normalizedCode} ${normalizedYear} ${normalizedMake} ${normalizedModel} repair`;
    
    console.log('Searching with query:', query);
    
    // Search YouTube for videos
    const searchResults = await searchVideos(query, 15);
    
    return searchResults.map(video => ({
      ...video,
      rated: false,
      isHelpful: null
    }));
  } catch (error) {
    console.error('Error searching YouTube:', error);
    throw error;
  }
};

/**
 * Search and save repair videos to history
 * @param {Object} vehicle - Vehicle object {make, model, year}
 * @param {string} code - Diagnostic trouble code
 * @returns {Promise} - Promise containing search with results
 */
export const searchAndSaveRepairVideos = async (vehicle, code) => {
  try {
    // Search for videos
    const videos = await searchRepairVideos(vehicle.make, vehicle.model, vehicle.year, code);
    
    // Save search to history
    const search = await addSearchToHistory({
      vehicle,
      code,
      results: videos
    });
    
    return search;
  } catch (error) {
    console.error('Error searching and saving repair videos:', error);
    throw error;
  }
}; 