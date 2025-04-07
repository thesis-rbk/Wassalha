export interface QRCodeModalProps {
  visible: boolean;
  qrCodeData: string;
  onClose: () => void;
  paramsData: Record<string, any>; 
}