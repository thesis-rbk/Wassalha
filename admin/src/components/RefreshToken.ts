'use client';

import { useEffect } from 'react';
import { refreshTokenTimestamp } from '../lib/api';

/**
 * This component checks the token on page load and updates the token timestamp
 * if there is an existing valid token. This helps prevent unnecessary redirects
 * when the token is still valid.
 */
const RefreshToken = () => {
  useEffect(() => {
    // Check if there's a token in localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (token) {
        // If a token exists, update the timestamp to mark it as recently checked
        refreshTokenTimestamp();
        console.log('Token timestamp refreshed on page load');
      }
    }
  }, []);

  // This component doesn't render anything
  return null;
};

export default RefreshToken; 