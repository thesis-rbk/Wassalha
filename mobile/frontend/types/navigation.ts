export type PaymentRouteParams = {
  orderId: string;
  sponsorshipId: string;
  price: string;
  type: 'sponsorship' | 'regular';
  returnPath: string;
};

export type DeliveryRouteParams = {
  orderId: string;
  sponsorshipId: string;
  status: string;
};

export type Route = {
  params: PaymentRouteParams | DeliveryRouteParams;
}; 
