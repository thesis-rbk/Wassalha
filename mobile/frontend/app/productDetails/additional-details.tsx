"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { ChevronDown } from "lucide-react-native"
import { InputField } from "@/components/InputField"
import { BaseButton } from "@/components/ui/buttons/BaseButton"
import { TitleLarge, TitleSection, BodyMedium } from "@/components/Typography"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Category } from '@/types/Category'
import axiosInstance from "@/config"

const AdditionalDetails: React.FC = () => {
  const colorScheme = useColorScheme() ?? "light"
  const router = useRouter()
  const params = useLocalSearchParams()

  // Convert back to proper types
  const productDetails = {
    name: params.name as string,
    price: parseFloat(params.price as string),
    details: params.details as string,
    withBox: params.withBox === 'true',
    quantity: parseInt(params.quantity as string),
    imageUrl: params.imageUrl as string,
  }

  console.log('Received and converted data:', productDetails)

  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [size, setSize] = useState("")
  const [weight, setWeight] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/api/categories")
        if (response.status === 200) {
          setCategories(response.data.data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  const handleCategorySelect = (id: number) => {
    setCategoryId(id)
    setShowCategoryDropdown(false)
  }

  const handleSubmit = async () => {
    try {
      const productData = {
        ...productDetails,
        categoryId,
        size: size || null,
        weight: weight ? parseFloat(weight) : null,
      }

      console.log('Submitting product data:', productData)

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/goods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      const data = await response.json()
      console.log('Product created:', data)
      router.push('/home')
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <TitleLarge style={styles.mainTitle}>2. Additional Details</TitleLarge>

        {/* Category Dropdown */}
        <TitleSection style={styles.sectionTitle}>Category *</TitleSection>
        <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}>
          <BodyMedium style={categoryId ? styles.selectedText : styles.placeholderText}>
            {categories.find(c => c.id === categoryId)?.name || "Select a category"}
          </BodyMedium>
          <ChevronDown size={20} color={Colors[colorScheme].primary} />
        </TouchableOpacity>

        {showCategoryDropdown && (
          <View style={styles.dropdownMenu}>
            {categories.map((category) => (
              <TouchableOpacity key={category.id} style={styles.dropdownItem} onPress={() => handleCategorySelect(category.id)}>
                <BodyMedium>{category.name}</BodyMedium>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Size Input */}
        <InputField
          label="Size (Optional)"
          value={size}
          onChangeText={setSize}
          placeholder="Enter size"
          style={styles.input}
        />

        {/* Weight Input */}
        <InputField
          label="Weight in kg (Optional)"
          value={weight}
          onChangeText={setWeight}
          placeholder="Enter weight"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        {/* Additional Notes */}
        <InputField
          label="Additional Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Any special instructions or requirements"
          multiline
          numberOfLines={3}
          style={[styles.input, styles.textArea]}
        />

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <BaseButton size="large" onPress={handleSubmit} disabled={!categoryId}>
            <BodyMedium style={styles.buttonText}>
              Submit Product
            </BodyMedium>
          </BaseButton>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 14,
    margin: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mainTitle: {
    marginBottom: 16,
    fontSize: 20,
  },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 8,
  },
  dropdownTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginTop: -12,
    marginBottom: 16,
    backgroundColor: "#fff",
    maxHeight: 200,
    zIndex: 10,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  placeholderText: {
    color: "#999",
  },
  selectedText: {
    color: "#333",
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 24,
  },
  buttonText: {
    color: "#ffffff",
  },
})

export default AdditionalDetails

