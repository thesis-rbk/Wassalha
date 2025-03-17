import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axiosInstance from '@/config';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Sponsorship } from '@/types/Sponsorship';
import NavigationProp from '@/types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SponsorshipsScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSponsor, setIsSponsor] = useState<boolean>(false);
    const navigation = useNavigation<NavigationProp>();
    const [token, setToken] = useState<null | string>(null);
    const [id, setID] = useState<number>(0);
    const tokenVerif = async () => {
        const tokeny = await AsyncStorage.getItem('jwtToken');
        console.log("token:", tokeny);
        setToken(tokeny);
    };
    console.log("issss sponsor", isSponsor)
    const check = async () => {
        try {
            const response = await axiosInstance.get('/api/checkSponsor', {
                headers: {
                    'Authorization': `Bearer ${token}`, // Correct way to pass the token in the header
                    'Accept': 'application/json',
                },
            });
            console.log("is sponsor:", response.data);
            setIsSponsor(response.data);
        } catch (err) {
            console.log("Error in check function:", err);
        }
    };

    const fetchSponsorships = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('api/search', {
                params: {
                    nameContains: searchQuery,
                    minPrice: minPrice || undefined,
                    maxPrice: maxPrice || undefined,
                },
            });
            const sorted = response.data.sort((a: Sponsorship, b: Sponsorship) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setSponsorships(sorted);
        } catch (error) {
            console.error('Error fetching sponsorships:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        tokenVerif();
    }, []);

    useEffect(() => {
        check()
    }, [token]);

    useFocusEffect(
        useCallback(() => {
            fetchSponsorships();
        }, [searchQuery, minPrice, maxPrice])
    );

    const handleBuyPress = (sponsorshipId: number) => {
        navigation.navigate('verification/sponsorPayment', { id: sponsorshipId });
    };

    const handleAddSponsorshipPress = (sponsorshipId: number) => {
        navigation.navigate('verification/CreateSponsorPost', { id: sponsorshipId });
    };

    // Render the sponsorship card
    const renderItem = ({ item }: { item: Sponsorship }) => (
        <View
            style={[
                styles.card,
                { borderColor: item.isActive ? '#ccc' : '#ccc' },
            ]}
        >
            <Text style={styles.cardTitle}>{item.platform}</Text>
            <Text style={styles.cardDetails}>Price: ${item.price}</Text>
            <Text style={styles.cardDetails}>Category: {item.category.name}</Text>
            {item.status === 'inactive' && item.recipient && (
                <Text style={styles.cardDetails}>Recipient: {item.recipient.name}</Text>
            )}
            <Text style={styles.cardDetails}>Description: {item.description}</Text>
            <View style={styles.statusContainer}>
                <Text
                    style={[
                        styles.cardStatus,
                        { color: item.isActive ? 'green' : 'red' },
                    ]}
                >
                    {item.isActive ? 'Active' : 'Inactive'}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.buyButton}
                onPress={() => { handleBuyPress(item.id), setID(item.id) }}
            >
                <Text style={styles.buyButtonText}>Buy</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search Sponsorships"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {isSponsor && ( // Check if isSponsor is true before rendering the button
                    <TouchableOpacity onPress={() => handleAddSponsorshipPress(id)}>
                        <Text style={styles.plusButton}>+</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Price Range Inputs */}
            <View style={styles.priceRangeContainer}>
                <TextInput
                    style={styles.priceInput}
                    placeholder="Min Price"
                    value={minPrice}
                    keyboardType="numeric"
                    onChangeText={setMinPrice}
                />
                <TextInput
                    style={styles.priceInput}
                    placeholder="Max Price"
                    value={maxPrice}
                    keyboardType="numeric"
                    onChangeText={setMaxPrice}
                />
            </View>

            {/* Sponsorships List */}
            {loading ? (
                <Text>Loading...</Text>
            ) : (
                <FlatList
                    data={sponsorships}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
    },
    plusButton: {
        fontSize: 30,
        marginLeft: 10,
        color: '#000',
    },
    priceRangeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    priceInput: {
        width: '45%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
    },
    card: {
        padding: 15,
        marginBottom: 15,
        borderWidth: 2,
        borderRadius: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardDetails: {
        fontSize: 14,
        marginTop: 5,
    },
    cardStatus: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    statusContainer: {
        marginTop: 10,
    },
    buyButton: {
        backgroundColor: 'blue',
        padding: 10,
        marginTop: 10,
        borderRadius: 5,
        alignItems: 'center',
        position: 'absolute',
        bottom: 15,
        right: 15,
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SponsorshipsScreen;