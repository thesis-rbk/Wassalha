"use client";

import { ReactNode } from "react";
import { colors } from "@/styles/styles";

type BaseButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  size?: "small" | "medium" | "large" | "login";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

export function BaseButton({
  children,
  variant = "primary",
  size = "medium",
  className = "",
  onClick,
  type = "button",
  ...props
}: BaseButtonProps) {
  const sizeClasses = {
    small: "w-[90px]",
    medium: "w-[121px]",
    large: "w-[181px]",
    login: "w-full",
  };

  const variantColors = {
    primary: `bg-${colors.light.primary} dark:bg-${colors.dark.primary}`,
    secondary: `bg-${colors.light.secondary} dark:bg-${colors.dark.secondary}`
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        h-[50px] rounded-full flex items-center justify-center
        shadow-lg transition-all duration-200 hover:opacity-90
        text-white font-semibold text-lg
        ${sizeClasses[size]}
        ${variantColors[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
} 