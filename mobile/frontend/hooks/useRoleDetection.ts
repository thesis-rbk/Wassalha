import { useEffect, useState } from 'react';
import axiosInstance from '@/config';

export const useRoleDetection = (userId: string | undefined) => {
    const [role, setRole] = useState<'TRAVELER' | 'SHOPPER' | 'BOTH' | 'NONE'>('NONE');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const detectRole = async () => {
            if (!userId) {
                console.log('🚫 No user ID provided');
                setRole('NONE');
                setLoading(false);
                return;
            }

            try {
                // Check if user is a service provider (Traveler)
                const spResponse = await axiosInstance.get(`/api/service-provider/${userId}`);
                const isTraveler = spResponse.data?.data?.isServiceProvider || false;
                console.log('🧳 Traveler check:', isTraveler);

                // Check if user has created any requests (Shopper)
                const allRequestsResponse = await axiosInstance.get('/api/requests');
                const userRequests = allRequestsResponse.data?.data?.filter(
                    (request: any) => String(request.userId) === userId
                ) || [];
                const isShopper = userRequests.length > 0;
                console.log(`🛍️ Shopper check: ${isShopper} (${userRequests.length} requests found)`);

                if (isTraveler && isShopper) {
                    console.log('👥 Setting role to BOTH');
                    setRole('BOTH');
                } else if (isTraveler) {
                    console.log('✈️ Setting role to TRAVELER');
                    setRole('TRAVELER');
                } else if (isShopper) {
                    console.log('🛒 Setting role to SHOPPER');
                    setRole('SHOPPER');
                } else {
                    console.log('❌ Setting role to NONE');
                    setRole('NONE');
                }
            } catch (error) {
                console.error('❌ Error in role detection:', error);
                setRole('NONE');
            } finally {
                setLoading(false);
            }
        };

        detectRole();
    }, [userId]);

    return { role, loading };
}; 