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
import { useSelector } from 'react-redux';
import axiosInstance from '@/config';
import AssistantService from '@/services/assistantService';
import { ChatBotMessage, ChatBotSession, ChatBotState } from '@/types/ChatBotMessage';

// Using the Gemini API key directly from environment
const GEMINI_API_KEY = 'AIzaSyCfXU8UUHPXWeUvpUg7WJejccsjmzUS_VE';

// Enhanced Wassalha context with more comprehensive information
const createWassalhaContext = () => {
  const faqs = AssistantService.getWassalhaFAQs();
  const features = AssistantService.getServiceFeatures();
  const illegalItems = AssistantService.getIllegalItems();
  const orderStatuses = AssistantService.getOrderStatusInfo();
  
  return `
You are the official AI assistant for Wassalha, a cross-platform app designed for seamless package delivery between countries.
Your name is Wassalha Assistant.

ABOUT WASSALHA:
Wassalha is a service that connects travelers who have extra luggage space with people who need items delivered across countries. 
This creates a community-based delivery network that is more cost-effective and sometimes faster than traditional shipping methods.

USER ROLES IN WASSALHA:
1. Travelers: People who are traveling between countries and have space in their luggage to carry items
2. Sponsors: People who need items delivered from one country to another and are willing to pay for the service

KEY FEATURES:
${Object.entries(features).map(([key, feature]: [string, any]) => 
  `- ${feature.description}\n  ${feature.benefits ? feature.benefits.map((b: string) => `  * ${b}`).join('\n') : ''}`
).join('\n')}

ORDER STATUS MEANINGS:
${Object.entries(orderStatuses).map(([status, description]: [string, string]) => 
  `- ${status.toUpperCase()}: ${description}`
).join('\n')}

FREQUENTLY ASKED QUESTIONS:
${faqs.map((faq: any) => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}

PROHIBITED ITEMS:
Wassalha prohibits the transportation of illegal or dangerous items. Here are the main categories of prohibited items:
${illegalItems.map((item: any) => `- ${item.category}: ${item.products.slice(0, 3).join(', ')}${item.products.length > 3 ? ', and more' : ''}`).join('\n')}

CONVERSATION GUIDELINES:
1. Only answer questions related to Wassalha services, features, and operations
2. For questions about order status, politely ask the user to specify their order ID if they haven't
3. Always prioritize safety and legality in your recommendations
4. For questions about illegal items, refer to the prohibited items list
5. Begin your first response with "Welcome to Wassalha! I'm your Wassalha Assistant."
6. For unrelated questions, politely redirect the conversation back to Wassalha
7. You do not know about external services or competitors
8. You are helpful, concise, and focused on Wassalha-related information only
9. If asked about technical support or complex issues, suggest contacting Wassalha customer support
`;
};



