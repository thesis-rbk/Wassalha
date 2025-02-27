import { Stack } from "expo-router";
import '@/styles/global.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { useFontLoader } from '@/assets/fonts/fontLoader';
import { useState } from 'react';
import { View, Button } from 'react-native';
import ProductDetails from '@/app/productDetails'; // ✅ Import ProductDetails component

export default function RootLayout() {
  const fontsLoaded = useFontLoader();
  const [isTesting, setIsTesting] = useState(false);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      {isTesting ? (
        <ProductDetails onNext={() => setIsTesting(false)} /> // ✅ Add onNext prop to return to main view
      ) : (
        <View style={{ flex: 1 }}>
          <Button title="Test Product Details" onPress={() => setIsTesting(true)} />
          <Stack />
        </View>
      )}
    </ThemeProvider>
  );
}
