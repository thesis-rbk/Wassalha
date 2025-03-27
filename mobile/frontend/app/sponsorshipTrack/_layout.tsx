import React from 'react';
import { Stack } from 'expo-router';
import { SponsorshipProcessProvider } from '@/context/SponsorshipProcessContext';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '@/config';


export default function SponsorshipTrackLayout() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <SponsorshipProcessProvider>
        <Stack>
          <Stack.Screen
            name="initializationBuyer"
            options={{ title: 'Sponsorship Details' , headerShown: false }}
          />
          <Stack.Screen
            name="initializationSponsor"
            options={{ title: 'Sponsorship Request' , headerShown: false}}
          />
          <Stack.Screen
            name="verificationBuyer"
            options={{ title: 'Verification', headerShown: false }}
          />
          <Stack.Screen
            name="verificationSponsor"
            options={{ title: 'Verification', headerShown: false }}
          />
          <Stack.Screen
            name="paymentBuyer"
            options={{ title: 'Payment' , headerShown: false}}
          />
          <Stack.Screen
            name="paymentSponsor"
            options={{ title: 'Payment' , headerShown: false}}
          />
          <Stack.Screen
            name="deliveryBuyer"
            options={{ title: 'Delivery', headerShown: false }}
          />
          <Stack.Screen
            name="deliverySponsor"
            options={{ title: 'Delivery' , headerShown: false}}
          />
        </Stack>
      </SponsorshipProcessProvider>
    </StripeProvider>
  );
} 