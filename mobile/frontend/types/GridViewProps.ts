import { Grid } from "@/constants/Grid";
import { ViewStyle } from "react-native";
import { ViewProps } from "react-native";

export interface GridViewProps extends ViewProps {
    column?: number;
    spacing?: keyof typeof Grid.spacing | number;
    margin?: boolean | number;
    padding?: boolean | number;
    card?: boolean;
    fullWidth?: boolean;
    centered?: boolean;
    style?: ViewStyle;
  }