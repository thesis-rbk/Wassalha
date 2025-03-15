import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, Check } from 'lucide-react-native';

// Get screen width for responsive design
const { width } = Dimensions.get('window');

const TermsAndConditions: React.FC = () => {
    const [isAgreed, setIsAgreed] = useState<boolean>(false);
    const router = useRouter();

    const toggleCheckbox = () => {
        setIsAgreed((prev) => !prev);
    };

    // Handle Next button press
    const handleNextPress = async () => {
        if (isAgreed) {
            try {
                console.log('Saving terms acceptance...');
                // Save that user has accepted the terms
                await AsyncStorage.setItem('sponsorshipTermsAccepted', 'true');
                console.log('Terms acceptance saved successfully');
                router.push('/verification/start');
            } catch (error) {
                console.error('Error saving terms acceptance:', error);
                Alert.alert(
                    'Error',
                    'There was a problem saving your acceptance. Please try again.'
                );
            }
        } else {
            Alert.alert(
                'Terms Required',
                'Please accept the terms and conditions to continue.'
            );
        }
    };

    return (
        <ThemedView style={styles.outerContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color="#333" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Terms and Conditions</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.card}>
                <ThemedText style={styles.title}>Sponsorship Terms and Conditions</ThemedText>
                <ThemedText style={styles.updated}>Last Updated: March 04, 2025</ThemedText>

                {/* Inner ScrollView for Terms Content */}
                <ScrollView style={styles.innerScroll} contentContainerStyle={styles.innerContent}>
                    <ThemedText style={styles.intro}>
                        Welcome to The Tribe! These Terms and Conditions ("Terms") govern your participation in our global sponsorship community. By joining our community, you agree to these Terms. Please read them carefully.
                    </ThemedText>

                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>1. About Our Community</ThemedText>
                        <ThemedText style={styles.sectionText}>
                            The Tribe is a global community that connects sponsors with individuals seeking access to digital content. We facilitate these connections and handle monetary transactions through third-party payment processors. Our platform enables cultural exchange and access to resources across borders.
                        </ThemedText>
                    </View>

                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>2. Eligibility</ThemedText>
                        <ThemedText style={styles.sectionText}>To join our community, you must:</ThemedText>
                        <ThemedText style={styles.listItem}>• Be at least 18 years old.</ThemedText>
                        <ThemedText style={styles.listItem}>• Provide accurate identity information.</ThemedText>
                        <ThemedText style={styles.listItem}>• Complete our verification process.</ThemedText>
                        <ThemedText style={styles.listItem}>• Comply with all applicable laws.</ThemedText>
                    </View>

                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>3. Verification Process</ThemedText>
                        <ThemedText style={styles.sectionText}>
                            To ensure the safety and integrity of our community, all members must complete a verification process that includes:{'\n'}
                            • Identity verification{'\n'}
                            • Contact information verification{'\n'}
                            • Agreement to community guidelines{'\n'}
                            We may use third-party services to verify your information.
                        </ThemedText>
                    </View>

                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>4. Member Responsibilities</ThemedText>
                        <ThemedText style={styles.subSectionTitle}>As a Sponsor, you agree to:</ThemedText>
                        <ThemedText style={styles.listItem}>• Provide accurate information about your sponsorship offers.</ThemedText>
                        <ThemedText style={styles.listItem}>• Fulfill your sponsorship commitments.</ThemedText>
                        <ThemedText style={styles.listItem}>• Communicate respectfully with other members.</ThemedText>
                        <ThemedText style={styles.listItem}>• Report any suspicious activity to our team.</ThemedText>
                    </View>

                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>5. Prohibited Activities</ThemedText>
                        <ThemedText style={styles.sectionText}>
                            The following activities are strictly prohibited:{'\n'}
                            • Fraudulent sponsorships or requests{'\n'}
                            • Harassment or abusive behavior{'\n'}
                            • Sharing false information{'\n'}
                            • Using the platform for illegal purposes{'\n'}
                            • Creating multiple accounts{'\n'}
                            Violations may result in immediate termination of your membership.
                        </ThemedText>
                    </View>

                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>6. Privacy and Data</ThemedText>
                        <ThemedText style={styles.sectionText}>
                            We collect and process personal data as described in our Privacy Policy. By accepting these Terms, you consent to our data practices, including:{'\n'}
                            • Collection of verification information{'\n'}
                            • Sharing necessary data with other community members{'\n'}
                            • Processing payment information through secure third-party services
                        </ThemedText>
                    </View>

                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>7. Intellectual Property</ThemedText>
                        <ThemedText style={styles.sectionText}>
                            All content on our platform, including logos, text, and graphics, is protected by intellectual property rights. You may not use, reproduce, or distribute our content without permission.
                        </ThemedText>
                    </View>

                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>8. Limitation of Liability</ThemedText>
                        <ThemedText style={styles.sectionText}>
                            We provide our platform "as is" without warranties of any kind. We are not liable for:{'\n'}
                            • Actions of other community members{'\n'}
                            • Failed sponsorships or transactions{'\n'}
                            • Technical issues or service interruptions{'\n'}
                            • Any indirect, consequential, or incidental damages
                        </ThemedText>
                    </View>

                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>9. Termination</ThemedText>
                        <ThemedText style={styles.sectionText}>
                            We reserve the right to suspend or terminate your membership at any time for violations of these Terms. You may also terminate your membership by contacting our support team.
                        </ThemedText>
                    </View>

                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>10. Changes to Terms</ThemedText>
                        <ThemedText style={styles.sectionText}>
                            We may update these Terms at any time. Continued use of our platform after changes constitutes acceptance of the new Terms.
                        </ThemedText>
                    </View>

                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>11. Governing Law</ThemedText>
                        <ThemedText style={styles.sectionText}>
                            These Terms are governed by the laws of [Your Country/State]. Any disputes will be resolved in the courts of that jurisdiction.
                        </ThemedText>
                    </View>
                </ScrollView>

                {/* Checkbox for agreement */}
                <TouchableOpacity 
                    style={styles.checkboxContainer} 
                    onPress={toggleCheckbox}
                    activeOpacity={0.7}
                >
                    <View style={[
                        styles.checkbox,
                        isAgreed ? styles.checkboxChecked : {}
                    ]}>
                        {isAgreed && <Check size={16} color="#fff" />}
                    </View>
                    <ThemedText style={styles.checkboxLabel}>
                        I have read and agree to the Terms and Conditions
                    </ThemedText>
                </TouchableOpacity>

                {/* Continue button */}
                <TouchableOpacity 
                    style={[
                        styles.nextButton,
                        !isAgreed ? styles.nextButtonDisabled : {}
                    ]} 
                    onPress={handleNextPress}
                    disabled={!isAgreed}
                >
                    <ThemedText style={styles.nextButtonText}>Continue</ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        padding: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    card: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0891b2',
        textAlign: 'center',
        marginBottom: 10,
    },
    updated: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    innerScroll: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        marginBottom: 20,
    },
    innerContent: {
        padding: 16,
    },
    intro: {
        fontSize: 14,
        color: '#444',
        marginBottom: 20,
        lineHeight: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0891b2',
        marginBottom: 8,
    },
    subSectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#444',
        marginTop: 10,
        marginBottom: 5,
    },
    sectionText: {
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
    },
    listItem: {
        fontSize: 14,
        color: '#444',
        marginLeft: 10,
        marginBottom: 5,
        lineHeight: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderWidth: 2,
        borderColor: '#0891b2',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxChecked: {
        backgroundColor: '#0891b2',
    },
    checkmark: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#333',
    },
    nextButton: {
        backgroundColor: '#0891b2',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    nextButtonDisabled: {
        backgroundColor: '#cbd5e1',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default TermsAndConditions; 