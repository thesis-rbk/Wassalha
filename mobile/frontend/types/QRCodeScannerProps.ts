export interface QRCodeScannerProps {
  visible: boolean;
  onClose: () => void;
  pickups: any[]; // Replace 'any' with your Pickup type
  setPickups: React.Dispatch<React.SetStateAction<any[]>>;
  paramsData: {
    requesterId: string;
    travelerId: string;
    idOrder: string;
    requesterName: string;
    travelerName: string;
    goodsName: string;
    status: string;
    reviewLabel: string;
    isTraveler: string;
  };
}