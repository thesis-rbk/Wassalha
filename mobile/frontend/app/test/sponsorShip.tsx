import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
export default function Travel() {
    return (
        <View style={styles.container}>
            <ThemedText>Travel Page Coming Soon</ThemedText>
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