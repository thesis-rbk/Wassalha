import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { UserCardProps } from '@/types/UserCardProps';

const UserCard: React.FC<UserCardProps> = ({ name, score, gender, img }) => {
    const calculateStars = (score: number) => {
        const stars = Math.round((score / 1.15) / 100 * 5); // Convert score to a 5-star scale
        return '★'.repeat(stars) + '☆'.repeat(5 - stars);
    };

    return (
        <View style={styles.cardContainer}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: img }} style={styles.profileImage} />
            </View>
            <Text style={styles.nameText}>{name}</Text>
            <Text style={styles.starText}>{calculateStars(score)}</Text>
            <Text style={styles.genderText}>Gender: {gender}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: 150,
        height: 220, // Increased height
        padding: 10,
        margin: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
        backgroundColor: '#fff',
        shadowColor: '#008098',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        justifyContent: 'center',
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#008098',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    nameText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#008098',
    },
    starText: {
        color: '#FFD700', // Gold color for stars
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 5,
    },
    genderText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 5,
    },
});

export default UserCard;
