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
        <Stack>
          {/* Optionally define specific screens if needed */}
          <Stack.Screen name="auth/signup" options={{ title: "Sign Up" }} />
          <Stack.Screen name="auth/login" options={{ title: "Log In" }} />
          <Stack.Screen name="home" />
          <Stack.Screen
            name="auth/ResetPassword"
            options={{ title: "Reset Password" }}
          />
          <Stack.Screen
            name="onboarding/howYouHeard"
            options={{ title: "How You Heard" }}
          />
          <Stack.Screen
            name="onboarding/selectCategories"
            options={{ title: "Select Categories" }}
          />
          <Stack.Screen
            name="onboarding/customScreen"
            options={{ title: "Custom Screen" }}
          />
        </Stack>
      </Provider>
    </ThemeProvider>
  );
}
