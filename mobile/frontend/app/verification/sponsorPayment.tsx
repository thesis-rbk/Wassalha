import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const PaymentForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvc, setCvc] = useState('');
    const [country, setCountry] = useState('The United Kingdom');

    const handlePayment = () => {
        // Add payment processing logic here
        console.log('Processing payment...', { email, cardNumber, expiryDate, cvc, country });
    };

    return (
        <View style={styles.container}>
            <View style={styles.amountContainer}>
                <Text style={styles.currency}>£</Text>
                <Text style={styles.amount}>500.00</Text>
            </View>
            <Text style={styles.reference}>Goods and Services{'\n'}Ref: 954722230387</Text>

            <Text style={styles.sectionTitle}>Pay with card</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <Text style={styles.sectionTitle}>Card Information</Text>
            <View style={styles.cardContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Number"
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    keyboardType="numeric"
                />
                <View style={styles.dateCvcContainer}>
                    <TextInput
                        style={styles.smallInput}
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChangeText={setExpiryDate}
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={styles.smallInput}
                        placeholder="CVC"
                        value={cvc}
                        onChangeText={setCvc}
                        keyboardType="numeric"
                    />
                </View>
            </View>

            <Text style={styles.sectionTitle}>Country or region</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={country}
                    onValueChange={(itemValue) => setCountry(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="The United Kingdom" value="The United Kingdom" />
                    {/* Add more countries as needed */}
                </Picker>
            </View>

            <TextInput
                style={styles.input}
                placeholder="ZIP"
                keyboardType="numeric"
            />

            <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
                <Text style={styles.payButtonText}>Pay</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 10,
    },
    currency: {
        fontSize: 24,
        color: '#000',
    },
    amount: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#000',
    },
    reference: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000',
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    cardContainer: {
        marginBottom: 15,
    },
    dateCvcContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    smallInput: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        width: '48%',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 15,
    },
    picker: {
        height: 40,
        width: '100%',
    },
    payButton: {
        backgroundColor: '#ff4444',
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    payButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default PaymentForm;