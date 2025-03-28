import { Route } from 'expo-router';

export interface TabItem {
    name: string;
    icon: React.ReactElement | ((isActive: boolean) => React.ReactElement);
    route: string;
    label?: string;
}
