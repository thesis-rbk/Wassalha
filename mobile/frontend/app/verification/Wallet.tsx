"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Animated,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "@/config";
import type { BonusProps, CardInfo } from "../../types/Sponsorship";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "@/components/navigation/headers";
const { width, height } = Dimensions.get("window");
const cardWidth = width * 0.85;
const cardHeight = cardWidth * 0.6;
import { useStatus } from "@/context/StatusContext";
const BonusTransferComponent: React.FC<BonusProps> = ({
  name,
  currency = "TD",
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [cardInfo, setCardInfo] = useState<CardInfo>({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cardFlip] = useState(new Animated.Value(0));
  const [bonusAmount, setBonusAmount] = useState<number>(0);
  const [token, setToken] = useState<string | null>(null);
  const [names, setName] = useState("");
  const { show, hide } = useStatus();
  // Function to fetch token from AsyncStorage
  const tokenVerif = async () => {
    try {
      const tokeny = await AsyncStorage.getItem("jwtToken");
      console.log("token:", tokeny);
      setToken(tokeny);
      return tokeny; // Return token for use in fetchBonusAmount
    } catch (error) {
      console.error("Error retrieving token:", error);
      Alert.alert("Error", "Failed to retrieve authentication token");
      return null;
    }
  };

  // Function to fetch bonus from backend
  const fetchBonusAmount = async (authToken: string | null) => {
    if (!authToken) {
      Alert.alert("Error", "No authentication token available");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/api/Bonus", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      console.log("Fetched bonus amount:", response.data.balance); // Debugging line
      if (response.data) {
        setName(response.data.firstName);
        setBonusAmount(response.data.balance || 0); // Adjust based on your API response structure
      } else {
        Alert.alert("Error", "Failed to fetch bonus amount");
      }
    } catch (error) {
      console.error("Error fetching bonus:", error);
      Alert.alert(
        "Error",
        "An error occurred while fetching your bonus balance"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch token and bonus on mount
  useEffect(() => {
    const initialize = async () => {
      // Step 1: Fetch token
      const authToken = await tokenVerif();

      // Step 2: Fetch bonus only if token is available
      if (authToken) {
        await fetchBonusAmount(authToken);
      }

      // Step 3: Animate card flip
      Animated.timing(cardFlip, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(cardFlip, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 1500);
    };

    initialize();
  }, []); // Empty dependency array since this runs only on mount

  const flipCard = () => {
    Animated.timing(cardFlip, {
      toValue: cardFlip._value === 0 ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const frontInterpolate = cardFlip.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = cardFlip.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const handleTransfer = () => {
    setModalVisible(true);
    setStep(1);
    setIsSuccess(false);
  };

  const validateAmount = () => {
    const amount = Number(transferAmount);
    if (!transferAmount || isNaN(amount)) {
      show({
        type: "error",
        title: "Invalid Amount",
        message: "Please enter a valid amount",
        primaryAction: {
          label: "OK",
          onPress: () => hide(),
        },
      });
      return false;
    }
    if (amount <= 0) {
      show({
        type: "error",
        title: "Invalid Amount",
        message: "Amount must be greater than zero",
        primaryAction: {
          label: "OK",
          onPress: () => hide(),
        },
      });
      return false;
    }
    if (amount > bonusAmount) {
      show({
        type: "error",
        title: "Insufficient Funds",
        message: `Amount cannot exceed your bonus balance of ${currency} ${bonusAmount}`,
        primaryAction: {
          label: "OK",
          onPress: () => hide(),
        },
      });
      return false;
    }
    return true;
  };

  const validateCardInfo = () => {
    const { cardNumber, cardHolder, expiryDate, cvv } = cardInfo;

    if (!cardNumber || cardNumber.replace(/\s/g, "").length !== 16) {
      show({
        type: "error",
        title: "Invalid Card",
        message: "Please enter a valid 16-digit card number",
        primaryAction: {
          label: "OK",
          onPress: () => hide(),
        },
      });
      return false;
    }

    if (!cardHolder) {
      show({
        type: "error",
        title: "Invalid Name",
        message: "Please enter the card holder name",
        primaryAction: {
          label: "OK",
          onPress: () => hide(),
        },
      });
      return false;
    }

    if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      show({
        type: "error",
        title: "Invalid Date",
        message: "Please enter a valid expiry date (MM/YY)",
        primaryAction: {
          label: "OK",
          onPress: () => hide(),
        },
      });
      return false;
    }

    if (!cvv || cvv.length !== 3) {
      show({
        type: "error",
        title: "Invalid CVV",
        message: "Please enter a valid 3-digit CVV",
        primaryAction: {
          label: "OK",
          onPress: () => hide(),
        },
      });
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateAmount()) {
      setStep(2);
    } else if (step === 2 && validateCardInfo()) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => {
          setModalVisible(false);
          setTransferAmount("");
          setCardInfo({
            cardNumber: "",
            cardHolder: "",
            expiryDate: "",
            cvv: "",
          });
          setStep(1);
          setIsSuccess(false);
        }, 3000);
      }, 1500);
    }
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(.{4})/g, "$1 ")
      .trim()
      .slice(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    value = value.replace(/\D/g, "");
    if (value.length > 2) {
      return `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    return value;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      <Header
        title="Bonus Transfer"
        subtitle="Transfer your bonus to your card"
        showBackButton={true}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          <View style={styles.cardContainer}>
            <TouchableOpacity activeOpacity={0.9} onPress={flipCard}>
              <Animated.View style={[styles.cardFace, frontAnimatedStyle]}>
                <LinearGradient
                  colors={["#007BFF", "#0056B3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.creditCard}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <View style={styles.chip} />
                      <Text style={styles.cardType}>PREMIUM BONUS</Text>
                    </View>

                    <View style={styles.balanceContainer}>
                      <Text style={styles.balanceLabel}>Bonus Balance</Text>
                      <Text style={styles.balanceAmount}>
                        {isLoading
                          ? "Loading..."
                          : `${currency} ${bonusAmount.toFixed(2)}`}
                      </Text>
                    </View>
                    <View style={styles.cardFooter}>
                      <View>
                        <Text style={styles.cardLabel}>CARD HOLDER</Text>
                        <Text style={styles.cardValue}>{names}</Text>
                      </View>
                      <View>
                        <Text style={styles.cardLabel}>EXPIRES</Text>
                        <Text style={styles.cardValue}>**/**</Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </Animated.View>

              <Animated.View
                style={[styles.cardFace, styles.cardBack, backAnimatedStyle]}
              >
                <LinearGradient
                  colors={["#007BFF", "#0056B3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.creditCard}
                >
                  <View style={styles.magneticStrip} />
                  <View style={styles.signatureContainer}>
                    <View style={styles.signature}>
                      <Text style={styles.cvvText}>***</Text>
                    </View>
                  </View>
                  <Text style={styles.backInfo}>
                    This card can be used to transfer your bonus balance to your
                    bank account. Tap card to flip.
                  </Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
            <Text style={styles.tapHint}>Tap card to view details</Text>
          </View>

          <View style={styles.transferSection}>
            <Text style={styles.transferQuestion}>
              Do you want to transfer Bonus?
            </Text>
            <TouchableOpacity
              style={styles.transferButton}
              onPress={handleTransfer}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#007BFF", "#0056B3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Transfer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setStep(1);
          setTransferAmount("");
          setCardInfo({
            cardNumber: "",
            cardHolder: "",
            expiryDate: "",
            cvv: "",
          });
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {!isSuccess ? (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {step === 1 ? "Transfer Amount" : "Card Details"}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {step === 1
                      ? `Enter the amount to transfer (Max: ${currency} ${bonusAmount.toFixed(
                          2
                        )})`
                      : "Enter your card information to complete the transfer"}
                  </Text>
                </View>

                <ScrollView contentContainerStyle={styles.modalScroll}>
                  {step === 1 ? (
                    <View style={styles.formGroup}>
                      <Text style={styles.inputLabel}>Amount</Text>
                      <View style={styles.amountInputContainer}>
                        <Text style={styles.currencySymbol}>{currency}</Text>
                        <TextInput
                          style={styles.amountInput}
                          keyboardType="numeric"
                          placeholder="0.00"
                          placeholderTextColor="#A0AEC0"
                          value={transferAmount}
                          onChangeText={setTransferAmount}
                        />
                      </View>
                      <Text style={styles.balanceHint}>
                        Available balance: {currency} {bonusAmount.toFixed(2)}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.cardFormContainer}>
                      <LinearGradient
                        colors={["#007BFF", "#0056B3"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardForm}
                      >
                        <View style={styles.formGroup}>
                          <View style={styles.inputLabelContainer}>
                            <Ionicons
                              name="card-outline"
                              size={18}
                              color="#CCE5FF"
                            />
                            <Text style={styles.cardInputLabel}>
                              Card Number
                            </Text>
                          </View>
                          <TextInput
                            style={styles.cardInput}
                            placeholder="1234 5678 9012 3456"
                            placeholderTextColor="#CCE5FF"
                            value={cardInfo.cardNumber}
                            onChangeText={(text) =>
                              setCardInfo({
                                ...cardInfo,
                                cardNumber: formatCardNumber(text),
                              })
                            }
                            keyboardType="numeric"
                          />
                        </View>

                        <View style={styles.formGroup}>
                          <Text style={styles.cardInputLabel}>Card Holder</Text>
                          <TextInput
                            style={styles.cardInput}
                            placeholderTextColor="#CCE5FF"
                            value={cardInfo.cardHolder}
                            onChangeText={(text) =>
                              setCardInfo({ ...cardInfo, cardHolder: text })
                            }
                          />
                        </View>

                        <View style={styles.cardDetailsRow}>
                          <View style={[styles.formGroup, styles.halfWidth]}>
                            <View style={styles.inputLabelContainer}>
                              <Ionicons
                                name="calendar-outline"
                                size={18}
                                color="#CCE5FF"
                              />
                              <Text style={styles.cardInputLabel}>
                                Expiry Date
                              </Text>
                            </View>
                            <TextInput
                              style={styles.cardInput}
                              placeholder="MM/YY"
                              placeholderTextColor="#CCE5FF"
                              value={cardInfo.expiryDate}
                              onChangeText={(text) =>
                                setCardInfo({
                                  ...cardInfo,
                                  expiryDate: formatExpiryDate(text),
                                })
                              }
                              keyboardType="numeric"
                              maxLength={5}
                            />
                          </View>

                          <View style={[styles.formGroup, styles.halfWidth]}>
                            <View style={styles.inputLabelContainer}>
                              <Ionicons
                                name="lock-closed-outline"
                                size={18}
                                color="#CCE5FF"
                              />
                              <Text style={styles.cardInputLabel}>CVV</Text>
                            </View>
                            <TextInput
                              style={styles.cardInput}
                              placeholder="123"
                              placeholderTextColor="#CCE5FF"
                              value={cardInfo.cvv}
                              onChangeText={(text) =>
                                setCardInfo({
                                  ...cardInfo,
                                  cvv: text.replace(/\D/g, "").slice(0, 3),
                                })
                              }
                              keyboardType="numeric"
                              maxLength={3}
                              secureTextEntry
                            />
                          </View>
                        </View>
                      </LinearGradient>
                    </View>
                  )}
                </ScrollView>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      if (step === 1) {
                        setModalVisible(false);
                        setTransferAmount("");
                      } else {
                        setStep(1);
                      }
                    }}
                  >
                    <Text style={styles.cancelButtonText}>
                      {step === 1 ? "Cancel" : "Back"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleNextStep}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={["#007BFF", "#0056B3"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.actionButtonGradient}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                      ) : (
                        <Text style={styles.actionButtonText}>
                          {step === 1 ? "Next" : "Confirm Transfer"}
                        </Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={80} color="#10B981" />
                </View>
                <Text style={styles.successTitle}>Transfer Successful!</Text>
                <Text style={styles.successMessage}>
                  {currency} {transferAmount} has been transferred to your card
                  ending in {cardInfo.cardNumber.slice(-4)}
                </Text>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30, // Add padding at the bottom for better scrolling
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F3F4F6",
  },
  cardContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  cardFace: {
    width: cardWidth,
    height: cardHeight,
    backfaceVisibility: "hidden",
  },
  cardBack: {
    position: "absolute",
    top: 0,
  },
  creditCard: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chip: {
    width: 40,
    height: 30,
    backgroundColor: "#FFD700",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5C100",
  },
  cardType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
    letterSpacing: 1,
  },
  balanceContainer: {
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  balanceLabel: {
    fontSize: 16,
    color: "#CCE5FF",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFF",
    textAlign: "center",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardLabel: {
    fontSize: 10,
    color: "#CCE5FF",
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 14,
    color: "#FFF",
  },
  magneticStrip: {
    height: 40,
    backgroundColor: "#111",
    marginTop: 20,
    marginBottom: 20,
  },
  signatureContainer: {
    backgroundColor: "#FFF",
    height: 40,
    marginVertical: 20,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  signature: {
    alignItems: "flex-end",
  },
  cvvText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  backInfo: {
    color: "#CCE5FF",
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
  },
  tapHint: {
    marginTop: 8,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  transferSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40, // Add more bottom margin to ensure button is visible
  },
  transferQuestion: {
    fontSize: 16,
    color: "#007BFF",
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "500",
  },
  transferButton: {
    width: cardWidth,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    width: "100%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    overflow: "hidden",
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007BFF",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  modalScroll: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
  },
  currencySymbol: {
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  balanceHint: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  cardFormContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  cardForm: {
    padding: 16,
    borderRadius: 12,
  },
  inputLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardInputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#CCE5FF",
    marginLeft: 4,
  },
  cardInput: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#FFF",
  },
  cardDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
  },
  actionButton: {
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  actionButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  successContainer: {
    padding: 30,
    alignItems: "center",
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
});

export default BonusTransferComponent;
