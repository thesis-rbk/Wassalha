import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export function useFontLoader() {
  const [fontsLoaded] = useFonts({
    // Android fonts
    'Inter-Light': require('./android/inter/Inter_18pt-Light.ttf'),
    'Inter-Italic': require('./android/inter/Inter_18pt-Italic.ttf'),
    'Inter-MediumItalic': require('./android/inter/Inter_18pt-MediumItalic.ttf'),
    'Inter-Thin': require('./android/inter/Inter_18pt-Thin.ttf'),

    'Inter-Black': require('./android/inter/Inter_28pt-Black.ttf'),
    'Inter-Bold': require('./android/inter/Inter_28pt-Bold.ttf'),
    'Inter-Medium': require('./android/inter/Inter_28pt-Medium.ttf'),
    'Inter-Regular': require('./android/inter/Inter_28pt-Regular.ttf'),
    
    // iOS fonts
    'SFPro-Bold': require('./ios/sf-pro/SF-Pro-Display-Bold.otf'),
    'SFPro-Black': require('./ios/sf-pro/SF-Pro-Display-Black.otf'),
    'SFPro-Heavy': require('./ios/sf-pro/SF-Pro-Display-Heavy.otf'),
    'SFPro-Light': require('./ios/sf-pro/SF-Pro-Display-Light.otf'),
    'SFPro-Medium': require('./ios/sf-pro/SF-Pro-Display-Medium.otf'),
    'SFPro-MediumItalic': require('./ios/sf-pro/SF-Pro-Display-MediumItalic.otf'),
    'SFPro-Regular': require('./ios/sf-pro/SF-Pro-Display-Regular.otf'),
    'SFPro-Semibold': require('./ios/sf-pro/SF-Pro-Display-Semibold.otf'),
    'SFPro-Thin': require('./ios/sf-pro/SF-Pro-Display-Thin.otf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return fontsLoaded;
} 