import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { Message } from '../../types';
import { ChatScreenProps } from "../../types/ChatScreenProps"
import { Ionicons } from '@expo/vector-icons';

const ChatScreen: React.FC<ChatScreenProps> = ({
    contactName = 'name',
    contactStatus = 'last seen',
    contactAvatar,
    onBackPress,
    onCallPress,
    onMorePress,
}) => {
    // Sample messages
    const [messages, setMessages] = useState<Message[]>([
    ]);

    const [newMessage, setNewMessage] = useState('');

    const sendMessage = () => {
        if (newMessage.trim() === '') return;

        const message: Message = {
            id: Date.now().toString(),
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSender: true,
        };

        setMessages([...messages, message]);
        setNewMessage('');
    };

    // Render a message bubble
    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[
            styles.messageBubble,
            item.isSender ? styles.senderBubble : styles.receiverBubble
        ]}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timeText}>{item.time}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#0099cc" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>

                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        {/* {contactAvatar ? (
              <Image source={{ uri: contactAvatar }} style={styles.avatarImage} />
            ) : null} */}
                    </View>
                </View>

                <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contactName}</Text>
                    <Text style={styles.contactStatus}>{contactStatus}</Text>
                </View>

                <TouchableOpacity onPress={onCallPress} style={styles.iconButton}>
                    <Ionicons name="call" size={22} color="white" />
                </TouchableOpacity>

                <TouchableOpacity onPress={onMorePress} style={styles.iconButton}>
                    <Ionicons name="ellipsis-vertical" size={22} color="white" />
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <FlatList
                data={messages}
                renderItem={renderMessage}
                contentContainerStyle={styles.messagesContainer}
            />

            {/* Input area */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="messages......................"
                    placeholderTextColor="#666"
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={sendMessage}
                >
                    <Ionicons name="send" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#008098",
        height: 60,
        paddingHorizontal: 10,
    },
    backButton: {
        padding: 5,
    },
    avatarContainer: {
        marginLeft: 5,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#777',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    contactInfo: {
        flex: 1,
        marginLeft: 10,
    },
    contactName: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    contactStatus: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
    },
    iconButton: {
        padding: 8,
    },
    messagesContainer: {
        padding: 10,
    },
    messageBubble: {
        maxWidth: '70%',
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        backgroundColor: '#e0e0e0',
    },
    receiverBubble: {
        alignSelf: 'flex-start',
    },
    senderBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#e5e5e5',
    },
    messageText: {
        fontSize: 16,
        color: '#333',
    },
    timeText: {
        fontSize: 12,
        color: '#777',
        alignSelf: 'flex-end',
        marginTop: 2,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#008098',
    },
    input: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontSize: 16,
    },
    sendButton: {
        marginLeft: 10,
        alignSelf: 'center',
        padding: 8,
    },
});

export default ChatScreen;