export default function ChatBotConversation() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { user, token } = useSelector((state: any) => state.auth);
  const [state, setState] = useState<ChatBotState>({
    messages: [],
    isLoading: false,
    error: null,
    sessionId: null,
  });
  const [orderData, setOrderData] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Fetch user's order data if available
  useEffect(() => {
    if (token && user?.id) {
      fetchUserOrders();
    }
  }, [token, user]);

  const fetchUserOrders = async () => {
    try {
      const response = await axiosInstance.get('/api/orders/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data) {
        setOrderData(response.data);
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
    }
  };

  const sendMessage = async () => {
    if (state.messages.length === 0) return;
    
    const userMessage: ChatBotMessage = {
      id: Date.now().toString(),
      text: state.messages[state.messages.length - 1].text,
      isUser: true,
      timestamp: new Date(),
    };
    
    setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, userMessage],
    }));
    
    // Create the context for the model dynamically
    const WASSALHA_CONTEXT = createWassalhaContext();
    
    // Process the message to check for order-related queries
    const lowerCaseMessage = userMessage.text.toLowerCase();
    let promptText = userMessage.text;
    
    // Check if the message is asking about order status
    if (
      lowerCaseMessage.includes('order') && 
      (lowerCaseMessage.includes('status') || 
       lowerCaseMessage.includes('track') || 
       lowerCaseMessage.includes('where') ||
       lowerCaseMessage.includes('my order'))
    ) {
      // If user has order data, include it in the context
      if (orderData && orderData.length > 0) {
        const recentOrders = orderData.slice(0, 3).map((order: any) => ({
          id: order.id,
          status: order.status,
          createdAt: order.createdAt,
          destination: order.destination
        }));
        
        promptText = `The user is asking about order status. Here's their recent order data: ${JSON.stringify(recentOrders)}. 
        Please provide a helpful response about their order status. The original query was: ${userMessage.text}`;
      }
    }
    
    // Check if the message is asking about illegal items
    if (
      lowerCaseMessage.includes('illegal') || 
      lowerCaseMessage.includes('prohibited') || 
      lowerCaseMessage.includes('banned') ||
      lowerCaseMessage.includes('allowed') ||
      lowerCaseMessage.includes('can i send') ||
      lowerCaseMessage.includes('transport')
    ) {
      const illegalItems = AssistantService.getIllegalItems();
      const categories = illegalItems.map((item: any) => item.category);
      
      // Check if the message mentions specific categories of illegal items
      for (const item of illegalItems) {
        const category = item.category.toLowerCase();
        if (lowerCaseMessage.includes(category)) {
          const products = item.products.join(', ');
          promptText = `The user is asking about prohibited items in the ${item.category} category. 
          This category includes: ${products}. The original query was: ${userMessage.text}`;
          break;
        }
      }
      
      if (promptText === userMessage.text) {
        promptText = `The user is asking about prohibited items. Wassalha prohibits transporting items in these categories: 
        ${categories.join(', ')}. The original query was: ${userMessage.text}`;
      }
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
      
      const botMessage: ChatBotMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };
      
      setState((prevState) => ({
        ...prevState,
        messages: [...prevState.messages, botMessage],
      }));
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      const errorMessage: ChatBotMessage = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I\'m having trouble connecting to our services right now. Please try again later or contact Wassalha customer support for immediate assistance.',
        isUser: false,
        timestamp: new Date(),
      };
      
      setState((prevState) => ({
        ...prevState,
        messages: [...prevState.messages, errorMessage],
      }));
    } finally {
      setState((prevState) => ({
        ...prevState,
        isLoading: false,
      }));
    }
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [state.messages]);

  const renderMessage = (message: ChatBotMessage) => {
    return (
      <View 
        key={message.id} 
        style={[
          styles.messageBubble, 
          message.isUser ? 
            [styles.userBubble, { backgroundColor: Colors[colorScheme].primary }] : 
            [styles.botBubble, { backgroundColor: Colors[colorScheme].card }]
        ]}
      >
        <Text 
          style={[
            styles.messageText, 
            { 
              color: message.isUser ? '#fff' : Colors[colorScheme].text 
            }
          ]}
        >
          {message.text}
        </Text>
        <Text 
          style={[
            styles.timestamp, 
            { 
              color: message.isUser ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)' 
            }
          ]}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

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
        {state.messages.map(renderMessage)}
        
        {state.isLoading && (
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
          value={state.messages[state.messages.length - 1]?.text || ''}
          onChangeText={(text) => {
            setState((prevState) => ({
              ...prevState,
              messages: [...prevState.messages.slice(0, -1), { ...prevState.messages[prevState.messages.length - 1], text } as ChatBotMessage]
            }));
          }}
          placeholder="Ask about Wassalha services..."
          placeholderTextColor={'gray'}
          multiline
        />
        <TouchableOpacity 
          onPress={sendMessage} 
          style={[styles.sendButton, { backgroundColor: Colors[colorScheme].primary }]}
          disabled={state.isLoading || state.messages[state.messages.length - 1]?.text.trim() === ''}
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