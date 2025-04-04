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
    | '/test/order'
    | '/test/Notifications'
    | '/reporting-system/create-ticket'
    | '/traveler/become-traveler'
   
export interface SideMenu {
    icon: React.ReactNode;
    label: string;
    route?: AppRoutes;  // Use specific route types instead of generic string
    onPress?: () => void
}