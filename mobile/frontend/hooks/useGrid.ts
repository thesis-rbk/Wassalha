import { useWindowDimensions } from 'react-native';
import { Grid } from '@/constants/Grid';

export function useGrid() {
  const { width, height } = useWindowDimensions();
  
  // Calculate available width taking into account margins
  const availableWidth = width - (Grid.margin * 2);
  
  // Calculate column width based on current screen width
  const getColumnWidth = (columns = Grid.column, gutter = Grid.gutter) => {
    return (availableWidth - (gutter * (columns - 1))) / columns;
  };
  
  // Calculate padding for a specific number of columns
  const getColumnPadding = (columns = Grid.column) => {
    return {
      horizontal: Grid.padding.horizontal,
      vertical: Grid.padding.vertical,
    };
  };
  
  // Helper to get spacing value
  const getSpacing = (size: keyof typeof Grid.spacing) => Grid.spacing[size];
  
  return {
    ...Grid,
    screenWidth: width,
    screenHeight: height,
    availableWidth,
    getColumnWidth,
    getColumnPadding,
    getSpacing,
  };
} 