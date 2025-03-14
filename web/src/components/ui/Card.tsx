import { ReactNode } from "react";
import { colors } from "@/styles/styles";

type CardProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        w-[400px] h-[350px] rounded-xl p-4 shadow-lg
        transition-all duration-200 hover:shadow-xl
        bg-[${colors.light.secondary}]
        dark:bg-[${colors.dark.secondary}]
        ${className}
      `}
    >
      {children}
    </div>
  );
} 