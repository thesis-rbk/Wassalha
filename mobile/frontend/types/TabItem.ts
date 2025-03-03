import { Route } from "expo-router";

export interface TabItem {
    name: string;
    icon: React.ReactNode;
    route: Route;
  }