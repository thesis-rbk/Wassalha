import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera"; // No need for BarCodeScanner import unless using constants
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { XCircle } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../../config";
import { QRCodeScannerProps } from "../../types/QRCodeScannerProps"; // Adjust the import path as necessary
import { useRouter } from "expo-router";
import { StatusScreen } from "@/app/screens/StatusScreen";

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  visible,
  onClose,
  pickups,
  setPickups,
  paramsData,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();

  // Add state for StatusScreen
  const [statusVisible, setStatusVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState({
    type: "error" as "success" | "error",
    title: "",
    message: "",
  });

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
    if (scanned) return;
    setScanned(true);

    try {
      const scannedData = JSON.parse(data);
      const pickup = pickups.find((p) => p.id === scannedData.pickupNumber);

      if (!pickup || pickup.orderId !== scannedData.orderNumber) {
        setStatusMessage({
          type: "error",
          title: "Error",
          message: "Invalid QR code for this pickup.",
        });
        setStatusVisible(true);
        onClose();
        return;
      }

      if (pickup.status === "COMPLETED") {
        setStatusMessage({
          type: "error",
          title: "Info",
          message: "This pickup is already completed.",
        });
        setStatusVisible(true);
        onClose();
        return;
      }

      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      // Show success message with review navigation
      setStatusMessage({
        type: "success",
        title: "✅ Success",
        message: "Pickup completed successfully! Please leave a review.",
      });
      setStatusVisible(true);

      // Handle the success flow
      const handleSuccess = async () => {
        try {
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

          onClose();
          // Navigate to Review screen
          router.push({
            pathname: "/screens/Review",
            params: {
              idOrder: paramsData.idOrder,
              goodsName: paramsData.goodsName,
              travelerId: paramsData.travelerId,
              requesterId: paramsData.requesterId,
              requesterName: paramsData.requesterName,
              travelerName: paramsData.travelerName,
            },
          });
        } catch (error) {
          setStatusMessage({
            type: "error",
            title: "Error",
            message: "Failed to update pickup status.",
          });
          setStatusVisible(true);
        }
      };
    } catch (error) {
      console.error("Error processing QR scan:", error);
      setStatusMessage({
        type: "error",
        title: "Error",
        message: "Failed to complete pickup. Please try again.",
      });
      setStatusVisible(true);
      onClose();
    } finally {
      setTimeout(() => setScanned(false), 1000);
    }
  };

  if (!visible) return null;

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          {hasPermission === null ? (
            <Text style={styles.scannerText}>
              Requesting camera permission...
            </Text>
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

      <StatusScreen
        visible={statusVisible}
        type={statusMessage.type}
        title={statusMessage.title}
        message={statusMessage.message}
        primaryAction={{
          label: statusMessage.type === "success" ? "Continue" : "OK",
          onPress: () => {
            setStatusVisible(false);
            if (statusMessage.type === "success") {
              onClose();
              router.push({
                pathname: "/screens/Review",
                params: {
                  idOrder: paramsData.idOrder,
                  goodsName: paramsData.goodsName,
                  travelerId: paramsData.travelerId,
                  requesterId: paramsData.requesterId,
                  requesterName: paramsData.requesterName,
                  travelerName: paramsData.travelerName,
                },
              });
            } else {
              onClose();
            }
          },
        }}
        onClose={() => {
          setStatusVisible(false);
          if (statusMessage.type === "success") {
            onClose();
            router.push({
              pathname: "/screens/Review",
              params: {
                idOrder: paramsData.idOrder,
                goodsName: paramsData.goodsName,
                travelerId: paramsData.travelerId,
                requesterId: paramsData.requesterId,
                requesterName: paramsData.requesterName,
                travelerName: paramsData.travelerName,
              },
            });
          } else {
            onClose();
          }
        }}
      />
    </>
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