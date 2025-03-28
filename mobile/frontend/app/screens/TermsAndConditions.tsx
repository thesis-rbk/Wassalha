import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Alert, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, Check } from 'lucide-react-native';

// Get screen width for responsive design
const { width } = Dimensions.get('window');

const TermsAndConditions: React.FC = () => {
    const [isAgreed, setIsAgreed] = useState<boolean>(false);
    const [hasReadToBottom, setHasReadToBottom] = useState<boolean>(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const router = useRouter();

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 20; // Adjust this value as needed
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

        if (isCloseToBottom && !hasReadToBottom) {
            setHasReadToBottom(true);
        }
    };

    const toggleCheckbox = () => {
        if (!hasReadToBottom) {
            Alert.alert(
                "Please Read Terms",
                "Please read the entire terms and conditions before accepting.",
                [{ text: "OK" }]
            );
            return;
        }
        setIsAgreed((prev) => !prev);
    };

    // Handle Next button press
    const handleNextPress = async () => {
        if (isAgreed) {
            try {
                console.log('Saving terms acceptance...');
                // Save that user has accepted the terms
                await AsyncStorage.setItem('sponsorshipTermsAccepted', 'true'); // Fixed to 'true'
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
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.innerScroll}
                    contentContainerStyle={styles.innerContent}
                    onScroll={handleScroll}
                    scrollEventThrottle={16} // Adjusted for smoother detection
                >
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

                {!hasReadToBottom && (
                    <View style={styles.scrollReminder}>
                        <ThemedText style={styles.reminderText}>
                            Please scroll to read the entire document
                        </ThemedText>
                    </View>
                )}

                <TouchableOpacity
                    style={[
                        styles.checkboxContainer,
                        !hasReadToBottom && styles.checkboxContainerDisabled
                    ]}
                    onPress={toggleCheckbox}
                    activeOpacity={hasReadToBottom ? 0.7 : 1}
                >
                    <View style={[
                        styles.checkbox,
                        isAgreed && styles.checkboxChecked,
                        !hasReadToBottom && styles.checkboxDisabled
                    ]}>
                        {isAgreed && <Check size={16} color="#fff" />}
                    </View>
                    <ThemedText style={[
                        styles.checkboxLabel,
                        !hasReadToBottom && styles.checkboxLabelDisabled
                    ]}>
                        I have read and agree to the Terms and Conditions
                    </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.nextButton,
                        (!isAgreed || !hasReadToBottom) && styles.nextButtonDisabled
                    ]}
                    onPress={handleNextPress}
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
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
    },
    card: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#007BFF',
        textAlign: 'center',
        marginBottom: 12,
    },
    updated: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 32,
    },
    innerScroll: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 20,
        marginBottom: 24,
        backgroundColor: '#F8FAFC',
    },
    innerContent: {
        padding: 24,
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
        fontSize: 20,
        fontWeight: '700',
        color: '#007BFF',
        marginBottom: 16,
        marginTop: 32,
    },
    subSectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#444',
        marginTop: 10,
        marginBottom: 5,
    },
    sectionText: {
        fontSize: 16,
        color: '#475569',
        lineHeight: 26,
    },
    listItem: {
        fontSize: 16,
        color: '#475569',
        marginLeft: 16,
        marginBottom: 12,
        lineHeight: 26,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 24,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        backgroundColor: '#FFF',
    },
    checkbox: {
        width: 28,
        height: 28,
        borderWidth: 2,
        borderColor: '#007BFF',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    checkboxChecked: {
        backgroundColor: '#007BFF',
    },
    checkboxLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1E293B',
        flex: 1,
        lineHeight: 24,
    },
    nextButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 20,
        borderRadius: 16,
        alignItems: 'center',
        margin: 24,
        shadowColor: '#007BFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    nextButtonDisabled: {
        backgroundColor: '#94A3B8',
        shadowOpacity: 0,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    scrollReminder: {
        padding: 12,
        backgroundColor: '#F0F7FF',
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
    },
    reminderText: {
        fontSize: 14,
        color: '#007BFF',
        fontWeight: '500',
    },
    checkboxContainerDisabled: {
        opacity: 0.6,
    },
    checkboxDisabled: {
        borderColor: '#94A3B8',
    },
    checkboxLabelDisabled: {
        color: '#94A3B8',
    },
});

export default TermsAndConditions;