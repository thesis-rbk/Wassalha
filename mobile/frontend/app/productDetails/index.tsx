import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Camera, Globe, Edit2 } from "lucide-react-native";
import { InputField } from "@/components/InputField";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import {
  TitleLarge,
  TitleSection,
  TitleSub,
  BodyMedium,
} from "@/components/Typography";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useLocalSearchParams } from "expo-router";
import { ProductDetailsProps } from "@/types/ProductDetails";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useStatus } from '@/context/StatusContext';
import Header from "@/components/navigation/headers";
console.log("API URL:", process.env.EXPO_PUBLIC_API_URL);
console.log("Upload URL:", process.env.EXPO_PUBLIC_MEDIA_UPLOAD_URL);

const ProductDetails: React.FC<ProductDetailsProps> = ({ onNext }) => {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const { show, hide } = useStatus();

  // Retrieve scrapedData from the query parameters (if available)
  const { scrapedData } = useLocalSearchParams();
  const parsedData = scrapedData ? JSON.parse(scrapedData as string) : null;

  // Initialize form fields with scraped data if available
  const [productName, setProductName] = useState(
    parsedData ? parsedData.name : ""
  );
  const [productImage, setProductImage] = useState(
    parsedData && parsedData.imageId
      ? `${process.env.EXPO_PUBLIC_MEDIA_VIEW_URL}/${parsedData.imageId}`
      : ""
  );
  const [productImageId, setProductImageId] = useState(null);
  const [price, setPrice] = useState(
    parsedData ? parsedData.price.toString() : ""
  );
  const [productDetails, setProductDetails] = useState(
    parsedData ? parsedData.description : ""
  );
  const [withBox, setWithBox] = useState(false);
  const [goodsId, setGoodsId] = useState(parsedData ? parsedData.goodsId : "");
  const [dataSource, setDataSource] = useState("scraped");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageSource, setImageSource] = useState<"local" | "remote">("local");

  const clearProductImage = () => setProductImage("");

  const pickImage = async () => {
    try {
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
        setProductImage(selectedFile.uri);
        console.log("📄 Updated product image with new URI:", selectedFile.uri);
      } else {
        console.log("📄 Document picking cancelled or no file selected");
      }
    } catch (error) {
      console.error("❌ Error picking document:", error);
      show({
        type: 'error',
        title: 'Document Error',
        message: 'Failed to pick document. Please try again.',
        primaryAction: {
          label: 'Try Again',
          onPress: () => {
            hide();
            pickImage();
          }
        },
        secondaryAction: {
          label: 'Cancel',
          onPress: () => hide()
        }
      });
    }
  };

  const handleNext = async () => {
    try {
      console.log("🚀 Starting navigation to additional details...");

      // If we have a remote image, try to download it first
      if (imageSource === "remote" && productImage.startsWith("http")) {
        setImageLoading(true);

        try {
          const filename = productImage.split("/").pop() || "image.jpg";
          const fileUri = `${FileSystem.cacheDirectory}${filename}`;

          console.log("📥 Downloading image before navigation...");
          const result = await FileSystem.downloadAsync(productImage, fileUri);

          if (result.status === 200) {
            console.log("✅ Image downloaded successfully");
            setProductImage(fileUri);
            setImageSource("local");
          } else {
            // If download fails, we'll still navigate but with the remote URL
            console.warn("⚠️ Image download failed, using remote URL");
          }
        } catch (error) {
          console.error("❌ Image download error:", error);
          // Continue with navigation even if download fails
        } finally {
          setImageLoading(false);
        }
      }

      // Now navigate with whatever image we have
      navigateToNextStep();
    } catch (error) {
      console.error("Navigation error:", error);
      show({
        type: 'error',
        title: 'Navigation Error',
        message: 'Failed to proceed to next step. Please try again.',
        primaryAction: {
          label: 'Try Again',
          onPress: () => {
            hide();
            handleNext();
          }
        },
        secondaryAction: {
          label: 'Cancel',
          onPress: () => hide()
        }
      });
    }
  };

  const handleScrapedImage = async () => {
    if (!parsedData?.imageUrl) return;

    setImageLoading(true);

    try {
      // First, try to display the remote image directly
      setProductImage(parsedData.imageUrl);
      setImageSource("remote");

      // Start a background download of the image
      const filename =
        parsedData.imageUrl.split("/").pop() || "scraped_image.jpg";
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      console.log("🔄 Background downloading of scraped image started");

      FileSystem.downloadAsync(parsedData.imageUrl, fileUri)
        .then((result) => {
          if (result.status === 200) {
            console.log("✅ Scraped image downloaded to local storage");
            // Only update if we're still using the same remote image
            if (productImage === parsedData.imageUrl) {
              setProductImage(fileUri);
              setImageSource("local");
              console.log("🔄 Image source switched to local file");
            }
          }
        })
        .catch((error) => {
          console.error("❌ Background download failed:", error);
          // We already have the remote URL displayed, so no need for an alert
        });
    } catch (error) {
      console.error("❌ Error handling scraped image:", error);
      // If we can't even set the remote URL, clear it
      setProductImage("");
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    if (parsedData) {
      setDataSource("scraped");
      setProductName(parsedData.name || "");
      setPrice(parsedData.price ? parsedData.price.toString() : "");
      setProductDetails(parsedData.description || "");

      // Handle the image in the background
      handleScrapedImage();
    }
  }, [parsedData]);

  const renderScrapedDataBanner = () => {
    if (dataSource !== "scraped") return null;

    return (
      <View style={styles.scrapedBanner}>
        <View style={styles.scrapedIconContainer}>
          <Globe size={18} color="#ffffff" />
        </View>
        <View style={styles.scrapedTextContainer}>
          <BodyMedium style={styles.scrapedTitle}>Web Data Imported</BodyMedium>
          <BodyMedium style={styles.scrapedSubtitle}>
            This information was automatically imported from{" "}
            {parsedData?.source || "the web"}
          </BodyMedium>
        </View>
        <TouchableOpacity
          style={styles.scrapedEditButton}
          onPress={() => setDataSource("manual")}
        >
          <Edit2
            size={16}
            color={Colors[colorScheme as "light" | "dark"].primary}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const navigateToNextStep = () => {
    router.push({
      pathname: "/productDetails/additional-details",
      params: {
        name: productName,
        price: price,
        details: productDetails,
        withBox: withBox.toString(),
        imageUri: productImage,
        dataSource: imageSource === "remote" ? "scraped" : "manual",
      },
    });
    console.log("✅ Navigation successful");
  };

  return (
    <ScrollView style={styles.container}>
      <Header title="Create Request" subtitle="Enter Your Request details" showBackButton={true} />
      <View style={styles.card}>
        {renderScrapedDataBanner()}
        <InputField
          label="Product name"
          value={productName}
          onChangeText={setProductName}
          placeholder="Enter product name"
          style={styles.input}
        />

        <TitleSection style={styles.sectionTitle}>Product Image</TitleSection>
        <View style={styles.imageContainer}>
          {productImage ? (
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: productImage }}
                style={styles.productImage}
                onError={(e) => {
                  console.error("Image loading error:", e.nativeEvent.error);
                  show({
                    type: 'error',
                    title: 'Image Error',
                    message: 'Failed to load image. Please try selecting another image.',
                    primaryAction: {
                      label: 'Select New Image',
                      onPress: () => {
                        hide();
                        pickImage();
                      }
                    },
                    secondaryAction: {
                      label: 'Cancel',
                      onPress: () => {
                        hide();
                        setProductImage("");
                      }
                    }
                  });
                }}
              />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={pickImage}
              >
                <BodyMedium style={styles.changeImageText}>
                  Change Image
                </BodyMedium>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadCard}>
              <BaseButton
                size="medium"
                onPress={pickImage}
                style={styles.uploadButton}
              >
                <Camera
                  size={20}
                  color={Colors[colorScheme as "light" | "dark"].primary}
                />
                <BodyMedium style={styles.uploadText}>Upload image</BodyMedium>
              </BaseButton>
            </View>
          )}
        </View>

        <InputField
          label="Price"
          value={price}
          onChangeText={setPrice}
          placeholder="Enter product price"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <InputField
          label="Product details"
          value={productDetails}
          onChangeText={setProductDetails}
          placeholder="Enter product details"
          multiline
          numberOfLines={3}
          style={[styles.input, styles.textArea]}
        />

        <View style={styles.switchContainer}>
          <View style={styles.switchTextContainer}>
            <View style={styles.switchHeader}>
              <TitleSub>With box</TitleSub>
              <Switch
                value={withBox}
                onValueChange={setWithBox}
                trackColor={{
                  false: "#e0e0e0",
                  true: Colors[colorScheme as "light" | "dark"].primary,
                }}
                thumbColor={withBox ? "#ffffff" : "#ffffff"}
              />
            </View>
            <BodyMedium style={styles.switchDescription}>
              Requiring the box may reduce the number of offers you receive.
              Travelers generally prefer to deliver orders without the box to
              save space.
            </BodyMedium>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <BaseButton size="large" onPress={handleNext}>
            <BodyMedium style={styles.buttonText}>Next</BodyMedium>
          </BaseButton>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
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
  mainTitle: { marginBottom: 16, fontSize: 20 },
  sectionTitle: { marginTop: 12, marginBottom: 8, fontSize: 16 },
  input: { marginBottom: 12 },
  imageContainer: {
    marginBottom: 16,
  },
  imageWrapper: {
    width: 120,
    height: 120,
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  uploadCard: {
    width: 160,
    height: 110,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 6,
    backgroundColor: "rgba(0, 128, 152, 0.05)",
    overflow: "hidden",
  },
  uploadButton: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "column",
    gap: 4,
    elevation: 0,
    shadowOpacity: 0,
  },
  uploadText: { fontSize: 12 },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 8,
    marginBottom: 0,
  },
  switchContainer: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
    marginVertical: 12,
  },
  switchTextContainer: { flex: 1 },
  switchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  switchDescription: { fontSize: 12, color: "#666666", lineHeight: 16 },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 12,
  },
  buttonText: { color: "#ffffff" },
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
  scrapedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  scrapedIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2196f3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  scrapedTextContainer: {
    flex: 1,
  },
  scrapedTitle: {
    fontWeight: "600",
    color: "#0d47a1",
    fontSize: 14,
  },
  scrapedSubtitle: {
    color: "#1976d2",
    fontSize: 12,
  },
  scrapedEditButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: "#e3f2fd",
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
});

export default ProductDetails;
