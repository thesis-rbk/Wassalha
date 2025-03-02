// types/navigation.d.ts
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

declare module '@react-navigation/native-stack' {
    interface NativeStackNavigationOptions {
        component?: any,
        headerBackTitleVisible?: boolean;
        title?: string,
        headerShown?: boolean,

    }
}