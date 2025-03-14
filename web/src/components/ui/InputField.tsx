import { useState } from "react";
import { colors, typography } from "@/styles/styles";

type InputFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
};

export function InputField({
  label,
  placeholder = "",
  value,
  onChange,
  type = "text",
  className = "",
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label className={`${typography.medium} text-base`}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          w-full px-2.5 py-2 border-2 rounded-xl text-base
          transition-all duration-200 shadow-md
          focus:outline-none focus:ring-2
          ${isFocused ? 
            `border-[${colors.light.primary}] ring-[${colors.light.primary}]/30` : 
            `border-[${colors.light.primary}]`
          }
          dark:bg-[${colors.dark.background}]
          dark:text-[${colors.dark.text}]
          dark:border-[${colors.dark.primary}]
        `}
      />
    </div>
  );
} 