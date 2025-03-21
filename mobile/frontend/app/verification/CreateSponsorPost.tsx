import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Dimensions } from 'react-native';
import axiosInstance from '@/config';
import { InputField } from '@/components/InputField';
import { BaseButton } from "../../components/ui/buttons/BaseButton";
import { useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavigationProp from '@/types/navigation';
import { Colors } from '@/constants/Colors';
import { FontFamily } from '@/assets/fonts';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TabBar } from "@/components/navigation/TabBar";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SponsorshipPlatform = {
    FACEBOOK: 'Facebook',
    INSTAGRAM: 'Instagram',
    YOUTUBE: 'YouTube',
    TWITTER: 'Twitter',
    TIKTOK: 'TikTok',
    OTHER: 'Other',
};

const CreateRequestForm: React.FC = () => {
    const [activeTab, setActiveTab] = useState("create"); // Set to "create" to match the screenshot
    const navigate = useNavigation<NavigationProp>();
    const colorScheme = useColorScheme() ?? 'light';
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [platform, setPlatform] = useState<string>(SponsorshipPlatform.FACEBOOK);
    const [categoryId, setCategoryId] = useState<string>("");
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<null | string>(null);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isPlatformOpen, setIsPlatformOpen] = useState(false);
    const categoryRef = useRef<View>(null);
    const platformRef = useRef<View>(null);

    const platformOptions = Object.entries(SponsorshipPlatform).map(([key, value]) => ({
        label: value,
        value: key,
    }));

    const categoryOptions = categories.length > 0
        ? categories.map((category) => ({
            label: category.name,
            value: category.id.toString(),
        }))
        : [{ label: 'Loading categories...', value: '' }];

    const decodeJWT = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const decodedData = JSON.parse(atob(base64));
            return decodedData;
        } catch (error) {
            console.error("Error decoding token:", error);
            return null;
        }
    };

    const tokenVerif = async () => {
        const tokeny = await AsyncStorage.getItem('jwtToken');
        setToken(tokeny);
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosInstance.get('api/allCat');
                setCategories(response.data);
            } catch (err) {
                setError('An error occurred while fetching categories');
            }
        };
        tokenVerif();
        fetchCategories();
    }, []);

    const handleSubmit = async () => {
        if (!name || !description || !price || !duration || !categoryId || !platform) {
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
            status: 'pending',
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

    const handleTabPress = (tab: string) => {
        setActiveTab(tab);
        if (tab === "create") {
            return;
        }
        navigate.navigate(tab as any);
    };

    const selectedCategoryLabel = categoryOptions.find(opt => opt.value === categoryId)?.label || "Select category";
    const selectedPlatformLabel = platformOptions.find(opt => opt.value === platform)?.label || "Select platform";

    return (
        <View style={styles.outerContainer}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.header, { color: Colors[colorScheme].text }]}>
                    Create Sponsor Post
                </Text>

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

                {/* Category Custom Dropdown */}
                <View style={styles.dropdownWrapper} ref={categoryRef}>
                    <Text style={[styles.label, { color: Colors[colorScheme].text }]}>
                        Category
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.dropdownContainer,
                            {
                                borderColor: Colors[colorScheme].primary,
                                backgroundColor: Colors[colorScheme].background,
                            },
                        ]}
                        onPress={() => {
                            setIsPlatformOpen(false); // Close the other dropdown
                            setIsCategoryOpen(!isCategoryOpen);
                        }}
                    >
                        <Text
                            style={[
                                styles.dropdownText,
                                {
                                    color: categoryId ? Colors[colorScheme].text : Colors[colorScheme].text + '80',
                                },
                            ]}
                        >
                            {selectedCategoryLabel}
                        </Text>
                        <Text style={[styles.arrow, { color: Colors[colorScheme].text }]}>
                            {isCategoryOpen ? '▲' : '▼'}
                        </Text>
                    </TouchableOpacity>
                    {isCategoryOpen && (
                        <View style={styles.dropdownList}>
                            <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                                {categoryOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setCategoryId(option.value);
                                            setIsCategoryOpen(false);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.dropdownItemText,
                                                { color: Colors[colorScheme].text },
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* Platform Custom Dropdown */}
                <View style={styles.dropdownWrapper} ref={platformRef}>
                    <Text style={[styles.label, { color: Colors[colorScheme].text }]}>
                        Platform
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.dropdownContainer,
                            {
                                borderColor: Colors[colorScheme].primary,
                                backgroundColor: Colors[colorScheme].background,
                            },
                        ]}
                        onPress={() => {
                            setIsCategoryOpen(false); // Close the other dropdown
                            setIsPlatformOpen(!isPlatformOpen);
                        }}
                    >
                        <Text
                            style={[
                                styles.dropdownText,
                                {
                                    color: platform ? Colors[colorScheme].text : Colors[colorScheme].text + '80',
                                },
                            ]}
                        >
                            {selectedPlatformLabel}
                        </Text>
                        <Text style={[styles.arrow, { color: Colors[colorScheme].text }]}>
                            {isPlatformOpen ? '▲' : '▼'}
                        </Text>
                    </TouchableOpacity>
                    {isPlatformOpen && (
                        <View style={styles.dropdownList}>
                            <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                                {platformOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setPlatform(option.value);
                                            setIsPlatformOpen(false);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.dropdownItemText,
                                                { color: Colors[colorScheme].text },
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* Submit Button */}
                <View style={styles.submitButtonContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
                    ) : (
                        <BaseButton
                            variant="primary"
                            onPress={handleSubmit}
                            style={styles.submitButton}
                        >
                            <Text style={styles.submitButtonText}>Submit</Text>
                        </BaseButton>
                    )}
                </View>

                {error && <Text style={styles.error}>{error}</Text>}
            </ScrollView>

            {/* TabBar */}
            <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    container: {
        padding: 20,
        flexGrow: 1,
        paddingBottom: 80, // Add padding to avoid content being hidden behind TabBar
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: FontFamily.bold,
        textAlign: 'center',
        marginBottom: 20,
    },
    dropdownWrapper: {
        gap: 6,
        width: '100%',
        marginBottom: 20,
        position: 'relative',
    },
    label: {
        fontFamily: FontFamily.medium,
        fontSize: 16,
    },
    dropdownContainer: {
        width: '100%',
        padding: 10,
        borderWidth: 2,
        borderRadius: 12,
        fontFamily: FontFamily.regular,
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: 16,
        fontFamily: FontFamily.regular,
    },
    arrow: {
        fontSize: 16,
        fontFamily: FontFamily.regular,
    },
    dropdownList: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 10,
        borderWidth: 1,
        borderColor: Colors.light.primary,
        borderRadius: 12,
        backgroundColor: Colors.light.background,
        marginTop: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.primary + '20',
    },
    dropdownItemText: {
        fontSize: 16,
        fontFamily: FontFamily.regular,
    },
    submitButtonContainer: {
        marginTop: 30,
        alignItems: 'center',
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: Colors.light.primary,
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 25,
        width: '60%',
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: FontFamily.medium,
    },
    error: {
        color: '#EF4444',
        fontSize: 14,
        fontFamily: FontFamily.regular,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
});

export default CreateRequestForm;