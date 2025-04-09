import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRouter } from "expo-router";
import { Bell, Mail, Tag, Truck } from "lucide-react-native";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import axiosInstance from "@/config";
import { useStatus } from "@/context/StatusContext";

interface NotificationOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function CustomScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const { show, hide } = useStatus();

  // Get user and token from Redux store
  const { user, token } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;

  const [preferences, setPreferences] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
    delivery: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const notificationOptions: NotificationOption[] = [
    {
      id: "orderUpdates",
      title: "Order Updates",
      description: "Get notified about your order status",
      icon: <Bell size={24} color={Colors[colorScheme].text} />,
    },
    {
      id: "promotions",
      title: "Promotions",
      description: "Receive special offers and discounts",
      icon: <Tag size={24} color={Colors[colorScheme].text} />,
    },
    {
      id: "newsletter",
      title: "Newsletter",
      description: "Weekly updates and news",
      icon: <Mail size={24} color={Colors[colorScheme].text} />,
    },
    {
      id: "delivery",
      title: "Delivery Alerts",
      description: "Track your deliveries in real-time",
      icon: <Truck size={24} color={Colors[colorScheme].text} />,
    },
  ];

  const handleFinish = async () => {
    if (!userId) {
      show({
        type: "error",
        title: "User ID Missing",
        message: "User ID is missing. Please log in again.",
        primaryAction: {
          label: "OK",
          onPress: () => {
            hide();
            router.push("/auth/login");
          }
        }
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await axiosInstance.post("/api/users/complete-onboarding",
        {
          userId,
          preferences
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request headers
          },
        }
      );

      router.push("/home"); // Redirect to home after onboarding
    } catch (error) {
      console.error("Error completing onboarding:", error);
      show({
        type: "error",
        title: "Error",
        message: "An error occurred. Please try again.",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>Notification Preferences</ThemedText>
        <ThemedText style={styles.subtitle}>
          Customize how you want to be notified
        </ThemedText>

        <View style={styles.optionsContainer}>
          {notificationOptions.map((option) => (
            <View key={option.id} style={styles.optionRow}>
              <View style={styles.optionInfo}>
                {option.icon}
                <View style={styles.optionTexts}>
                  <ThemedText style={styles.optionTitle}>
                    {option.title}
                  </ThemedText>
                  <ThemedText style={styles.optionDescription}>
                    {option.description}
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={preferences[option.id as keyof typeof preferences]}
                onValueChange={(value) =>
                  setPreferences((prev) => ({ ...prev, [option.id]: value }))
                }
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.skipButton]}
          onPress={handleFinish}
        >
          <ThemedText style={styles.buttonText}>Skip</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.finishButton,
            { backgroundColor: Colors[colorScheme].primary },
          ]}
          onPress={handleFinish}
        >
          <ThemedText style={[styles.buttonText, styles.finishButtonText]}>
            Finish
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
    gap: 16,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.secondary,
  },
  optionInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  optionTexts: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  optionDescription: {
    fontSize: 14,
    opacity: 0.7,
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
  finishButton: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  finishButtonText: {
    color: "#FFFFFF",
  },
});
