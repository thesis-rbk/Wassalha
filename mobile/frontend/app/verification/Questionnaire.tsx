import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import axiosInstance from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const questions = [
  {
    id: 1,
    question: "Which platforms will you be using?",
    options: ["YouTube", "Netflix", "Amazon Prime", "Disney+", "Other"],
    multiple: true
  },
  {
    id: 2,
    question: "Which gaming platforms will you be using?",
    options: ["Steam", "Epic Games", "PlayStation", "Xbox", "Nintendo", "Other"],
    multiple: true
  },
  {
    id: 3,
    question: "What's your expected monthly transaction volume?",
    options: ["1-5 transactions", "6-15 transactions", "16-30 transactions", "30+ transactions"],
    multiple: false
  },
  {
    id: 4,
    question: "What type of items will you be sponsoring?",
    options: ["Digital Games", "Streaming Subscriptions", "In-Game Items", "Other Digital Content"],
    multiple: true
  },
  {
    id: 5,
    question: "How did you hear about our sponsorship program?",
    options: ["Social Media", "Friend/Family", "Online Search", "Advertisement", "Other"],
    multiple: false
  }
];

const Questionnaire = () => {
  const router = useRouter();
  const [answers, setAnswers] = useState<{ [key: number]: string[] }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleSelect = (option: string) => {
    const question = questions[currentQuestion];
    if (question.multiple) {
      setAnswers(prev => ({
        ...prev,
        [question.id]: prev[question.id] 
          ? prev[question.id].includes(option)
            ? prev[question.id].filter(item => item !== option)
            : [...prev[question.id], option]
          : [option]
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        [question.id]: [option]
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error('No token found');

      const decoded: any = jwtDecode(token);
      
      const response = await axiosInstance.post(
        `/api/users/submit-questionnaire/${decoded.id}`,
        { 
          answers,
          userType: 'SPONSOR',
          subscriptionLevel: 'BASIC'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        await AsyncStorage.setItem('verificationPending', 'true');
        router.push('/verification/VerificationPending');
      }
    } catch (error: any) {
      console.error('Error submitting questionnaire:', error);
    }
  };

  const isQuestionAnswered = (questionId: number) => {
    return answers[questionId] && answers[questionId].length > 0;
  };

  const canProceed = currentQuestion < questions.length - 1 && 
    isQuestionAnswered(questions[currentQuestion].id);

  const canSubmit = currentQuestion === questions.length - 1 && 
    isQuestionAnswered(questions[currentQuestion].id);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <ThemedText style={styles.progress}>
          Question {currentQuestion + 1} of {questions.length}
        </ThemedText>

        <ThemedText style={styles.question}>
          {questions[currentQuestion].question}
        </ThemedText>

        <View style={styles.optionsContainer}>
          {questions[currentQuestion].options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.option,
                answers[questions[currentQuestion].id]?.includes(option) && styles.selectedOption
              ]}
              onPress={() => handleSelect(option)}
            >
              <ThemedText style={styles.optionText}>{option}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {currentQuestion > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => setCurrentQuestion(prev => prev - 1)}
          >
            <ThemedText style={styles.buttonText}>Previous</ThemedText>
          </TouchableOpacity>
        )}

        {canProceed && (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => setCurrentQuestion(prev => prev + 1)}
          >
            <ThemedText style={styles.buttonText}>Next</ThemedText>
          </TouchableOpacity>
        )}

        {canSubmit && (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSubmit}
          >
            <ThemedText style={styles.buttonText}>Submit</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  progress: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  selectedOption: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  optionText: {
    fontSize: 16,
  },
  footer: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.light.secondary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default Questionnaire; 