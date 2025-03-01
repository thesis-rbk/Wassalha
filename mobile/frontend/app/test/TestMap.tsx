import React from 'react';
import { View, StyleSheet } from 'react-native';
import TrackingApp from '../mapTrack';  // Import your existing map component

export default function TestMap() {
  return (
    <View style={styles.container}>
      <TrackingApp />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
