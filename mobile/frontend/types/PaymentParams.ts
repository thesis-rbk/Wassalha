type ValidReturnPath = '/sponsorshipTrack/deliveryBuyer' | '/other/valid/paths';

export interface PaymentParams {
  orderId: string;
  sponsorshipId?: string;
  price: string;
  type: 'sponsorship' | 'regular';
  returnPath: ValidReturnPath;
}