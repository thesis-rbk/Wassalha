import { Stack } from "expo-router";
import { Provider } from 'react-redux';
import { store } from '../store';
export default function RootLayout() {
  return (
    <Provider store={store}>
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#f4511e' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {/* Optionally define specific screens if needed */}
      <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
      <Stack.Screen name="login" options={{ title: 'Log In' }} />
      <Stack.Screen name="home" options={{ title: 'Home' }} />
    </Stack>
    </Provider>
  );
}