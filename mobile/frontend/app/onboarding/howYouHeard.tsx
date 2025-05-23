import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import axiosInstance from "@/config";
import { useStatus } from "@/context/StatusContext";

enum ReferralSource {
  SOCIAL_MEDIA = "SOCIAL_MEDIA",
  FRIEND_RECOMMENDATION = "FRIEND_RECOMMENDATION",
  APP_STORE = "APP_STORE",
  GOOGLE_SEARCH = "GOOGLE_SEARCH",
  ADVERTISEMENT = "ADVERTISEMENT",
  OTHER = "OTHER",
}

const options = [
  { label: "Social Media", value: ReferralSource.SOCIAL_MEDIA },
  {
    label: "Friend Recommendation",
    value: ReferralSource.FRIEND_RECOMMENDATION,
  },
  { label: "App Store", value: ReferralSource.APP_STORE },
  { label: "Google Search", value: ReferralSource.GOOGLE_SEARCH },
  { label: "Advertisement", value: ReferralSource.ADVERTISEMENT },
  { label: "Other", value: ReferralSource.OTHER },
];

export default function HowYouHeardScreen() {
  const [selectedOption, setSelectedOption] = useState<ReferralSource | null>(
    null
  );
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const { show, hide } = useStatus();

  // Get user and token from Redux store
  const { user, token } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;

  const handleNext = async () => {
    if (!selectedOption) {
      show({
        type: "error",
        title: "Selection Required",
        message: "Please select an option before proceeding.",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
      return;
    }

    try {
      if (!userId) {
        console.error("User ID is missing");
        show({
          type: "error",
          title: "User ID Missing",
          message: "User ID is missing. Please log in again.",
          primaryAction: {
            label: "OK",
            onPress: hide
          }
        });
        return;
      }

      // Send a POST request to update the referral source
      const response = await axiosInstance.post("/api/users/update-referral-source",
        {
          userId,
          referralSource: selectedOption,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request headers
          },
        }
      );

      const data = response.data;

      if (response.status === 200 || response.status === 201) {
        router.push("/onboarding/selectCategories");
      } else {
        console.error("Failed to update referral source:", data.message);
        show({
          type: "error",
          title: "Update Failed",
          message: "Failed to update referral source. Please try again.",
          primaryAction: {
            label: "OK",
            onPress: hide
          }
        });
      }
    } catch (error) {
      console.error("Error updating referral source:", error);
      show({
        type: "error",
        title: "Error",
        message: "An error occurred. Please try again.",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
    }
  };

  const handleSkip = () => {
    router.push("/onboarding/selectCategories");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>How did you hear about us?</ThemedText>
        <ThemedText style={styles.subtitle}>
          Help us understand how you found our app
        </ThemedText>

        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                {
                  backgroundColor:
                    selectedOption === option.value
                      ? Colors[colorScheme].primary
                      : Colors[colorScheme].secondary,
                },
              ]}
              onPress={() => setSelectedOption(option.value)}
            >
              <ThemedText
                style={[
                  styles.optionText,
                  selectedOption === option.value && styles.selectedOptionText,
                ]}
              >
                {option.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.skipButton]}
          onPress={handleSkip}
        >
          <ThemedText style={styles.buttonText}>Skip</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.nextButton,
            { backgroundColor: Colors[colorScheme].primary },
          ]}
          onPress={handleNext}
        >
          <ThemedText style={[styles.buttonText, styles.nextButtonText]}>
            Next
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.7,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
  },
  selectedOptionText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  skipButton: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
  nextButton: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  nextButtonText: {
    color: "#FFFFFF",
  },
});
