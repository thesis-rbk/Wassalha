// types/navigation.d.ts
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

declare module "@react-navigation/native-stack" {
    interface NativeStackNavigationOptions {
        headerBackTitleVisible?: boolean;
        headerShown?: boolean;
        presentation?: 'card' | 'modal' | 'transparentModal' | 'containedModal' | 'containedTransparentModal';
        title?: string;
        id?: number;
    }
}

import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
    'verification/CreateSponsorPost': { id: number };
    "verification/CreateSponsorPost";
    'verification/fetchAll': undefined;
    'verification/sponsorPayment': { id: number };
    "verification/reviewSponsor";
    "home": undefined;
    'sponsorshipTrack/initializationBuyer': { id: number };
    "verification/SponsorshipDetails": { id: number };
    "verification/CreditCardVerification": { id: number };
    "verification/Payment": { id: number };
    "verification/ClientsOrders"
};

type NavigationProp = StackNavigationProp<RootStackParamList>;
export default NavigationProp;
