import { Grid } from "@/constants/Grid";
import { ViewProps } from "react-native";
import { ViewStyle } from "react-native";

export interface GridRowProps extends ViewProps {
    spacing?: keyof typeof Grid.spacing | number;
    align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
    wrap?: boolean;
    style?: ViewStyle;
  }