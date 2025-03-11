// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   Alert,
// } from "react-native";
// import {
//   CreditCard,
//   Lock,
//   CircleCheck as CheckCircle,
// } from "lucide-react-native";
// import ProgressBar from "../../components/ProgressBar";
// import Card from "../../components/cards/ProcessCard";
// import { RootState } from "@/store";
// import { useSelector } from "react-redux";
// import { useRouter } from "expo-router";
// import {
//   CardField,
//   useConfirmPayment,
//   CardFieldInput,
// } from "@stripe/stripe-react-native";
// import { BACKEND_URL } from "@/config";
// import { LoginButton } from "@/components/ui/buttons";

// export default function PaymentScreen() {
//   const router = useRouter();
//   const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
//   const [cardDetails, setCardDetails] = useState({
//     number: "",
//     name: "",
//     expiry: "",
//     cvv: "",
//   });
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [stripeCardDetails, setStripeCardDetails] =
//     useState<CardFieldInput.Details | null>(null);
//   const { confirmPayment, loading } = useConfirmPayment();
//   const { user, token } = useSelector((state: RootState) => state.auth);

//   const fetchPaymentIntentClientSecret = async () => {
//     try {
//       // In a real app, you would pass the actual order ID, amount, so ID, and seller ID
//       const response = spfetch(
//         `${BACKEND_URL}api/payment/create-escrow-payment-intent`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             orderId: 1, // Replace with actual order ID
//             amount: 154.0, // Total amount from the order summary
//             soId: user?.id, // Current user ID
//             sspd: 2, // Replace with actual seller/traveler ID
//           }),
//         }
//       );

//       const data = await response.json();

//       if (!data.success) {
//         throw new Error(data.error || "Failed to create payment intent");
//       }

//       return {
//         clientSecret: data.clientSecret,
//         paymentIntentId: data.paymentIntentId,
//       };
//     } catch (error: any) {
//       console.error("Error fetching payment intent:", error);
//       return { error: error.message };
//     }
//   };

//   const handlePayment = async () => {
//     if (paymentMethod === "paypal") {
//       Alert.alert(
//         "PayPal Payment",
//         "PayPal integration is not available in this demo."
//       );
//       return;
//     }

//     if (!stripeCardDetails?.complete) {
//       Alert.alert(
//         "Incomplete Card Details",
//         "Please enter complete card details"
//       );
//       return;
//     }

//     setIsProcessing(true);

//     try {
//       const { clientSecret, error, paymentIntentId } =
//         await fetchPaymentIntentClientSecret();

//       if (error) {
//         Alert.alert("Payment Error", `Unable to process payment: ${error}`);
//         setIsProcessing(false);
//         return;
//       }

//       const { paymentIntent, error: confirmError } = await confirmPayment(
//         clientSecret,
//         {
//           paymentMethodType: "Card",
//         }
//       );

//       if (confirmError) {
//         Alert.alert(
//           "Payment Error",
//           `Payment confirmation error: ${confirmError.message}`
//         );
//       } else if (paymentIntent) {
//         Alert.alert(
//           "Payment Successful",
//           "Your payment has been processed and will be held in escrow until delivery is confirmed.",
//           [
//             {
//               text: "OK",
//               onPress: () => router.push("/processTrack/pickupSO"),
//             },
//           ]
//         );
//       }
//     } catch (e: any) {
//       Alert.alert(
//         "Payment Error",
//         `An unexpected error occurred: ${e.message}`
//       );
//       console.error(e);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // if (!delivery || !traveler) {
//   //   return (
//   //     <View style={styles.loadingContainer}>
//   //       <Text style={styles.loadingText}>Loading...</Text>
//   //     </View>
//   //   );
//   // }

//   const progressSteps = [
//     { id: 1, title: "Initialization", icon: "initialization" },
//     { id: 2, title: "Verification", icon: "verification" },
//     { id: 3, title: "Payment", icon: "payment" },
//     { id: 4, title: "Pickup", icon: "pickup" },
//   ];

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//       <View style={styles.content}>
//         <Text style={styles.title}>Secure Payment</Text>
//         <Text style={styles.subtitle}>
//           Your payment will be held in escrow until delivery is confirmed
//         </Text>

