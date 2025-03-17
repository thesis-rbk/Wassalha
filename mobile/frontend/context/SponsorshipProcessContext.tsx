import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '@/config';
import { useNotification } from './NotificationContext';

type SponsorshipProcessContextType = {
  initiateSponsorshipProcess: (sponsorshipId: number, buyerId: number) => Promise<any>;
  updateSponsorshipStatus: (processId: number, status: string) => Promise<any>;
  verifySponsorshipDelivery: (processId: number, imageUri: string) => Promise<any>;
  confirmSponsorshipDelivery: (processId: number) => Promise<any>;
  requestNewVerificationPhoto: (processId: number) => Promise<any>;
  cancelSponsorshipProcess: (processId: number) => Promise<any>;
  loading: boolean;
};

const SponsorshipProcessContext = createContext<SponsorshipProcessContextType | undefined>(undefined);

export const SponsorshipProcessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const { sendNotification } = useNotification();

  const initiateSponsorshipProcess = async (sponsorshipId: number, buyerId: number) => {
    try {
      setLoading(true);
      // Log the input parameters
      console.log('Initiating process with:', { sponsorshipId, buyerId });

      // Validate inputs
      if (!sponsorshipId || !buyerId) {
        throw new Error('Invalid sponsorshipId or buyerId');
      }

      const response = await axiosInstance.post('/api/sponsorship-process/initiate', {
        sponsorshipId,
        buyerId
      });

      console.log('API Response:', response.data);

      if (response.data.success) {
        sendNotification('sponsorship_initiated', {
          sponsorId: response.data.data.sponsorId,
          buyerId,
          sponsorshipId,
          processId: response.data.data.id
        });
      }
      return response.data;
    } catch (error: any) {
      console.error('Error initiating sponsorship process:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSponsorshipStatus = async (processId: number, status: string) => {
    try {
      setLoading(true);
      const response = await axiosInstance.patch(`/api/sponsorship-process/${processId}/status`, {
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error updating sponsorship status:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifySponsorshipDelivery = async (processId: number, imageUri: string) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Create file object from image URI
      const imageFile = {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'verification.jpg',
      };

      formData.append('file', imageFile as any);
      formData.append('processId', processId.toString());

      const response = await axiosInstance.post('/api/sponsorship-process/verify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error verifying sponsorship delivery:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const confirmSponsorshipDelivery = async (processId: number) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/api/sponsorship-process/${processId}/confirm`);
      return response.data;
    } catch (error) {
      console.error('Error confirming sponsorship delivery:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const requestNewVerificationPhoto = async (processId: number) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/api/sponsorship-process/${processId}/request-new-photo`);
      return response.data;
    } catch (error) {
      console.error('Error requesting new verification photo:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelSponsorshipProcess = async (processId: number) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/api/sponsorship-process/${processId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling sponsorship process:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SponsorshipProcessContext.Provider
      value={{
        initiateSponsorshipProcess,
        updateSponsorshipStatus,
        verifySponsorshipDelivery,
        confirmSponsorshipDelivery,
        requestNewVerificationPhoto,
        cancelSponsorshipProcess,
        loading
      }}
    >
      {children}
    </SponsorshipProcessContext.Provider>
  );
};

export const useSponsorshipProcess = () => {
  const context = useContext(SponsorshipProcessContext);
  if (context === undefined) {
    throw new Error('useSponsorshipProcess must be used within a SponsorshipProcessProvider');
  }
  return context;
};