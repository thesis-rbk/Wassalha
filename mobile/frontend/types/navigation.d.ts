// types/navigation.d.ts
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

declare module "@react-navigation/native-stack" {
    interface NativeStackNavigationOptions {
        headerBackTitleVisible?: boolean;
        title?: string;
    }

<<<<<<< HEAD
}
import { StackNavigationProp } from '@react-navigation/stack'
type RootStackParamList = {
    'verification/CreateSponsorPost': undefined;
    // Add other screens as needed
};
type NavigationProp = StackNavigationProp<RootStackParamList>;
export default NavigationProp;
=======
}
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
