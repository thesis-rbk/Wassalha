import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRouter } from "expo-router";
import { Category } from "@/types";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import axiosInstance from "@/config";

export default function SelectCategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();

  // Get user and token from Redux store
  const { user, token } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;

  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/api/categories");
        const data = await response.data;
        if (response.status === 200) {
          setCategories(data.data);
        } else {
          console.error("Failed to fetch categories:", data.message);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(
      (prev) =>
        prev.includes(categoryId)
          ? prev.filter((id) => id !== categoryId) // Deselect if already selected
          : [...prev, categoryId] // Select if not already selected
    );
  };

  const handleNext = async () => {
    try {
      if (!userId) {
        console.error("User ID is missing");
        alert("User ID is missing. Please log in again.");
        return;
      }

      // Send a POST request to update preferred categories
      const response = await axiosInstance.post(
        "/api/users/update-preferred-categories",
        {
          userId,
          preferredCategories: selectedCategories.join(","), // Convert array of IDs to comma-separated string
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request headers
          },
        }
      );

      const data = await response.data;

      if (response.status === 200 || response.status === 201) {
        console.log("Preferred categories updated successfully:", data);
        router.push("/onboarding/customScreen");
      } else {
        console.error("Failed to update preferred categories:", data.message);
        alert("Failed to update preferred categories. Please try again.");
      }
    } catch (error) {
      console.error("Error updating preferred categories:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleSkip = () => {
    router.push("/onboarding/customScreen");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Select Your Interests</ThemedText>
        <ThemedText style={styles.subtitle}>
          Choose categories that interest you the most
        </ThemedText>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                {
                  backgroundColor: selectedCategories.includes(category.id)
                    ? Colors[colorScheme].primary
                    : Colors[colorScheme].secondary,
                },
              ]}
              onPress={() => toggleCategory(category.id)}
            >
              <ThemedText
                style={[
                  styles.categoryText,
                  selectedCategories.includes(category.id) &&
                    styles.selectedCategoryText,
                ]}
              >
                {category.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

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
  header: {
    paddingVertical: 16,
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
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingVertical: 16,
  },
  categoryCard: {
    width: "48%", // Two cards per row
    height: 100, // Fixed height for consistency
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  categoryText: {
    fontSize: 16,
    color: "#333333", // Default text color
  },
  selectedCategoryText: {
    color: "#FFFFFF", // Selected text color
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
