// import React, { useState } from 'react';
// import { View, StyleSheet, Switch, Alert } from 'react-native';
// import { Card } from '@/components/Card';
// import { InputField } from '@/components/InputField';
// import { SmallButton, LoginButton } from '@/components/ui/buttons';
// import { TitleSection, BodyMedium } from '@/components/Typography';
// import { useColorScheme } from '@/hooks/useColorScheme';
// import { useRouter } from 'expo-router';
// import { CreateRequestPayload, RequestStatus } from '@/types/request.types';

// type FormStep = 'initial' | 'product' | 'delivery' | 'summary';

// interface FormData extends CreateRequestPayload {
//   productUrl: string;
//   productName: string;
//   price: string;
//   details: string;
// }

// export function RequestForm() {
//   const router = useRouter();
//   const [currentStep, setCurrentStep] = useState<FormStep>('initial');
//   const [formData, setFormData] = useState<FormData>({
//     productUrl: '',
//     productName: '',
//     price: '',
//     quantity: 1,
//     details: '',
//     withBox: false,
//     goodsLocation: '',
//     goodsDestination: '',
//     date: new Date().toISOString(),
//     goodsId: 1, // Default value, should come from product selection
//   });

//   // Calculate fees
//   const price = parseFloat(formData.price) || 0;
//   const taxes = price * 0.02;
//   const travelerReward = price * 0.10;
//   const appFees = price * 0.05;
//   const paymentFees = price * 0.01;
//   const totalPrice = price + taxes + travelerReward + appFees + paymentFees;

//   const handleSubmit = async () => {
//     try {
//       const response = await fetch('http://localhost:4000/api/requests', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           goodsId: formData.goodsId,
//           userId: 1, // This should come from auth context
//           quantity: formData.quantity,
//           goodsLocation: formData.goodsLocation,
//           goodsDestination: formData.goodsDestination,
//           date: formData.date,
//           withBox: formData.withBox,
//         }),
//       });

//       const data = await response.json();
//       if (data.success) {
//         Alert.alert('Success', 'Request sent successfully!');
//         router.back(); // Go back to previous screen
//       } else {
//         Alert.alert('Error', data.error || 'Failed to create request');
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to send request');
//     }
//   };

//   const renderInitial = () => (
//     <View style={styles.container}>
//       <LoginButton onPress={() => setCurrentStep('product')}>
//         Make Request
//       </LoginButton>
//     </View>
//   );

//   const renderProductDetails = () => (
//     <View style={styles.container}>
//       <TitleSection>Product Details</TitleSection>
//       <InputField
//         label="Product URL"
//         value={formData.productUrl}
//         // onChangeText={(text) => setFormData(prev => ({ ...prev, productUrl: text }))}
//         placeholder="Enter product URL"
//       />
//       <InputField
//         label="Product Name"
//         value={formData.productName}
//         onChangeText={(text) => setFormData(prev => ({ ...prev, productName: text }))}
//         placeholder="Enter product name"
//       />
//       <InputField
//         label="Price"
//         value={formData.price}
//         onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
//         placeholder="Enter price"
//         keyboardType="numeric"
//       />
//       <InputField
//         label="Quantity"
//         value={formData.quantity.toString()}
//         onChangeText={(text) => setFormData(prev => ({ ...prev, quantity: parseInt(text) }))}
//         placeholder="Enter quantity"
//         keyboardType="numeric"
//       />
//       <InputField
//         label="Product Details"
//         value={formData.details}
//         onChangeText={(text) => setFormData(prev => ({ ...prev, details: text }))}
//         placeholder="Enter product details"
//         multiline
//       />
//       <View style={styles.toggleContainer}>
//         <BodyMedium>With Box</BodyMedium>
//         <Switch
//           value={formData.withBox}
//           onValueChange={(value) => setFormData(prev => ({ ...prev, withBox: value }))}
//         />
//       </View>
//       <View style={styles.buttonContainer}>
//         <SmallButton onPress={() => setCurrentStep('delivery')}>
//           Next
//         </SmallButton>
//       </View>
//     </View>
//   );

//   const renderDeliveryDetails = () => (
//     <View style={styles.container}>
//       <TitleSection>Confirm Delivery City and Date</TitleSection>
//       <InputField
//         label="From"
//         value={formData.goodsLocation}
//         onChangeText={(text) => setFormData(prev => ({ ...prev, goodsLocation: text }))}
//         placeholder="Select city"
//       />
//       <InputField
//         label="To"
//         value={formData.goodsDestination}
//         onChangeText={(text) => setFormData(prev => ({ ...prev, goodsDestination: text }))}
//         placeholder="Select city"
//       />
//       <InputField
//         label="Delivery Before"
//         value={formData.date}
//         onChangeText={(text) => setFormData(prev => ({ ...prev, date: text }))}
//         placeholder="Select date"
//       />
//       <View style={styles.buttonContainer}>
//         <SmallButton onPress={() => setCurrentStep('summary')}>
//           Next
//         </SmallButton>
//       </View>
//     </View>
//   );

//   const renderSummary = () => (
//     <View style={styles.container}>
//       <TitleSection>Request Summary</TitleSection>
//       <View style={styles.summaryItem}>
//         <BodyMedium>Product Name: {formData.productName}</BodyMedium>
//         <BodyMedium>From: {formData.goodsLocation}</BodyMedium>
//         <BodyMedium>To: {formData.goodsDestination}</BodyMedium>
//         <BodyMedium>Delivery Before: {formData.date}</BodyMedium>
//         <BodyMedium>Quantity: {formData.quantity}</BodyMedium>
//         <BodyMedium>Packaging: {formData.withBox ? 'With Box' : 'No Box'}</BodyMedium>
//         <BodyMedium>Price: ${price.toFixed(2)}</BodyMedium>
//         <BodyMedium>Taxes (2%): ${taxes.toFixed(2)}</BodyMedium>
//         <BodyMedium>Traveler Reward (10%): ${travelerReward.toFixed(2)}</BodyMedium>
//         <BodyMedium>App Fees (5%): ${appFees.toFixed(2)}</BodyMedium>
//         <BodyMedium>Payment Fees (1%): ${paymentFees.toFixed(2)}</BodyMedium>
//         <TitleSection>Total: ${totalPrice.toFixed(2)}</TitleSection>
//       </View>
//       <LoginButton onPress={handleSubmit}>
//         Submit Request
//       </LoginButton>
//     </View>
//   );

//   const renderContent = () => {
//     switch (currentStep) {
//       case 'initial':
//         return renderInitial();
//       case 'product':
//         return renderProductDetails();
//       case 'delivery':
//         return renderDeliveryDetails();
//       case 'summary':
//         return renderSummary();
//       default:
//         return renderInitial();
//     }
//   };

//   return (
//     <Card style={styles.card}>
//       {renderContent()}
//     </Card>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     flex: 1,
//     margin: 16,
//   },
//   container: {
//     gap: 16,
//     padding: 16,
//   },
//   toggleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   buttonContainer: {
//     alignItems: 'flex-end',
//   },
//   summaryItem: {
//     gap: 8,
//   },
// }); 