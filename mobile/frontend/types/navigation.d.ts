// types/navigation.d.ts
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

declare module "@react-navigation/native-stack" {
    interface NativeStackNavigationOptions {
        headerBackTitleVisible?: boolean;
        title?: string;
        id?: number;
    }
}

import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
    'verification/CreateSponsorPost': { id: number };
    'verification/fetchAll': undefined;
    'verification/sponsorPayment': { id: number };
<<<<<<< HEAD
    "verification/reviewSponsor";
    "home": undefined;

=======
    'sponsorshipTrack/initializationBuyer': { id: number };
    
>>>>>>> f4741c0705710a4bc88760d811c5d7dcfa34b9e3
};

type NavigationProp = StackNavigationProp<RootStackParamList>;
export default NavigationProp;
