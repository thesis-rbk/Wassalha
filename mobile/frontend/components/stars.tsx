import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { StarProps } from '@/types';
// import START


const Star: React.FC<StarProps> = ({ filled, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.starContainer}>
            <Text style={[styles.star, filled && styles.filledStar]}>★</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    starContainer: {
        padding: 5,
    },
    star: {
        fontSize: 24,
        color: '#ccc',
    },
    filledStar: {
        color: '#25D366', // Green color similar to WhatsApp
    },
});

export { Star };