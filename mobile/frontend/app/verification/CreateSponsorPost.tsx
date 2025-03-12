import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Button, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axiosInstance from '@/config';

const SponsorshipPlatform = {
    FACEBOOK: 'Facebook',
    INSTAGRAM: 'Instagram',
    YOUTUBE: 'YouTube',
    TWITTER: 'Twitter',
    TIKTOK: 'TikTok',
    OTHER: 'Other',
};

const CreateRequestForm: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [platform, setPlatform] = useState(SponsorshipPlatform.FACEBOOK); // Default platform
    const [categoryId, setCategoryId] = useState(''); // Default category ID should be empty
    const [amount, setAmount] = useState('');
    const [categories, setCategories] = useState<any[]>([]); // Store categories fetched from the backend
    const [loading, setLoading] = useState(false); // Loading state for submission
    const [error, setError] = useState<string | null>(null); // Error state

    // Default values for sponsorId and recipientId
    const sponsorId = 13; // Example sponsorId, set this to an actual value you want to use
    const recipientId = 86; // Example recipientId, set this to an actual value you want to use

    // Fetch categories from the backend using axios
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
            categoryId: parseInt(categoryId, 10),
            amount: parseFloat(amount),
            sponsorId, // Default sponsorId
            recipientId, // Default recipientId
            status: 'pending', // Default status set to 'pending'
        };

        try {
            const response = await axiosInstance.post('api/createSponsor', requestData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                Alert.alert('Success', 'Request created successfully');
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
            <Text style={styles.label}>Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter name"
                value={name}
                onChangeText={setName}
            />
            <Text style={styles.label}>Description</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter description"
                value={description}
                onChangeText={setDescription}
            />
            <Text style={styles.label}>Price</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter price"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
            />
            <Text style={styles.label}>Duration (in days)</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter duration"
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
            />
            <Text style={styles.label}>Platform</Text>
            <Picker
                selectedValue={platform}
                style={styles.picker}
                onValueChange={(itemValue) => setPlatform(itemValue)}
            >
                {Object.entries(SponsorshipPlatform).map(([key, value]) => (
                    <Picker.Item key={key} label={value} value={key} />
                ))}
            </Picker>
            <Text style={styles.label}>Category</Text>
            <Picker
                selectedValue={categoryId}
                style={styles.picker}
                onValueChange={(itemValue) => setCategoryId(itemValue)}
            >
                {categories.length > 0 ? (
                    categories.map((category) => (
                        <Picker.Item key={category.id} label={category.name} value={category.id.toString()} />
                    ))
                ) : (
                    <Picker.Item label="Loading categories..." value="" />
                )}
            </Picker>
            <Text style={styles.label}>Amount</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
            />

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <Button title="Submit" onPress={handleSubmit} />
            )}

            {error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 4,
        fontWeight: 'bold',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    picker: {
        height: 50,
        marginBottom: 12,
    },
    error: {
        color: 'red',
        marginTop: 10,
    },
});

export default CreateRequestForm;
