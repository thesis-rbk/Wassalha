// types/navigation.d.ts
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

declare module "@react-navigation/native-stack" {
    interface NativeStackNavigationOptions {
        headerBackTitleVisible?: boolean;
        title?: string;
    }

}