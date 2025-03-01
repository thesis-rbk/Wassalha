import HomeScreen from "../screens/HomeScreen";
import { Grid } from "@/constants/Grid";
import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";
import RootLayout from "./_layout";
import { HowYouHeardScreen } from "./onboarding/how-you-heard";
import { SelectCategoriesScreen } from "./onboarding/select-categories";
import { CustomScreen } from "./onboarding/custom-screen";

// Example usage in styles
const styles = StyleSheet.create({
  container: {
    padding: Grid.padding.horizontal,
    backgroundColor: Colors.light.background,
  },
  card: {
    borderRadius: Grid.card.borderRadius,
    padding: Grid.card.padding,
    marginBottom: Grid.spacing.md,
  },
});

export default function Index() {
  return (
    <>
      <RootLayout />
      <HomeScreen />
    </>
  );

  // return (
  //   <>
  //     <HowYouHeardScreen />
  //   </>
  // );

  // return (
  //   <>
  //     <SelectCategoriesScreen />
  //   </>
  // );

  // return (
  //   <>
  //     <CustomScreen />
  //   </>
  // );
}
