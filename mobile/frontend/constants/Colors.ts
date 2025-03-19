/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: Platform.select({
      ios: '#000000',
      android: '#1F1F1F',
    }),
    background: '#FFFFFF',
    primary: '#007BFF',
    secondary: Platform.select({
      ios: '#F3F4F6',
      android: '#F5F5F5',
    }),
    border: Platform.select({
      ios: '#E5E7EB',
      android: '#E0E0E0',
    }),
    icon: Platform.select({
      ios: '#000000',
      android: '#1F1F1F',
    }),
    surface: Platform.select({
      ios: '#FFFFFF',
      android: '#FAFAFA',
    }),
    card: Platform.select({
      ios: '#FFFFFF',
      android: '#FFFFFF',
    }),
    shadow: Platform.select({
      ios: 'rgba(0, 0, 0, 0.1)',
      android: 'rgba(0, 0, 0, 0.15)',
    }),
    googleButton: '#F5F5F5',
  },
  dark: {
    text: '#FFFFFF',
    background: Platform.select({
      ios: '#000000',
      android: '#121212',
    }),
    primary: '#007BFF',
    secondary: Platform.select({
      ios: '#1C1C1E',
      android: '#1E1E1E',
    }),
    border: Platform.select({
      ios: '#38383A',
      android: '#2C2C2C',
    }),
    icon: '#FFFFFF',
    surface: Platform.select({
      ios: '#1C1C1E',
      android: '#1E1E1E',
    }),
    card: Platform.select({
      ios: '#2C2C2E',
      android: '#242424',
    }),
    shadow: 'rgba(0, 0, 0, 0.3)',
    googleButton: '#2D2D2D',
  },
};
