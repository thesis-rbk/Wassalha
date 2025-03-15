// types/dropdown.ts
export interface DropdownProps {
    options: { label: string; value: string | number }[];
    placeholder?: string;
    value: string | number;
    onChange: (value: string | number) => void;
    containerStyle?: object;
    dropdownStyle?: object;
    textStyle?: object;
    disabled?: boolean;
    arrowIcon?: boolean; // <-- Add this line
}