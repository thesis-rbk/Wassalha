import React, { useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import PickupReceiver from "../processTrack/pickupSO"; 
import PickupDeliverer from "../processTrack/pickupSP"; 
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function PickupDashboard() {
  const colorScheme = useColorScheme() ?? "light";
  const [view, setView] = useState<"toReceive" | "toDeliver">("toReceive");
  const [isLoading, setIsLoading] = useState(false); // Control this from child components if needed

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    segmentedControl: {
      margin: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    noItemsContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    noItemsText: {
      fontSize: 18,
      color: Colors[colorScheme].text,
      textAlign: "center",
    },
    contentContainer: {
      flex: 1,
    },
  });

  return (
    <ThemedView style={styles.container}>
      <SegmentedControl
        values={["To Receive", "To Deliver"]}
        selectedIndex={view === "toReceive" ? 0 : 1}
        onChange={(event) => {
          setView(event.nativeEvent.selectedSegmentIndex === 0 ? "toReceive" : "toDeliver");
        }}
        style={styles.segmentedControl}
        tintColor={Colors[colorScheme].primary}
        backgroundColor={Colors[colorScheme].secondary}
        fontStyle={{ color: Colors[colorScheme].text }}
        activeFontStyle={{ color: Colors[colorScheme].background }}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
        </View>
      ) : view === "toDeliver" ? (
        <View style={styles.contentContainer}>
          <PickupDeliverer />
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <PickupReceiver />
        </View>
      )}
    </ThemedView>
  );
}