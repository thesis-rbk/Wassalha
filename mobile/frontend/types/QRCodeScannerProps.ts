export interface QRCodeScannerProps {
  visible: boolean;
  onClose: () => void;
  pickups: any[]; // Replace 'any' with your Pickup type
  setPickups: React.Dispatch<React.SetStateAction<any[]>>;
}