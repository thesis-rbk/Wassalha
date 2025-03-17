import { ViewStyle, TextStyle } from 'react-native';

export interface CardDetails {
  complete: boolean;
}

export interface ProgressStep {
  id: number;
  title: string;
  icon: string;
  status: 'completed' | 'current' | 'pending';
}

export interface PaymentBuyerStyles {
  container: ViewStyle;
  scrollView: ViewStyle;
  scrollContent: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  paymentSummary: ViewStyle;
  summaryTitle: TextStyle;
  summaryRow: ViewStyle;
  summaryLabel: TextStyle;
  summaryValue: TextStyle;
  divider: ViewStyle;
  totalLabel: TextStyle;
  totalValue: TextStyle;
  paymentMethodSection: ViewStyle;
  sectionTitle: TextStyle;
  cardContainer: ViewStyle;
  cardStyle: object;
  cardField: ViewStyle;
  securityNote: ViewStyle;
  securityText: TextStyle;
  infoCard: ViewStyle;
  infoHeader: ViewStyle;
  infoTitle: TextStyle;
  infoText: TextStyle;
  footer: ViewStyle;
  button: ViewStyle;
  buttonText: TextStyle;
} 