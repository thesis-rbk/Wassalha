import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Globe2, CreditCard, FileText, Home, ChevronRight, Shield } from 'lucide-react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useRouter } from 'expo-router';
import { TabBar } from "@/components/navigation/TabBar";
const countries = {
  "USA": "US",
  "FRANCE": "FR",
  "SPAIN": "ES",
  "GERMANY": "DE",
  "ITALY": "IT",
  "UK": "GB",
  "CANADA": "CA",
  "AUSTRALIA": "AU",
  "JAPAN": "JP",
  "CHINA": "CN",
  "BRAZIL": "BR",
  "INDIA": "IN",
  "RUSSIA": "RU",
  "MEXICO": "MX",
  "BOLIVIA": "BO",
  "MOROCCO": "MA",
  "TUNISIA": "TN",
  "ALGERIA": "DZ",
  "TURKEY": "TR",
  "PORTUGAL": "PT",
  "NETHERLANDS": "NL",
  "BELGIUM": "BE",
  "SWEDEN": "SE",
  "NORWAY": "NO",
  "DENMARK": "DK",
  "FINLAND": "FI",
  "ICELAND": "IS",
  "AUSTRIA": "AT",
  "SWITZERLAND": "CH",
  "BELARUS": "BY",
  "ARGENTINA": "AR",
  "CHILE": "CL",
  "COLOMBIA": "CO",
  "PERU": "PE",
  "VENEZUELA": "VE",
  "ECUADOR": "EC",
  "PARAGUAY": "PY",
  "URUGUAY": "UY",
  "OTHER": "XX"
};

const SelectCountry = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("verification");

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    if (tabName !== "verification") {
      router.push(`/${tabName}`);
    }
  };
  return (
    <ThemedView style={styles.container}>
      <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={styles.header}
      >
        <Shield size={32} color="#FFF" />
        <ThemedText style={styles.headerTitle}>Verify Your Identity</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Select your document's country of issue
        </ThemedText>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.countrySection}>
          <View style={styles.iconContainer}>
            <Globe2 size={24} color={Colors.light.primary} />
          </View>
          <ThemedText style={styles.sectionTitle}>Country of Issue</ThemedText>
          
          <View style={styles.pickerContainer}>
            <RNPickerSelect
              onValueChange={(value) => setSelectedCountry(value)}
              items={Object.entries(countries).map(([name, id]) => ({ 
                label: name, 
                value: id 
              }))}
              style={pickerSelectStyles}
              placeholder={{ label: 'Select your country...', value: null }}
            />
          </View>
        </View>

        <View style={styles.documentsSection}>
          <ThemedText style={styles.sectionTitle}>Choose Document Type</ThemedText>
          
          <TouchableOpacity 
            style={styles.documentCard}
            onPress={() => router.push('/verification/IdCard')}
          >
            <View style={styles.documentIcon}>
              <CreditCard size={24} color={Colors.light.primary} />
            </View>
            <View style={styles.documentInfo}>
              <ThemedText style={styles.documentTitle}>ID Card</ThemedText>
              <ThemedText style={styles.documentDescription}>
                National ID or Driver's License
              </ThemedText>
            </View>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.documentCard}
            onPress={() => router.push('/verification/IdCard')}
          >
            <View style={styles.documentIcon}>
              <FileText size={24} color={Colors.light.primary} />
            </View>
            <View style={styles.documentInfo}>
              <ThemedText style={styles.documentTitle}>Passport</ThemedText>
              <ThemedText style={styles.documentDescription}>
                International passport
              </ThemedText>
            </View>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.documentCard}
            onPress={() => router.push('/verification/IdCard')}
          >
            <View style={styles.documentIcon}>
              <Home size={24} color={Colors.light.primary} />
            </View>
            <View style={styles.documentInfo}>
              <ThemedText style={styles.documentTitle}>Residence Permit</ThemedText>
              <ThemedText style={styles.documentDescription}>
                Official residence documentation
              </ThemedText>
            </View>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  countrySection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  documentsSection: {
    marginBottom: 24,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 14,
    color: '#64748B',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#1E293B',
    borderRadius: 12,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#1E293B',
    borderRadius: 12,
  },
});

export default SelectCountry;