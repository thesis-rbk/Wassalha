import React, { useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { Rating } from "react-native-ratings";
import axiosInstance from "@/config";

export default function ReviewScreen() {
  const router = useRouter();
  const {
    orderId,
    reviewerId,
    reviewedId,
    reviewType,
    goodsName,
  } = useLocalSearchParams();

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
        orderId,
        rating: userRating,
        reviewType,
        comment,
      });

      await axiosInstance.post("/api/processReview/experience", {
        reviewerId,
        orderId,
        rating: experienceRating,
      });

      Alert.alert("✅ Review submitted", "Thanks for your feedback!", [
        { text: "OK", onPress: () => router.replace("./home") }
      ]);
    } catch (error) {
      console.error("Review submission error:", error);
      Alert.alert("Error", "Failed to submit review. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16 }}>
        Rate your delivery of {goodsName}
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 8 }}>Rate the other user:</Text>
      <Rating
        startingValue={userRating}
        onFinishRating={setUserRating}
        imageSize={32}
        style={{ marginBottom: 16 }}
      />

      <Text style={{ fontSize: 16, marginBottom: 12 }}>Comments (optional):</Text>
      <TextInput
        placeholder="Share your thoughts..."
        value={comment}
        onChangeText={setComment}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
          height: 100,
          textAlignVertical: "top",
        }}
        multiline
      />

      <Text style={{ fontSize: 16, marginBottom: 8 }}>
        Rate your experience with Wassalha:
      </Text>
      <Rating
        startingValue={experienceRating}
        onFinishRating={setExperienceRating}
        imageSize={32}
        style={{ marginBottom: 20 }}
      />

      <BaseButton
        variant="primary"
        onPress={handleSubmit}
        disabled={loading}
        style={{ marginTop: 24 }}
      >
        Submit Review
      </BaseButton>
    </View>
  );
}
