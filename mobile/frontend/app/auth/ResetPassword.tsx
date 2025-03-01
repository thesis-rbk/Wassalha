import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AwesomeAlert from 'react-native-awesome-alerts';
import { useRouter } from 'expo-router';

const ForgotPassword = () => {
  const API = "http://192.168.104.14:4000";
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);

  const handleRequestReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      const response = await axios.post(`${API}/api/users/reset-password/request`, { email });
      if (response.status === 200) {
        setShowSuccessAlert(true);
      }
    } catch (error) {
      console.error('Request reset error:', error);
      Alert.alert('Error', (error as any).response?.data?.error || 'Failed to send reset link');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button title="Send Reset Link" onPress={handleRequestReset} />
      <Text style={styles.backText}>
        Back to{' '}
        <Text
          style={styles.backLink}
          onPress={() => router.push('/auth/login')}
        >
          Login
        </Text>
      </Text>
      <AwesomeAlert
        show={showSuccessAlert}
        showProgress={false}
        title="Success"
        message="A reset link has been sent to your email. Check your inbox."
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor="#00FF00"
        onConfirmPressed={() => {
          setShowSuccessAlert(false);
          router.push('/auth/login');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  backText: { marginTop: 20, textAlign: 'center' },
  backLink: { color: 'blue', fontWeight: 'bold' },
});

export default ForgotPassword;