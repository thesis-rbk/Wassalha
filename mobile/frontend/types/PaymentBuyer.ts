import { ViewStyle, TextStyle } from 'react-native';
import { CardFieldInput } from '@stripe/stripe-react-native';

export interface CardDetails extends CardFieldInput.Details {
  complete?: boolean;
  validNumber?: boolean;
  validExpiry?: boolean;
  validCVC?: boolean;
}

export interface ProgressStep {
  id: number;
  title: string;
  icon: string;
  status: string;
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
  cardStyle: ViewStyle;
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
  errorText: TextStyle;
  validationStatus: ViewStyle;
  validText: TextStyle;
} 