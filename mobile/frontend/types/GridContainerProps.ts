import { ViewStyle } from "react-native";

export interface GridContainerProps {
    children: React.ReactNode;
    scroll?: boolean;
    style?: ViewStyle;
    contentContainerStyle?: ViewStyle;
    safeArea?: boolean;
  } 