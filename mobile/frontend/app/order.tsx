import { InputField } from '@/components/InputField';
import { BaseButton } from '@/components/ui/buttons/BaseButton';
import { useState } from 'react';
import { Colors } from '@/constants/Colors';
import { View, StyleSheet, ScrollView, Image } from 'react-native';

export function Order() {
    const [url, setUrl] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleUrl = () => {
        // Add your logic here
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <InputField
                    label=""
                    placeholder="Enter your product URL............"
                    value={url}
                    onChangeText={(text) => {
                        setUrl(text);
                        setError(null); // Clear error on change
                    }}
                    error={error || undefined}
                    keyboardType="url"
                    autoCapitalize="none"
                />
                <View style={styles.buttonContainer}>
                    <BaseButton
                        variant="primary"
                        size="login"
                        style={styles.loginButton}
                        onPress={handleUrl}
                    >
                        enter your product UrL
                    </BaseButton>
                    <BaseButton
                        variant="primary"
                        size="login"
                        style={styles.loginButton}
                        onPress={handleUrl}
                    >
                        Fill manuel
                    </BaseButton>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    buttonContainer: {
        flexDirection: 'row', // Aligns buttons horizontally
        justifyContent: 'space-between', // Spaces buttons evenly
        alignItems: 'center', // Vertically centers buttons
        width: '100%', // Takes full width of parent
        marginTop: 20, // Matches existing marginTop from loginButton
    },
    loginButton: {
        flex: 1, // Makes buttons take equal space
        marginHorizontal: 8, // Adds spacing between buttons
    },
    logo: {
        width: 150,
        height: 150,
        alignSelf: 'center',
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        color: Colors.light.text + '80', // Slightly transparent
    },
    signUpText: {
        textAlign: 'center',
        marginTop: 20,
    },
    signUpLink: {
        color: Colors.light.primary,
        fontWeight: 'bold',
    },
    forgotPasswordText: {
        textAlign: 'right',
        marginTop: 10,
        color: Colors.light.primary,
        fontSize: 14,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
        fontSize: 14,
    },
});