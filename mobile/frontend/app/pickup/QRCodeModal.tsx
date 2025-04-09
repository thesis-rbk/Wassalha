import React from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { BaseButton } from "@/components/ui/buttons/BaseButton";
import { QRCodeModalProps } from "@/types/QRCodeModalProps";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { QRCodeScanner } from "./QRCodeScanner";

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ visible, qrCodeData, onClose, paramsData }) => {
  const { user } = useAuth();
  const router = useRouter();

  const handleClose = () => {
    router.push({
      pathname: "/screens/Review",
      params: {
        idOrder: paramsData.idOrder,
        goodsName: paramsData.goodsName,
        travelerId: paramsData.travelerId,
        travelerName: paramsData.travelerName,
        requesterId: paramsData.requesterId,
        requesterName: paramsData.requesterName,
      },
    });
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Your Pickup QR Code</Text>
          <View style={styles.qrCodeContainer}>
            <QRCode value={qrCodeData} size={200} color="#1e293b" backgroundColor="white" />
          </View>
          <Text style={styles.qrInstructions}>
            Show this QR code to identify yourself when picking up your package.
          </Text>
          <BaseButton variant="primary" size="small" style={styles.cancelModalButton} onPress={handleClose}>
            Close
          </BaseButton>
        </View>
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
  modalContent: {
    width: "80%",
    maxHeight: "60%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#1e293b",
    marginBottom: 15,
    textAlign: "center",
  },
  qrCodeContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  qrInstructions: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
  },
  cancelModalButton: {
    backgroundColor: "#FF4444",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 100,
    marginTop: 10,
  },
});