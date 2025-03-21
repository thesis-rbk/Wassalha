import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { CheckCircle, Home } from "lucide-react-native";
import { useRouter } from "expo-router";

const VerificationPending = () => {
  const router = useRouter();

  const goHome = () => {
    router.push("/home");
  };
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <CheckCircle
          size={120}
          color={Colors.light.primary}
          style={styles.icon}
        />
        <ThemedText style={styles.title}>Verification Submitted</ThemedText>
        <ThemedText style={styles.message}>
          Thank you for completing the verification process. Our admin team will
          review your information and get back to you shortly.
        </ThemedText>

        <View style={styles.statusContainer}>
          <ThemedText style={styles.statusTitle}>
            Verification Status
          </ThemedText>

          <View style={styles.statusItem}>
            <View style={[styles.statusDot, styles.statusCompleted]} />
            <ThemedText style={styles.statusText}>
              Verification Complete
            </ThemedText>
          </View>

          <View style={styles.statusItem}>
            <View style={[styles.statusDot, styles.statusInProgress]} />
            <ThemedText style={styles.statusText}>Under Review</ThemedText>
          </View>

          <View style={styles.statusItem}>
            <View style={[styles.statusDot, styles.statusPending]} />
            <ThemedText style={styles.statusText}>
              Information Submitted
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoBox}>
          <ThemedText style={styles.infoTitle}>What happens next?</ThemedText>
          <ThemedText style={styles.infoText}>
            Once approved, you'll be able to access sponsor features and help
            others in the community. We'll notify you via email when your
            verification is complete.
          </ThemedText>
        </View>

        <TouchableOpacity style={styles.homeButton} onPress={goHome}>
          <Home size={24} color="white" style={styles.homeIcon} />
          <ThemedText style={styles.homeButtonText}>Go Back Home</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    color: Colors.light.primary,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    color: Colors.dark.secondary,
  },
  statusContainer: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusCompleted: {
    backgroundColor: "#22c55e",
  },
  statusInProgress: {
    backgroundColor: "#f59e0b",
  },
  statusPending: {
    backgroundColor: "#cbd5e1",
  },
  statusText: {
    fontSize: 16,
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: Colors.light.primary,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.dark.secondary,
  },
  homeButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginTop: 20,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  homeIcon: {
    marginRight: 4,
  },
});

export default VerificationPending;
