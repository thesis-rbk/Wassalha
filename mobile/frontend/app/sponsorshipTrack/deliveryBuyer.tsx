import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { Image } from "expo-image";
import { Mail, Star, Clock, RefreshCw, ExternalLink } from "lucide-react-native";
import { TabBar } from "@/components/navigation/TabBar";

export default function DeliveryBuyer() {
  const router = useRouter();
  const [hasReviewed, setHasReviewed] = useState(false);
  const [rating, setRating] = useState(0);
  const [detailsReceived, setDetailsReceived] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("orders");
  const handleOpenGmail = async () => {
    try {
      // Open Gmail in browser
      await Linking.openURL('https://mail.google.com/mail/');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Unable to open Gmail in browser');
    }
  };

  const handleRating = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const submitReview = () => {
    if (rating === 0) {
      Alert.alert("Error", "Please select a rating before submitting");
      return;
    }
    setHasReviewed(true);
    Alert.alert("Success", "Thank you for your review!");
  };

  const confirmDetailsReceived = () => {
    Alert.alert(
      "Confirm Receipt",
      "Have you received the sponsorship details in your email?",
      [
        {
          text: "No, Still Waiting",
          style: "cancel"
        },
        {
          text: "Yes, Received",
          onPress: () => setDetailsReceived(true)
        }
      ]
    );
  };
  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    // Add navigation logic if needed
  };
  return (
    <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.container}>

        <View style={styles.statusContainer}>
          {!detailsReceived ? (
            <>
              <Clock color="#f59e0b" size={64} />
              <ThemedText style={styles.statusTitle}>
                Waiting for Sponsorship Details
              </ThemedText>
              <ThemedText style={styles.statusText}>
                The sponsor will send your account details shortly. Please check your email.
              </ThemedText>
            </>
          ) : (
            <>
              <Mail color="#28a745" size={64} />
              <ThemedText style={styles.statusTitle}>
                Details Received!
              </ThemedText>
              <ThemedText style={styles.statusText}>
                You can now access your sponsored account
              </ThemedText>
            </>
          )}
        </View>

        {/* Email Check Section */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <RefreshCw color="#0061ff" size={32} />
            <ThemedText style={styles.cardTitle}>Check Your Email</ThemedText>
            <ThemedText style={styles.cardText}>
              {!detailsReceived
                ? "Please check your email regularly. The sponsor will send your details soon."
                : "Your sponsorship details have been delivered to your email"}
            </ThemedText>
            <BaseButton
              variant="primary"
              size="medium"
              style={styles.emailButton}
              onPress={handleOpenGmail}
            >
              <View style={styles.buttonContent}>
                <ThemedText style={styles.buttonText}>Open Gmail</ThemedText>
                <ExternalLink size={20} color="white" />
              </View>
            </BaseButton>

            {!detailsReceived && (
              <BaseButton
                variant="secondary"
                size="medium"
                style={styles.confirmButton}
                onPress={confirmDetailsReceived}
              >
                <ThemedText>I've Received the Details</ThemedText>
              </BaseButton>
            )}
          </View>
        </View>

        {/* Rating Section - Only show after details are received */}
        {detailsReceived && !hasReviewed && (
          <View style={styles.ratingContainer}>
            <ThemedText style={styles.ratingTitle}>
              Rate Your Experience
            </ThemedText>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRating(star)}
                >
                  <Star
                    size={32}
                    color={star <= rating ? "#ffc107" : "#e4e5e7"}
                    fill={star <= rating ? "#ffc107" : "none"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <BaseButton
              variant="primary"
              size="medium"
              style={styles.submitButton}
              onPress={submitReview}
            >
              Submit Review
            </BaseButton>
          </View>
        )}

        {/* Thank You Message (shows after review) */}
        {hasReviewed && (
          <View style={styles.thankYouContainer}>
            <ThemedText style={styles.thankYouText}>
              Thank you for your feedback! Your review helps improve our service.
            </ThemedText>
          </View>
        )}

        {/* Return to Home Button */}
        <BaseButton
          variant="secondary"
          size="medium"
          style={styles.homeButton}
          onPress={() => router.push("/home")}
        >
          Return to Home
        </BaseButton>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  statusContainer: {
    alignItems: "center",
    marginVertical: 24,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  statusText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  cardContainer: {
    marginVertical: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 8,
  },
  cardText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
  emailButton: {
    marginTop: 8,
    width: "100%",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  ratingContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  submitButton: {
    width: "100%",
  },
  thankYouContainer: {
    backgroundColor: "#e8f5e9",
    padding: 16,
    borderRadius: 8,
    marginVertical: 20,
  },
  thankYouText: {
    textAlign: "center",
    color: "#2e7d32",
    fontSize: 16,
  },
  homeButton: {
    marginTop: 8,
  },
  confirmButton: {
    marginTop: 12,
    width: "100%",
  },
}); 