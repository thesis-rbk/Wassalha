import { Stack } from 'expo-router';

export default function ScreensLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="SponsorshipScreen" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="TermsAndConditions" 
        options={{ 
          headerShown: false 
        }} 
      />
      
    </Stack>
  );
} 