import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../store";
import "../styles/global.css";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({});

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  console.log("Layout loading...");
  console.log("Store:", store);
  return (
    <ThemeProvider>
      <Provider store={store}>
        <Stack >
          {/* Optionally define specific screens if needed */}
          <Stack.Screen 
            name="auth/signup" 
            options={{ headerShown: false } as any} 
          />
          <Stack.Screen name="auth/login" options={{ headerShown: false } as any}  />
          <Stack.Screen name="home" options={{ headerShown: false } as any} />
          <Stack.Screen
            name="auth/ResetPassword"
            options={{ headerShown: false } as any} 
          />
          <Stack.Screen
            name="auth/NewPassword"
            options={{ headerShown: false } as any} 
          />

          <Stack.Screen
            name="productDetails/create-order"
            options={{ headerShown: false } as any} 
          />
          <Stack.Screen
            name="productDetails"
            options={{ headerShown: false } as any} 
          />
          <Stack.Screen name="test/Travel" options={{ headerShown: false } as any}  />
          <Stack.Screen name="test/Pickup" options={{ headerShown: false } as any} />
          <Stack.Screen
            name="test/Subscription"
            options={{ headerShown: false } as any} 
          />
          <Stack.Screen
            name="onboarding/howYouHeard"
            options={{ headerShown: false } as any} 
          />
          <Stack.Screen
            name="onboarding/selectCategories"
            options={{ headerShown: false } as any} 
          />
          <Stack.Screen
            name="onboarding/customScreen"
            options={{ headerShown: false } as any} 
          />
        </Stack>
      </Provider>
    </ThemeProvider>
  );
}
