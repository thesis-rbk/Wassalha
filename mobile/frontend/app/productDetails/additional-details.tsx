"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image as RNImage,
} from "react-native";
import { ChevronDown, Image as ImageIcon } from "lucide-react-native";
import { InputField } from "@/components/InputField";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { TitleLarge, TitleSection, BodyMedium } from "@/components/Typography";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Category } from "@/types/Category";
import axiosInstance from "@/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const AdditionalDetails: React.FC = () => {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const params = useLocalSearchParams();

  // Update the productDetails conversion to include all passed data
  const [productDetails, setProductDetails] = useState({
    name: params.name as string,
    price: parseFloat(params.price as string),
    details: params.details as string,
    withBox: params.withBox === "true",
    imageUri: params.imageUri as string | undefined,
  });

  console.log("Received and converted data:", productDetails);

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [size, setSize] = useState("");
  const [weight, setWeight] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [notes, setNotes] = useState("");
  const [categoryError, setCategoryError] = useState<string>("");

  // Add new state for request details
  const [quantity, setQuantity] = useState("");
  const [goodsLocation, setGoodsLocation] = useState("");
  const [goodsDestination, setGoodsDestination] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(new Date());

  // Add this to handle closing dropdown when clicking outside
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Add loading state for image picker
  const [imageLoading, setImageLoading] = useState(false);

  // Add this new state for date picker
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/api/categories");
        if (response.status === 200) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategorySelect = (id: number) => {
    setCategoryId(id);
    setShowCategoryDropdown(false);
  };

  // Document picker function
  const pickDocument = async () => {
    try {
      setImageLoading(true);
      console.log("📄 Opening document picker...");

      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*"], // Limit to image files
        copyToCacheDirectory: true,
      });

      console.log("📄 Document picker result:", result);

      if (
        result.canceled === false &&
        result.assets &&
        result.assets.length > 0
      ) {
        const selectedFile = result.assets[0];
        console.log("📄 Selected file:", selectedFile);

        // Update state with the selected file URI
        setProductDetails((prev) => ({
          ...prev,
          imageUri: selectedFile.uri,
        }));

        console.log(
          "📄 Updated product details with new image URI:",
          selectedFile.uri
        );
      } else {
        console.log("📄 Document picking cancelled or no file selected");
      }
    } catch (error) {
      console.error("❌ Error picking document:", error);
      Alert.alert("Error", "Failed to pick document");
    } finally {
      setImageLoading(false);
    }
  };

  // Add this right before your handleSubmit function
  const debugFormData = (formData: FormData) => {
    console.log("🔍 DEBUG: FormData contents:");
    // @ts-ignore - accessing _parts which exists in React Native's FormData
    const parts = formData._parts || [];
    parts.forEach((part: [string, any], index: number) => {
      if (part[0] === "file" && part[1] && typeof part[1] === "object") {
        console.log(`📎 Part ${index} (File):`, {
          fieldName: part[0],
          fileName: part[1].name,
          type: part[1].type,
          uri: part[1].uri ? `${part[1].uri.substring(0, 30)}...` : undefined,
        });
      } else {
        console.log(`📝 Part ${index}:`, part);
      }
    });
  };

  // Then modify your handleSubmit function to include debugging
  const handleSubmit = async () => {
    try {
      console.log("🚀 Starting submission process...");
      let jwtToken = await AsyncStorage.getItem("jwtToken");
      console.log("🔑 Token retrieved:", jwtToken ? "Found" : "Not found");

      // Make sure we have a token
      if (!jwtToken) {
        Alert.alert("Error", "You need to be logged in to create a request");
        return;
      }

      // Check if token is expired and refresh if needed
      try {
        // Try a simple API call to check token validity
        await axiosInstance.get("/api/categories", {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
      } catch (tokenError: any) {
        // If token is expired, try to refresh it
        if (
          tokenError.response?.status === 401 &&
          tokenError.response?.data?.message === "jwt expired"
        ) {
          console.log("🔄 Token expired, attempting to refresh...");
          try {
            // Call your refresh token endpoint
            const refreshResponse = await axiosInstance.post(
              "/api/auth/refresh-token"
            );
            if (refreshResponse.data.success) {
              const newToken = refreshResponse.data.token;
              if (newToken) {
                jwtToken = newToken;
                await AsyncStorage.setItem("jwtToken", newToken);
                console.log("🔑 Token refreshed successfully");
              }
            } else {
              // If refresh fails, redirect to login
              Alert.alert("Session Expired", "Please log in again");
              router.replace("../login");
              return;
            }
          } catch (refreshError) {
            console.error("❌ Token refresh failed:", refreshError);
            Alert.alert("Session Expired", "Please log in again");
            router.replace("../login");
            return;
          }
        }
      }

      // If the image is a remote URL, download it first
      if (
        productDetails.imageUri &&
        productDetails.imageUri.startsWith("http")
      ) {
        console.log("📥 Downloading remote image before submission...");
        setImageLoading(true);

        try {
          const filename =
            productDetails.imageUri.split("/").pop() || "image.jpg";
          const fileUri = `${FileSystem.cacheDirectory}${filename}`;

          const result = await FileSystem.downloadAsync(
            productDetails.imageUri,
            fileUri
          );

          if (result.status === 200) {
            console.log("✅ Remote image downloaded successfully");
            setProductDetails((prev) => ({
              ...prev,
              imageUri: fileUri,
            }));
          } else {
            throw new Error("Failed to download image");
          }
        } catch (error) {
          console.error("❌ Image download error:", error);
          Alert.alert(
            "Image Download Failed",
            "We couldn't download the web image. Would you like to continue without an image or go back and select a local image?",
            [
              {
                text: "Continue Without Image",
                onPress: () => {
                  setProductDetails((prev) => ({
                    ...prev,
                    imageUri: undefined,
                  }));
                  // Continue with submission
                  if (jwtToken) {
                    submitForm(jwtToken);
                  } else {
                    Alert.alert("Error", "Authentication token is missing");
                  }
                },
              },
              {
                text: "Go Back",
                style: "cancel",
              },
            ]
          );
          return;
        } finally {
          setImageLoading(false);
        }
      }

      // Continue with form submission
      if (jwtToken) {
        submitForm(jwtToken);
      } else {
        Alert.alert("Error", "Authentication token is missing");
      }
    } catch (error) {
      console.error("❌ Outer error:", error);
      Alert.alert(
        "Error",
        (error as Error).message || "An unknown error occurred"
      );
    }
  };

  // Extract the actual form submission logic
  async function submitForm(jwtToken: string) {
    try {
      // Create FormData for goods with image
      console.log("📤 Creating goods with image...");

      const formData = new FormData();

      // Add all the goods data
      formData.append("name", productDetails.name);
      formData.append("price", productDetails.price.toString());
      formData.append("description", productDetails.details);
      formData.append("categoryId", categoryId!.toString());
      formData.append("isVerified", "false");

      // Add image if available - using document picker approach
      if (productDetails.imageUri) {
        console.log("📄 Processing selected image:", productDetails.imageUri);

        // Get file info
        const fileInfo = await FileSystem.getInfoAsync(productDetails.imageUri);
        console.log("📄 File info:", fileInfo);

        // Determine file type based on URI
        const uriParts = productDetails.imageUri.split(".");
        const fileExtension = uriParts[uriParts.length - 1];

        let fileType = "image/jpeg"; // Default
        if (fileExtension) {
          if (fileExtension.toLowerCase() === "png") {
            fileType = "image/png";
          } else if (fileExtension.toLowerCase() === "gif") {
            fileType = "image/gif";
          } else if (fileExtension.toLowerCase() === "webp") {
            fileType = "image/webp";
          }
        }

        // Get filename from URI
        const fileName =
          productDetails.imageUri.split("/").pop() ||
          `image.${fileExtension || "jpg"}`;

        console.log("📄 Creating file object with:", {
          uri: productDetails.imageUri,
          type: fileType,
          name: fileName,
        });

        const imageFile = {
          uri: productDetails.imageUri,
          type: fileType,
          name: fileName,
        };

        formData.append("file", imageFile as any);
        console.log("📎 Appended image to FormData");
      } else {
        console.log("⚠️ No image selected");
      }

      // Debug the FormData
      debugFormData(formData);

      try {
        // Use fetch instead of axios for more direct control
        console.log("📤 Using fetch API for file upload...");

        const response = await fetch(
          `${axiosInstance.defaults.baseURL}/api/goods`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              // Don't set Content-Type - let fetch set it automatically with the boundary
            },
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Server returned ${response.status}: ${await response.text()}`
          );
        }

        const goodsResponse = await response.json();
        console.log("✅ Goods created:", goodsResponse);

        // Create request with the new goods ID
        if (goodsResponse.success) {
          // Parse and validate the date
          let requestDate = null;
          try {
            if (deliveryDate && deliveryDate.getTime() !== 0) {
              requestDate = new Date(deliveryDate);
              // Check if date is valid
              if (isNaN(requestDate.getTime())) {
                console.warn("⚠️ Invalid date format, using null instead");
                requestDate = null;
              } else {
                console.log("📅 Using date:", requestDate.toISOString());
              }
            }
          } catch (dateError) {
            console.warn("⚠️ Date parsing error:", dateError);
            requestDate = null;
          }

          const requestData = {
            goodsId: goodsResponse.data.id,
            quantity: parseInt(quantity) || 1,
            goodsLocation,
            goodsDestination,
            date: requestDate,
            withBox: productDetails.withBox,
          };

          console.log("📤 Creating request with data:", requestData);

          const requestResponse = await axiosInstance.post(
            "/api/requests",
            requestData,
            {
              headers: {
                Authorization: `Bearer ${jwtToken}`,
              },
            }
          );
          console.log("✅ Request created:", requestResponse.data);

          if (requestResponse.data.success) {
            router.replace({
              pathname: "/screens/RequestSuccessScreen",
              params: {
                requestId: requestResponse.data.data.id,
                goodsName: productDetails.name,
              },
            });
          }
        }
      } catch (error: any) {
        console.error("❌ Error:", error);
        console.error("❌ Error details:", {
          message: error.message,
          response: error.response
            ? {
                status: error.response.status,
                data: error.response.data,
              }
            : "No response",
          request: error.request
            ? "Request was made but no response received"
            : "Request setup failed",
        });
        Alert.alert("Error", error.message || "An unknown error occurred");
      }
    } catch (error: any) {
      console.error("❌ Error:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response
          ? {
              status: error.response.status,
              data: error.response.data,
            }
          : "No response",
        request: error.request
          ? "Request was made but no response received"
          : "Request setup failed",
      });
      Alert.alert(
        "Error",
        (error as Error).message || "An unknown error occurred"
      );
    }
  }

  return (
    <ScrollView style={styles.container} scrollEnabled={!dropdownVisible}>
      <View style={styles.card}>
        <TitleLarge style={styles.mainTitle}>Product Details</TitleLarge>

        {/* Image Selection Section */}
        <View style={styles.imageSection}>
          <TitleSection style={styles.sectionTitle}>Product Image</TitleSection>

          {productDetails.imageUri ? (
            <View style={styles.selectedImageContainer}>
              <RNImage
                source={{ uri: productDetails.imageUri }}
                style={styles.selectedImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={pickDocument}
                disabled={imageLoading}
              >
                <BodyMedium style={styles.changeImageText}>
                  {imageLoading ? "Loading..." : "Change Image"}
                </BodyMedium>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.pickDocumentButton}
              onPress={pickDocument}
              disabled={imageLoading}
            >
              {imageLoading ? (
                <BodyMedium style={styles.pickDocumentText}>
                  Loading...
                </BodyMedium>
              ) : (
                <>
                  <ImageIcon size={24} color={Colors[colorScheme].primary} />
                  <BodyMedium style={styles.pickDocumentText}>
                    Select Product Image
                  </BodyMedium>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Category Dropdown */}
        <View style={styles.dropdownContainer}>
          <TitleSection style={styles.sectionTitle}>
            Category * {/* Asterisk indicates required field */}
          </TitleSection>
          <TouchableOpacity style={styles.dropdownTrigger}>
            <TitleSection style={styles.sectionTitle}>
              Category * {/* Asterisk indicates required field */}
            </TitleSection>
            <TouchableOpacity
              style={[
                styles.dropdownTrigger,
                categoryError ? styles.errorBorder : null,
                dropdownVisible ? styles.dropdownTriggerActive : null,
              ]}
              onPress={() => setDropdownVisible(!dropdownVisible)}
              activeOpacity={0.7}
            >
              <BodyMedium
                style={
                  categoryId ? styles.selectedText : styles.placeholderText
                }
              >
                {categories.find((c) => c.id === categoryId)?.name ||
                  "Select a category"}
              </BodyMedium>
              <ChevronDown
                size={20}
                color={Colors[colorScheme].primary}
                style={[
                  styles.dropdownIcon,
                  dropdownVisible ? styles.dropdownIconActive : null,
                ]}
              />
            </TouchableOpacity>

            {/* Error message */}
            {categoryError ? (
              <BodyMedium style={styles.errorText}>{categoryError}</BodyMedium>
            ) : null}
          </TouchableOpacity>

          {/* Error message */}
          {categoryError ? (
            <BodyMedium style={styles.errorText}>{categoryError}</BodyMedium>
          ) : null}

          {dropdownVisible && (
            <View style={styles.dropdownMenu}>
              <ScrollView
                style={styles.dropdownScroll}
                nestedScrollEnabled={true}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.dropdownItem,
                      categoryId === category.id && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      handleCategorySelect(category.id);
                      setDropdownVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <BodyMedium
                      style={[
                        styles.dropdownItemText,
                        categoryId === category.id &&
                          styles.dropdownItemTextSelected,
                      ]}
                    >
                      {category.name}
                    </BodyMedium>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Size Input */}
        <InputField
          label="Size (Optional)"
          value={size}
          onChangeText={setSize}
          placeholder="Enter size"
          style={styles.input}
        />

        {/* Weight Input */}
        <InputField
          label="Weight in kg (Optional)"
          value={weight}
          onChangeText={setWeight}
          placeholder="Enter weight"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        {/* Additional Notes */}
        <InputField
          label="Additional Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Any special instructions or requirements"
          multiline
          numberOfLines={3}
          style={[styles.input, styles.textArea]}
        />

        <View style={styles.divider} />

        <TitleLarge style={styles.mainTitle}>Delivery Details</TitleLarge>

        <InputField
          label="Quantity *"
          value={quantity}
          onChangeText={setQuantity}
          placeholder="Enter quantity"
          keyboardType="numeric"
          style={styles.input}
        />

        <InputField
          label="Pickup Location *"
          value={goodsLocation}
          onChangeText={setGoodsLocation}
          placeholder="Enter pickup location"
          style={styles.input}
        />

        <InputField
          label="Delivery Location *"
          value={goodsDestination}
          onChangeText={setGoodsDestination}
          placeholder="Enter delivery location"
          style={styles.input}
        />

        <View style={styles.formField}>
          <BodyMedium style={styles.label}>Delivery Date</BodyMedium>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <BodyMedium>{deliveryDate.toLocaleDateString()}</BodyMedium>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={showDatePicker}
            mode="date"
            onConfirm={(date) => {
              setShowDatePicker(false);
              setDeliveryDate(date);
            }}
            onCancel={() => setShowDatePicker(false)}
            minimumDate={new Date()}
          />
        </View>

        <View style={styles.buttonContainer}>
          <BaseButton
            size="large"
            onPress={handleSubmit}
            disabled={
              !categoryId || !quantity || !goodsLocation || !goodsDestination
            }
          >
            <BodyMedium style={styles.buttonText}>
              Create Product & Request
            </BodyMedium>
          </BaseButton>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 14,
    margin: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mainTitle: {
    marginBottom: 16,
    fontSize: 20,
  },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 8,
  },
  dropdownContainer: {
    position: "relative",
    zIndex: 1000,
    marginBottom: 16,
  },
  dropdownTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    zIndex: 1000,
  },
  dropdownTriggerActive: {
    borderColor: Colors.light.primary,
    borderWidth: 2,
  },
  dropdownIcon: {
    transform: [{ rotate: "0deg" }],
  },
  dropdownIconActive: {
    transform: [{ rotate: "180deg" }],
  },
  dropdownMenu: {
    position: "absolute",
    top: "auto", // Changed from fixed value
    marginTop: 4, // Add some space between trigger and menu
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#fff",
    maxHeight: 200,
    zIndex: 1001,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  dropdownItemSelected: {
    backgroundColor: Colors.light.primary + "10", // Add slight tint for selected item
  },
  dropdownItemText: {
    color: "#333",
  },
  dropdownItemTextSelected: {
    color: Colors.light.primary,
    fontWeight: "500",
  },
  placeholderText: {
    color: "#999",
  },
  selectedText: {
    color: "#333",
    fontWeight: "500",
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 24,
  },
  buttonText: {
    color: "#ffffff",
  },
  errorBorder: {
    borderColor: "#FF3B30",
    borderWidth: 1,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 20,
  },
  // New styles for image picker
  imageSection: {
    marginBottom: 16,
  },
  pickDocumentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 16,
    backgroundColor: Colors.light.primary + "10",
    gap: 8,
  },
  pickDocumentText: {
    color: Colors.light.primary,
    fontWeight: "500",
  },
  selectedImageContainer: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  selectedImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  changeImageButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    position: "absolute",
    bottom: 0,
    right: 0,
    borderTopLeftRadius: 8,
  },
  changeImageText: {
    color: "#fff",
    fontSize: 14,
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
  },
});

export default AdditionalDetails;
