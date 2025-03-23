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
  
  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Fix leaflet icons
    fixLeafletIcons();
    
    // Calculate total users for percentage
    const totalUsers = countryData.reduce((sum, country) => sum + country.count, 0) || 1;
    
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
    }
    
    // Clear existing markers
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
    
    // Add markers for each country
    countryData.forEach(country => {
      const coords = countryCoordinates[country.country];
      if (!coords || !mapRef.current) return;
      
      // Calculate percentage
      const percentage = (country.count / totalUsers) * 100;
      const percentageText = percentage.toFixed(1);
      
      // Determine marker size based on user count percentage
      // Make markers smaller overall with more responsive sizing
      const radius = Math.max(5, Math.min(20, 5 + Math.sqrt(percentage) * 2.5));
      
      // Get marker color based on percentage (using a gradient from blue)
      let color: string;
      if (percentage > 40) color = '#3703C8'; // color-primary from theme
      else if (percentage > 20) color = '#018ABE'; // color-secondary from theme
      else if (percentage > 10) color = '#05AFF0'; // color-dark from theme
      else color = '#6ac8ee'; // lighter blue for smallest values
      
      // Create circle marker with improved styling
      const marker = L.circleMarker(coords, {
        radius: radius,
        fillColor: color,
        color: 'white',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.7,
        className: styles.mapMarker
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
      
      // Only add label if percentage is significant (above 5%)
      if (percentage >= 5) {
        // Custom icon with percentage label
        const labelIcon = L.divIcon({
          html: `<div class="${styles.markerLabel}">${percentageText}%</div>`,
          className: '',
          iconSize: [36, 18],
          iconAnchor: [18, 9]
        });
        
        const label = L.marker(coords, { icon: labelIcon }).addTo(mapRef.current);
        labelsRef.current.push(label);
      }
    });
    
    // Cleanup
    return () => {
      if (mapRef.current) {
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
  }, [isDarkMode]);
  
  return <div ref={mapContainerRef} className={styles.leafletMap}></div>;
};

export default LeafletMap; 