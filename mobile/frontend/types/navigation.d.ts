// types/navigation.d.ts
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

<<<<<<< HEAD
declare module '@react-navigation/native-stack' {
    interface NativeStackNavigationOptions {
        component?: any,
        headerBackTitleVisible?: boolean;
        title?: string,
        headerShown?: boolean,

    }
}
=======
declare module "@react-navigation/native-stack" {
  interface NativeStackNavigationOptions {
    headerBackTitleVisible?: boolean;
    title?: string;
  }
}
>>>>>>> 6feec0c946fea1b17a8e1528dd123f86887c6931
