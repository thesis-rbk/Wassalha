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
<<<<<<< HEAD
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
=======
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
>>>>>>> 6cfa565da0700a73f3bf51b91130c8c3305400b5
          />
        </Stack>
      </SponsorshipProcessProvider>
    </StripeProvider>
  );
}