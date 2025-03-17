import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import axiosInstance from '@/config';
import { InputField } from '@/components/InputField';
import { Dropdown } from '@/components/dropDown'; // Import the reusable Dropdown
import { BaseButton } from "../../components/ui/buttons/BaseButton"; // Import BaseButton
import { useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavigationProp from '@/types/navigation';
const SponsorshipPlatform = {
    FACEBOOK: 'Facebook',
    INSTAGRAM: 'Instagram',
    YOUTUBE: 'YouTube',
    TWITTER: 'Twitter',
    TIKTOK: 'TikTok',
    OTHER: 'Other',
};

const CreateRequestForm: React.FC = () => {
    const navigate = useNavigation<NavigationProp>()
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [platform, setPlatform] = useState<string>(SponsorshipPlatform.FACEBOOK); // Default platform
    const [categoryId, setCategoryId] = useState<number>(0); // Default category ID should be empty
    const [amount, setAmount] = useState('');
    const [categories, setCategories] = useState<any[]>([]); // Store categories fetched from the backend
    const [loading, setLoading] = useState(false); // Loading state for submission
    const [error, setError] = useState<string | null>(null); // Error state
    const [token, setToken] = useState<null | string>(); // Default sponsor ID should be empty
    const decodeJWT = (token: string) => {
        try {
            const base64Url = token.split('.')[1];  // Payload part of the token
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const decodedData = JSON.parse(atob(base64));
            return decodedData;
        } catch (error) {
            console.error("Error decoding token:", error);
            return null;
        }
    };

    const formatCardNumber = (text: string) => {
        const cleaned = text.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        // Add space after every 4 digits
        const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
        return formatted.slice(0, 19); // Limit to 16 digits + 3 spaces
    };

    const tokenVerif = async () => {
        const tokeny = await AsyncStorage.getItem('jwtToken');
        setToken(tokeny);
    };
    // Fetch categories from the backend
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosInstance.get('api/allCat'); // Replace with your API URL for categories
                console.log("Categories:", response.data);
                setCategories(response.data); // Assuming the API returns an array of categories
            } catch (err) {
                setError('An error occurred while fetching categories');
            }
        };
        tokenVerif()
        fetchCategories();
    }, []);

    const handleSubmit = async () => {
        if (!name || !description || !price || !duration || !categoryId || !platform || !amount) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setLoading(true);
        setError(null);

        const requestData = {
            name,
            description,
            price: parseFloat(price),
            duration: parseInt(duration, 10),
            platform,
            categoryId,
            amount: parseFloat(amount),
            status: 'pending', // Default status set to 'pending'
        };

        try {
            const response = await axiosInstance.post('api/createSponsor', requestData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                navigate.navigate("verification/fetchAll");
            } else {
                setError(response.data.message || 'Something went wrong');
            }
        } catch (err) {
            setError('An error occurred while submitting the request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <InputField
                label="Name"
                placeholder="Enter name"
                value={name}
                onChangeText={setName}
            />
            <InputField
                label="Description"
                placeholder="Enter description"
                value={description}
                onChangeText={setDescription}
            />
            <InputField
                label="Price"
                placeholder="Enter price"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
            />
            <InputField
                label="Duration (in days)"
                placeholder="Enter duration"
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
            />

            {/* Amount Input moved below Duration */}
            <InputField
                label="Amount"
                placeholder="Enter amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
            />

            {/* Category Dropdown */}
            <View style={styles.dropdownSpacing}>
                <Text style={styles.label}>Category</Text>
                <Dropdown
                    options={categories.length > 0
                        ? categories.map((category) => ({
                            label: category.name,
                            value: category.id.toString(),
                        }))
                        : [{ label: 'Loading categories...', value: '' }]}
                    value={categoryId}
                    onChange={(value) => setCategoryId(value as number)}
                    placeholder="Select category"
                    containerStyle={styles.dropdownContainer}
                    dropdownStyle={styles.dropdownList}
                />
            </View>

            <View style={styles.spacing} />

            {/* Platform Dropdown moved below Category */}
            <View style={styles.dropdownSpacing}>
                <Text style={styles.label}>Platform</Text>
                <Dropdown
                    options={Object.entries(SponsorshipPlatform).map(([key, value]) => ({
                        label: value,
                        value: key,
                    }))}
                    value={platform}
                    onChange={(value) => setPlatform(value as string)}
                    placeholder="Select platform"
                    containerStyle={styles.dropdownContainer}
                    dropdownStyle={styles.dropdownList}
                />
            </View>

            <View style={styles.spacing} />

            {/* Submit Button centered */}
            <View style={styles.submitButtonContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <BaseButton variant="primary" onPress={handleSubmit}>
                        Submit
                    </BaseButton>
                )}
            </View>

            {error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flexGrow: 1,
    },
    label: {
        fontSize: 16,
        marginBottom: 4,
        fontWeight: 'bold',
    },
    dropdownContainer: {
        marginBottom: 20,
    },
    dropdownList: {
        maxHeight: 200,
    },
    dropdownSpacing: {
        marginTop: 20, // Added margin to move dropdowns down
    },
    spacing: {
        marginBottom: 20, // Added consistent spacing between elements
    },
    error: {
        color: 'red',
        marginTop: 10,
    },
    submitButtonContainer: {
        marginTop: 40, // Added more margin to center the button further down
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CreateRequestForm;
