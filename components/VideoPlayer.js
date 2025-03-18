import React from 'react';
import { View, Text, StyleSheet, Platform, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';

/**
 * Cross-platform video player component that handles YouTube videos
 * - Uses WebView on mobile platforms
 * - Opens browser on web or falls back to linking
 * 
 * @param {Object} props
 * @param {string} props.videoId - YouTube video ID
 * @param {string} props.title - Video title 
 * @param {string} props.style - Additional styles
 */
const VideoPlayer = ({ videoId, title, style }) => {
  // On web platform, we need to handle differently
  if (Platform.OS === 'web') {
    // Create the iframe embed HTML for web
    const embedHtml = `
      <iframe 
        width="100%" 
        height="100%" 
        src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
        title="${title || 'YouTube video player'}"
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
      ></iframe>
    `;

    // For web, use a div with innerHTML set to the iframe
    return (
      <View style={[styles.container, style]}>
        <div 
          style={{ width: '100%', height: '100%', position: 'relative' }}
          dangerouslySetInnerHTML={{ __html: embedHtml }}
        />
      </View>
    );
  }

  // For native platforms, use WebView
  return (
    <View style={[styles.container, style]}>
      <WebView
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsFullscreenVideo={true}
        mediaPlaybackRequiresUserAction={false}
        source={{ uri: `https://www.youtube.com/embed/${videoId}?autoplay=1` }}
      />
    </View>
  );
};

/**
 * Open YouTube video in external browser or app
 * @param {string} videoId - YouTube video ID
 */
export const openYouTubeVideo = async (videoId) => {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  
  try {
    // Try to open in browser first
    const result = await WebBrowser.openBrowserAsync(url);
    console.log('Opened video in browser:', result);
  } catch (error) {
    console.error('Error opening in browser, falling back to Linking:', error);
    // Fallback to linking - will open YouTube app if installed
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      console.error('Cannot open URL:', url);
    }
  }
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 240,
    backgroundColor: '#000',
  },
  webView: {
    flex: 1,
  },
});

export default VideoPlayer; 