//         <ProgressBar currentStep={3} steps={progressSteps} />

//         <Card style={styles.summaryCard}>
//           <Text style={styles.sectionTitle}>Order Summary</Text>

//           <View style={styles.orderRow}>
//             <Text style={styles.orderLabel}>Item:</Text>
//             <Text style={styles.orderValue}>MacBook Pro Laptop</Text>
//           </View>

//           <View style={styles.orderRow}>
//             <Text style={styles.orderLabel}>Traveler:</Text>
//             <View style={styles.travelerInfo}>
//               <Image
//                 source={{
//                   uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
//                 }}
//                 style={styles.travelerImage}
//               />
//               <Text style={styles.orderValue}>John Doe</Text>
//             </View>
//           </View>

//           <View style={styles.orderRow}>
//             <Text style={styles.orderLabel}>Price:</Text>
//             <Text style={styles.priceValue}>$140.00</Text>
//           </View>

//           <View style={styles.orderRow}>
//             <Text style={styles.orderLabel}>Service Fee:</Text>
//             <Text style={styles.orderValue}>$14.00</Text>
//           </View>

//           <View style={styles.divider} />

//           <View style={styles.orderRow}>
//             <Text style={styles.totalLabel}>Total:</Text>
//             <Text style={styles.totalValue}>$154.00</Text>
//           </View>
//         </Card>

//         <Card style={styles.paymentCard}>
//           <Text style={styles.sectionTitle}>Payment Method</Text>

