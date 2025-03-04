import { Route } from 'expo-router';

export interface TabItem {
    name: string;
    icon: JSX.Element;
    route: Route;
}
