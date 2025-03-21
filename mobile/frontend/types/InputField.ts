import { TextInputProps } from "react-native";
export interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}
