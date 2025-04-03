import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SponsorshipScreen" />
      <Stack.Screen name="TermsAndConditions" />
      <Stack.Screen name="NotificationsScreen" />
    </Stack>
  );
}
