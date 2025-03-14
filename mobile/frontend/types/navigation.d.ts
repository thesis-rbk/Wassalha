// types/navigation.d.ts
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

declare module "@react-navigation/native-stack" {
    interface NativeStackNavigationOptions {
        headerBackTitleVisible?: boolean;
        title?: string;
    }

}
import { StackNavigationProp } from '@react-navigation/stack'
type RootStackParamList = {
    'verification/CreateSponsorPost': undefined;
    'verification/FetchAll': undefined; // Add this line
    "verification/sponsorPayment": undefined
};
type NavigationProp = StackNavigationProp<RootStackParamList>;
export default NavigationProp;
