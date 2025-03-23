import React, { useEffect, useState } from 'react';
import styles from '../styles/WorldMap.module.css';
import api from '../lib/api';
import dynamic from 'next/dynamic';
import { ChevronDown, ChevronUp } from 'lucide-react'; // Import icons if available, or use alternatives
import { CountryData } from '@/types/CountryData';


// Sample data to use when API fails
const SAMPLE_DATA: CountryData[] = [
  { country: 'Tunisia', count: 2 },
  { country: 'France', count: 1 },
  { country: 'UK', count: 1 },
];

// Dynamically import the Map component with no SSR
const MapWithNoSSR = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className={styles.loading}>Loading map...</div>
  ),
});

const WorldMap: React.FC = () => {
  const [countryData, setCountryData] = useState<CountryData[]>(SAMPLE_DATA);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLegendExpanded, setIsLegendExpanded] = useState<boolean>(false);

  // Check for dark mode using both classes and localStorage
  useEffect(() => {
    const checkDarkMode = () => {
      // Check HTML class first (managed by Nav component)
      const isDark = document.documentElement.classList.contains('dark-mode');
      
      // Fallback to localStorage if class is not set
      const storedPreference = localStorage.getItem('darkMode') === 'true';
      
      setIsDarkMode(isDark || storedPreference);
    };
    
    // Initial check
    checkDarkMode();
    
    // Monitor for class changes on html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    // Listen for theme change events (dispatched by the Nav component)
    const handleThemeChange = () => {
      checkDarkMode();
    };
    
    window.addEventListener('themeChange', handleThemeChange);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  // Fetch country data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch data but fallback to sample data if it fails
        try {
          const response = await api.get('/api/users/demographics');
          if (response.data && response.data.success && response.data.data?.length > 0) {
            setCountryData(response.data.data);
          } else {
            console.warn('API returned empty or invalid data, using sample data');
            setCountryData(SAMPLE_DATA);
          }
        } catch (err) {
          console.warn('API request failed, using sample data', err);
          setCountryData(SAMPLE_DATA);
        }
      } catch (err) {
        console.error('Error in fetch wrapper:', err);
        setError('Failed to load demographic data');
        setCountryData(SAMPLE_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate total users
  const totalUsers = countryData.reduce((sum, country) => sum + country.count, 0) || 1;

  // Get marker color based on user percentage
  const getMarkerColor = (count: number) => {
    const percentage = (count / totalUsers) * 100;
    
    if (percentage > 40) return '#2563eb'; // blue-600
    if (percentage > 20) return '#3b82f6'; // blue-500
    if (percentage > 10) return '#60a5fa'; // blue-400
    return '#93c5fd'; // blue-300
  };

  // Get top countries by user count
  const topCountries = [...countryData]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Toggle legend expanded state
  const toggleLegend = () => {
    setIsLegendExpanded(!isLegendExpanded);
  };

  if (loading) {
    return (
      <div className={`${styles.worldMapContainer} ${isDarkMode ? styles.darkMode : ''}`}>
        <div className={styles.loading}>Loading demographic data...</div>
      </div>
    );
  }

  return (
    <div className={`${styles.worldMapContainer} ${isDarkMode ? styles.darkMode : ''}`}>
      <div className={styles.mapWrapper}>
        <MapWithNoSSR countryData={countryData} isDarkMode={isDarkMode} />
      </div>

      {/* Legend with toggle */}
      <div className={styles.legend}>
        <div className={styles.legendHeader} onClick={toggleLegend}>
          <div className={styles.legendTitle}>Top Countries by Users</div>
          <button className={styles.legendToggle}>
            {isLegendExpanded ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
        </div>
        
        {isLegendExpanded && (
          <div className={styles.legendItems}>
            {topCountries.map((country) => (
              <div key={country.country} className={styles.legendItem}>
                <div
                  className={styles.legendColor}
                  style={{ backgroundColor: getMarkerColor(country.count) }}
                />
                <div className={styles.legendText}>
                  {country.country}: {country.count} ({((country.count / totalUsers) * 100).toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldMap;