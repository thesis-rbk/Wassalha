import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ArrowLeft, Send } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { MessagesBot } from '@/types/Chat';
import { GEMINI_API_KEY } from '@/config';

// Wassalha system context to provide to the model
const WASSALHA_CONTEXT = `
You are the official AI assistant for Wassalha, a cross-platform app designed for seamless package delivery between countries.
Your name is Wassalha Assistant.

Key information about Wassalha:
- Wassalha allows users to track and manage deliveries across countries
- The app has both traveler and sponsor roles
- Sponsors can create subscription plans for enhanced features
- Users can make orders, track their status, and handle order returns and refunds
- The app has a strict policy regarding illegal items that cannot be transported

When answering user queries:
1. Only answer questions related to Wassalha services, features, and operations
2. For questions about order status, politely ask the user to specify their order ID
3. Always prioritize safety and legality in your recommendations
4. For questions about illegal items that cannot be transported, refer to the company's prohibited items list
5. Begin your first response with "Welcome to Wassalha! I'm your Wassalha Assistant."
6. For unrelated questions, politely redirect the conversation back to Wassalha
7. You do not know about external services or competitors
8. You are helpful, concise, and focused on Wassalha-related information only
`;

// List of illegal items that cannot be transported
const ILLEGAL_ITEMS_CATEGORIES = [
  "Art & Antiques", "Animal & Plant Products", "Military & Security Equipment",
  "Financial Items & Documents", "Health & Pharmaceuticals", "Jewelry & Valuables",
  "Tobacco & Related Products", "Counterfeit & Restricted Commercial Goods",
  "Drones & Technology", "Culturally Sensitive Items", "Firearms & Explosives",
  "Illegal Substances", "Restricted Agricultural Products", "Endangered Wildlife Products",
  "Food & Beverages", "Miscellaneous"
];

export default function ChatBotConversation() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<MessagesBot[]>([
    {
      id: '1',
      text: 'Welcome to Wassalha! I\'m your Wassalha Assistant. How can I help you with your package delivery needs today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (message.trim() === '') return;

    const userMessage: MessagesBot = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setMessage('');
    setIsLoading(true);

    // Process the message to check for order-related queries
    const lowerCaseMessage = message.toLowerCase();
    let promptText = message;

    // Check if the message is asking about order status
    if (
      lowerCaseMessage.includes('order') &&
      (lowerCaseMessage.includes('status') ||
        lowerCaseMessage.includes('track') ||
        lowerCaseMessage.includes('where'))
    ) {
      // Frontend only mock data for orders
      const mockOrders = [
        {
          id: "ORD-123456",
          status: "In Transit",
          createdAt: "2023-04-05T10:30:00Z",
          destination: "Paris, France"
        },
        {
          id: "ORD-789012",
          status: "Delivered",
          createdAt: "2023-03-20T14:15:00Z",
          destination: "Berlin, Germany"
        }
      ];

      promptText = `The user is asking about order status. Here's their recent order data: ${JSON.stringify(mockOrders)}. 
      Please provide a helpful response about their order status. The original query was: ${message}`;
    }

    // Check if the message is asking about illegal items
    if (
      lowerCaseMessage.includes('illegal') ||
      lowerCaseMessage.includes('prohibited') ||
      lowerCaseMessage.includes('banned') ||
      lowerCaseMessage.includes('allowed') ||
      lowerCaseMessage.includes('can i send')
    ) {
      promptText = `The user is asking about prohibited items. Wassalha prohibits transporting items in these categories: 
      ${ILLEGAL_ITEMS_CATEGORIES.join(', ')}. The original query was: ${message}`;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: WASSALHA_CONTEXT },
                  { text: "Current user query: " + promptText }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          }),
        }
      );

      const data = await response.json();

      let aiResponse = 'Sorry, I couldn\'t process your request.';

      if (data.candidates && data.candidates[0]?.content?.parts && data.candidates[0].content.parts[0]?.text) {
        aiResponse = data.candidates[0].content.parts[0].text;
      } else if (data.error) {
        aiResponse = `I apologize, but I'm having trouble answering your question right now. Please try again later or contact Wassalha support for assistance.`;
        console.error('API Error:', data.error);
      }

      const botMessage: MessagesBot = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);

      const errorMessage: MessagesBot = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I\'m having trouble connecting to our services right now. Please try again later or contact Wassalha customer support for immediate assistance.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme].card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors[colorScheme].text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme].text }]}>Wassalha Assistant</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Messages Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.isUser ?
                [styles.userBubble, { backgroundColor: Colors[colorScheme].primary }] :
                [styles.botBubble, { backgroundColor: Colors[colorScheme].card }]
            ]}
          >
            <Text
              style={[
                styles.messageText,
                {
                  color: msg.isUser ? '#fff' : Colors[colorScheme].text
                }
              ]}
            >
              {msg.text}
            </Text>
            <Text
              style={[
                styles.timestamp,
                {
                  color: msg.isUser ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)'
                }
              ]}
            >
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}

        {isLoading && (
          <View style={[styles.messageBubble, styles.botBubble, { backgroundColor: Colors[colorScheme].card }]}>
            <ActivityIndicator size="small" color={Colors[colorScheme].primary} />
          </View>
        )}
      </ScrollView>

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.inputContainer, { backgroundColor: Colors[colorScheme].card }]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? Colors.dark.background : '#f0f0f0',
              color: Colors[colorScheme].text
            }
          ]}
          value={message}
          onChangeText={setMessage}
          placeholder="Ask about Wassalha services..."
          placeholderTextColor={'gray'}
          multiline
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={[styles.sendButton, { backgroundColor: Colors[colorScheme].primary }]}
          disabled={isLoading || message.trim() === ''}
        >
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40, // Same width as back button for centering
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});