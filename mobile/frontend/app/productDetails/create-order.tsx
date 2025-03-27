import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Link,
  Bell,
  MessageCircle,
  User,
  Shield,
  Package,
  Headphones,
  ChevronRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { TitleLarge, BodyMedium } from "@/components/Typography";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { useStatus } from '@/context/StatusContext';

const SCRAPE_URL = `${process.env.EXPO_PUBLIC_API_URL}${process.env.EXPO_PUBLIC_SCRAPE_ENDPOINT}`;

export default function Page() {
  const colorScheme = useColorScheme() ?? "light";
  const [productUrl, setProductUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entryMethod, setEntryMethod] = useState<"manual" | "url">("manual");
  const router = useRouter();
  const { show, hide } = useStatus();

  const handleCreateOrder = async () => {
    console.log('🎯 Starting order creation process...');
    console.log('📝 Entry method:', entryMethod);

    if (entryMethod === "manual") {
      console.log('👉 Navigating to manual entry...');
      router.push("/productDetails");
      return;
    }

    if (entryMethod === "url" && !productUrl) {
      show({
        type: 'error',
        title: 'No URL Provided',
        message: 'Would you like to proceed with manual entry?',
        primaryAction: {
          label: 'Yes, proceed manually',
          onPress: () => {
            hide();
            router.push('/productDetails');
          }
        },
        secondaryAction: {
          label: 'Cancel',
          onPress: () => hide()
        }
      });
      return;
    }

    // Only try to scrape if URL method is selected and URL is provided
    if (entryMethod === "url" && productUrl) {
      console.log('🔗 Processing URL:', productUrl);
      setIsLoading(true);
      try {
        console.log('📡 Making scrape request to:', SCRAPE_URL);
        const response = await fetch(SCRAPE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: productUrl }),
        });
        console.log('✅ Scrape response received');
        const data = await response.json();
        if (data.success) {
          console.log("URL success - navigating...");
          router.push("/productDetails");
        } else {
          setError(data.message || "Failed to scrape product");
        }
      } catch (err) {
        setError("Error connecting to server");
      } finally {
        setIsLoading(false);
      }
    } else if (entryMethod === "url") {
      setError("Please enter a URL");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TitleLarge style={styles.headerTitle}>Create Order</TitleLarge>
        <View style={styles.headerIcons}>
          <Bell size={24} color={Colors[colorScheme].primary} />
          <MessageCircle size={24} color={Colors[colorScheme].primary} />
          <User size={24} color={Colors[colorScheme].primary} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Entry Method Selection */}
        <View style={styles.methodSelection}>
          <TouchableOpacity
            style={[
              styles.methodButton,
              entryMethod === "manual" && styles.methodButtonActive,
            ]}
            onPress={() => setEntryMethod("manual")}
          >
            <BodyMedium
              style={[
                styles.methodButtonText,
                entryMethod === "manual" && styles.methodButtonTextActive,
              ]}
            >
              Manual Entry
            </BodyMedium>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodButton,
              entryMethod === "url" && styles.methodButtonActive,
            ]}
            onPress={() => setEntryMethod("url")}
          >
            <BodyMedium
              style={[
                styles.methodButtonText,
                entryMethod === "url" && styles.methodButtonTextActive,
              ]}
            >
              Import from URL
            </BodyMedium>
          </TouchableOpacity>
        </View>

        {/* URL Input Section - Always visible */}
        <View style={styles.inputSection}>
          <BodyMedium style={styles.label}>Product URL (Optional)</BodyMedium>
          <View style={styles.inputContainer}>
            <Link size={20} color={Colors[colorScheme].primary} />
            <TextInput
              style={styles.input}
              placeholder="Paste URL here to auto-fill details"
              placeholderTextColor="#999"
              value={productUrl}
              onChangeText={(text) => {
                setProductUrl(text);
                setError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>
          <BodyMedium style={styles.helperText}>
            {entryMethod === "manual"
              ? "You can paste a URL anytime to import product details"
              : "Example: https://aliexpress.com/item/..."}
          </BodyMedium>
        </View>

        {error && (
          <BodyMedium style={[styles.helperText, { color: "red" }]}>
            {error}
          </BodyMedium>
        )}

        <BaseButton
          size="large"
          onPress={handleCreateOrder}
          style={styles.createButton}
          disabled={entryMethod === "url" && isLoading}
        >
          {entryMethod === "url" && isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <BodyMedium style={styles.createButtonText}>
              Create Order
            </BodyMedium>
          )}
        </BaseButton>

        <View style={styles.trustSection}>
          <View style={styles.trustItem}>
            <View style={styles.trustHeader}>
              <Shield size={24} color={Colors[colorScheme].primary} />
              <BodyMedium style={styles.trustTitle}>Secure Payments</BodyMedium>
            </View>
            <BodyMedium style={styles.trustText}>
              Your payment is protected and never released to the traveler until
              you confirm delivery.
            </BodyMedium>
            <TouchableOpacity style={styles.learnMore}>
              <BodyMedium style={styles.learnMoreText}>
                Learn more about Trust and Safety
              </BodyMedium>
              <ChevronRight size={16} color={Colors[colorScheme].primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.trustItem}>
            <View style={styles.trustHeader}>
              <Package size={24} color={Colors[colorScheme].primary} />
              <BodyMedium style={styles.trustTitle}>
                Guaranteed delivery
              </BodyMedium>
            </View>
            <BodyMedium style={styles.trustText}>
              You are protected from start to finish. Receive your order as
              agreed or get 100% money back.
            </BodyMedium>
            <TouchableOpacity style={styles.learnMore}>
              <BodyMedium style={styles.learnMoreText}>
                Learn more about Money Back guarantee
              </BodyMedium>
              <ChevronRight size={16} color={Colors[colorScheme].primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.trustItem}>
            <View style={styles.trustHeader}>
              <Headphones size={24} color={Colors[colorScheme].primary} />
              <BodyMedium style={styles.trustTitle}>
                24/7 Customer care
              </BodyMedium>
            </View>
            <BodyMedium style={styles.trustText}>
              Customer support in your native language, within 24 hours.
            </BodyMedium>
            <TouchableOpacity style={styles.learnMore}>
              <BodyMedium style={styles.learnMoreText}>
                Go to Help Center
              </BodyMedium>
              <ChevronRight size={16} color={Colors[colorScheme].primary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: { fontSize: 20, color: Colors.light.primary },
  headerIcons: { flexDirection: "row", gap: 16 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  inputSection: { marginBottom: 32 },
  label: { marginBottom: 8, fontSize: 16, color: "#333" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    gap: 12,
  },
  input: { flex: 1, fontSize: 16, color: "#333" },
  helperText: { marginTop: 8, fontSize: 12, color: "#666" },
  trustSection: { marginTop: 32, gap: 24, paddingBottom: 24 },
  trustItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  trustHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  trustTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  trustText: { fontSize: 14, color: "#666", lineHeight: 20, marginBottom: 12 },
  learnMore: { flexDirection: "row", alignItems: "center", gap: 4 },
  learnMoreText: { fontSize: 14, color: Colors.light.primary },
  createButton: {
    marginTop: 24,
    backgroundColor: Colors.light.primary,
    width: "100%",
  },
  createButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  methodSelection: { flexDirection: "row", marginBottom: 24, gap: 12 },
  methodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    alignItems: "center",
  },
  methodButtonActive: { backgroundColor: Colors.light.primary },
  methodButtonText: { color: Colors.light.primary },
  methodButtonTextActive: { color: "#fff" },
});
