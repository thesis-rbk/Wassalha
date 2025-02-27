import { Stack } from "expo-router";
import '../styles/global.css';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Android fonts
    'Inter-Light': require('../assets/fonts/android/inter/Inter_18pt-Light.ttf'),
    'Inter-Italic': require('../assets/fonts/android/inter/Inter_18pt-Italic.ttf'),
    'Inter-MediumItalic': require('../assets/fonts/android/inter/Inter_18pt-MediumItalic.ttf'),
    'Inter-Thin': require('../assets/fonts/android/inter/Inter_18pt-Thin.ttf'),

    'Inter-Black': require('../assets/fonts/android/inter/Inter_28pt-Black.ttf'),
    'Inter-Bold': require('../assets/fonts/android/inter/Inter_28pt-Bold.ttf'),
    'Inter-Medium': require('../assets/fonts/android/inter/Inter_28pt-Medium.ttf'),
    'Inter-Regular': require('../assets/fonts/android/inter/Inter_28pt-Regular.ttf'),
    
    // iOS fonts
    'SFPro-Bold': require('../assets/fonts/ios/sf-pro/SF-Pro-Display-Bold.otf'),
    'SFPro-Black': require('../assets/fonts/ios/sf-pro/SF-Pro-Display-Black.otf'),
    'SFPro-Heavy': require('../assets/fonts/ios/sf-pro/SF-Pro-Display-Heavy.otf'),
    'SFPro-Light': require('../assets/fonts/ios/sf-pro/SF-Pro-Display-Light.otf'),
    'SFPro-Medium': require('../assets/fonts/ios/sf-pro/SF-Pro-Display-Medium.otf'),
    'SFPro-MediumItalic': require('../assets/fonts/ios/sf-pro/SF-Pro-Display-MediumItalic.otf'),
    'SFPro-Regular': require('../assets/fonts/ios/sf-pro/SF-Pro-Display-Regular.otf'),
    'SFPro-Semibold': require('../assets/fonts/ios/sf-pro/SF-Pro-Display-Semibold.otf'),
    'SFPro-Thin': require('../assets/fonts/ios/sf-pro/SF-Pro-Display-Thin.otf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <Stack />
    </ThemeProvider>
  );
}
