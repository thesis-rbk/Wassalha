import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../store";
import "../styles/global.css";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import WelcomeAnimation from "@/components/WelcomeAnimation";
import MainLoading from "@/components/MainLoading";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({});

  const [animationComplete, setAnimationComplete] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  console.log("Store:", store);

  return (
    <ThemeProvider>
      <Provider store={store}>
        {!loadingComplete ? (
          <MainLoading onLoadingComplete={() => setLoadingComplete(true)} />
        ) : !animationComplete ? (
          <WelcomeAnimation
            onAnimationComplete={() => setAnimationComplete(true)}
          />
        ) : (
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
              name="auth/NewPassword"
              options={{ title: "New Password" }}
            />

            <Stack.Screen
              name="productDetails"
              options={{
                title: "Product Details",
              }}
            />
            <Stack.Screen
              name="test/Subscription"
              options={{ title: "Subscription" }}
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
            <Stack.Screen
              name="profile/change"
              options={{ title: "Change Password" }}
            />
            <Stack.Screen
              name="profile/edit"
              options={{ title: "Edit Profile" }}
            />
            <Stack.Screen name="profile/index" options={{ title: "Profile" }} />
            <Stack.Screen
              name="messages/messages"
              options={{ title: "Messages" }}
            />
            <Stack.Screen
              name="test/Terms&&Conditions"
              options={{ title: "terms n conditions" }}
            />
            <Stack.Screen name="test/Travel" options={{ title: "Travel" }} />
            <Stack.Screen name="test/Pickup" options={{ title: "Pickup" }} />
            <Stack.Screen name="test/chat" options={{ title: "Chat" }} />
            <Stack.Screen name="test/order" options={{ title: "order" }} />
            <Stack.Screen name="verification/start" options={{ title: "verification" }} />
            <Stack.Screen
              name="processTrack/initializationSO"
              options={{ title: "Initialization" }}
            />
            <Stack.Screen
              name="processTrack/initializationSP"
              options={{ title: "Initialization" }}
            />
            <Stack.Screen
              name="processTrack/verificationSO"
              options={{ title: "Verification" }}
            />
            <Stack.Screen
              name="processTrack/verificationSP"
              options={{ title: "Verification" }}
            />
            <Stack.Screen
              name="processTrack/paymentSO"
              options={{ title: "Payment" }}
            />
            <Stack.Screen
              name="processTrack/paymentSP"
              options={{ title: "Payment" }}
            />
            <Stack.Screen
              name="processTrack/pickupSO"
              options={{ title: "Pickup" }}
            />
            <Stack.Screen
              name="processTrack/pickupSP"
              options={{ title: "Pickup" }}
            />
          </Stack>
        )}
      </Provider>
    </ThemeProvider>
  );
}