//           <View style={styles.paymentOptions}>
//             <TouchableOpacity
//               style={[
//                 styles.paymentOption,
//                 paymentMethod === "card" && styles.selectedPaymentOption,
//               ]}
//               onPress={() => setPaymentMethod("card")}
//             >
//               <CreditCard
//                 size={24}
//                 color={paymentMethod === "card" ? "#3b82f6" : "#64748b"}
//               />
//               <Text
//                 style={[
//                   styles.paymentOptionText,
//                   paymentMethod === "card" && styles.selectedPaymentOptionText,
//                 ]}
//               >
//                 Credit Card
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[
//                 styles.paymentOption,
//                 paymentMethod === "paypal" && styles.selectedPaymentOption,
//               ]}
//               onPress={() => setPaymentMethod("paypal")}
//             >
//               <Text
//                 style={[
//                   styles.paypalText,
//                   paymentMethod === "paypal" &&
//                     styles.selectedPaymentOptionText,
//                 ]}
//               >
//                 PayPal
//               </Text>
//             </TouchableOpacity>
//           </View>

//           {paymentMethod === "card" && (
//             <View style={styles.cardForm}>
//               <View style={styles.formGroup}>
//                 <Text style={styles.inputLabel}>Card Number</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="1234 5678 9012 3456"
//                   value={cardDetails.number}
//                   onChangeText={(text) =>
//                     setCardDetails({ ...cardDetails, number: text })
//                   }
//                   keyboardType="numeric"
//                   maxLength={19}
//                 />
//               </View>

//               <View style={styles.formGroup}>
//                 <Text style={styles.inputLabel}>Cardholder Name</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder={user?.name}
//                   value={cardDetails.name}
//                   onChangeText={(text) =>
//                     setCardDetails({ ...cardDetails, name: text })
//                   }
//                 />
//               </View>

//               <View style={styles.formRow}>
//                 <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
//                   <Text style={styles.inputLabel}>Expiry Date</Text>
//                   <TextInput
//                     style={styles.input}
//                     placeholder="MM/YY"
//                     value={cardDetails.expiry}
//                     onChangeText={(text) =>
//                       setCardDetails({ ...cardDetails, expiry: text })
//                     }
//                     keyboardType="numeric"
//                     maxLength={5}
//                   />
//                 </View>

//                 <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
//                   <Text style={styles.inputLabel}>CVV</Text>
//                   <TextInput
//                     style={styles.input}
//                     placeholder="123"
//                     value={cardDetails.cvv}
//                     onChangeText={(text) =>
//                       setCardDetails({ ...cardDetails, cvv: text })
//                     }
//                     keyboardType="numeric"
//                     maxLength={3}
//                     secureTextEntry
//                   />
//                 </View>
//               </View>
//             </View>
//           )}

//           {paymentMethod === "paypal" && (
//             <View style={styles.paypalContainer}>
//               <Text style={styles.paypalInstructions}>
//                 You will be redirected to PayPal to complete your payment
//                 securely.
//               </Text>
//             </View>
//           )}
//         </Card>

//         <View style={styles.securityNote}>
//           <Lock size={16} color="#64748b" />
//           <Text style={styles.securityText}>
//             Your payment information is encrypted and secure
//           </Text>
//         </View>

//         <View style={styles.escrowNote}>
//           <CheckCircle size={16} color="#10b981" />
//           <Text style={styles.escrowText}>
//             Payment will be held in escrow until delivery is confirmed
//           </Text>
//         </View>

//         {paymentMethod === "card" && (
//           <View style={styles.stripeCardContainer}>
//             <Text style={styles.inputLabel}>Card Information</Text>
//             <CardField
//               postalCodeEnabled={true}
//               placeholders={{
//                 number: "4242 4242 4242 4242",
//               }}
//               cardStyle={styles.stripeCard}
//               style={styles.cardFieldContainer}
//               onCardChange={(cardDetails) => {
//                 setStripeCardDetails(cardDetails);
//               }}
//             />
//           </View>
//         )}

//         <LoginButton
//           onPress={handlePayment}
//           disabled={isProcessing || loading}
//           style={styles.payButton}
//         >
//           {isProcessing || loading ? "Processing..." : "Complete Payment"}
//         </LoginButton>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   stripeCardContainer: {
//     marginTop: 16,
//     marginBottom: 16,
//   },
//   stripeCard: {
//     backgroundColor: "#f8fafc",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#e2e8f0",
//   },
//   cardFieldContainer: {
//     height: 50,
//     marginTop: 8,
//   },
//   container: {
//     flex: 1,
//     backgroundColor: "#f8fafc",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     fontFamily: "Inter-Medium",
//     fontSize: 16,
//     color: "#64748b",
//   },
//   content: {
//     padding: 16,
//     paddingBottom: 40,
//   },
//   title: {
//     fontFamily: "Poppins-Bold",
//     fontSize: 24,
//     color: "#1e293b",
//     marginBottom: 4,
//   },
//   subtitle: {
//     fontFamily: "Inter-Regular",
//     fontSize: 14,
//     color: "#64748b",
//     marginBottom: 20,
//   },
//   summaryCard: {
//     marginTop: 16,
//   },
//   sectionTitle: {
//     fontFamily: "Poppins-SemiBold",
//     fontSize: 18,
//     color: "#1e293b",
//     marginBottom: 16,
//   },
//   orderRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   orderLabel: {
//     fontFamily: "Inter-Medium",
//     fontSize: 14,
//     color: "#64748b",
//   },
//   orderValue: {
//     fontFamily: "Inter-Medium",
//     fontSize: 14,
//     color: "#1e293b",
//   },
//   travelerInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   travelerImage: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     marginRight: 8,
//   },
//   priceValue: {
//     fontFamily: "Inter-SemiBold",
//     fontSize: 14,
//     color: "#16a34a",
//   },
//   divider: {
//     height: 1,
//     backgroundColor: "#e2e8f0",
//     marginVertical: 12,
//   },
//   totalLabel: {
//     fontFamily: "Inter-Bold",
//     fontSize: 16,
//     color: "#1e293b",
//   },
//   totalValue: {
//     fontFamily: "Inter-Bold",
//     fontSize: 16,
//     color: "#16a34a",
//   },
//   paymentCard: {
//     marginTop: 16,
//   },
//   paymentOptions: {
//     flexDirection: "row",
//     marginBottom: 16,
//   },
//   paymentOption: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#e2e8f0",
//     marginRight: 12,
//     minWidth: 120,
//   },
//   selectedPaymentOption: {
//     borderColor: "#3b82f6",
//     backgroundColor: "#eff6ff",
//   },
//   paymentOptionText: {
//     fontFamily: "Inter-Medium",
//     fontSize: 14,
//     color: "#64748b",
//     marginLeft: 8,
//   },
//   paypalText: {
//     fontFamily: "Inter-Bold",
//     fontSize: 16,
//     color: "#64748b",
//   },
//   selectedPaymentOptionText: {
//     color: "#3b82f6",
//   },
//   cardForm: {
//     marginTop: 8,
//   },
//   formGroup: {
//     marginBottom: 16,
//   },
//   formRow: {
//     flexDirection: "row",
//   },
//   inputLabel: {
//     fontFamily: "Inter-Medium",
//     fontSize: 14,
//     color: "#64748b",
//     marginBottom: 6,
//   },
//   input: {
//     backgroundColor: "#f8fafc",
//     borderRadius: 8,
//     padding: 12,
//     fontFamily: "Inter-Regular",
//     fontSize: 14,
//     color: "#1e293b",
//     borderWidth: 1,
//     borderColor: "#e2e8f0",
//   },
//   paypalContainer: {
//     padding: 16,
//     backgroundColor: "#f8fafc",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#e2e8f0",
//   },
//   paypalInstructions: {
//     fontFamily: "Inter-Regular",
//     fontSize: 14,
//     color: "#64748b",
//     textAlign: "center",
//   },
//   securityNote: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   securityText: {
//     fontFamily: "Inter-Regular",
//     fontSize: 14,
//     color: "#64748b",
//     marginLeft: 8,
//   },
//   escrowNote: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 24,
//   },
//   escrowText: {
//     fontFamily: "Inter-Regular",
//     fontSize: 14,
//     color: "#64748b",
//     marginLeft: 8,
//   },
//   payButton: {
//     marginTop: 8,
//   },
// });

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import {
  CreditCard,
  Lock,
  CircleCheck as CheckCircle,
} from "lucide-react-native";
import ProgressBar from "../../components/ProgressBar";
import Card from "../../components/cards/ProcessCard";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { CardField, useConfirmPayment } from "@stripe/stripe-react-native";
import { BaseButton } from "@/components/ui/buttons/BaseButton";

// Replace with your backend URL
const API_URL = "http://192.168.1.165:3000";

export default function PaymentScreen() {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
    complete: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { confirmPayment, loading } = useConfirmPayment();

  // Mock order data (WILL BE REPLACED FROM TABLE ORDER (i guess))
  const orderData = {
    orderId: 1,
    amount: 15400, // Amount in cents ($154.00)
    soId: user?.id || 2,
    spId: 1,
  };

  // Handle payment submission
  const handlePayment = async () => {
    // if (!cardDetails.complete) {
    //   Alert.alert("Error", "Please enter complete card details");
    //   return;
    // }

    setIsProcessing(true);

    try {
      // Step 1: Create a payment intent
      const response = await fetch(
        `${API_URL}/api/payment/create-escrow-payment-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const { clientSecret, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Step 2: Confirm the payment
      const { paymentIntent, error: confirmError } = await confirmPayment(
        clientSecret,
        {
          paymentMethodType: "Card",
          paymentMethodData: {
            billingDetails: {
              email: user?.email || "user@example.com",
              name: user?.name || "John Doe",
            },
          },
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent) {
        Alert.alert("Success", "Payment successful! Funds are held in escrow.");
        console.log("Payment successful:", paymentIntent);
      }
    } catch (error: Error | any) {
      console.error("Payment error:", error);
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  };

  const progressSteps = [
    { id: 1, title: "Initialization", icon: "initialization" },
    { id: 2, title: "Verification", icon: "verification" },
    { id: 3, title: "Payment", icon: "payment" },
    { id: 4, title: "Pickup", icon: "pickup" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Secure Payment</Text>
        <Text style={styles.subtitle}>
          Your payment will be held in escrow until delivery is confirmed
        </Text>

        <ProgressBar currentStep={3} steps={progressSteps} />

        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Item:</Text>
            <Text style={styles.orderValue}>MacBook Pro Laptop</Text>
          </View>

          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Traveler:</Text>
            <View style={styles.travelerInfo}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
                }}
                style={styles.travelerImage}
              />
              <Text style={styles.orderValue}>John Doe</Text>
            </View>
          </View>

          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Price:</Text>
            <Text style={styles.priceValue}>$140.00</Text>
          </View>

          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Service Fee:</Text>
            <Text style={styles.orderValue}>$14.00</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.orderRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>$154.00</Text>
          </View>
        </Card>

        <Card style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === "card" && styles.selectedPaymentOption,
              ]}
              onPress={() => setPaymentMethod("card")}
            >
              <CreditCard
                size={24}
                color={paymentMethod === "card" ? "#3b82f6" : "#64748b"}
              />
              <Text
                style={[
                  styles.paymentOptionText,
                  paymentMethod === "card" && styles.selectedPaymentOptionText,
                ]}
              >
                Credit Card
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === "paypal" && styles.selectedPaymentOption,
              ]}
              onPress={() => setPaymentMethod("paypal")}
            >
              <Text
                style={[
                  styles.paypalText,
                  paymentMethod === "paypal" &&
                    styles.selectedPaymentOptionText,
                ]}
              >
                PayPal
              </Text>
            </TouchableOpacity>
          </View>

          {paymentMethod === "card" && (
            <View style={styles.cardForm}>
              <CardField
                postalCodeEnabled={false}
                placeholders={{
                  number: "4242 4242 4242 4242",
                }}
                cardStyle={styles.card}
                style={styles.cardContainer}
                onCardChange={(cardDetails) => {
                  setCardDetails((prevState) => ({
                    ...prevState,
                    number: cardDetails.number || "",
                    complete: cardDetails.complete,
                  }));
                }}
              />
            </View>
          )}

          {paymentMethod === "paypal" && (
            <View style={styles.paypalContainer}>
              <Text style={styles.paypalInstructions}>
                You will be redirected to PayPal to complete your payment
                securely.
              </Text>
            </View>
          )}
        </Card>

        <View style={styles.securityNote}>
          <Lock size={16} color="#64748b" />
          <Text style={styles.securityText}>
            Your payment information is encrypted and secure
          </Text>
        </View>

        <View style={styles.escrowNote}>
          <CheckCircle size={16} color="#10b981" />
          <Text style={styles.escrowText}>
            Payment will be held in escrow until delivery is confirmed
          </Text>
        </View>

        {/* <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.disabledButton]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          <Text style={styles.payButtonText}>
            {isProcessing ? "Processing..." : "Complete Payment"}
          </Text>
        </TouchableOpacity> */}
        <BaseButton
          style={styles.payButton}
          onPress={handlePayment}
          size="large"
          variant="primary"
          disabled={isProcessing}
        >
          <Text style={styles.payButtonText}>
            {isProcessing ? "Processing..." : "Complete Payment"}
          </Text>
        </BaseButton>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
  },
  summaryCard: {
    marginTop: 16,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#1e293b",
    marginBottom: 16,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#64748b",
  },
  orderValue: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#1e293b",
  },
  travelerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  travelerImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  priceValue: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    color: "#16a34a",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 12,
  },
  totalLabel: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "#1e293b",
  },
  totalValue: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "#16a34a",
  },
  paymentCard: {
    marginTop: 16,
  },
  paymentOptions: {
    flexDirection: "row",
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 12,
    minWidth: 120,
  },
  selectedPaymentOption: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  paymentOptionText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
  },
  paypalText: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "#64748b",
  },
  selectedPaymentOptionText: {
    color: "#3b82f6",
  },
  cardForm: {
    marginTop: 8,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
  },
  cardContainer: {
    height: 50,
    marginVertical: 10,
  },
  paypalContainer: {
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  paypalInstructions: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  securityText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
  },
  escrowNote: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  escrowText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
  },
  payButton: {
    padding: 12,
    alignSelf: "center",
  },
  payButtonText: {
    color: "#ffffff",
    fontFamily: "Inter-Bold",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
});
