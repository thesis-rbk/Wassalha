import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';

interface Sponsor {
    id: number;
    name: string;
    description?: string;
    price: number;
    duration: number;
    type: string; // Assuming SubscriptionType is a string
    categoryId: number;
    isActive: boolean;
}

const SponsorCard: React.FC<{ sponsorId: number }> = ({ sponsorId }) => {
    const [sponsor, setSponsor] = useState<Sponsor | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSponsor = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/allSub`);
                console.log("hellooooo", response)
                if (!response.ok) {
                    throw new Error('Failed to fetch sponsor data');
                }
                const data: Sponsor = await response.json();
                setSponsor(data);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchSponsor();
    }, [sponsorId]);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }
    if (error) {
        return <Text style={styles.errorText}>{error}</Text>;
    }
    if (!sponsor) {
        return null;
    }

    return (
        <View style={styles.card}>
            <Text style={styles.name}>{sponsor.name}</Text>
            {sponsor.description && <Text style={styles.description}>{sponsor.description}</Text>}
            <Text style={styles.price}>Price: ${sponsor.price.toFixed(2)}</Text>
            <Text style={styles.duration}>Duration: {sponsor.duration} days</Text>
            <Text style={styles.type}>Type: {sponsor.type}</Text>
            <Text style={styles.status}>Status: {sponsor.isActive ? 'Active' : 'Inactive'}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 16,
        margin: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginVertical: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    duration: {
        fontSize: 14,
        color: '#666',
    },
    type: {
        fontSize: 14,
        color: '#666',
    },
    status: {
        fontSize: 14,
        color: '#666',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default SponsorCard;
