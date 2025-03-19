import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack>
      <Stack.Screen name="SponsorshipScreen" />
      <Stack.Screen name="TermsAndConditions" />
    </Stack>
  );
}
