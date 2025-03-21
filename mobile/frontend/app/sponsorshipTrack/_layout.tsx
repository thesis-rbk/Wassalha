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
            options={{ title: 'Sponsorship Details' }}
          />
          <Stack.Screen
            name="initializationSponsor"
            options={{ title: 'Sponsorship Request' }}
          />
          <Stack.Screen
            name="verificationBuyer"
            options={{ title: 'Verification' }}
          />
          <Stack.Screen
            name="verificationSponsor"
            options={{ title: 'Verification' }}
          />
          <Stack.Screen
            name="paymentBuyer"
            options={{ title: 'Payment' }}
          />
          <Stack.Screen
            name="paymentSponsor"
            options={{ title: 'Payment' }}
          />
          <Stack.Screen
            name="deliveryBuyer"
            options={{ title: 'Delivery' }}
          />
          <Stack.Screen
            name="deliverySponsor"
            options={{ title: 'Delivery' }}
          />
        </Stack>
      </SponsorshipProcessProvider>
    </StripeProvider>
  );
} 