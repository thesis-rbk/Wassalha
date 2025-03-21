import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { Star } from '../../components/stars'; // Custom Star component (defined below)
import axiosInstance from '@/config';
import { useNavigation } from 'expo-router';
import NavigationProp from '@/types/navigation'
import { ReviewComponentProps } from "../../types/Review"

const ReviewComponent: React.FC<ReviewComponentProps> = ({ onReviewSubmitted }) => {
    const navigation = useNavigation<NavigationProp>();
    const [rating, setRating] = useState<number | null>(null);

    // Handle star selection
    const handleRating = (value: number) => {
        setRating(value);
    };

    // Submit review to backend
    const handleSubmit = async () => {
        if (rating === null) {
            alert('Please select a rating before submitting.');
            return;
        }
        console.log("rating:", rating)
        try {
            const response = await axiosInstance.post("/api/createReview", {
                rating,
                timestamp: new Date().toISOString(),
            });

            console.log('Review submitted successfully:', response.data);
            if (onReviewSubmitted) onReviewSubmitted();
            setRating(null);
            alert('Thank you for your feedback!');
            navigation.push('home');
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>how did you find our application ?</Text>
            <Text style={styles.description}>
                Your Review is important to us
            </Text>
            <View style={styles.rating}>
                {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                        key={value}
                        filled={rating !== null && value <= rating}
                        onPress={() => handleRating(value)}
                    />
                ))}
            </View>
            <View style={styles.buttons}>
                <TouchableOpacity style={styles.button} onPress={() => setRating(null)}>
                    <Text style={styles.buttonText}>Pas maintenant</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={rating === null}>
                    <Text style={[styles.buttonText, rating === null && styles.disabledButtonText]}>Envoyer</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        maxWidth: 300,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignSelf: 'center',
        marginTop: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    rating: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#e0e0e0',
        flex: 1,
        marginHorizontal: 5,
    },
    buttonText: {
        color: '#000',
        textAlign: 'center',
        fontWeight: '500',
    },
    disabledButtonText: {
        color: '#888',
    },
});

export default ReviewComponent;