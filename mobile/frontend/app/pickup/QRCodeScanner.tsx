import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera"; // No need for BarCodeScanner import unless using constants
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { XCircle } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../../config";
import { QRCodeScannerProps } from "../../types/QRCodeScannerProps"; // Adjust the import path as necessary

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  visible,
  onClose,
  pickups,
  setPickups,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    const checkAndRequestPermission = async () => {
      if (!permission) return; // Wait for hook to initialize
      if (permission.granted) {
        setHasPermission(true);
      } else if (permission.canAskAgain) {
        const result = await requestPermission();
        setHasPermission(result.granted);
      } else {
        setHasPermission(false);
      }
    };

    checkAndRequestPermission();
  }, [permission, requestPermission]);

  const handleScan = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return; // Prevent multiple scans while processing
    setScanned(true);

    try {
      const scannedData = JSON.parse(data);
      const pickup = pickups.find((p) => p.id === scannedData.pickupNumber);
      if (!pickup || pickup.orderId !== scannedData.orderNumber) {
        Alert.alert("Error", "Invalid QR code for this pickup.");
        onClose();
        return;
      }

      if (pickup.status === "COMPLETED") {
        Alert.alert("Info", "This pickup is already completed.");
        onClose();
        return;
      }

      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      await axiosInstance.put(
        "/api/pickup/status",
        { pickupId: pickup.id, newStatus: "COMPLETED" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPickups((prev) =>
        prev.map((p) =>
          p.id === pickup.id ? { ...p, status: "COMPLETED" } : p
        )
      );

      Alert.alert("Success", "Pickup completed successfully!");
      onClose();
    } catch (error) {
      console.error("Error processing QR scan:", error);
      Alert.alert("Error", "Failed to complete pickup. Please try again.");
      onClose();
    } finally {
      setTimeout(() => setScanned(false), 1000); // Reset after 1s
    }
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {hasPermission === null ? (
          <Text style={styles.scannerText}>Requesting camera permission...</Text>
        ) : hasPermission === false ? (
          <View style={styles.permissionDeniedContainer}>
            <Text style={styles.scannerText}>Camera access denied</Text>
            <BaseButton
              variant="primary"
              size="small"
              style={styles.retryButton}
              onPress={requestPermission}
            >
              <Text style={styles.buttonText}>Request Permission</Text>
            </BaseButton>
          </View>
        ) : (
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={handleScan} // Updated prop name (case-sensitive)
            barcodeScannerSettings={{
              barcodeTypes: ["qr"], // Simplified, "qr" works in newer versions
            }}
          />
        )}
        <BaseButton
          variant="primary"
          size="small"
          style={styles.cancelScannerButton}
          onPress={onClose}
        >
          <XCircle size={14} color="#fff" />
          <Text style={styles.buttonText}>Cancel</Text>
        </BaseButton>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  camera: {
    width: "80%",
    height: "60%",
    borderRadius: 10,
  },
  scannerText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "white",
    textAlign: "center",
  },
  permissionDeniedContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    minWidth: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 20,
  },
  cancelScannerButton: {
    backgroundColor: "#FF4444",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    minWidth: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 20,
  },
  buttonText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#fff",
  },
});