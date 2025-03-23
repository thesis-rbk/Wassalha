import React from 'react';
import { View } from 'react-native';
import { Grid } from '@/constants/Grid';
import { GridSpacerProps } from '@/types/GridSpacerProps';


export function GridSpacer({ 
  size = 'md',
  direction = 'vertical'
}: GridSpacerProps) {
  const spacingValue = typeof size === 'string' ? Grid.spacing[size] : size;
  
  return (
    <View
      style={{
        width: direction === 'horizontal' ? spacingValue : undefined,
        height: direction === 'vertical' ? spacingValue : undefined,
      }}
    />
  );
} 