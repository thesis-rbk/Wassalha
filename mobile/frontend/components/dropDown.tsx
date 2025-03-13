import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Modal,
    Animated,
    Easing,
    Platform,
} from 'react-native';
import { DropdownProps } from "../types/dropdown";
import { Ionicons } from '@expo/vector-icons'; // Optional, for adding icons

export const Dropdown: React.FC<DropdownProps> = ({
    options,
    placeholder = 'Select an option',
    value,
    onChange,
    containerStyle,
    dropdownStyle,
    textStyle,
    disabled = false,
    arrowIcon = true, // Add an option for arrow icon visibility
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState<string | undefined>(
        options.find((option) => option.value === value)?.label || undefined
    );

    // Animation setup for dropdown fade-in effect
    const fadeAnim = useState(new Animated.Value(0))[0];

    const handleSelect = (item: { label: string; value: string | number }) => {
        setSelectedLabel(item.label);
        onChange(item.value);
        setIsVisible(false);
    };

    const renderItem = ({ item }: { item: { label: string; value: string | number } }) => (
        <TouchableOpacity
            style={styles.option}
            onPress={() => handleSelect(item)}
        >
            <Text style={[styles.optionText, textStyle]}>{item.label}</Text>
        </TouchableOpacity>
    );

    // Show dropdown with fade-in effect
    const showDropdown = () => {
        if (!disabled) {
            setIsVisible(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                easing: Easing.ease,
                useNativeDriver: true,
            }).start();
        }
    };

    // Close dropdown with fade-out effect
    const hideDropdown = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
        }).start(() => {
            setIsVisible(false);
        });
    };

    return (
        <View style={[styles.container, containerStyle]}>
            <TouchableOpacity
                style={[styles.dropdown, dropdownStyle]}
                onPress={showDropdown}
                disabled={disabled}
            >
                <Text style={[styles.selectedText, textStyle]}>
                    {selectedLabel || placeholder}
                </Text>
                {arrowIcon && (
                    <Ionicons
                        name={isVisible ? 'arrow-up' : 'arrow-down'}
                        size={20}
                        color="#008098"
                        style={styles.arrowIcon}
                    />
                )}
            </TouchableOpacity>

            <Modal
                visible={isVisible}
                transparent
                animationType="none"
                onRequestClose={hideDropdown}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={hideDropdown}
                >
                    <Animated.View style={[styles.dropdownList, { opacity: fadeAnim }, dropdownStyle]}>
                        <FlatList
                            data={options}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.value.toString()}
                        />
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    dropdown: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#008098',
        borderRadius: 4,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedText: {
        fontSize: 16,
        color: '#008098',
    },
    arrowIcon: {
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 128, 152, 0.5)', // Semi-transparent overlay
    },
    dropdownList: {
        maxHeight: 200,
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#008098',
    },
    option: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0F2F5',
    },
    optionText: {
        fontSize: 16,
        color: '#008098',
    },
});
