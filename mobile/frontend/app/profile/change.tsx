import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert, ScrollView, SafeAreaView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axiosInstance from "../../config";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import { BaseButton } from '@/components/ui/buttons/BaseButton';
import { useRouter } from 'expo-router';
import { TabBar } from '@/components/navigation/TabBar';
import { TitleLarge, BodyMedium } from '@/components/Typography';
import { MaterialIcons } from '@expo/vector-icons';

const ChangePassword = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeTab, setActiveTab] = useState("home");
  const router = useRouter();

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    if (tab === "create") {
      router.push("/verification/CreateSponsorPost");
    } else {
      router.push(tab as any);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    const token = await AsyncStorage.getItem('jwtToken');

    try {
      const response = await axiosInstance.put(`/api/users/change-password`, {
        currentPassword,
        newPassword,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Optional: If you want to store any data in AsyncStorage after a successful password change
      // Ensure all values are strings to avoid null value errors
      // For example, you might want to store a flag indicating the password was changed
      await AsyncStorage.setItem('passwordChanged', 'true');

      Alert.alert('Success', response.data.message);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors[theme].background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>

          <View style={styles.header}>
            <TitleLarge style={[styles.headerTitle, { color: Colors[theme].primary }]}>
              Change Password
            </TitleLarge>
            <Text style={[styles.headerSubtitle, { color: Colors[theme].primary }]}>
              Update your password to keep your account secure
            </Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <MaterialIcons name="lock" size={16} color={Colors[theme].primary} />
                <BodyMedium style={styles.labelText}>Current Password</BodyMedium>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: Colors[theme].border,
                    backgroundColor: Colors[theme].card,
                    color: Colors[theme].text,
                  },
                ]}
                placeholder="Enter your current password"
                placeholderTextColor={Colors[theme].secondary}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <MaterialIcons name="lock" size={16} color={Colors[theme].primary} />
                <BodyMedium style={styles.labelText}>New Password</BodyMedium>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: Colors[theme].border,
                    backgroundColor: Colors[theme].card,
                    color: Colors[theme].text,
                  },
                ]}
                placeholder="Enter your new password"
                placeholderTextColor={Colors[theme].secondary}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <MaterialIcons name="lock" size={16} color={Colors[theme].primary} />
                <BodyMedium style={styles.labelText}>Confirm New Password</BodyMedium>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: Colors[theme].border,
                    backgroundColor: Colors[theme].card,
                    color: Colors[theme].text,
                  },
                ]}
                placeholder="Confirm your new password"
                placeholderTextColor={Colors[theme].secondary}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          <BaseButton
            variant="primary"
            size="login"
            onPress={handleChangePassword}
            style={styles.changeButton}
          >
            <Text style={styles.buttonText}>Change Password</Text>
          </BaseButton>
        </View>
      </ScrollView>
      <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 80, // Add padding to ensure content isn't hidden behind the TabBar
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  formSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  changeButton: {
    backgroundColor: Colors.light.primary, // Adjust based on your theme
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePassword;