import { Stack } from "expo-router";
import { Provider } from 'react-redux';
import { store } from '../store';
import '../styles/global.css';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import WelcomeAnimation from '@/components/WelcomeAnimation';
import MainLoading from '@/components/MainLoading';

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


  console.log('Store:', store);
  
  return (
    <ThemeProvider>
      <Provider store={store}>
        {!loadingComplete ? (
          <MainLoading onLoadingComplete={() => setLoadingComplete(true)} />
        ) : !animationComplete ? (
          <WelcomeAnimation onAnimationComplete={() => setAnimationComplete(true)} />
        ) : (
        <Stack >
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
            name="productDetails/create-order"
            options={{
              title: "Create Order",
            }}
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
          <Stack.Screen name="test/Travel" options={{ title: 'Travel' }} />
          <Stack.Screen name="test/Pickup" options={{ title: 'Pickup' }} />
          </Stack>
        )}
      </Provider>
    </ThemeProvider>
  );
} 
   
