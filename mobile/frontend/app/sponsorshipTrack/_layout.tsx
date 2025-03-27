import React from 'react';
import { Stack } from 'expo-router';
import { SponsorshipProcessProvider } from '@/context/SponsorshipProcessContext';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '@/config';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

export default function SponsorshipTrackLayout() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <SponsorshipProcessProvider>
        <Stack>
          <Stack.Screen
            name="initializationBuyer"
            options={{ headerShown: false } as NativeStackNavigationOptions}
          />
          <Stack.Screen
            name="initializationSponsor"
            options={{ headerShown: false } as NativeStackNavigationOptions}
          />
          <Stack.Screen
            name="verificationBuyer"
            options={{ headerShown: false } as NativeStackNavigationOptions}
          />
          <Stack.Screen
            name="verificationSponsor"
            options={{ headerShown: false } as NativeStackNavigationOptions}
          />
          <Stack.Screen
            name="paymentBuyer"
            options={{ headerShown: false } as NativeStackNavigationOptions}
          />
          <Stack.Screen
            name="paymentSponsor"
            options={{ headerShown: false } as NativeStackNavigationOptions}
          />
          <Stack.Screen
            name="deliveryBuyer"
            options={{ headerShown: false } as NativeStackNavigationOptions}
          />
          <Stack.Screen
            name="deliverySponsor"
            options={{ headerShown: false } as NativeStackNavigationOptions}
          />
        </Stack>
      </SponsorshipProcessProvider>
    </StripeProvider>
  );
}