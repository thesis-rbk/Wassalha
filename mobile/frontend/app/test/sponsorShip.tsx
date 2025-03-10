import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import TermsAndConditions from './Terms&Conditions';
export default function Travel() {
    return (
        <View style={styles.container}>
            <TermsAndConditions />
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