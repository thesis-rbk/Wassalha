import { TextProps } from "react-native";

export interface TypographyProps extends TextProps {
    children: React.ReactNode;
    style?: any;
  }