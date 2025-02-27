import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { store } from './store';
import './styles/global.css';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '@/context/ThemeContext';
import { HomeScreen } from '@/screens/HomeScreen';
import Login from './app/auth/login';
import Signup from './app/auth/signup';
import ResetPassword from './app/auth/ResetPassword';

type RootStackParamList = {
  'auth/login': undefined;
  'auth/signup': undefined;
  'screens/HomeScreen': undefined; // HomeScreen
  'auth/ResetPassword': undefined;
};

SplashScreen.preventAutoHideAsync();
const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Light': require('./assets/fonts/android/inter/Inter_18pt-Light.ttf'),
    'Inter-Italic': require('./assets/fonts/android/inter/Inter_18pt-Italic.ttf'),
    'Inter-MediumItalic': require('./assets/fonts/android/inter/Inter_18pt-MediumItalic.ttf'),
    'Inter-Thin': require('./assets/fonts/android/inter/Inter_18pt-Thin.ttf'),
    'Inter-Black': require('./assets/fonts/android/inter/Inter_28pt-Black.ttf'),
    'Inter-Bold': require('./assets/fonts/android/inter/Inter_28pt-Bold.ttf'),
    'Inter-Medium': require('./assets/fonts/android/inter/Inter_28pt-Medium.ttf'),
    'Inter-Regular': require('./assets/fonts/android/inter/Inter_28pt-Regular.ttf'),
    'SFPro-Bold': require('./assets/fonts/ios/sf-pro/SF-Pro-Display-Bold.otf'),
    'SFPro-Black': require('./assets/fonts/ios/sf-pro/SF-Pro-Display-Black.otf'),
    'SFPro-Heavy': require('./assets/fonts/ios/sf-pro/SF-Pro-Display-Heavy.otf'),
    'SFPro-Light': require('./assets/fonts/ios/sf-pro/SF-Pro-Display-Light.otf'),
    'SFPro-Medium': require('./assets/fonts/ios/sf-pro/SF-Pro-Display-Medium.otf'),
    'SFPro-MediumItalic': require('./assets/fonts/ios/sf-pro/SF-Pro-Display-MediumItalic.otf'),
    'SFPro-Regular': require('./assets/fonts/ios/sf-pro/SF-Pro-Display-Regular.otf'),
    'SFPro-Semibold': require('./assets/fonts/ios/sf-pro/SF-Pro-Display-Semibold.otf'),
    'SFPro-Thin': require('./assets/fonts/ios/sf-pro/SF-Pro-Display-Thin.otf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  console.log('App loading...');
  console.log('Store:', store);

  return (
    <ThemeProvider>
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="screens/HomeScreen">
            <Stack.Screen name="auth/signup" options={{ title: 'Sign Up' }} component={Signup} />
            <Stack.Screen name="auth/login" options={{ title: 'Log In' }} component={Login} />
            <Stack.Screen name="screens/HomeScreen" options={{ title: 'Home' }} component={HomeScreen} />
            <Stack.Screen name="auth/ResetPassword" options={{ title: 'Reset Password' }} component={ResetPassword} />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    </ThemeProvider>
  );
}