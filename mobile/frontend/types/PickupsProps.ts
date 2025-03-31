import { Pickup as PickupType } from "../types/Pickup"; // Renamed to avoid conflict with component name
export interface PickupProps {
  pickupId?: number;
  orderId?: number; // Keeping your original prop
  pickups?: PickupType[]; // Optional
  setPickups?: (pickups: PickupType[]) => void; // Optional
  showPickup?: boolean;
  setShowPickup?: React.Dispatch<React.SetStateAction<boolean>>;
}