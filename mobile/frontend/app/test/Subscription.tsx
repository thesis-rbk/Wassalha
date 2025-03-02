import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
export default function Subscription() {
return (
<View style={styles.container}>
<ThemedText>Subscription Page Coming Soon</ThemedText>
</View>
);
}
const styles = StyleSheet.create({
container: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
},
});
