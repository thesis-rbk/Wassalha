import { Grid } from "@/constants/Grid";

export interface GridSpacerProps {
    size?: keyof typeof Grid.spacing | number;
    direction?: 'vertical' | 'horizontal';
  } 