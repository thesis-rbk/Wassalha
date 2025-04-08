"use client"

import { useState } from "react"
import { View, TextInput, StyleSheet, ScrollView, SafeAreaView, Text } from "react-native"
import { useNavigation } from "@react-navigation/native"
import axiosInstance from "../../config"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Colors } from "@/constants/Colors"
import { useTheme } from "@/context/ThemeContext"
import { BaseButton } from "@/components/ui/buttons/BaseButton"
import { useRouter } from "expo-router"
import { TabBar } from "@/components/navigation/TabBar"
import { BodyMedium } from "@/components/Typography"
import { MaterialIcons } from "@expo/vector-icons"
import { useStatus } from "@/context/StatusContext"

const ChangePassword = () => {
  const { theme } = useTheme()
  const navigation = useNavigation()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [activeTab, setActiveTab] = useState("home")
  const router = useRouter()
  const { show, hide } = useStatus()

  const handleTabPress = (tab: string) => {
    setActiveTab(tab)
    if (tab === "create") {
      router.push("/verification/CreateSponsorPost")
    } else {
      router.push(tab)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      show({
        type: "error",
        title: "Error",
        message: "Please fill in all fields",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      show({
        type: "error",
        title: "Error",
        message: "New password and confirmation do not match",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
      return;
    }
    if (newPassword.length < 8) {
      show({
        type: "error",
        title: "Error",
        message: "New password must be at least 8 characters long",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
      return;
    }

    const token = await AsyncStorage.getItem("jwtToken")

    try {
      const response = await axiosInstance.put(
        `/api/users/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      await AsyncStorage.setItem("passwordChanged", "true")
      
      show({
        type: "success",
        title: "Success",
        message: response.data.message || "Password updated successfully",
        primaryAction: {
          label: "OK",
          onPress: () => {
            hide();
            navigation.goBack();
          }
        }
      });
    } catch (error: any) {
      show({
        type: "error",
        title: "Error",
        message: error.response?.data?.message || "Something went wrong",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
          {/* Header with only subtitle */}
          <View style={styles.header}>
            <BodyMedium style={[styles.headerSubtitle, { color: Colors[theme].muted }]}>
              Keep your account secure with a strong password
            </BodyMedium>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <MaterialIcons name="lock-outline" size={18} color={Colors[theme].primary} />
                <BodyMedium style={[styles.labelText, { color: Colors[theme].text }]}>Current Password</BodyMedium>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: currentPassword ? Colors[theme].primary : Colors[theme].border,
                    backgroundColor: Colors[theme].card,
                    color: Colors[theme].text,
                    height: 56, // Fixed height for all inputs
                  },
                ]}
                placeholder="Enter current password"
                placeholderTextColor={Colors[theme].muted}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                autoCapitalize="none"
                accessibilityLabel="Current password input"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <MaterialIcons name="lock-outline" size={18} color={Colors[theme].primary} />
                <BodyMedium style={[styles.labelText, { color: Colors[theme].text }]}>New Password</BodyMedium>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: newPassword ? Colors[theme].primary : Colors[theme].border,
                    backgroundColor: Colors[theme].card,
                    color: Colors[theme].text,
                    height: 56, // Fixed height for all inputs
                  },
                ]}
                placeholder="Enter new password (min 8 characters)"
                placeholderTextColor={Colors[theme].muted}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                autoCapitalize="none"
                accessibilityLabel="New password input"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <MaterialIcons name="lock-outline" size={18} color={Colors[theme].primary} />
                <BodyMedium style={[styles.labelText, { color: Colors[theme].text }]}>Confirm New Password</BodyMedium>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: confirmPassword ? Colors[theme].primary : Colors[theme].border,
                    backgroundColor: Colors[theme].card,
                    color: Colors[theme].text,
                    height: 56, // Fixed height for all inputs
                  },
                ]}
                placeholder="Confirm your new password"
                placeholderTextColor={Colors[theme].muted}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
                accessibilityLabel="Confirm new password input"
              />
            </View>
          </View>

          {/* Button with fixed height and proper text display */}
          <View style={styles.buttonContainer}>
            <BaseButton
              variant="primary"
              size="login"
              onPress={handleChangePassword}
              style={[styles.changeButton, { backgroundColor: Colors[theme].primary }]}
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              <Text style={styles.buttonText}>Update Password</Text>
            </BaseButton>
          </View>
        </View>
      </ScrollView>
      <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  scrollContent: {
    paddingBottom: 100, // Space for TabBar
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 20,
  },
  formSection: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  labelText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 20,
  },
  changeButton: {
    borderRadius: 14,
    height: 56, // Fixed height for button
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    paddingHorizontal: 16, // Ensure there's horizontal padding
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.5,
    textAlign: "center",
    includeFontPadding: false, // Prevents extra padding in text
    textAlignVertical: "center", // Centers text vertically (Android)
  },
})

export default ChangePassword

