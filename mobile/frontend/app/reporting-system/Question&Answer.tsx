import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react-native';
import Header from '@/components/navigation/headers';
interface QAItem {
    question: string;
    answer: string;
}

export default function FAQComponent() {
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

    const qaList: QAItem[] = [
        {
            question: "What should I do if a traveler hasn't responded to my request?",
            answer: "Ensure your request details are clear and appealing. If no response within 48 hours, cancel and create a new request from your dashboard.",
        },
        {
            question: "How do I confirm a traveler's offer?",
            answer: "Go to 'Requests,' select your request, review offers, and click 'Accept' on the preferred one. You'll be notified once confirmed.",
        },
        {
            question: "What if the traveler doesn't send a photo of the purchased good?",
            answer: "Contact them via chat. If no response in 24 hours, submit a ticket under 'Traveler Non-Compliance.'",
        },
        {
            question: "Why is my payment still on hold?",
            answer: "Payments are held until delivery is confirmed. Confirm receipt in the app. If still held, submit a ticket under 'Payment Issues.'",
        },
        {
            question: "What if the good I received is damaged or incorrect?",
            answer: "Inspect during pickup and reject if faulty. Submit a ticket under 'Delivery Issues' with photos.",
        },
        {
            question: "How do I suggest a pickup method?",
            answer: "After payment, go to 'Order Details,' select 'Suggest Pickup,' and choose a method. The traveler must confirm.",
        },
        {
            question: "The traveler didn't show up for an in-person pickup. What do I do?",
            answer: "Contact them via chat. If unresolved, submit a ticket under 'Pickup Issues,' though liability may remain with you.",
        },
        {
            question: "How do I confirm delivery and release payment?",
            answer: "Go to 'Order Details,' click 'Confirm Delivery' after verifying the good. Payment releases within 24 hours.",
        },
        {
            question: "What if I don't see my issue listed here?",
            answer: "Submit a support ticket with detailed information, and we'll assist you promptly.",
        },
    ];

    const toggleQuestion = (index: number) => {
        setExpandedQuestion(expandedQuestion === index ? null : index);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header title="Q&A"
                subtitle='Frequently Asked Questions'
                showBackButton={true} />
            <ScrollView style={styles.scrollContainer}>
                <ThemedText style={styles.description}>
                    Check our common questions below. Click on any question to view the answer.
                </ThemedText>

                {qaList.map((qa, index) => (
                    <View key={index} style={styles.qaContainer}>
                        <TouchableOpacity
                            style={styles.questionRow}
                            onPress={() => toggleQuestion(index)}
                            activeOpacity={0.7}
                        >
                            <ThemedText style={styles.questionText}>{qa.question}</ThemedText>
                            {expandedQuestion === index ? (
                                <ChevronUp size={20} color={Colors.light.primary} />
                            ) : (
                                <ChevronDown size={20} color={Colors.light.primary} />
                            )}
                        </TouchableOpacity>
                        {expandedQuestion === index && (
                            <ThemedText style={styles.answerText}>{qa.answer}</ThemedText>
                        )}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 16,
    },
    headerText: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.light.primary,
        marginLeft: 8,
    },
    icon: {
        marginRight: 8,
    },
    scrollContainer: {
        flex: 1,
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
    },
    qaContainer: {
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        borderRadius: 8,
        overflow: 'hidden',
    },
    questionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 4,
    },
    questionText: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    answerText: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
        paddingHorizontal: 4,
        paddingBottom: 16,
    },
});