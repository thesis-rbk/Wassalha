export interface ChatScreenProps {
    contactName: string;
    contactStatus?: string;
    contactAvatar?: string;
    onBackPress?: () => void;
    onCallPress?: () => void;
    onMorePress?: () => void;
}