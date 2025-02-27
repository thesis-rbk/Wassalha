import { Stack } from "expo-router";
import '@/styles/global.css';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { useFontLoader } from '@/assets/fonts/fontLoader';

export default function RootLayout() {
  const fontsLoaded = useFontLoader();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <Stack />
    </ThemeProvider>
  );
}
