import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '../styles/WorldMap.module.css';
import { CountryData } from '../types/CountryData';
import LeafletMapProps from '../types/LeafletMapProps';
// Fix for Leaflet marker icons in Next.js
const fixLeafletIcons = () => {
  // Fix leaflet's default icon paths
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
};

// Map country names to geographical coordinates
const countryCoordinates: { [key: string]: [number, number] } = {
  // Africa
  'Tunisia': [36.8, 10.2],
  'Morocco': [31.8, -7.1],
  'Algeria': [28.0, 1.7],
  'Egypt': [26.8, 30.8],
  'Nigeria': [9.1, 8.7],
  'South Africa': [-30.6, 22.9],

  // Europe
  'UK': [55.4, -3.4],
  'United Kingdom': [55.4, -3.4],
  'France': [46.2, 2.2],
  'Germany': [51.2, 10.4],
  'Italy': [42.8, 12.8],
  'Spain': [40.5, -3.7],

  // North America
  'US': [37.1, -95.7],
  'USA': [37.1, -95.7],
  'United States': [37.1, -95.7],
  'Canada': [56.1, -106.3],
  'Mexico': [23.6, -102.6],

  // South America
  'Brazil': [-14.2, -51.9],
  'Argentina': [-38.4, -63.6],
  'Chile': [-35.7, -71.1],

  // Asia
  'China': [35.9, 104.2],
  'India': [20.6, 79.0],
  'Japan': [36.2, 138.3],
  'Russia': [61.5, 105.3],

  // Oceania
  'Australia': [-25.3, 133.8]
};

