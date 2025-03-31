import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { CircleCheck as CheckCircle2, Circle as XCircle } from 'lucide-react-native';

interface StatusScreenProps {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  primaryAction?: {
    label: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  onClose?: () => void;
}

export function StatusScreen({
  visible,
  type,
  title,
  message,
  primaryAction,
  secondaryAction,
  onClose,
}: StatusScreenProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={64} color="#10B981" />;
      case 'error':
        return <XCircle size={64} color="#EF4444" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#F0FDF4';
      case 'error':
        return '#FEF2F2';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
          <View style={styles.content}>
            {getIcon()}
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          <View style={styles.actions}>
            {primaryAction && (
              <Pressable
                style={[styles.button, styles.primaryButton]}
                onPress={primaryAction.onPress}>
                <Text style={styles.primaryButtonText}>{primaryAction.label}</Text>
              </Pressable>
            )}

            {secondaryAction && (
              <Pressable
                style={[styles.button, styles.secondaryButton]}
                onPress={secondaryAction.onPress}>
                <Text style={styles.secondaryButtonText}>{secondaryAction.label}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
});