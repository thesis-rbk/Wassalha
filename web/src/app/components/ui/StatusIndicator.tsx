import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontFamily } from '@/assets/fonts';
import { StatusIndicatorProps, StatusType } from '@/types/StatusIndicator';




export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'success':
        return '#22C55E';
      case 'danger':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor(status) }]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 70,
    height: 25,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: '#FFFFFF',
  },
}); 