const LeafletMap: React.FC<LeafletMapProps> = ({ countryData, isDarkMode }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const labelsRef = useRef<L.Marker[]>([]);
  const markerPaneRef = useRef<HTMLElement | null>(null);
  
  // Add a function to ensure markers are visible
  const ensureMarkersVisible = () => {
    // Make sure marker pane is always on top
    if (mapRef.current) {
      const markerPane = document.querySelector('.leaflet-marker-pane');
      const overlayPane = document.querySelector('.leaflet-overlay-pane');
      
      if (markerPane && overlayPane) {
        markerPane.parentNode?.appendChild(markerPane); // Move to the end (top)
        markerPaneRef.current = markerPane as HTMLElement;
        (markerPane as HTMLElement).style.zIndex = '650'; // Set a high z-index
      }
    }
  };
  
  // Add function to create markers with retry logic
  const createMapMarkers = () => {
    if (!mapRef.current) return;
    
    // Clear existing markers first
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => {
        if (mapRef.current) mapRef.current.removeLayer(marker);
      });
      markersRef.current = [];
    }
    
    // Clear existing labels
    if (labelsRef.current.length > 0) {
      labelsRef.current.forEach(label => {
        if (mapRef.current) mapRef.current.removeLayer(label);
      });
      labelsRef.current = [];
    }
    
    // Calculate total users for percentage
    const totalUsers = countryData.reduce((sum, country) => sum + country.count, 0) || 1;
    
    // Add markers for each country
    countryData.forEach(country => {
      const coords = countryCoordinates[country.country];
      if (!coords || !mapRef.current) return;
      
      // Calculate percentage
      const percentage = (country.count / totalUsers) * 100;
      const percentageText = percentage.toFixed(1);
      
      // Determine marker size based on user count percentage (making them slightly larger to fit text)
      const radius = Math.max(12, Math.min(20, 12 + Math.sqrt(percentage) * 1.5));
      
      // Get marker color based on percentage (using solid colors with slight transparency)
      let color: string;
      if (percentage > 40) color = '#3703C8E6'; // Solid primary color with 90% opacity
      else if (percentage > 20) color = '#018ABEE6'; // Solid secondary color with 90% opacity
      else if (percentage > 10) color = '#05AFF0E6'; // Solid dark color with 90% opacity
      else color = '#6ac8eeE6'; // Solid light blue with 90% opacity
      
      // Create circle marker with no border and slight transparency
      const marker = L.circleMarker(coords, {
        radius: radius,
        fillColor: color,
        color: 'transparent', // Remove border
        weight: 0, // No border width
        opacity: 1,
        fillOpacity: 0.9, // 90% opacity for fill
        className: styles.mapMarker,
        bubblingMouseEvents: false,
        interactive: true
      }).addTo(mapRef.current);
      
      // Add popup with country info
      marker.bindPopup(`
        <div class="${styles.countryPopup}">
          <h3>${country.country}</h3>
          <p>Users: ${country.count}</p>
          <p>Percentage: ${percentageText}%</p>
        </div>
      `);
      
      markersRef.current.push(marker);
      
      // Add percentage text directly on the marker
      const textIcon = L.divIcon({
        html: `<div style="
          width: ${radius * 2}px;
          height: ${radius * 2}px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 11px;
          font-weight: 500;
          text-shadow: 0 0 2px rgba(0,0,0,0.5);
        ">${percentageText}%</div>`,
        className: '',
        iconSize: [radius * 2, radius * 2],
        iconAnchor: [radius, radius]
      });
      
      const label = L.marker(coords, { 
        icon: textIcon,
        interactive: false,
        zIndexOffset: 1000
      }).addTo(mapRef.current);
      
      labelsRef.current.push(label);
    });
    
    // Ensure markers are visible
    ensureMarkersVisible();
    
    // Add a slight delay and ensure again (helps with race conditions)
    setTimeout(ensureMarkersVisible, 500);
  };
  
  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Fix leaflet icons
    fixLeafletIcons();
    
    // Initialize map if not already done
    if (!mapRef.current) {
      // Create the map
      mapRef.current = L.map(mapContainerRef.current, {
        center: [20, 0], // Center of the world
        zoom: 2,
        maxBounds: [[-90, -180], [90, 180]],
        minZoom: 2,
        maxZoom: 6,
        zoomControl: true,
        attributionControl: false,
        renderer: L.canvas() // Use canvas renderer for better performance
      });
      
      // Add tile layer based on dark mode
      if (isDarkMode) {
        tileLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }).addTo(mapRef.current);
      } else {
        tileLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }).addTo(mapRef.current);
      }
      
      // Wait for tile layer to load before adding markers
      tileLayerRef.current.on('load', () => {
        createMapMarkers();
      });
      
      // Add markers anyway after a short delay (fallback)
      setTimeout(createMapMarkers, 1000);
      
      // Listen for zoom events to ensure markers stay visible
      mapRef.current.on('zoomend', ensureMarkersVisible);
      mapRef.current.on('moveend', ensureMarkersVisible);
    } else {
      // If map already exists, just update markers
      createMapMarkers();
    }
    
    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.off('zoomend', ensureMarkersVisible);
        mapRef.current.off('moveend', ensureMarkersVisible);
        mapRef.current.remove();
        mapRef.current = null;
        tileLayerRef.current = null;
        markersRef.current = [];
        labelsRef.current = [];
      }
    };
  }, [countryData, isDarkMode]);
  
  // Update map on dark mode change
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Remove existing tile layer
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }
    
    // Add new tile layer based on dark mode
    if (isDarkMode) {
      tileLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(mapRef.current);
    } else {
      tileLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(mapRef.current);
    }
    
    // Recreate markers after tile layer changes
    tileLayerRef.current.on('load', () => {
      createMapMarkers();
    });
    
    // Fallback: create markers after a short delay anyway
    setTimeout(createMapMarkers, 1000);
  }, [isDarkMode]);
  
  // Add additional effect to ensure markers remain visible during component updates
  useEffect(() => {
    const interval = setInterval(ensureMarkersVisible, 2000);
    return () => clearInterval(interval);
  }, []);
  
  return <div ref={mapContainerRef} className={styles.leafletMap}></div>;
};

export default LeafletMap; 