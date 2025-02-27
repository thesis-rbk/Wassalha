import { Stack } from "expo-router";
import '../styles/global.css';
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
