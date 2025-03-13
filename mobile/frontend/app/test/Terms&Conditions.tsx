import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
<<<<<<< HEAD
import { useRouter } from 'expo-router';
=======
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32

// Get screen width for responsive design
const { width } = Dimensions.get('window');

const TermsAndConditions: React.FC = () => {
    const [isAgreed, setIsAgreed] = useState<boolean>(false);
<<<<<<< HEAD
    const router = useRouter();
=======
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32

    const toggleCheckbox = () => {
        setIsAgreed((prev) => !prev);
    };

    // Handle Next button press (you can replace this with your navigation logic)
    const handleNextPress = () => {
<<<<<<< HEAD
        console.log("Next button pressed"); // Debug log
        if (isAgreed) {
            router.push('/verification/start' as any);
        }
=======
        console.log('Next button pressed');
        // Add your navigation or action here, e.g., navigation.navigate('NextScreen');
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
    };

    return (
        <ScrollView contentContainerStyle={styles.outerContainer}>
            <View style={styles.card}>
                <Text style={styles.title}>Terms and Conditions</Text>
                <Text style={styles.updated}>Last Updated: March 04, 2025</Text>

                {/* Inner ScrollView for Terms Content */}
                <ScrollView style={styles.innerScroll} contentContainerStyle={styles.innerContent}>
                    <Text style={styles.intro}>
<<<<<<< HEAD
                        Welcome to wasslha ! These Terms and Conditions ("Terms") govern your use of our app, which connects shoppers seeking items from around the world ("Shoppers") with travelers willing to deliver them ("Travelers"). We facilitate these connections and handle monetary transactions through third-party payment processors. By using our app, you agree to these Terms. Please read them carefully.
=======
                        Welcome to [Your App Name]! These Terms and Conditions ("Terms") govern your use of our app, which connects shoppers seeking items from around the world ("Shoppers") with travelers willing to deliver them ("Travelers"). We facilitate these connections and handle monetary transactions through third-party payment processors. By using our app, you agree to these Terms. Please read them carefully.
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
                    </Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>1. About Our Platform</Text>
                        <Text style={styles.sectionText}>
<<<<<<< HEAD
                            wasslha is a marketplace that enables Shoppers to request items unavailable in their location and Travelers to offer delivery services for a fee. We facilitate connections between users and manage payments via third-party processors, but we do not physically handle goods.
=======
                            [Your App Name] is a marketplace that enables Shoppers to request items unavailable in their location and Travelers to offer delivery services for a fee. We facilitate connections between users and manage payments via third-party processors, but we do not physically handle goods.
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>2. Eligibility</Text>
                        <Text style={styles.sectionText}>To use our app, you must:</Text>
                        <Text style={styles.listItem}>• Be at least 18 years old.</Text>
                        <Text style={styles.listItem}>• Provide accurate account info.</Text>
                        <Text style={styles.listItem}>• Comply with local and delivery country laws.</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>3. How It Works</Text>
                        <Text style={styles.sectionText}>
                            • Shoppers post item requests (description, price, location).{'\n'}
                            • Travelers offer delivery for a fee.{'\n'}
                            • We process payments securely through third-party services and release funds upon delivery confirmation.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
                        <Text style={styles.subSectionTitle}>Shoppers:</Text>
                        <Text style={styles.listItem}>• Provide clear details.</Text>
                        <Text style={styles.listItem}>• Authorize payments via the app.</Text>
                        <Text style={styles.listItem}>• Accept/reject items within 5 days.</Text>
                        <Text style={styles.subSectionTitle}>Travelers:</Text>
                        <Text style={styles.listItem}>• Purchase requested items.</Text>
                        <Text style={styles.listItem}>• Follow customs rules.</Text>
                        <Text style={styles.listItem}>• Deliver on time.</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>5. Payments</Text>
                        <Text style={styles.sectionText}>
                            We handle all monetary transactions through trusted third-party payment processors (e.g., Stripe). You agree to:{'\n'}
                            • Provide accurate payment information.{'\n'}
                            • Authorize us to process payments and distribute funds via third-party services.{'\n'}
                            • Payments are held securely and released to Travelers upon delivery confirmation.{'\n'}
                            Fees include item costs, Traveler fees, and our service fee (see Pricing). We are not liable for third-party processor errors or delays.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>6. Prohibited Items</Text>
                        <Text style={styles.sectionText}>
                            You may not request/deliver:{'\n'}
                            • Illegal items (drugs, weapons).{'\n'}
                            • Banned items (airlines/customs).{'\n'}
                            • Fraudulent transactions.{'\n'}
                            Violations may lead to suspension.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>7. Delivery & Acceptance</Text>
                        <Text style={styles.sectionText}>
                            • Deliveries must meet agreements.{'\n'}
                            • Refusal only for incorrect/damaged items.{'\n'}
                            • Disputes reported within 48 hours.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>8. Liability</Text>
                        <Text style={styles.sectionText}>
                            • We are not liable for user actions, lost/damaged items, or third-party payment issues.{'\n'}
                            • Travelers handle customs compliance.{'\n'}
                            • Our app, including payment processing, is provided "as is." We do not guarantee uninterrupted service or third-party performance.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>9. Third-Party Links</Text>
                        <Text style={styles.sectionText}>
                            Links to third-party services (including payment processors) are not our responsibility.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>10. Termination</Text>
                        <Text style={styles.sectionText}>
                            We may suspend accounts for violations. Close your account via settings.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
                        <Text style={styles.sectionText}>
                            Updates notified via email or app alerts.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>12. Governing Law</Text>
                        <Text style={styles.sectionText}>
                            Governed by [Your Country/State] laws. Disputes resolved there.
                        </Text>
                    </View>
                </ScrollView>

                {/* Checkbox and Next Button */}
                <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                        style={[styles.checkbox, isAgreed && styles.checkboxChecked]}
                        onPress={toggleCheckbox}
                    >
                        {isAgreed && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                    <Text style={styles.checkboxLabel}>I agree to the Terms and Conditions</Text>
                </View>

                {isAgreed && (
                    <TouchableOpacity style={styles.nextButton} onPress={handleNextPress}>
                        <Text style={styles.nextButtonText}>Next</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flexGrow: 1,
        padding: 15,
        backgroundColor: '#f5f5f5',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        width: width * 0.9,
        alignSelf: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a73e8',
        textAlign: 'center',
        marginBottom: 10,
    },
    updated: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginBottom: 15,
    },
    innerScroll: {
        maxHeight: 300,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        marginBottom: 20,
    },
    innerContent: {
        padding: 10,
    },
    intro: {
        fontSize: 14,
        color: '#444',
        marginBottom: 15,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginBottom: 5,
    },
    subSectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#444',
        marginTop: 10,
    },
    sectionText: {
        fontSize: 14,
        color: '#444',
    },
    listItem: {
        fontSize: 14,
        color: '#444',
        marginLeft: 10,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#666',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxChecked: {
        backgroundColor: '#1a73e8',
        borderColor: '#1a73e8',
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
        backgroundColor: '#1a73e8',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignSelf: 'center',
        marginTop: 10,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default TermsAndConditions;