import React, { useState } from "react";
import { View, Text, TextInput, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { Rating } from "react-native-ratings";
import axiosInstance from "@/config";
import { useAuth } from "@/context/AuthContext";
import { StatusScreen } from '@/app/screens/StatusScreen';

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
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#1C1E21",
    textAlign: "center",
  },
  orderDetails: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#F5F6F8",
    borderRadius: 8,
  },
  orderDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#1C1E21",
    fontWeight: "600",
  },
  ratingSection: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    color: "#1C1E21",
  },
  ratingDescription: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
    marginBottom: 14,
  },
  ratingValue: {
    fontSize: 16,
    color: "#1C1E21",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
  ratingContainer: {
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
  },
  commentSection: {
    marginBottom: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#E4E6EB",
    borderRadius: 12,
    padding: 16,
    height: 110,
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
  const reviewType = "USER_REVIEW";

  const [userRating, setUserRating] = useState(0);
  const [experienceRating, setExperienceRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // Add state for StatusScreen
  const [statusVisible, setStatusVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState({
    type: 'error' as 'success' | 'error',
    title: '',
    message: ''
  });

  const handleSubmit = async () => {
    if (userRating === 0 || experienceRating === 0) {
      setStatusMessage({
        type: 'error',
        title: 'Missing Ratings',
        message: 'Please provide both ratings.'
      });
      setStatusVisible(true);
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

      setStatusMessage({
        type: 'success',
        title: '✅ Review submitted',
        message: 'Thanks for your feedback!'
      });
      setStatusVisible(true);
    } catch (error) {
      console.error("Review submission error:", error);
      setStatusMessage({
        type: 'error',
        title: 'Error',
        message: 'Failed to submit review. Please try again later.'
      });
      setStatusVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Rate your delivery of {params.goodsName} </Text>

          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>{reviewLabel}: {reviewedName}</Text>
            <Text style={styles.ratingDescription}>
              Rate how satisfied you were with {isUserTraveler ? "the requester's communication and cooperation" : "the traveler's service and reliability"}
            </Text>
            <Rating
              startingValue={0}
              fractions={0}
              imageSize={32}
              style={{ marginBottom: 8 }}
              onFinishRating={setUserRating}
              type="star"
              readonly={false}
            />
            <Text style={styles.ratingValue}>
              {userRating > 0 ? `${userRating} stars` : "Not rated yet"}
            </Text>
          </View>

          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Rate your experience with Wassalha</Text>
            <Rating
              startingValue={0}
              fractions={0}
              imageSize={32}
              style={{ marginBottom: 8 }}
              onFinishRating={setExperienceRating}
              type="star"
              readonly={false}
            />
            <Text style={styles.ratingValue}>
              {experienceRating > 0 ? `${experienceRating} stars` : "Not rated yet"}
            </Text>
          </View>

          <View style={styles.commentSection}>
            <Text style={styles.ratingLabel}>Comments (optional)</Text>
            <Text style={styles.ratingDescription}>
              Share your experience and help others make informed decisions. What went well? What could have been better?
            </Text>
            <TextInput
              placeholder="Share your thoughts about the delivery experience..."
              value={comment}
              onChangeText={setComment}
              style={styles.commentInput}
              multiline
              placeholderTextColor="#8A8D91"
              maxLength={500}
            />
          </View>

          <BaseButton 
            variant="primary" 
            onPress={handleSubmit} 
            disabled={loading} 
            style={styles.submitButton}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </BaseButton>
        </View>
      </ScrollView>

      <StatusScreen
        visible={statusVisible}
        type={statusMessage.type}
        title={statusMessage.title}
        message={statusMessage.message}
        primaryAction={{
          label: statusMessage.type === 'success' ? "Done" : "OK",
          onPress: () => {
            setStatusVisible(false);
            if (statusMessage.type === 'success') {
              router.replace("/home");
            }
          }
        }}
        onClose={() => {
          setStatusVisible(false);
          if (statusMessage.type === 'success') {
            router.replace("/home");
          }
        }}
      />
    </SafeAreaView>
  );
}
