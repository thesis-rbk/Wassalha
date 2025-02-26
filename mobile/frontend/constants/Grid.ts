import { Platform } from 'react-native';

export const Grid = {
  // Common grid specifications
  column: 4,
  margin: 16,
  gutter: 16,
  type: 'stretch',

  // Platform specific measurements
  statusBar: Platform.select({
    ios: 54, // Status bar height for iOS
    android: 24, // Status bar height for Android
    default: 24,
  }),

  navigationBar: Platform.select({
    ios: 96, // Navigation/header bar height for iOS
    android: 56, // App bar height for Android
    default: 56,
  }),

  bottomBar: Platform.select({
    ios: {
      tabBar: 56,
      homeIndicator: 34,
      total: 90, // Combined height of tab bar and home indicator
    },
    android: {
      navigationBar: 48,
      total: 48, // Android bottom navigation height
    },
    default: {
      total: 56,
    },
  }),

  // Screen dimensions
  screenSize: Platform.select({
    ios: {
      width: 393,
      height: 852,
    },
    android: {
      width: 360,
      height: 640,
    },
    default: {
      width: 360,
      height: 640,
    },
  }),

  // Layout spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  // Content padding
  padding: {
    horizontal: 16,
    vertical: 16,
  },

  // Card dimensions
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },

  // Helper functions
  getColumnWidth: (totalColumns = 4, margin = 16, gutter = 16) => {
    const screenWidth = Platform.select({
      ios: 393,
      android: 360,
      default: 360,
    });
    
    const availableWidth = screenWidth - (margin * 2) - (gutter * (totalColumns - 1));
    return availableWidth / totalColumns;
  },

  // Safe area insets
  safeArea: Platform.select({
    ios: {
      top: 47,
      bottom: 34,
    },
    android: {
      top: 24,
      bottom: 0,
    },
    default: {
      top: 0,
      bottom: 0,
    },
  }),
}; 