export type SponsorshipProcessContextType = {
    initiateSponsorshipProcess: (sponsorshipId: number, buyerId: number) => Promise<any>;
    updateSponsorshipStatus: (processId: number, status: string) => Promise<any>;
    verifySponsorshipDelivery: (processId: number, imageUri: string) => Promise<any>;
    confirmSponsorshipDelivery: (processId: number) => Promise<any>;
    requestNewVerificationPhoto: (processId: number) => Promise<any>;
    cancelSponsorshipProcess: (processId: number) => Promise<any>;
    loading: boolean;
  };