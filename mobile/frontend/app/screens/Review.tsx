import React, { useState } from "react";
import { View, Text, TextInput, Alert, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { Rating } from "react-native-ratings";
import axiosInstance from "@/config";
import { useAuth } from "@/context/AuthContext";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5", 
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
    color: "#1C1E21",
    textAlign: "center",
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
    color: "#1C1E21",
  },
  ratingContainer: {
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
  },
  commentSection: {
    marginBottom: 24,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#E4E6EB",
    borderRadius: 12,
    padding: 16,
    height: 120,
    textAlignVertical: "top",
    fontSize: 16,
    backgroundColor: "#F5F6F8",
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 8,
    height: 50,
    backgroundColor: "#1877F2",
  },
});

export default function ReviewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  const isUserTraveler = String(user?.id) === String(params.travelerId);
  const reviewerId = String(user?.id);
  const reviewedId = isUserTraveler ? params.requesterId : params.travelerId;
  const reviewedName = isUserTraveler ? params.requesterName : params.travelerName;
  const reviewLabel = isUserTraveler ? "Rate the requester" : "Rate the traveller";
  const reviewType = isUserTraveler ? "REQUESTER_REVIEW" : "USER_REVIEW";

  const [userRating, setUserRating] = useState(0);
  const [experienceRating, setExperienceRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (userRating === 0 || experienceRating === 0) {
      Alert.alert("Please provide both ratings.");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/api/processReview/user", {
        reviewerId,
        reviewedId,
        orderId: params.idOrder,
        rating: userRating,
        reviewType,
        comment,
      });

      await axiosInstance.post("/api/processReview/experience", {
        reviewerId,
        orderId: params.idOrder,
        rating: experienceRating,
      });

      Alert.alert("✅ Review submitted", "Thanks for your feedback!", [
        { text: "OK", onPress: () => router.replace("/home") },
      ]);
    } catch (error) {
      console.error("Review submission error:", error);
      Alert.alert("Error", "Failed to submit review. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Rate your delivery of {params.goodsName}</Text>

          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>{reviewLabel}</Text>
            <Rating
              startingValue={userRating}
              onFinishRating={setUserRating}
              imageSize={32}
              style={{ marginBottom: 16 }}
            />
          </View>

          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Rate your experience with Wassalha</Text>
            <Rating
              startingValue={experienceRating}
              onFinishRating={setExperienceRating}
              imageSize={32}
              style={{ marginBottom: 20 }}
            />
          </View>

          <View style={styles.commentSection}>
            <Text style={styles.ratingLabel}>Comments (optional)</Text>
            <TextInput
              placeholder="Share your thoughts..."
              value={comment}
              onChangeText={setComment}
              style={styles.commentInput}
              multiline
              placeholderTextColor="#8A8D91"
            />
          </View>

          <BaseButton variant="primary" onPress={handleSubmit} disabled={loading} style={styles.submitButton}>
            {loading ? "Submitting..." : "Submit Review"}
          </BaseButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
