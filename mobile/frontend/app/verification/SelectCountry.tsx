import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

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
  const colorScheme = useColorScheme() ?? 'light';
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>Select the country where your ID document was issued</ThemedText>
        
        <RNPickerSelect
          onValueChange={(value) => setSelectedCountry(value)}
          items={Object.entries(countries).map(([name, id]) => ({ label: name, value: id }))}
          style={pickerSelectStyles}
          placeholder={{ label: 'Select a country...', value: null }}
        />

        <ThemedText style={styles.subtitle}>Select your document type</ThemedText>
        <ScrollView style={styles.scrollContainer}>
          <TouchableOpacity
            style={styles.linkOption}
            onPress={() => router.push('/verification/IdCard' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <Icon name="credit-card" size={24} color="black" style={styles.icon} />
              <ThemedText style={styles.optionText}>ID Card</ThemedText>
              <Icon name="chevron-right" size={24} color="black" style={styles.chevronIcon} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkOption}
            onPress={() => router.push('/verification/passport' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <Icon name="public" size={24} color="black" style={styles.icon} />
              <ThemedText style={styles.optionText}>Passport</ThemedText>
              <Icon name="chevron-right" size={24} color="black" style={styles.chevronIcon} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkOption}
            onPress={() => router.push('/verification/residencePermit' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <Icon name="home" size={24} color="black" style={styles.icon} />
              <ThemedText style={styles.optionText}>Residence Permit</ThemedText>
              <Icon name="chevron-right" size={24} color="black" style={styles.chevronIcon} />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ThemedView>
  );
};

export default SelectCountry;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors[colorScheme as keyof typeof Colors].background,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors[colorScheme as keyof typeof Colors].primary,
  },
  subtitle: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 10,
    color: Colors[colorScheme as keyof typeof Colors].secondary,
  },
  scrollContainer: {
    maxHeight: 220,
    marginBottom: 20,
  },
  linkOption: {
    padding: 18,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
  chevronIcon: {
    marginLeft: 'auto',
  },
  optionText: {
    fontSize: 18,
    color: 'black',
  },
});

// Styles for the picker
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    color: 'black',
    marginBottom: 20,
  },
  inputAndroid: {
    fontSize: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    color: 'black',
    marginBottom: 20,
  },
});