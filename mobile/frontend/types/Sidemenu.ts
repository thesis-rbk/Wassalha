import { Route } from 'expo-router';
import { GestureResponderEvent } from 'react-native'
type AppRoutes =
    | '/'
    | '/profile'
    | '/test/Travel'
    | '/productDetails/create-order'
    | '/test/Terms&Conditions'
    | '/test/Subscription'
    | '/test/sponsorShip'
export interface SideMenu {
    icon: React.ReactNode;
    label: string;
    route?: AppRoutes;  // Use specific route types instead of generic string
    onPress?: () => void
}