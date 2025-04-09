import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import ProgressBar from "@/components/ProgressBar";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { useSponsorshipProcess } from "@/context/SponsorshipProcessContext";
import { useStatus } from "@/context/StatusContext";
import axiosInstance from "@/config";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import {
  Camera,
  Upload,
  CheckCircle,
  Info,
  AlertCircle,
  X,
} from "lucide-react-native";

export default function DeliverySponsor() {
  const params = useLocalSearchParams();
  const processId = params.processId;
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const { show, hide } = useStatus();
  const [process, setProcess] = useState<any>(null);
  const [sponsorship, setSponsorship] = useState<any>(null);
  const [buyer, setBuyer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [accountDetails, setAccountDetails] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const { verifySponsorshipDelivery } = useSponsorshipProcess();

  // Progress steps
  const progressSteps = [
    { id: 1, title: "Initialization", icon: "initialization", status: "completed" },
    { id: 2, title: "Verification", icon: "verification", status: "completed" },
    { id: 3, title: "Payment", icon: "payment", status: "completed" },
    { id: 4, title: "Delivery", icon: "pickup", status: "current" },
  ];

  // Fetch process details
  useEffect(() => {
    if (processId) {
      fetchProcessDetails();
    }
  }, [processId]);

  const fetchProcessDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/sponsorship-process/${processId}`);
      setProcess(response.data.data);
      
      // Fetch sponsorship details
      const sponsorshipResponse = await axiosInstance.get(`/api/one/${response.data.data.sponsorshipId}`);
      setSponsorship(sponsorshipResponse.data);
      
      // Fetch buyer details
      const buyerResponse = await axiosInstance.get(`/api/users/${response.data.data.buyerId}`);
      setBuyer(buyerResponse.data.data);
    } catch (error) {
      console.error("Error fetching process details:", error);
      show({
        type: "error",
        title: "Error",
        message: "Failed to load process details",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        show({
          type: "error",
          title: "Permission Denied",
          message: "Camera permission is required to take photos",
          primaryAction: {
            label: "OK",
            onPress: hide
          }
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      show({
        type: "error",
        title: "Error",
        message: "Failed to take photo",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        show({
          type: "error",
          title: "Permission Denied",
          message: "Gallery permission is required to select photos",
          primaryAction: {
            label: "OK",
            onPress: hide
          }
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      show({
        type: "error",
        title: "Error",
        message: "Failed to select image",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      show({
        type: "error",
        title: "Missing Image",
        message: "Please provide a screenshot or photo of the account",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
      return;
    }

    if (!accountDetails.trim()) {
      show({
        type: "error",
        title: "Missing Details",
        message: "Please provide account details",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Upload image and account details
      const formData = new FormData();
      formData.append("image", {
        uri: image,
        type: "image/jpeg",
        name: "delivery_proof.jpg",
      } as any);
      
      formData.append("accountDetails", accountDetails);
      formData.append("accountPassword", accountPassword);
      
      // Submit delivery proof
      await verifySponsorshipDelivery(Number(processId), image);
      
      // Navigate to success screen
      show({
        type: "success",
        title: "Delivery Submitted",
        message: "Your delivery proof has been submitted. The buyer will now verify the account.",
        primaryAction: {
          label: "OK",
          onPress: () => {
            hide();
            router.push("/screens/NotificationsScreen");
          }
        }
      });
    } catch (error) {
      console.error("Error submitting delivery:", error);
      show({
        type: "error",
        title: "Submission Failed",
        message: "There was an error submitting your delivery proof",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
    } finally {
      setSubmitting(false);
    }
  };

  // if (loading) {
  //   return (
  //     <ThemedView style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
  //       <ThemedText style={styles.loadingText}>Loading delivery details...</ThemedText>
  //     </ThemedView>
  //   );
  // }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.title}>Delivery</ThemedText>
        <ThemedText style={styles.subtitle}>
          Provide account details and proof for the buyer
        </ThemedText>

        <ProgressBar currentStep={4} steps={progressSteps} />

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Info size={20} color="#3b82f6" />
            <ThemedText style={styles.infoTitle}>Delivery Instructions</ThemedText>
          </View>
          <ThemedText style={styles.infoText}>
            Please provide the account details and a screenshot showing the account is active and ready for use.
            The buyer will verify these details to confirm receipt.
          </ThemedText>
        </View>

        <View style={styles.formSection}>
          <ThemedText style={styles.sectionTitle}>Account Details</ThemedText>
          
          <ThemedText style={styles.inputLabel}>Account Email/Username</ThemedText>
          <TextInput
            style={styles.textInput}
            value={accountDetails}
            onChangeText={setAccountDetails}
            placeholder="Enter account email or username"
            placeholderTextColor="#94a3b8"
          />
          
          <ThemedText style={styles.inputLabel}>Account Password</ThemedText>
          <TextInput
            style={styles.textInput}
            value={accountPassword}
            onChangeText={setAccountPassword}
            placeholder="Enter account password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
          />
          
          <ThemedText style={styles.sectionTitle}>Proof of Account</ThemedText>
          <ThemedText style={styles.inputDescription}>
            Take a screenshot or photo showing the account is active
          </ThemedText>
          
          {image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => setImage(null)}>
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imageButtonsContainer}>
              <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                <Camera size={24} color={Colors[colorScheme].primary} />
                <ThemedText style={styles.imageButtonText}>Take Photo</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Upload size={24} color={Colors[colorScheme].primary} />
                <ThemedText style={styles.imageButtonText}>Upload Image</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.warningCard}>
          <AlertCircle size={20} color="#f59e0b" />
          <ThemedText style={styles.warningText}>
            Make sure the account details are correct. The buyer will use these to verify the account.
          </ThemedText>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <BaseButton
          variant="primary"
          onPress={handleSubmit}
          style={styles.button}
          disabled={submitting || !image || !accountDetails.trim()}
        >
          {submitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <ThemedText style={styles.buttonText}>Submit Delivery</ThemedText>
              <CheckCircle size={20} color="white" />
            </>
          )}
        </BaseButton>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0369a1",
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1e293b",
    lineHeight: 20,
  },
  formSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  imageButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  imageButton: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  imageButtonText: {
    fontSize: 14,
    color: Colors.light.primary,
    marginTop: 8,
  },
  imagePreviewContainer: {
    position: "relative",
    marginBottom: 16,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  warningCard: {
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#92400e",
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "white",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
}); 